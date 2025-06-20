# Use a mesma imagem base do Node.js para consistência.
FROM node:20-slim

# Define o diretório de trabalho.
WORKDIR /app

# Copia os arquivos de definição de pacotes.
COPY package*.json ./

# Instala as dependências.
RUN npm install

# Copia todo o código-fonte do frontend.
COPY . .

# O Vite precisa ser exposto em todas as interfaces de rede dentro do contêiner.
# O Vite por padrão roda na porta 5173.
EXPOSE 5173

# Comando para iniciar o servidor de desenvolvimento do Vite.
# O argumento '--host' é crucial para que o servidor seja acessível de fora do contêiner.
CMD ["npm", "run", "dev", "--", "--host"] 