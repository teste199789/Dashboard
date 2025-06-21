#!/bin/bash
set -e

echo "🏭 Iniciando ambiente de PRODUÇÃO..."

# Especifica o arquivo de compose de produção.
docker compose -f docker-compose.prod.yml up --build -d

echo "✅ Ambiente de produção pronto em http://localhost:5173" 