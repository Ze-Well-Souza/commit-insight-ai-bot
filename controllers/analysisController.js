
import { getAllAnalyses, getAnalysisById, saveAnalysis } from "../database.js";
import { analisarCommit } from "../openaiService.js";
import { enviarNotificacaoDiscord } from "../discordService.js";

export const getAllAnalysesHandler = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 50;
    const analyses = await getAllAnalyses(limit);
    res.status(200).json({
      success: true,
      data: analyses,
      count: analyses.length
    });
  } catch (error) {
    console.error("❌ Erro ao buscar análises:", error);
    res.status(500).json({
      success: false,
      message: "Erro interno ao buscar análises",
      error: error.message
    });
  }
};

export const getAnalysisByIdHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const analysis = await getAnalysisById(id);
    
    if (!analysis) {
      return res.status(404).json({
        success: false,
        message: "Análise não encontrada"
      });
    }

    res.status(200).json({
      success: true,
      data: analysis
    });
  } catch (error) {
    console.error("❌ Erro ao buscar análise:", error);
    res.status(500).json({
      success: false,
      message: "Erro interno ao buscar análise",
      error: error.message
    });
  }
};

export const triggerAnalysisHandler = async (req, res) => {
  try {
    const { repositoryUrl, commitSha, commitMessage, author, diff } = req.body;

    if (!repositoryUrl || !commitMessage || !author) {
      return res.status(400).json({
        success: false,
        message: "Campos obrigatórios: repositoryUrl, commitMessage, author"
      });
    }

    res.status(202).json({
      success: true,
      message: "Análise iniciada com sucesso",
      status: "processing"
    });

    (async () => {
      try {
        console.log(`🔍 Iniciando análise via API para: ${repositoryUrl}`);
        
        const analysisData = {
          repo: repositoryUrl,
          author: author,
          message: commitMessage,
          diff: diff || "Análise disparada via API - diff não fornecido"
        };

        const analise = await analisarCommit(analysisData);
        
        await saveAnalysis({
          commit_sha: commitSha || `api-${Date.now()}`,
          commit_message: commitMessage,
          author: author,
          repository: repositoryUrl,
          timestamp: new Date().toISOString(),
          analysis_content: analise,
          status: 'Completed',
          commit_url: `${repositoryUrl}/commit/${commitSha || 'unknown'}`
        });

        console.log(`✅ Análise via API concluída e salva para: ${repositoryUrl}`);

        if (process.env.DISCORD_WEBHOOK_URL) {
          await enviarNotificacaoDiscord({
            repo: repositoryUrl,
            author: author,
            message: commitMessage,
            url: `${repositoryUrl}/commit/${commitSha || 'unknown'}`,
            analise: analise,
          });
        }

      } catch (error) {
        console.error(`❌ Erro na análise via API: ${error.message}`);
        try {
          await saveAnalysis({
            commit_sha: commitSha || `api-error-${Date.now()}`,
            commit_message: commitMessage,
            author: author,
            repository: repositoryUrl,
            timestamp: new Date().toISOString(),
            analysis_content: `Erro na análise: ${error.message}`,
            status: 'Failed',
            commit_url: `${repositoryUrl}/commit/${commitSha || 'unknown'}`
          });
        } catch (saveError) {
          console.error(`❌ Erro ao salvar análise com falha: ${saveError.message}`);
        }
      }
    })();

  } catch (error) {
    console.error("❌ Erro ao processar requisição de análise:", error);
    res.status(500).json({
      success: false,
      message: "Erro interno do servidor",
      error: error.message
    });
  }
};
