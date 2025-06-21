#!/bin/bash
set -e

# Default to running backup
RUN_BACKUP=true

# Check for --no-backup flag
if [ "$1" == "--no-backup" ]; then
  RUN_BACKUP=false
fi

# Executar backup ANTES de parar os contêineres, se a flag não for passada
if [ "$RUN_BACKUP" = true ]; then
  echo "Executando o script de backup..."
  if [ -f ./backup.sh ]; then
      ./backup.sh
  else
    echo "AVISO: Script backup.sh não encontrado. Pulando etapa de backup."
  fi
else
    echo "O backup não será executado (--no-backup)."
fi

# Parar os contêineres de produção
echo "Parando os contêineres de produção..."
if docker compose -f docker-compose.prod.yml down --volumes --remove-orphans; then
  echo "Contêineres de produção parados com sucesso."
else
  echo "Falha ao parar os contêineres de produção. Pode ser que eles já estivessem parados."
fi
