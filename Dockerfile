
FROM node:18-alpine

WORKDIR /app

# Instalar dependências
COPY package*.json ./
RUN npm install

# Copiar código fonte
COPY . .

# Expor porta - Railway define isso automaticamente, mas vamos manter para clareza
EXPOSE 3000

# Configurar comando de inicialização com tratamento adequado de sinais
CMD ["node", "index.js"]
