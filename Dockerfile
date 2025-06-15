
FROM node:18-alpine

WORKDIR /app

# Instalar dependências do sistema para SQLite
RUN apk add --no-cache sqlite

# Instalar dependências
COPY package*.json ./
RUN npm install

# Copiar código fonte
COPY . .

# Criar diretório para banco de dados 
RUN mkdir -p /app/data 

# Usar DATABASE_PATH por padrão na imagem Docker
ENV DATABASE_PATH=/app/data/analyses.db

# Expor porta - Railway define isso automaticamente  
EXPOSE 3000

# Configurar comando de inicialização com tratamento adequado de sinais
CMD ["node", "index.js"]
