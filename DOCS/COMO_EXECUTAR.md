# Como Executar o Projeto

Este projeto é totalmente containerizado com Docker, separando os ambientes de desenvolvimento e produção.

## ❗ Configuração Inicial Obrigatória (.env)

Antes de iniciar o projeto pela primeira vez, você **precisa** criar um arquivo de configuração de ambiente.

1.  Crie um arquivo chamado `.env` na raiz do projeto.
2.  Copie e cole o seguinte conteúdo dentro dele:

    ```env
    # Variáveis de Ambiente para o Banco de Dados
    # Este arquivo NÃO deve ser comitado no Git.

    # Produção
    POSTGRES_USER=user
    POSTGRES_PASSWORD=${POSTGRES_PASSWORD}
    POSTGRES_DB=dashboard_prod

    # Desenvolvimento
    POSTGRES_USER_DEV=user_dev
    POSTGRES_PASSWORD_DEV=password_dev
    POSTGRES_DB_DEV=dashboard_dev
    ```
3.  Você pode alterar os valores de usuário e senha, se desejar. O restante do sistema usará esses valores automaticamente.

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

**Importante:** Na primeira vez que o ambiente de produção é iniciado, o banco de dados estará vazio. Você precisa aplicar as migrações manualmente com o seguinte comando:
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

Este comando irá parar e remover todos os contêineres relacionados a este projeto.

## Backup do Banco de Dados

O projeto inclui um script para realizar backups automáticos do banco de dados de **produção** e enviá-los para o Google Drive.

**Pré-requisito:** Você precisa ter o `rclone` instalado e configurado com um remote chamado `backup_gdrive`.

Para executar o backup manualmente a qualquer momento:
```bash
./backup.sh
```
O script é inteligente: ele iniciará o contêiner do banco de dados se estiver parado, realizará o backup e o desligará ao final, caso não estivesse rodando antes.

**Nota:** Um backup também é executado automaticamente sempre que o comando `./stop.sh` é utilizado com o ambiente de produção ativo.

## Comandos Gerais

- **Verificar os logs**:
  - `docker compose logs -f` (todos os serviços)
  - `docker compose logs -f backend`
  - `docker compose logs -f frontend`

## Comandos Úteis

-   **Forçar a reconstrução das imagens**: Se você fizer alterações nos `Dockerfiles`