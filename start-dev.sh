#!/bin/bash
set -e

echo "🚀 Iniciando ambiente de DESENVOLVIMENTO..."

# Especifica o arquivo de compose de desenvolvimento.
docker compose -f docker-compose.dev.yml up -d --build

echo "✅ Ambiente de desenvolvimento pronto em http://localhost:5174" 