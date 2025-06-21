#!/bin/bash
set -e

echo "🛑 Parando todos os contêineres do projeto (dev e prod)..."

# Tenta parar ambos os ambientes. O Docker ignora os arquivos que não se aplicam.
docker compose -f docker-compose.dev.yml -f docker-compose.prod.yml down

echo "✅ Contêineres parados com sucesso." 