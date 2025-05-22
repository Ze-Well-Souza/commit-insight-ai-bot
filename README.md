
# Repo Analyzer Bot

Bot de análise automática de commits usando GitHub API e OpenAI.

## Configuração para Railway

### Variáveis de Ambiente Obrigatórias

Configure estas variáveis no painel do Railway:

- `OPENAI_API_KEY`: Sua chave API da OpenAI (obrigatória)

### Verificação de Status

Após o deploy, acesse a URL:
- `/status` - Para verificar o estado do serviço e configuração
- `/test-repo` - Para testar a integração com o repositório techcare-connect-automator

## Integrações disponíveis para notificações

Para receber notificações dos commits analisados, considere estas opções:

### 1. Discord (recomendado)
- Configure um webhook do Discord no seu servidor
- Adicione a URL do webhook como variável de ambiente `DISCORD_WEBHOOK_URL`

### 2. Telegram
- Crie um bot no BotFather e obtenha o token
- Configure `TELEGRAM_BOT_TOKEN` e `TELEGRAM_CHAT_ID`

### 3. Notify.run (simples, sem custos)
- Crie um canal em https://notify.run/
- Use a URL do canal para receber notificações no navegador

### 4. Slack
- Configure um App no Slack workspace
- Adicione a Webhook URL como `SLACK_WEBHOOK_URL`

## Uso

Quando um novo commit é enviado para o repositório, o webhook é acionado e a análise é realizada automaticamente.

## Solução de Problemas

Se a aplicação falhar no Railway:
1. Verifique se a variável `OPENAI_API_KEY` está configurada corretamente
2. Acesse os logs para identificar possíveis erros
3. Teste localmente antes de fazer deploy

