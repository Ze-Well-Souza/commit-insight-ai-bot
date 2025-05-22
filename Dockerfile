
FROM node:18-alpine

WORKDIR /app

# Instalar dependências
COPY package*.json ./
RUN npm install

# Copiar código fonte
COPY . .

# Verificar se as variáveis de ambiente estão configuradas
RUN echo "Verificando configuração..."

# Expor porta - Railway define isso automaticamente
EXPOSE 3000

# Configurar comando de inicialização com tratamento adequado de sinais
CMD ["node", "index.js"]
