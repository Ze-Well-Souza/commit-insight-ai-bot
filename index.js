import express from "express";
import bodyParser from "body-parser";
import dotenv from "dotenv";
import cors from "cors";
import { analisarCommit } from "./openaiService.js";
import { enviarNotificacaoDiscord } from "./discordService.js";
import { initializeDatabase, saveAnalysis, getAllAnalyses, getAnalysisById } from "./database.js";

// Carregar variáveis de ambiente do arquivo .env (se existir)
dotenv.config();

// --- Validação de Configuração Crítica ---
// O servidor irá iniciar, mas funcionalidades chave serão desativadas se as variáveis não estiverem presentes.
// Logs de aviso são emitidos para facilitar a depuração.
if (!process.env.OPENAI_API_KEY) {
  console.warn("⚠️ AVISO: OPENAI_API_KEY não está configurada! O serviço não funcionará corretamente.");
}
if (!process.env.DISCORD_WEBHOOK_URL) {
  console.warn("⚠️ AVISO: DISCORD_WEBHOOK_URL não está configurada! As notificações não serão enviadas.");
}

const app = express();

// --- Middlewares ---
// CORS: Controla quais domínios podem acessar a API.
// FRONTEND_URL: Deve ser a URL do seu painel React. Se não for definida, '*' permite qualquer domínio (menos seguro).
app.use(cors({
  origin: process.env.FRONTEND_URL || '*',
  credentials: true
}));

app.use(bodyParser.json({
  limit: '10mb',
  verify: (req, res, buf) => {
    req.rawBody = buf;
  }
}));

// Inicializar banco de dados SQLite
await initializeDatabase();

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
      OPENAI_API_KEY: process.env.OPENAI_API_KEY ? "***configurada***" : "não configurada",
      DISCORD_WEBHOOK_URL: process.env.DISCORD_WEBHOOK_URL ? "***configurada***" : "não configurada"
    }
  });
});

// NOVOS ENDPOINTS REST PARA FRONTEND

// GET /api/analyses - Buscar todas as análises
app.get("/api/analyses", async (req, res) => {
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
});

// GET /api/analyses/:id - Buscar análise específica
app.get("/api/analyses/:id", async (req, res) => {
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
});

// POST /api/analyze - Disparar nova análise
app.post("/api/analyze", async (req, res) => {
  try {
    const { repositoryUrl, commitSha, commitMessage, author, diff } = req.body;

    // Validações básicas
    if (!repositoryUrl || !commitMessage || !author) {
      return res.status(400).json({
        success: false,
        message: "Campos obrigatórios: repositoryUrl, commitMessage, author"
      });
    }

    // Resposta imediata para o frontend
    res.status(202).json({
      success: true,
      message: "Análise iniciada com sucesso",
      status: "processing"
    });

    // Processar análise de forma assíncrona
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
        
        // Salvar no banco de dados
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

        // Enviar notificação Discord (opcional)
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
        
        // Salvar erro no banco
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
});

// Webhook do GitHub (atualizado para salvar no banco)
app.post("/webhook", async (req, res) => {
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

    // Processar análise de forma assíncrona
    (async () => {
      try {
        console.log(`🔍 Analisando commit: ${commit_message.substring(0, 50)}...`);
        
        const analise = await analisarCommit({
          repo: repository,
          author: author,
          message: commit_message,
          diff: diff,
        });

        // Salvar no banco de dados
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

        await enviarNotificacaoDiscord({
          repo: repository,
          author: author,
          message: commit_message,
          url: commit_url,
          analise: analise,
        });

      } catch (error) {
        console.error(`❌ Erro durante a análise assíncrona do commit: ${error.message}`);
        
        // Salvar erro no banco
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
🗄️ Banco de dados: SQLite inicializado
⏰ Data/Hora: ${new Date().toISOString()}

🌐 URLs:
- Status: http://localhost:${PORT}/
- Webhook: http://localhost:${PORT}/webhook
- API Análises: http://localhost:${PORT}/api/analyses
- Disparar Análise: http://localhost:${PORT}/api/analyze
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
});

process.on("unhandledRejection", (reason, promise) => {
  console.error("❌ Promessa rejeitada não tratada:", reason);
});
