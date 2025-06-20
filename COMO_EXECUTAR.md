# Como Executar a Aplicação com Docker

Este guia simplificado explica como iniciar, parar e gerenciar a aplicação "Dashboard de Provas" usando Docker e Docker Compose. Com esta configuração, todo o ambiente (backend e frontend) é executado com poucos comandos, sem a necessidade de instalar Node.js ou outras dependências manualmente em sua máquina.

##  Pré-requisitos

1.  **Instale o Docker**: Certifique-se de que o [Docker Desktop](https://www.docker.com/products/docker-desktop/) (ou Docker Engine no Linux) esteja instalado e em execução no seu sistema. A versão 2 do Docker Compose (que usamos aqui) já vem integrada.

## Iniciando a Aplicação (Primeira Vez)

Na primeira vez que você for executar o projeto, ou sempre que houver alterações nos arquivos `Dockerfile`, você precisa construir as imagens dos contêineres.

1.  **Abra um terminal** na pasta raiz do projeto (onde o arquivo `docker-compose.yml` está localizado).

2.  **Execute o seguinte comando:**

    ```bash
    docker compose up --build -d
    ```

    -   `up`: Cria e inicia os contêineres.
    -   `--build`: Força a reconstrução das imagens a partir dos `Dockerfiles`.
    -   `-d` (modo "detached"): Executa os contêineres em segundo plano, liberando seu terminal.

3.  **Aguarde a Conclusão**: O Docker fará o download das imagens base, instalará as dependências e iniciará os servidores. Este processo pode levar alguns minutos na primeira vez.

4.  **Acesse a Aplicação**: Após a conclusão, a aplicação estará disponível no seu navegador no seguinte endereço:
    [**http://localhost:5173**](http://localhost:5173)

## Iniciando a Aplicação (Uso Diário)

Depois da primeira execução, para iniciar a aplicação, o processo é ainda mais rápido, pois as imagens já foram construídas.

1.  **Abra um terminal** na pasta raiz do projeto.

2.  **Execute o comando:**
    ```bash
    docker compose up -d
    ```
    Isso iniciará os contêineres existentes em segundo plano.

## Parando a Aplicação

Para parar completamente todos os contêineres da aplicação:

1.  **Abra um terminal** na pasta raiz do projeto.

2.  **Execute o comando:**
    ```bash
    docker compose down
    ```
    Este comando para e remove os contêineres, mas **não apaga seus dados**, pois eles estão salvos na pasta `database` do seu projeto, graças à configuração de volumes.

## Comandos Úteis

-   **Verificar os logs (para depuração)**:
    -   Ver logs de todos os serviços: `docker compose logs -f`
    -   Ver logs do backend: `docker compose logs -f backend`
    -   Ver logs do frontend: `docker compose logs -f frontend`
    (Use `Ctrl + C` para sair da visualização de logs).

-   **Forçar a reconstrução das imagens**: Se você fizer alterações nos `Dockerfiles` ou suspeitar que algo está errado com a imagem, use:
    ```bash
    docker compose build
    ```

-   **Listar contêineres em execução**:
    ```bash
    docker compose ps
    ```
    Isso mostrará o status dos seus contêineres (`up` ou `exited`). 