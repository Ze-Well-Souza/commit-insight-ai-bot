
# Repo Analyzer Bot

Bot de análise automática de commits usando GitHub API e OpenAI.

## Funcionalidades

- Webhook para receber notificações de novos commits
- Análise automática de commits usando OpenAI
- Integração com GitHub Actions

## Configuração

### Variáveis de Ambiente

Crie um arquivo `.env` com as seguintes variáveis:

```
PORT=3000
OPENAI_API_KEY=sua_chave_api_openai
```

### Instalação

```bash
npm install
npm start
```

### Docker

```bash
docker build -t repo-analyzer-bot .
docker run -p 3000:3000 --env-file .env repo-analyzer-bot
```

## Integração com GitHub

1. Configure um webhook no seu repositório GitHub:
   - URL: `https://seu-dominio.com/webhook`
   - Eventos: `push`

2. Ou use GitHub Actions (recomendado):
   
```yaml
name: Commit Analysis

on:
  push:
    branches: [ main, master, develop ]

jobs:
  analyze:
    runs-on: ubuntu-latest
    steps:
    - name: Notify Analyzer Bot
      uses: fjogeleit/http-request-action@v1
      with:
        url: 'https://seu-dominio.com/webhook'
        method: 'POST'
        data: |
          {
            "repository": "${{ github.repository }}",
            "commits": "${{ toJSON(github.event.commits) }}"
          }
```

## Uso

Quando um novo commit é enviado para o repositório, o webhook é acionado e a análise é realizada automaticamente.

```

## Hospedagem

Recomendado: Railway, Render ou Fly.io com as seguintes variáveis de ambiente configuradas:
- `PORT`: 3000 (ou será usado o padrão da plataforma)
- `OPENAI_API_KEY`: Sua chave API da OpenAI
