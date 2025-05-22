
import express from "express";
import bodyParser from "body-parser";
import dotenv from "dotenv";
import { analisarCommit } from "./openaiService.js";

// Carregar variáveis de ambiente
dotenv.config();

// Verificar configuração crítica
if (!process.env.OPENAI_API_KEY) {
  console.warn("⚠️ AVISO: OPENAI_API_KEY não está configurada! O serviço não funcionará corretamente.");
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
  res.status(200).send(`✅ Webhook ativo e funcionando. OpenAI API: ${apiStatus}`);
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
      OPENAI_API_KEY: process.env.OPENAI_API_KEY ? "***configurada***" : "não configurada"
    }
  });
});

app.post("/webhook", async (req, res) => {
  try {
    const eventType = req.headers["x-github-event"];
    console.log(`📌 Evento recebido: ${eventType || "Desconhecido"}`);

    if (eventType === "ping") {
      console.log("🔔 Ping recebido do GitHub");
      return res.status(200).send("✅ Pong do webhook");
    }

    // Validar a requisição
    if (!req.body) {
      console.error("❌ Corpo da requisição vazio");
      return res.status(400).send("Corpo da requisição vazio");
    }

    const commits = req.body.commits || [];
    const repo = req.body.repository?.full_name || "Repositório desconhecido";
    
    console.log(`📦 Recebidos ${commits.length} commits do repositório: ${repo}`);
    
    // Responder imediatamente para evitar timeout no GitHub
    res.status(202).send(`✅ Webhook recebido, processando ${commits.length} commits`);

    // Processar os commits de forma assíncrona após responder
    for (const commit of commits) {
      const message = commit.message || "Sem mensagem";
      const author = commit.author?.name || "Autor desconhecido";
      const url = commit.url || "";
      
      console.log(`🔍 Analisando commit: ${message.substring(0, 50)}${message.length > 50 ? '...' : ''}`);
      
      try {
        const diff = `Repositório: ${repo}\nAutor: ${author}\nMensagem: ${message}\nURL: ${url}`;
        const analise = await analisarCommit(diff);
        console.log(`✅ Commit analisado com sucesso: ${commit.id?.substring(0, 7) || "ID desconhecido"}`);
        console.log(`📝 Análise: ${analise.substring(0, 100)}...`);
        
        // Aqui você poderia adicionar código para enviar notificações
        // via SMS, WhatsApp, etc.
        
      } catch (error) {
        console.error(`❌ Erro ao analisar commit: ${error.message}`);
      }
    }
  } catch (error) {
    console.error("❌ Erro ao processar webhook:", error);
    // Não retornar erro aqui, pois já enviamos a resposta acima
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
⏰ Data/Hora: ${new Date().toISOString()}

🌐 URLs:
- Webhook: http://localhost:${PORT}/webhook
- Status: http://localhost:${PORT}/status
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
