# Como Executar a Aplicação com Docker

Este guia explica como iniciar a aplicação em modo de **Desenvolvimento** (para fazer alterações no código) e em modo de **Produção** (uma versão otimizada para uso).

##  Pré-requisitos

1.  **Instale o Docker**: Certifique-se de que o [Docker Desktop](https://www.docker.com/products/docker-desktop/) esteja instalado e em execução.

---

## Modo de Desenvolvimento (Padrão)

Use este modo quando quiser programar. Ele ativa o "hot-reloading", então qualquer alteração que você salvar nos arquivos será refletida instantaneamente na aplicação.

1.  **Verifique a existência do arquivo `docker-compose.override.yml`**: Este arquivo é o que ativa o modo de desenvolvimento. Ele já está criado no projeto.

2.  **Abra um terminal** na pasta raiz do projeto.

3.  **Execute o seguinte comando:**
    ```bash
    docker compose up --build -d
    ```
    - O Docker Compose irá combinar `docker-compose.yml` + `docker-compose.override.yml` automaticamente.

4.  **Acesse a Aplicação**: Estará disponível em [**http://localhost:5173**](http://localhost:5173).

---

## Modo de Produção (Uso Otimizado)

Use este modo para rodar a aplicação de forma estável e performática. Ele usa imagens otimizadas e não reflete alterações no código em tempo real.

1.  **Renomeie ou remova o `docker-compose.override.yml`**: Para que o Docker Compose não o aplique, você pode, por exemplo, renomeá-lo:
    ```bash
    mv docker-compose.override.yml docker-compose.override.yml.bak
    ```

2.  **Abra um terminal** na pasta raiz do projeto.

3.  **Execute o comando de build e subida:**
    ```bash
    docker compose up --build -d
    ```
    - Desta vez, apenas as configurações do `docker-compose.yml` (produção) serão utilizadas.

4.  **Acesse a Aplicação**: Estará disponível no mesmo endereço: [**http://localhost:5173**](http://localhost:5173).

5.  **Para voltar ao modo de desenvolvimento**, basta renomear o arquivo de volta:
    ```bash
    mv docker-compose.override.yml.bak docker-compose.override.yml
    ```

---

## Comandos Gerais

- **Parar a Aplicação (em qualquer modo)**:
  ```bash
  docker compose down
  ```

- **Verificar os logs**:
  - `docker compose logs -f` (todos os serviços)
  - `docker compose logs -f backend`
  - `docker compose logs -f frontend`

## Comandos Úteis

-   **Forçar a reconstrução das imagens**: Se você fizer alterações nos `Dockerfiles`