# Como Executar o Projeto

Este projeto é totalmente containerizado com Docker, separando os ambientes de desenvolvimento e produção.

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

## Comandos Gerais

- **Verificar os logs**:
  - `docker compose logs -f` (todos os serviços)
  - `docker compose logs -f backend`
  - `docker compose logs -f frontend`

## Comandos Úteis

-   **Forçar a reconstrução das imagens**: Se você fizer alterações nos `Dockerfiles`