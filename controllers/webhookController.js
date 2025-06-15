
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

    // Validação mais robusta dos dados recebidos
    const { repository, author, commit_message, commit_sha, diff, commit_url } = req.body;

    if (!repository) {
      console.error("❌ Campo 'repository' é obrigatório.");
      return res.status(400).json({ error: "Campo 'repository' é obrigatório." });
    }
    if (!commit_message) {
      console.error("❌ Campo 'commit_message' é obrigatório.");
      return res.status(400).json({ error: "Campo 'commit_message' é obrigatório." });
    }
    if (!commit_sha) {
      console.error("❌ Campo 'commit_sha' é obrigatório.");
      return res.status(400).json({ error: "Campo 'commit_sha' é obrigatório." });
    }
    if (!diff) {
      console.error("❌ O 'diff' do commit não foi encontrado no corpo da requisição.");
      return res.status(400).json({ error: "O 'diff' do commit é obrigatório." });
    }
    // Limitar tamanho dos campos.
    if (diff.length > 20000) {
      return res.status(400).json({ error: "O campo 'diff' excede limite de 20.000 caracteres." });
    }
    if (commit_message.length > 500) {
      return res.status(400).json({ error: "O campo 'commit_message' excede 500 caracteres." });
    }
    if (repository.length > 250) {
      return res.status(400).json({ error: "O campo 'repository' excede 250 caracteres." });
    }
    // author pode ser string ou objeto (compat), segurar string "Desconhecido"
    const safeAuthor = typeof author === "string" && author.length <= 120
      ? author
      : (typeof author === "object" && author?.name ? author.name : "Desconhecido");

    console.log(`📦 Recebido commit de ${repository}`);

    res.status(202).json({
      message: "Webhook recebido, análise em andamento.",
      commit_sha: commit_sha.substring(0, 7)
    });

    // Processamento assíncrono
    (async () => {
      try {
        console.log(`🔍 Analisando commit: ${commit_message.substring(0, 50)}...`);

        const analise = await analisarCommit({
          repo: repository,
          author: safeAuthor,
          message: commit_message,
          diff: diff,
        });

        await saveAnalysis({
          commit_sha: commit_sha,
          commit_message: commit_message,
          author: safeAuthor,
          repository: repository,
          timestamp: new Date().toISOString(),
          analysis_content: analise,
          status: 'Completed',
          commit_url: commit_url || `https://github.com/${repository}/commit/${commit_sha}`
        });

        console.log(`✅ Análise do commit ${commit_sha.substring(0,7)} concluída e salva.`);

        if(process.env.DISCORD_WEBHOOK_URL) {
          await enviarNotificacaoDiscord({
            repo: repository,
            author: safeAuthor,
            message: commit_message,
            url: commit_url || `https://github.com/${repository}/commit/${commit_sha}`,
            analise: analise,
          });
        }

      } catch (error) {
        console.error(`❌ Erro durante a análise assíncrona do commit: ${error.message}`);
        try {
          await saveAnalysis({
            commit_sha: commit_sha,
            commit_message: commit_message,
            author: safeAuthor,
            repository: repository,
            timestamp: new Date().toISOString(),
            analysis_content: `Erro na análise: ${error.message}`,
            status: 'Failed',
            commit_url: commit_url || `https://github.com/${repository}/commit/${commit_sha}`
          });
        } catch (saveError) {
          console.error(`❌ Erro ao salvar análise com falha: ${saveError.message}`);
        }
      }
    })();

  } catch (error) {
    console.error("❌ Erro ao processar webhook:", error);
    res.status(500).json({
      error: "Erro interno do servidor",
      message: error.message
    });
  }
};
