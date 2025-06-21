# Como Executar o Projeto

Este projeto é totalmente containerizado com Docker, separando os ambientes de desenvolvimento e produção.

## ❗ Configuração Inicial Obrigatória (.env)

Antes de iniciar o projeto pela primeira vez, você **precisa** criar um arquivo de configuração de ambiente.

1.  Crie um arquivo chamado `.env` na raiz do projeto:
    ```bash
    cp .env.example .env
    ```

2.  Edite o arquivo `.env` e substitua os valores placeholder pelas suas credenciais reais.

3.  **IMPORTANTE:** Nunca commite o arquivo `.env` no Git. Ele contém informações sensíveis.

## Exemplo de Configuração

Veja o arquivo `.env.example` para um exemplo de como configurar suas variáveis de ambiente para PostgreSQL.

## Pré-requisitos

- Docker
- Docker Compose (geralmente incluído nas instalações mais recentes do Docker)

## Ambiente de Desenvolvimento

Para iniciar o ambiente de desenvolvimento, que inclui hot-reloading para o frontend e backend:

```bash
./start-dev.sh
```

Na primeira vez que executar, ou sempre que houver alterações no `schema.prisma`, abra um novo terminal e rode a migração de desenvolvimento:
```bash
docker compose -f docker-compose.dev.yml exec backend-dev npx prisma migrate dev
```

- **Frontend:** Acessível em `http://localhost:5174`
- **Backend:** Acessível em `http://localhost:3001`
- **Banco de Dados (PostgreSQL):** Exposto em `localhost:5433`

## Ambiente de Produção

Para iniciar o ambiente de produção, que utiliza imagens otimizadas e serve o frontend com Nginx:

```bash
./start-prod.sh
```

**Importante:** Na primeira vez que o ambiente de produção é iniciado, o banco PostgreSQL estará vazio. Você precisa aplicar as migrações manualmente com o seguinte comando:
```bash
docker exec dashboard-backend-prod npx prisma migrate deploy
```
Este comando só precisa ser executado uma vez.

- **Aplicação:** Acessível em `http://localhost:5173`

## Parando os Ambientes

Para parar todos os contêineres (sejam de desenvolvimento ou produção), utilize o script:

```bash
./stop.sh
```
Por padrão, este comando tentará executar um backup do PostgreSQL de produção se ele estiver ativo.

Para parar os contêineres **sem** executar o backup, utilize a flag `--no-backup`:
```bash
./stop.sh --no-backup
```

Este comando irá parar e remover todos os contêineres relacionados a este projeto.

## Backup do Banco de Dados PostgreSQL

O projeto inclui um script para realizar backups automáticos do banco PostgreSQL de **produção** e enviá-los para o Google Drive.

**Pré-requisito:** Você precisa ter o `rclone` instalado e configurado com um remote chamado `backup_gdrive`.

Para executar o backup manualmente a qualquer momento:
```bash
./backup.sh
```
O script é inteligente: ele iniciará o contêiner do PostgreSQL se estiver parado, realizará o backup usando `pg_dump` e o desligará ao final, caso não estivesse rodando antes.

**Nota:** Um backup também é executado automaticamente sempre que o comando `./stop.sh` é utilizado com o ambiente de produção ativo.

## 🔒 Verificação de Segurança

**IMPORTANTE:** Antes de fazer qualquer commit, execute sempre a verificação de segurança:

```bash
./scripts/check-security.sh
```

Este script verifica:
- ✅ Arquivos `.env` não estão sendo commitados
- ✅ Arquivos de backup não estão no Git
- ✅ Arquivos SQLite antigos foram removidos
- ✅ `.gitignore` está configurado corretamente
- ✅ Migrações do Prisma estão corretas

## Comandos Gerais

- **Verificar os logs**:
  - `docker compose logs -f` (todos os serviços)
  - `docker compose logs -f backend`
  - `docker compose logs -f frontend`
  - `docker compose logs -f db-prod` (PostgreSQL produção)

## Comandos Úteis

-   **Forçar a reconstrução das imagens**: Se você fizer alterações nos `Dockerfiles`
    ```bash
    docker compose -f docker-compose.dev.yml build --no-cache
    # ou para produção
    docker compose -f docker-compose.prod.yml build --no-cache
    ```

-   **Acessar o PostgreSQL diretamente**:
    ```bash
    # Desenvolvimento
    docker compose -f docker-compose.dev.yml exec db-dev psql -U $POSTGRES_USER_DEV -d $POSTGRES_DB_DEV
    
    # Produção
    docker compose -f docker-compose.prod.yml exec db-prod psql -U $POSTGRES_USER -d $POSTGRES_DB
    ```

-   **Verificar segurança antes de commit**:
    ```bash
    ./scripts/check-security.sh
    ```

-   **Limpar arquivos SQLite antigos**:
    ```bash
    ./scripts/cleanup-sqlite.sh
    ```

## Migração do SQLite para PostgreSQL

Este projeto foi migrado do SQLite para PostgreSQL. Se você encontrar arquivos `.db` ou `.sqlite` antigos, eles podem ser removidos com segurança usando:

```bash
./scripts/cleanup-sqlite.sh
```

## 🚨 Problemas Comuns

### Erro: "Arquivo .env não encontrado"
```bash
cp .env.example .env
# Edite o arquivo .env com suas credenciais
```

### Erro: "Migrações não aplicadas"
```bash
# Desenvolvimento
docker compose -f docker-compose.dev.yml exec backend-dev npx prisma migrate dev

# Produção
docker exec dashboard-backend-prod npx prisma migrate deploy
```

### Erro: "Verificação de segurança falhou"
```bash
./scripts/check-security.sh
# Siga as instruções do script para corrigir os problemas
```

## 📋 Checklist Antes de Commit

- [ ] Execute `./scripts/check-security.sh`
- [ ] Verifique se `.env` não está sendo commitado
- [ ] Teste o ambiente de desenvolvimento
- [ ] Verifique se não há credenciais hardcoded no código