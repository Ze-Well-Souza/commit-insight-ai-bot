
import express from "express";
import bodyParser from "body-parser";
import dotenv from "dotenv";
import cors from "cors";
import { initializeDatabase } from "./database.js";

import mainRoutes from './routes/mainRoutes.js';
import apiRoutes from './routes/apiRoutes.js';
import webhookRoutes from './routes/webhookRoutes.js';

// Carregar variáveis de ambiente do arquivo .env (se existir)
dotenv.config();

// --- Validação de Configuração Crítica ---
if (!process.env.OPENAI_API_KEY) {
  console.warn("⚠️ AVISO: OPENAI_API_KEY não está configurada! O serviço não funcionará corretamente.");
}
if (!process.env.DISCORD_WEBHOOK_URL) {
  console.warn("⚠️ AVISO: DISCORD_WEBHOOK_URL não está configurada! As notificações não serão enviadas.");
}

const app = express();

// --- Middlewares ---
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

// --- Rotas ---
app.use('/', mainRoutes);
app.use('/api', apiRoutes);
app.use('/', webhookRoutes); // O webhook está em /webhook

// --- Tratamento de Erros ---
// Para rotas não encontradas
app.use((req, res) => {
  res.status(404).send("Rota não encontrada");
});

// Tratamento de erros globais
app.use((err, req, res, next) => {
  console.error("❌ Erro na aplicação:", err);
  res.status(500).send("Erro interno do servidor");
});

const PORT = process.env.PORT || 3000;

// Iniciar servidor
const server = app.listen(PORT, () => {
  console.log(`
🚀 Servidor iniciado e refatorado!
📡 Porta: ${PORT}
🔑 OpenAI API: ${process.env.OPENAI_API_KEY ? "configurada" : "NÃO CONFIGURADA"}
🔔 Discord Webhook: ${process.env.DISCORD_WEBHOOK_URL ? "configurado" : "NÃO CONFIGURADO"}
🗄️ Banco de dados: SQLite inicializado
⏰ Data/Hora: ${new Date().toISOString()}

🌐 URLs:
- Status: http://localhost:${PORT}/status
- Webhook: http://localhost:${PORT}/webhook
- API Análises: http://localhost:${PORT}/api/analyses
  `);
});

// --- Tratamento de Encerramento do Processo ---
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
