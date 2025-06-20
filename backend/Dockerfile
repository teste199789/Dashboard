# Use uma imagem oficial do Node.js como base.
# Escolha uma versão LTS (Long Term Support) para estabilidade.
FROM node:20-slim

# Define o diretório de trabalho dentro do contêiner.
WORKDIR /app

# Copia os arquivos de definição de pacotes.
# O '.*' é para incluir arquivos como .npmrc se existirem.
COPY package*.json ./

# Instala as dependências do projeto.
RUN npm install

# Copia o schema do Prisma para dentro do contêiner.
COPY prisma ./prisma/

# Gera o cliente Prisma. Este passo é crucial para o ORM funcionar.
RUN npx prisma generate

# Copia o restante do código da aplicação.
COPY . .

# Expõe a porta que a API usa para se comunicar.
EXPOSE 3001

# Comando para iniciar a aplicação.
# Usamos "npm run dev" conforme a configuração do seu projeto.
# Para um ambiente de produção real, seria ideal ter um script "start" que use "node server.js".
CMD ["npm", "run", "dev"] 