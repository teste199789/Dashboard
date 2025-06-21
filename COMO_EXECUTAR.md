# Como Executar a Aplicação com Docker

Este guia explica como iniciar, parar e gerenciar a aplicação usando scripts simples.

##  Pré-requisitos

1.  **Instale o Docker**: Certifique-se de que o [Docker Desktop](https://www.docker.com/products/docker-desktop/) (ou Docker Engine no Linux) esteja instalado e em execução.

---

## Como Iniciar em Modo de Desenvolvimento

Use este modo quando quiser programar. Ele ativa o "hot-reloading" e usa um **banco de dados de teste isolado (`dev.test.db`)**, para que você possa fazer experimentos sem medo de afetar os dados de produção.

-   No seu terminal, na raiz do projeto, execute:
    ```bash
    ./start-dev.sh
    ```

A aplicação estará disponível em [**http://localhost:5174**](http://localhost:5174) e você verá um banner "Modo de Desenvolvimento" no canto da tela.

---

## Como Iniciar em Modo de Produção

Use este modo para rodar a aplicação de forma estável e performática com seus **dados reais (`dev.db`)**.

-   No seu terminal, na raiz do projeto, execute:
    ```bash
    ./start-prod.sh
    ```
A aplicação estará disponível em [**http://localhost:5173**](http://localhost:5173).

---

## Como Parar a Aplicação

Para parar completamente todos os contêineres (seja de dev ou prod):

-   No seu terminal, na raiz do projeto, execute:
    ```bash
    ./stop.sh
    ```

## Comandos Gerais

- **Verificar os logs**:
  - `docker compose logs -f` (todos os serviços)
  - `docker compose logs -f backend`
  - `docker compose logs -f frontend`

## Comandos Úteis

-   **Forçar a reconstrução das imagens**: Se você fizer alterações nos `Dockerfiles`