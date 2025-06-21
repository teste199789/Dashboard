#!/bin/bash
set -e

echo "🛑 Parando todos os contêineres do projeto..."
docker compose down
echo "✅ Contêineres parados com sucesso." 