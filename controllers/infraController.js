
import { analisarCommit } from "../openaiService.js";
import { enviarNotificacaoDiscord } from "../discordService.js";

export const healthCheckExtendedHandler = async (req, res) => {
  const openaiReady = !!process.env.OPENAI_API_KEY;
  const discordReady = !!process.env.DISCORD_WEBHOOK_URL;
  try {
    let openaiStatus = openaiReady ? "OK" : "NÃO CONFIGURADA";
    let discordStatus = discordReady ? "OK" : "NÃO CONFIGURADA";

    if (openaiReady) {
      try {
        // Só testa conectividade, sem consumir tokens reais
        await analisarCommit({
          repo: "HEALTHCHECK",
          author: "health",
          message: "health test",
          diff: "Linha fake para healthcheck"
        });
        openaiStatus = "funcionando";
      } catch (e) {
        openaiStatus = "erro: " + e.message;
      }
    }
    if (discordReady) {
      try {
        await enviarNotificacaoDiscord({
          repo: "HEALTHCHECK",
          author: "health",
          message: "health test",
          url: "https://fake/health",
          analise: "simulado"
        });
        discordStatus = "funcionando";
      } catch (e) {
        discordStatus = "erro: " + e.message;
      }
    }
    res.json({
      success: true,
      service: "Repo Analyzer",
      openaiApi: openaiStatus,
      discordWebhook: discordStatus,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Erro healthcheck",
      error: error.message
    });
  }
};

export const selfTestHandler = async (req, res) => {
  // Simula ciclo completo: análise + discord + db
  try {
    const commitData = {
      repo: "SELFTEST",
      author: "Autotest",
      message: "Test commit for selfcheck",
      diff: "+ test",
    };
    const analise = await analisarCommit(commitData);
    let discordStatus = "SKIPPED";
    if (process.env.DISCORD_WEBHOOK_URL) {
      await enviarNotificacaoDiscord({
        repo: commitData.repo,
        author: commitData.author,
        message: commitData.message,
        url: "https://github.com/selftest/1",
        analise
      });
      discordStatus = "OK!";
    }
    res.json({
      success: true,
      analysis: analise,
      discord: discordStatus
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
