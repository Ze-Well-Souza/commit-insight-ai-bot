
import { saveAnalysis } from "../database.js";
import { analisarCommit } from "../openaiService.js";
import { enviarNotificacaoDiscord } from "../discordService.js";

export const githubWebhookHandler = async (req, res) => {
  try {
    const eventType = req.headers["x-github-event"];
    console.log(`📌 Evento recebido: ${eventType || "push"}`);

    if (eventType === "ping") {
      console.log("🔔 Ping recebido do GitHub");
      return res.status(200).send("✅ Pong do webhook");
    }

    const { repository, author, commit_message, commit_sha, diff, commit_url } = req.body;

    if (!diff) {
      console.error("❌ O 'diff' do commit não foi encontrado no corpo da requisição.");
      return res.status(400).send("O 'diff' do commit é obrigatório.");
    }
    
    console.log(`📦 Recebido commit de ${repository}`);
    
    res.status(202).send("✅ Webhook recebido, análise em andamento.");

    (async () => {
      try {
        console.log(`🔍 Analisando commit: ${commit_message.substring(0, 50)}...`);
        
        const analise = await analisarCommit({
          repo: repository,
          author: author,
          message: commit_message,
          diff: diff,
        });

        await saveAnalysis({
          commit_sha: commit_sha,
          commit_message: commit_message,
          author: author,
          repository: repository,
          timestamp: new Date().toISOString(),
          analysis_content: analise,
          status: 'Completed',
          commit_url: commit_url
        });

        console.log(`✅ Análise do commit ${commit_sha.substring(0,7)} concluída e salva.`);

        if(process.env.DISCORD_WEBHOOK_URL) {
            await enviarNotificacaoDiscord({
                repo: repository,
                author: author,
                message: commit_message,
                url: commit_url,
                analise: analise,
            });
        }

      } catch (error) {
        console.error(`❌ Erro durante a análise assíncrona do commit: ${error.message}`);
        
        try {
          await saveAnalysis({
            commit_sha: commit_sha,
            commit_message: commit_message,
            author: author,
            repository: repository,
            timestamp: new Date().toISOString(),
            analysis_content: `Erro na análise: ${error.message}`,
            status: 'Failed',
            commit_url: commit_url
          });
        } catch (saveError) {
          console.error(`❌ Erro ao salvar análise com falha: ${saveError.message}`);
        }
      }
    })();

  } catch (error) {
    console.error("❌ Erro ao processar webhook:", error);
  }
};
