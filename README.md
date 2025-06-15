
# Repo Analyzer Bot

Um bot que utiliza a API da OpenAI para analisar automaticamente os commits do seu repositório e enviar um resumo para o Discord.

## Como Funciona

1.  Você faz um `push` para uma das branches configuradas (ex: `main`).
2.  Uma **GitHub Action** é acionada no seu repositório.
3.  A Action coleta as informações do commit, incluindo as **alterações no código (diff)**.
4.  Essas informações são enviadas via webhook para esta aplicação.
5.  A aplicação usa a **OpenAI** para gerar uma análise de code review.
6.  O resultado é postado como uma notificação em um canal do **Discord**.

## Configuração (2 Passos)

### Passo 1: Configurar Variáveis de Ambiente na Railway

No painel do seu projeto na Railway, vá para a aba "Variables" e configure:

-   `OPENAI_API_KEY`: Sua chave da API da OpenAI (obrigatória).
-   `DISCORD_WEBHOOK_URL`: A URL do webhook do seu canal no Discord (obrigatória para notificações).

> **Como obter uma URL de Webhook do Discord?**
> 1. No seu servidor Discord, clique com o botão direito no canal de texto onde deseja receber as notificações.
> 2. Vá em `Editar Canal` > `Integrações`.
> 3. Clique em `Criar Webhook`.
> 4. Dê um nome ao webhook (ex: "Analisador de Commits") e copie a `URL do Webhook`. Cole esse valor na variável de ambiente.

### Passo 2: Configurar a GitHub Action no seu Repositório

No repositório que você deseja monitorar, faça o seguinte:

1.  Vá em `Settings` > `Secrets and variables` > `Actions`.
2.  Crie um novo "repository secret" com o nome `ANALYZER_WEBHOOK_URL`.
3.  No valor do secret, cole a URL da sua aplicação na Railway, seguida de `/webhook` (ex: `https://seu-projeto.up.railway.app/webhook`).
4.  Crie o arquivo `.github/workflows/repo-analyzer.yml` no seu repositório com o conteúdo do arquivo `public/webhook-example.yml` deste projeto.

Pronto! Agora, a cada `push`, a análise será realizada e enviada para o Discord.

## Solução de Problemas

Se nada acontecer após um push:
1.  Verifique os logs da sua aplicação na Railway.
2.  Verifique se as variáveis `OPENAI_API_KEY` e `DISCORD_WEBHOOK_URL` estão corretas.
3.  No GitHub, vá na aba "Actions" do seu repositório, clique no workflow "Repo Analyzer Bot" e verifique se houve algum erro na execução.
