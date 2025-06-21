# Use uma imagem oficial do Node.js como base.
FROM node:20-slim

# Define o diretório de trabalho da aplicação.
WORKDIR /app

# Instala o OpenSSL, uma dependência comum para o Prisma.
RUN apt-get update && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

# Copia os arquivos de gerenciamento de pacotes.
COPY package*.json ./

# Instala as dependências do projeto.
RUN npm install

# Copia o restante dos arquivos da aplicação (respeitando o .dockerignore).
COPY . .

# Gera o cliente do Prisma com base no schema copiado.
RUN npx prisma generate

# Expõe a porta que a aplicação usará.
EXPOSE 3001

# O comando padrão para iniciar o container em desenvolvimento.
CMD ["npm", "run", "dev"] 