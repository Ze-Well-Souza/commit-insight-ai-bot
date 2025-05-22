require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const { analisarCommit } = require("./openaiService");

const app = express();
app.use(bodyParser.json());

app.post("/webhook", async (req, res) => {
  const commits = req.body.commits || [];
  const repo = req.body.repository.full_name;

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
