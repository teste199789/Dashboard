#!/bin/bash
set -e

echo "Verificando o ambiente..."
if [ -f "docker-compose.override.yml.bak" ]; then
    echo "-> Ativando modo de desenvolvimento (renomeando .bak para .yml)"
    mv docker-compose.override.yml.bak docker-compose.override.yml
fi

echo "🚀 Iniciando contêineres em modo de DESENVOLVIMENTO..."
docker compose up --build -d

echo "✅ Ambiente de desenvolvimento pronto em http://localhost:5174" 