
# Repo Analyzer Bot

Um bot que utiliza a API da OpenAI para analisar automaticamente os commits do seu repositório e enviar um resumo para o Discord. Esta aplicação consiste em um **backend Node.js/Express** e um **painel de controle frontend em React**.

## Como Funciona

1.  Você faz um `push` para uma das branches configuradas (ex: `main`).
2.  Uma **GitHub Action** é acionada no seu repositório.
3.  A Action coleta as informações do commit, incluindo as **alterações no código (diff)**.
4.  Essas informações são enviadas via webhook para o backend desta aplicação.
5.  O backend usa a **OpenAI** para gerar uma análise de code review.
6.  O resultado é postado como uma notificação em um canal do **Discord** e salvo em um banco de dados SQLite.
7.  O **painel de controle (frontend)** permite visualizar o histórico de análises e disparar análises manuais.

---

## 🚀 Configuração para Produção (Ex: Railway)

Para implantar esta aplicação, você precisa configurar variáveis de ambiente tanto no backend quanto no frontend.

### Variáveis de Ambiente do Backend

No seu serviço de hospedagem (Railway, Heroku, etc.), configure as seguintes variáveis:

-   `OPENAI_API_KEY`: **(Obrigatório)** Sua chave da API da OpenAI.
-   `DISCORD_WEBHOOK_URL`: **(Obrigatório)** A URL do webhook do seu canal no Discord.
-   `FRONTEND_URL`: A URL onde seu frontend está hospedado (ex: `https://meu-painel.vercel.app`). Usado para configurar o CORS corretamente. Se não definida, aceitará qualquer origem (`*`).
-   `PORT`: A porta em que o servidor irá rodar. Serviços como o Railway geralmente definem isso automaticamente. O padrão é `3000`.

> **Como obter uma URL de Webhook do Discord?**
> 1. No seu servidor Discord, clique com o botão direito no canal de texto onde deseja receber as notificações.
> 2. Vá em `Editar Canal` > `Integrações`.
> 3. Clique em `Criar Webhook`.
> 4. Dê um nome ao webhook (ex: "Analisador de Commits") e copie a `URL do Webhook`. Cole esse valor na variável de ambiente.

### Variáveis de Ambiente do Frontend

No seu serviço de hospedagem do frontend (Vercel, Netlify, etc.), configure:

-   `VITE_API_URL`: **(Obrigatório)** A URL completa do seu backend (ex: `https://meu-backend.up.railway.app`).

---

### Configurar a GitHub Action no seu Repositório

No repositório que você deseja monitorar, faça o seguinte:

1.  Vá em `Settings` > `Secrets and variables` > `Actions`.
2.  Crie um novo "repository secret" com o nome `ANALYZER_WEBHOOK_URL`.
3.  No valor do secret, cole a URL do seu backend, seguida de `/webhook` (ex: `https://meu-backend.up.railway.app/webhook`).
4.  Crie o arquivo `.github/workflows/repo-analyzer.yml` no seu repositório com o conteúdo do arquivo `public/webhook-example.yml` deste projeto.

Pronto! Agora, a cada `push`, a análise será realizada e enviada para o Discord, além de ficar visível no painel.

## Solução de Problemas

Se nada acontecer após um push:
1.  Verifique os logs da sua aplicação de backend na Railway (ou onde estiver hospedado).
2.  Verifique se todas as variáveis de ambiente (`OPENAI_API_KEY`, `DISCORD_WEBHOOK_URL`, `VITE_API_URL`) estão corretas e acessíveis pelos respectivos serviços.
3.  No GitHub, vá na aba "Actions" do seu repositório, clique no workflow "Repo Analyzer Bot" e verifique se houve algum erro na execução.
