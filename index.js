import express from "express";
import bodyParser from "body-parser";
import dotenv from "dotenv";
import { analisarCommit } from "./openaiService.js";
import { enviarNotificacaoDiscord } from "./discordService.js";

// Carregar variáveis de ambiente
dotenv.config();

// Verificar configuração crítica
if (!process.env.OPENAI_API_KEY) {
  console.warn("⚠️ AVISO: OPENAI_API_KEY não está configurada! O serviço não funcionará corretamente.");
}
if (!process.env.DISCORD_WEBHOOK_URL) {
  console.warn("⚠️ AVISO: DISCORD_WEBHOOK_URL não está configurada! As notificações não serão enviadas.");
}

const app = express();
app.use(bodyParser.json({
  limit: '10mb', // Aumentar limite para commits grandes
  verify: (req, res, buf) => {
    req.rawBody = buf;
  }
}));

// Rota de verificação de saúde - crucial para Railway
app.get("/", (req, res) => {
  const apiStatus = process.env.OPENAI_API_KEY ? "configurada" : "NÃO configurada";
  const discordStatus = process.env.DISCORD_WEBHOOK_URL ? "configurada" : "NÃO configurada";
  res.status(200).send(`✅ Webhook ativo. OpenAI API: ${apiStatus}. Discord Webhook: ${discordStatus}.`);
});

// Rota de diagnóstico detalhado
app.get("/status", (req, res) => {
  res.status(200).json({
    status: "online",
    timestamp: new Date().toISOString(),
    version: "1.0.0",
    environment: process.env.NODE_ENV || 'development',
    apiKeyConfigured: !!process.env.OPENAI_API_KEY,
    envVars: {
      PORT: process.env.PORT || '3000',
      NODE_ENV: process.env.NODE_ENV || 'não definido',
      // Não mostrar a chave completa, apenas se existe
      OPENAI_API_KEY: process.env.OPENAI_API_KEY ? "***configurada***" : "não configurada",
      DISCORD_WEBHOOK_URL: process.env.DISCORD_WEBHOOK_URL ? "***configurada***" : "não configurada"
    }
  });
});

app.post("/webhook", async (req, res) => {
  try {
    const eventType = req.headers["x-github-event"];
    console.log(`📌 Evento recebido: ${eventType || "push"}`);

    if (eventType === "ping") {
      console.log("🔔 Ping recebido do GitHub");
      return res.status(200).send("✅ Pong do webhook");
    }

    // A partir de agora, esperamos um payload customizado do GitHub Actions
    const { repository, author, commit_message, commit_sha, diff, commit_url } = req.body;

    if (!diff) {
      console.error("❌ O 'diff' do commit não foi encontrado no corpo da requisição.");
      return res.status(400).send("O 'diff' do commit é obrigatório.");
    }
    
    console.log(`📦 Recebido commit de ${repository}`);
    
    res.status(202).send("✅ Webhook recebido, análise em andamento.");

    // Processa a análise de forma assíncrona
    (async () => {
      try {
        console.log(`🔍 Analisando commit: ${commit_message.substring(0, 50)}...`);
        
        const analise = await analisarCommit({
          repo: repository,
          author: author,
          message: commit_message,
          diff: diff,
        });

        console.log(`✅ Análise do commit ${commit_sha.substring(0,7)} concluída.`);

        await enviarNotificacaoDiscord({
          repo: repository,
          author: author,
          message: commit_message,
          url: commit_url,
          analise: analise,
        });

      } catch (error) {
        console.error(`❌ Erro durante a análise assíncrona do commit: ${error.message}`);
      }
    })();

  } catch (error) {
    console.error("❌ Erro ao processar webhook:", error);
    // A resposta já foi enviada, então apenas logamos o erro.
  }
});

// Teste de integração com o repositório específico
app.get("/test-repo", async (req, res) => {
  try {
    const repoUrl = "https://github.com/Ze-Well-Souza/techcare-connect-automator";
    const testCommit = {
      message: "Teste de integração",
      author: { name: "Sistema de Teste" },
      url: repoUrl,
      id: "test123"
    };
    
    console.log(`🧪 Testando integração com ${repoUrl}`);
    
    const diff = `Repositório: ${repoUrl}\nAutor: ${testCommit.author.name}\nMensagem: ${testCommit.message}\nURL: ${testCommit.url}`;
    const analise = await analisarCommit(diff);
    
    res.status(200).json({
      success: true,
      message: "Teste de integração realizado com sucesso",
      analysis: analise
    });
  } catch (error) {
    console.error("❌ Erro no teste de integração:", error);
    res.status(500).json({
      success: false,
      message: `Erro no teste: ${error.message}`
    });
  }
});

// Tratamento de erros para rotas não encontradas
app.use((req, res) => {
  res.status(404).send("Rota não encontrada");
});

// Tratamento de erros globais
app.use((err, req, res, next) => {
  console.error("❌ Erro na aplicação:", err);
  res.status(500).send("Erro interno do servidor");
});

const PORT = process.env.PORT || 3000;

// Iniciar servidor com tratamento de erros
const server = app.listen(PORT, () => {
  console.log(`
🚀 Servidor iniciado!
📡 Porta: ${PORT}
🔑 OpenAI API: ${process.env.OPENAI_API_KEY ? "configurada" : "NÃO CONFIGURADA"}
🔔 Discord Webhook: ${process.env.DISCORD_WEBHOOK_URL ? "configurado" : "NÃO CONFIGURADO"}
⏰ Data/Hora: ${new Date().toISOString()}

🌐 URLs:
- Status: http://localhost:${PORT}/
- Webhook: http://localhost:${PORT}/webhook
- Teste: http://localhost:${PORT}/test-repo
  `);
});

// Tratamento para garantir que o servidor feche adequadamente
process.on("SIGTERM", () => {
  console.log("🛑 Recebido sinal SIGTERM, encerrando servidor...");
  server.close(() => {
    console.log("✅ Servidor encerrado com sucesso");
    process.exit(0);
  });
});

process.on("SIGINT", () => {
  console.log("🛑 Recebido sinal SIGINT, encerrando servidor...");
  server.close(() => {
    console.log("✅ Servidor encerrado com sucesso");
    process.exit(0);
  });
});

// Capturar exceções não tratadas
process.on("uncaughtException", (error) => {
  console.error("❌ Exceção não tratada:", error);
  // Não derrubar o servidor, apenas registrar o erro
});

process.on("unhandledRejection", (reason, promise) => {
  console.error("❌ Promessa rejeitada não tratada:", reason);
  // Não derrubar o servidor, apenas registrar o erro
});
