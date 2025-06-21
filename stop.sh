#!/bin/bash
set -e

# Verifica se o contêiner de produção está em execução antes de fazer o backup
PROD_CONTAINER_NAME="dashboard-postgres-prod"
# O comando 'docker ps' filtra pelo nome exato do contêiner. Se retornar algo, o contêiner está ativo.
if [ -n "$(docker ps -q -f name=^/${PROD_CONTAINER_NAME}$)" ]; then
    echo "📦 Ambiente de produção detectado. Executando script de backup antes de parar..."
    
    # Verifica se o script de backup existe e é executável
    if [ -x "./backup.sh" ]; then
        ./backup.sh
    else
        echo "AVISO: O script backup.sh não foi encontrado ou não é executável. Pulando etapa do backup."
    fi
else
    echo "🔎 Ambiente de produção não parece estar em execução. Pulando o backup."
fi

echo "🛑 Parando todos os contêineres do projeto (dev e prod)..."

# Tenta parar ambos os ambientes. O Docker ignora os arquivos que não se aplicam.
docker compose -f docker-compose.dev.yml -f docker-compose.prod.yml down

echo "✅ Contêineres parados com sucesso." 