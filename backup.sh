#!/bin/bash
set -e

# --- Configurações ---
# Nome do remote configurado no rclone (o que você criou como 'backup_gdrive')
RCLONE_REMOTE_NAME="backup_gdrive"

# Pasta no Google Drive onde os backups serão salvos. Será criada se não existir.
GDRIVE_BACKUP_DIR="DashboardBackups"

# Nome do contêiner do PostgreSQL de produção, obtido do docker-compose.prod.yml
DB_CONTAINER_NAME="dashboard-postgres-prod"

# Nome do arquivo de compose do produto
PROD_COMPOSE_FILE="docker-compose.prod.yml"

# Arquivo de ambiente
ENV_FILE=".env"

# --- Lógica do Script ---
echo ">>> Iniciando processo de backup inteligente..."

# Carregar variáveis de ambiente do arquivo .env
if [ -f "$ENV_FILE" ]; then
    echo "Carregando variáveis de ambiente do arquivo $ENV_FILE..."
    # Lógica robusta para ler o .env, ignorando comentários, linhas vazias e malformadas.
    set -o allexport
    source "$ENV_FILE"
    set +o allexport
else
    echo "ERRO: Arquivo de ambiente '$ENV_FILE' não encontrado. Abortando."
    exit 1
fi

# Verificar se as variáveis necessárias foram carregadas
if [ -z "$POSTGRES_USER" ] || [ -z "$POSTGRES_PASSWORD" ] || [ -z "$POSTGRES_DB" ]; then
    echo "ERRO: Uma ou mais variáveis de banco de dados (POSTGRES_USER, POSTGRES_PASSWORD, POSTGRES_DB) não estão definidas no arquivo .env. Abortando."
    exit 1
fi

# Atribuir variáveis para uso no script
DB_USER=$POSTGRES_USER
DB_NAME=$POSTGRES_DB
DB_PASSWORD=$POSTGRES_PASSWORD

# Flag para saber se o script iniciou o contêiner
CONTAINER_WAS_STOPPED=false

# 1. Verificar se o contêiner está em execução
echo "[Passo 1/5] Verificando status do contêiner do banco de dados..."
if ! docker ps -q -f name=^/${DB_CONTAINER_NAME}$ | grep -q .; then
    echo "Contêiner '${DB_CONTAINER_NAME}' está parado. Iniciando-o para o backup..."
    CONTAINER_WAS_STOPPED=true
    docker compose -f "${PROD_COMPOSE_FILE}" up -d postgres-prod

    # Aguardar o banco de dados ficar saudável (healthy)
    echo "Aguardando o banco de dados ficar pronto..."
    # Loop de espera com timeout de 2 minutos (120 segundos)
    for i in {1..24}; do
        HEALTH_STATUS=$(docker inspect --format='{{.State.Health.Status}}' "${DB_CONTAINER_NAME}" 2>/dev/null)
        if [ "${HEALTH_STATUS}" == "healthy" ]; then
            echo "Banco de dados está pronto!"
            break
        fi
        sleep 5
    done
    
    # Se saiu do loop e não está healthy, aborte.
    if [ "${HEALTH_STATUS}" != "healthy" ]; then
        echo "ERRO: O banco de dados não ficou pronto a tempo. Abortando backup."
        # Tenta parar o contêiner que iniciou
        docker compose -f "${PROD_COMPOSE_FILE}" stop postgres-prod
        exit 1
    fi
else
    echo "Contêiner '${DB_CONTAINER_NAME}' já está em execução."
fi

# 2. Criar o dump do banco de dados
echo "[Passo 2/5] Criando dump compactado do banco de dados '${DB_NAME}'..."
TIMESTAMP=$(date +"%Y-%m-%d_%H-%M-%S")
BACKUP_FILE_NAME="backup-${TIMESTAMP}.sql.gz"
LOCAL_BACKUP_PATH="/tmp/${BACKUP_FILE_NAME}"

docker exec -e PGPASSWORD=$DB_PASSWORD $DB_CONTAINER_NAME pg_dump -U $DB_USER -d $DB_NAME | gzip > "$LOCAL_BACKUP_PATH"

if [ $? -ne 0 ]; then
    echo "ERRO: Falha ao criar o dump do banco de dados. Abortando."
    # Se o script iniciou o contêiner, ele o para antes de sair.
    if [ "$CONTAINER_WAS_STOPPED" = true ]; then
        echo "Parando o contêiner do banco de dados que foi iniciado pelo script..."
        docker compose -f "${PROD_COMPOSE_FILE}" stop postgres-prod
    fi
    exit 1
fi
echo "Dump criado com sucesso em: ${LOCAL_BACKUP_PATH}"

# 3. Enviar para o Google Drive
echo "[Passo 3/5] Enviando o arquivo de backup para o Google Drive..."
rclone copy "$LOCAL_BACKUP_PATH" "${RCLONE_REMOTE_NAME}:${GDRIVE_BACKUP_DIR}" --progress

if [ $? -ne 0 ]; then
    echo "ERRO: Falha ao enviar o backup para o Google Drive. O arquivo local foi mantido em ${LOCAL_BACKUP_PATH}."
    # Se o script iniciou o contêiner, ele o para antes de sair.
    if [ "$CONTAINER_WAS_STOPPED" = true ]; then
        echo "Parando o contêiner do banco de dados que foi iniciado pelo script..."
        docker compose -f "${PROD_COMPOSE_FILE}" stop postgres-prod
    fi
    exit 1
fi
echo "Upload concluído com sucesso!"

# 4. Limpeza local e remota
echo "[Passo 4/5] Removendo arquivo de backup local..."
rm "$LOCAL_BACKUP_PATH"
echo "Limpando backups antigos no Google Drive (mantendo os últimos 7 dias)..."
rclone delete --min-age 7d "${RCLONE_REMOTE_NAME}:${GDRIVE_BACKUP_DIR}"

# 5. Parar o contêiner, se o script o iniciou
if [ "$CONTAINER_WAS_STOPPED" = true ]; then
    echo "[Passo 5/5] Parando o contêiner do banco de dados para restaurar o estado original..."
    docker compose -f "${PROD_COMPOSE_FILE}" stop postgres-prod
else
    echo "[Passo 5/5] O contêiner já estava em execução, então será mantido assim."
fi

echo ">>> Processo de backup finalizado com sucesso! <<<" 