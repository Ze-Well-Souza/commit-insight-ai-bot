
FROM node:18-alpine

WORKDIR /app

# Instalar dependências
COPY package*.json ./
RUN npm install

# Copiar código fonte
COPY . .

# Expor porta
EXPOSE 3000

# Iniciar aplicação com tratamento adequado de sinais
CMD ["node", "index.js"]
