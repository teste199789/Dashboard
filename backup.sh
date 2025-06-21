#!/bin/bash

# Script de backup seguro para o banco de dados de produção
# Versão: 2.0 - Segurança aprimorada

set -e  # Parar em caso de erro

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}🔄 Iniciando processo de backup...${NC}"

# Verificar se o arquivo .env existe
if [ ! -f ".env" ]; then
    echo -e "${RED}❌ Erro: Arquivo .env não encontrado!${NC}"
    echo -e "${YELLOW}Execute: cp .env.example .env e configure as variáveis${NC}"
    exit 1
fi

# Carregar variáveis do .env de forma segura
set -a  # Automaticamente exportar variáveis
source .env
set +a

# Validar variáveis obrigatórias
if [ -z "$POSTGRES_USER" ] || [ -z "$POSTGRES_PASSWORD" ] || [ -z "$POSTGRES_DB" ]; then
    echo -e "${RED}❌ Erro: Variáveis de ambiente obrigatórias não configuradas!${NC}"
    echo -e "${YELLOW}Verifique se POSTGRES_USER, POSTGRES_PASSWORD e POSTGRES_DB estão definidas no .env${NC}"
    exit 1
fi

# Configurações do backup
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_DIR="./backups"
LOCAL_BACKUP_PATH="$BACKUP_DIR/backup_${TIMESTAMP}.sql.gz"
DB_CONTAINER_NAME="dashboard-postgres-prod"

# Verificar se o diretório de backup existe
mkdir -p "$BACKUP_DIR"

# Verificar se o container do banco está rodando
if ! docker ps | grep -q "$DB_CONTAINER_NAME"; then
    echo -e "${YELLOW}⚠️  Container do banco não está rodando. Iniciando...${NC}"
    docker compose -f docker-compose.prod.yml up -d postgres-prod
    
    # Aguardar o banco ficar pronto
    echo -e "${BLUE}⏳ Aguardando banco de dados ficar pronto...${NC}"
    sleep 10
    
    CONTAINER_WAS_STOPPED=true
else
    CONTAINER_WAS_STOPPED=false
fi

# Realizar backup usando arquivo temporário para credenciais
echo -e "${BLUE}📦 Criando backup...${NC}"

# Criar arquivo temporário para senha (mais seguro)
PGPASSFILE=$(mktemp)
echo "*:*:*:$POSTGRES_USER:$POSTGRES_PASSWORD" > "$PGPASSFILE"
chmod 600 "$PGPASSFILE"

# Executar backup
if docker exec -e PGPASSFILE=/tmp/pgpass "$DB_CONTAINER_NAME" sh -c "
    echo '*:*:*:$POSTGRES_USER:$POSTGRES_PASSWORD' > /tmp/pgpass && 
    chmod 600 /tmp/pgpass && 
    pg_dump -U $POSTGRES_USER -d $POSTGRES_DB
" | gzip > "$LOCAL_BACKUP_PATH"; then
    echo -e "${GREEN}✅ Backup criado com sucesso: $LOCAL_BACKUP_PATH${NC}"
else
    echo -e "${RED}❌ Erro ao criar backup!${NC}"
    rm -f "$PGPASSFILE"
    exit 1
fi

# Limpar arquivo temporário
rm -f "$PGPASSFILE"

# Verificar se o backup foi criado e tem conteúdo
if [ -f "$LOCAL_BACKUP_PATH" ] && [ -s "$LOCAL_BACKUP_PATH" ]; then
    BACKUP_SIZE=$(du -h "$LOCAL_BACKUP_PATH" | cut -f1)
    echo -e "${GREEN}📊 Tamanho do backup: $BACKUP_SIZE${NC}"
else
    echo -e "${RED}❌ Erro: Backup não foi criado corretamente!${NC}"
    exit 1
fi

# Upload para Google Drive (se rclone estiver configurado)
if command -v rclone &> /dev/null; then
    if rclone listremotes | grep -q "backup_gdrive:"; then
        echo -e "${BLUE}☁️  Enviando backup para Google Drive...${NC}"
        
        if rclone copy "$LOCAL_BACKUP_PATH" backup_gdrive:dashboard-backups/; then
            echo -e "${GREEN}✅ Backup enviado para Google Drive com sucesso!${NC}"
        else
            echo -e "${YELLOW}⚠️  Falha ao enviar para Google Drive, mas backup local foi criado${NC}"
        fi
    else
        echo -e "${YELLOW}⚠️  Remote 'backup_gdrive' não configurado no rclone${NC}"
        echo -e "${YELLOW}💡 Configure com: rclone config${NC}"
    fi
else
    echo -e "${YELLOW}⚠️  rclone não instalado. Backup mantido apenas localmente${NC}"
    echo -e "${YELLOW}💡 Instale rclone para backup automático na nuvem${NC}"
fi

# Limpar backups antigos (manter apenas os 7 mais recentes)
echo -e "${BLUE}🧹 Limpando backups antigos...${NC}"
cd "$BACKUP_DIR"
ls -t backup_*.sql.gz 2>/dev/null | tail -n +8 | xargs -r rm -f
REMAINING=$(ls -1 backup_*.sql.gz 2>/dev/null | wc -l)
echo -e "${GREEN}📁 Mantidos $REMAINING backups locais${NC}"
cd ..

# Parar container se ele não estava rodando antes
if [ "$CONTAINER_WAS_STOPPED" = true ]; then
    echo -e "${BLUE}⏹️  Parando container do banco...${NC}"
    docker compose -f docker-compose.prod.yml stop postgres-prod
fi

echo -e "${GREEN}🎉 Processo de backup concluído com sucesso!${NC}"
echo -e "${BLUE}📍 Backup salvo em: $LOCAL_BACKUP_PATH${NC}" 