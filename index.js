import express from "express";
import bodyParser from "body-parser";
import dotenv from "dotenv";
import { analisarCommit } from "./openaiService.js";

dotenv.config();

const app = express();
app.use(bodyParser.json());

app.post("/webhook", async (req, res) => {
  const eventType = req.headers["x-github-event"];

  if (eventType === "ping") {
    console.log("🔔 Ping recebido do GitHub");
    return res.status(200).send("✅ Pong do webhook");
  }

  const commits = req.body.commits || [];
  const repo = req.body.repository?.full_name || "Repositório desconhecido";

  for (const commit of commits) {
    const message = commit.message;
    const diff = `Repositório: ${repo}\nAutor: ${commit.author.name}\nMensagem: ${message}\nURL: ${commit.url}`;
    console.log(`📦 Commit recebido: ${message}`);
    await analisarCommit(diff);
  }

  res.status(200).send("✅ Commit processado com sucesso");
});


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Webhook ativo em http://localhost:${PORT}/webhook`);
});
