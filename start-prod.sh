#!/bin/bash
set -e

echo "Verificando o ambiente..."
if [ -f "docker-compose.override.yml" ]; then
    echo "-> Desativando modo de desenvolvimento (renomeando .yml para .bak)"
    mv docker-compose.override.yml docker-compose.override.yml.bak
fi

echo "🏭 Iniciando contêineres em modo de PRODUÇÃO..."
docker compose up --build -d

echo "✅ Ambiente de produção pronto em http://localhost:5173" 