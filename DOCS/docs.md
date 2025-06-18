# Documentação do Projeto: Dashboard de Provas

## 1. Visão Geral do Projeto
O Dashboard de Provas é uma aplicação web completa (full-stack) projetada para ajudar estudantes, especialmente concurseiros, a registrar e analisar seu desempenho em provas de concursos e simulados. A plataforma permite que o usuário cadastre os detalhes de cada prova, insira seus gabaritos, compare com os gabaritos oficiais (preliminar e definitivo) e obtenha uma análise detalhada de seus resultados.

As funcionalidades incluem o cálculo de pontuação líquida e bruta, percentuais de aproveitamento, e ferramentas de simulação para prever o impacto de questões anuladas, oferecendo uma visão estratégica sobre o desempenho.

A aplicação é dividida em um Backend (API), que gerencia a lógica de negócio e a persistência dos dados, e um Frontend (Interface do Usuário), construído em React para uma experiência interativa e responsiva.

## 2. Arquitetura e Tecnologias Utilizadas
O projeto adota uma arquitetura moderna baseada em JavaScript, com uma separação clara de responsabilidades entre o cliente (navegador) e o servidor.

<details>
<summary><strong>Tecnologias do Frontend (Interface do Usuário)</strong></summary>

- **Framework Principal**: React 19 com Vite como ferramenta de build, proporcionando um ambiente de desenvolvimento rápido com Hot Module Replacement (HMR).
- **Estilização**: Tailwind CSS, um framework CSS "utility-first" que permite a criação de designs customizados de forma rápida e eficiente. O projeto está configurado para suportar Modo Escuro (Dark Mode) através do sistema de classes do Tailwind.
- **Roteamento**: React Router (`react-router-dom`) é utilizado para gerenciar a navegação entre as diferentes páginas da aplicação, como o Dashboard, a lista de provas e a página de detalhes.
- **Gerenciamento de Estado Global**: A aplicação utiliza a React Context API para gerenciar o estado global.
    - `ProofsContext`: Centraliza a lista de provas, o estado de carregamento e as funções para adicionar, deletar e corrigir provas.
    - `ThemeContext`: Gerencia o tema atual (claro ou escuro) e persiste a escolha do usuário no `localStorage`.
- **Gráficos e Tabelas**:
    - `Recharts`: Biblioteca usada para criar os gráficos de evolução de desempenho.
    - `TanStack Table (React Table)`: Utilizada para construir a "Tabela de Controle", uma interface rica para visualização e gerenciamento dos concursos.
- **Notificações**: `React Hot Toast` é usado para exibir notificações "toast" (alertas discretos) de sucesso ou erro, melhorando a experiência do usuário.
</details>

<details>
<summary><strong>Tecnologias do Backend (Servidor e Lógica)</strong></summary>

- **Ambiente de Execução**: Node.js
- **Framework da API**: Express.js para a criação de rotas da API RESTful que o frontend consome.
- **Banco de Dados**: SQLite é utilizado para o ambiente de desenvolvimento, sendo um banco de dados leve e baseado em arquivo. Para produção, recomenda-se um banco de dados mais robusto. A variável de ambiente `DATABASE_URL` deve ser configurada para apontar para o arquivo do banco de dados (ex: `file:./dev.db`).
- **ORM (Object-Relational Mapping)**: Prisma é a ferramenta central do backend para:
    - **Modelagem de Dados**: O arquivo `schema.prisma` define todas as tabelas, colunas e relações do banco de dados.
    - **Migrações**: Gerencia as alterações na estrutura do banco de dados de forma versionada.
    - **Acesso aos Dados**: Fornece um cliente type-safe para realizar todas as operações de leitura e escrita no banco.
- **CORS**: O pacote `cors` é utilizado para permitir requisições do frontend (rodando em uma porta diferente) para o backend durante o desenvolvimento.
</details>

## 3. Modelo de Dados do Banco (`schema.prisma`)
O Prisma ORM utiliza o arquivo `schema.prisma` para definir a estrutura do banco de dados. As principais entidades são:

### Tabela `Proof`
Armazena as informações gerais de cada prova ou simulado.

| Campo                 | Tipo                                  | Descrição                                                                 |
|-----------------------|---------------------------------------|---------------------------------------------------------------------------|
| `id`                  | `Int`                                 | Identificador único (chave primária, autoincremento)                      |
| `titulo`              | `String`                              | Título da prova ou concurso.                                              |
| `banca`               | `String`                              | Banca organizadora.                                                       |
| `data`                | `DateTime`                            | Data de realização da prova.                                              |
| `totalQuestoes`       | `Int`                                 | Número total de questões da prova.                                        |
| `tipoPontuacao`       | `String`                              | Tipo de pontuação ('liquida' ou 'bruta').                                 |
| `type`                | `String`                              | Tipo de registro ('oficial' ou 'simulado').                               |
| `orgao`               | `String?`                             | Órgão do concurso (opcional).                                             |
| `cargo`               | `String?`                             | Cargo do concurso (opcional).                                             |
| `gabaritoPreliminar`  | `String?`                             | Gabarito preliminar em formato string (ex: "1:A,2:B,...").               |
| `gabaritoDefinitivo`  | `String?`                             | Gabarito definitivo em formato string.                                    |
| `userAnswers`         | `String?`                             | Respostas do usuário em formato string.                                   |
| `inscritos`           | `Int?`                                | Número de inscritos (opcional).                                           |
| `simulacaoAnuladas`   | `String?`                             | Questões a serem simuladas como anuladas (ex: "10,15").                   |
| `notaDiscursiva`      | `Float?`                              | Nota da prova discursiva (opcional).                                      |
| `resultadoObjetiva`   | `Json?`                               | Resultado detalhado da prova objetiva (pode incluir pontuação, acertos).  |
| `resultadoDiscursiva` | `Json?`                               | Resultado detalhado da prova discursiva.                                  |
| `resultadoFinal`      | `Json?`                               | Resultado final consolidado.                                              |
| `aproveitamento`      | `Float?`                              | Percentual de aproveitamento na prova.                                    |
| `createdAt`           | `DateTime`                            | Data de criação do registro (gerenciado pelo Prisma).                      |
| `updatedAt`           | `DateTime`                            | Data da última atualização (gerenciado pelo Prisma).                       |
| `subjects`            | `Subject[]`                           | Relação com as matérias da prova.                                         |
| `results`             | `Result[]`                            | Relação com os resultados por matéria.                                    |

### Tabela `Subject`
Armazena as informações sobre as matérias (disciplinas) de cada prova.

| Campo         | Tipo        | Descrição                                                              |
|---------------|-------------|------------------------------------------------------------------------|
| `id`          | `Int`       | Identificador único (chave primária, autoincremento).                   |
| `nome`        | `String`    | Nome da matéria (ex: "Português", "Direito Administrativo").            |
| `questoes`    | `Int`       | Quantidade de questões da matéria nesta prova.                          |
| `questaoInicio`| `Int`      | Número da questão inicial da matéria na prova.                          |
| `questaoFim`  | `Int`       | Número da questão final da matéria na prova.                            |
| `proofId`     | `Int`       | Chave estrangeira referenciando a `Proof` a qual esta matéria pertence. |
| `proof`       | `Proof`     | Relação com a prova.                                                   |

### Tabela `Result`
Armazena o desempenho do usuário em cada matéria de uma prova após a correção.

| Campo        | Tipo     | Descrição                                                                |
|--------------|----------|--------------------------------------------------------------------------|
| `id`         | `Int`    | Identificador único (chave primária, autoincremento).                     |
| `disciplina` | `String` | Nome da disciplina.                                                      |
| `acertos`    | `Int`    | Número de acertos na disciplina.                                         |
| `erros`      | `Int`    | Número de erros na disciplina.                                           |
| `brancos`    | `Int`    | Número de questões deixadas em branco na disciplina.                      |
| `anuladas`   | `Int`    | Número de questões anuladas (e consideradas como acerto) na disciplina. |
| `proofId`    | `Int`    | Chave estrangeira referenciando a `Proof` a qual este resultado pertence.|
| `proof`      | `Proof`  | Relação com a prova.                                                     |

## 4. Endpoints da API (`backend/server.js`)
A API backend expõe os seguintes endpoints para gerenciar os dados das provas:

### Provas (`/api/proofs`)

- **`POST /api/proofs`**
    - **Propósito**: Cria uma nova prova (concurso ou simulado).
    - **Corpo da Requisição (JSON)**: Campos da tabela `Proof` (ex: `titulo`, `banca`, `data`, `totalQuestoes`, `tipoPontuacao`, `type`, `orgao`, `cargo`, `notaDiscursiva`, `resultadoObjetiva`, `resultadoDiscursiva`, `resultadoFinal`).
    - **Resposta (JSON)**: O objeto da prova criada, incluindo seu `id`.
    - **Status Codes**: `201 Created`, `500 Internal Server Error`.

- **`GET /api/proofs`**
    - **Propósito**: Busca todas as provas e simulados cadastrados.
    - **Resposta (JSON)**: Um array de objetos de prova, incluindo seus `results` e `subjects`, ordenados pela data em ordem decrescente.
    - **Status Codes**: `200 OK`, `500 Internal Server Error`.

- **`GET /api/proofs/:id`**
    - **Propósito**: Busca uma prova ou simulado específico pelo seu `id`.
    - **Parâmetros de URL**: `id` (Int) - ID da prova.
    - **Resposta (JSON)**: O objeto da prova, incluindo seus `results` e `subjects`.
    - **Status Codes**: `200 OK`, `404 Not Found`, `500 Internal Server Error`.

- **`DELETE /api/proofs/:id`**
    - **Propósito**: Deleta uma prova ou simulado específico.
    - **Parâmetros de URL**: `id` (Int) - ID da prova.
    - **Resposta**: Nenhuma.
    - **Status Codes**: `204 No Content`, `500 Internal Server Error`.

- **`PUT /api/proofs/:id/details`**
    - **Propósito**: Atualiza os detalhes de uma prova, como gabaritos, matérias, informações gerais.
    - **Parâmetros de URL**: `id` (Int) - ID da prova.
    - **Corpo da Requisição (JSON)**: Campos a serem atualizados (ex: `gabaritoPreliminar`, `gabaritoDefinitivo`, `userAnswers`, `subjects`, `totalQuestoes`, etc.). As matérias (`subjects`) são recriadas a cada atualização, se fornecidas.
    - **Resposta (JSON)**: O objeto da prova atualizado.
    - **Status Codes**: `200 OK`, `500 Internal Server Error`.

### Correção (`/api/proofs/:id/grade`)

- **`POST /api/proofs/:id/grade`**
    - **Propósito**: Dispara o processo de correção de uma prova.
    - **Parâmetros de URL**: `id` (Int) - ID da prova a ser corrigida.
    - **Corpo da Requisição**: Nenhum corpo é esperado, pois os dados são lidos do banco.
    - **Lógica**:
        1. Busca os dados da prova (`proofData`), incluindo `userAnswers`, `gabaritoDefinitivo` ou `gabaritoPreliminar`, e `subjects`.
        2. Valida se os dados necessários para correção estão presentes.
        3. Chama a função `corrigirProva` para obter os resultados por matéria.
        4. Chama `calculateOverallPerformance` para obter o aproveitamento geral.
        5. Atualiza o campo `aproveitamento` da prova no banco.
        6. Deleta os `Result` antigos e salva os novos resultados por matéria no banco.
    - **Resposta (JSON)**: Mensagem de sucesso ou erro.
    - **Status Codes**: `200 OK`, `400 Bad Request` (dados insuficientes), `500 Internal Server Error`.

## 5. Lógica Central de Correção (`backend/utils/correcao.js`)
O arquivo `correcao.js` contém a lógica principal para processar e avaliar as respostas do usuário.

### `parseGabarito(gabaritoString)`
- **Propósito**: Converte uma string de gabarito (ex: "1:A,2:B,3:C") em um objeto `Map` para fácil consulta.
- **Entrada**: `gabaritoString` (String) - O gabarito em formato de string.
- **Saída**: `Map` onde a chave é o número da questão (String) e o valor é a alternativa (String). Retorna um `Map` vazio se a string for nula ou vazia.

### `corrigirProva(proof)`
- **Propósito**: Compara as respostas do usuário com o gabarito oficial (definitivo ou, na ausência deste, o preliminar) e calcula o número de acertos, erros, brancos e anuladas por matéria.
- **Entrada**: `proof` (Object) - Objeto contendo os dados da prova, incluindo:
    - `totalQuestoes` (Int)
    - `userAnswers` (String) - Gabarito do usuário.
    - `gabaritoDefinitivo` (String) - Gabarito definitivo da banca.
    - `gabaritoPreliminar` (String) - Gabarito preliminar da banca.
    - `subjects` (Array) - Array de objetos, cada um representando uma matéria com `nome`, `questaoInicio`, `questaoFim`.
- **Lógica Principal**:
    1. Parseia os gabaritos (`userAnswers`, `gabaritoDefinitivo`, `gabaritoPreliminar`) usando `parseGabarito`.
    2. Inicializa um objeto `resultadoPorMateria` para acumular os resultados de cada disciplina.
    3. Itera por cada questão de `1` a `totalQuestoes`:
        a. Identifica a matéria da questão com base nos intervalos `questaoInicio` e `questaoFim` definidos em `subjects`.
        b. **Regra de Anulação**: Uma questão é considerada anulada se o `gabaritoDefinitivo` e o `gabaritoPreliminar` existirem e a resposta para a questão for diferente entre eles. Se anulada, conta como `anulada` e também como `acerto` para o usuário naquela matéria.
        c. Se não for anulada:
            i. Se o usuário não respondeu (`!respostaUser`), conta como `branco`.
            ii. Se `respostaUser` === `respostaDefin` (ou `respostaPrelim`), conta como `acerto`.
            iii. Caso contrário, conta como `erro`.
- **Saída**: Objeto `{ resultados: Array, log: Array }`.
    - `resultados`: Um array de objetos, cada um representando o resultado de uma matéria (ex: `{ disciplina: "Português", acertos: 8, erros: 1, brancos: 1, anuladas: 0 }`).
    - `log`: Um array para logs de depuração (atualmente retornado vazio).

### `calculateOverallPerformance(proof, calculatedResults)`
- **Propósito**: Calcula a pontuação percentual geral da prova.
- **Entrada**:
    - `proof` (Object) - Objeto da prova, contendo `totalQuestoes` e `tipoPontuacao`.
    - `calculatedResults` (Array) - O array de resultados por matéria retornado por `corrigirProva`.
- **Lógica**:
    1. Soma os `acertos`, `erros` de todos os `calculatedResults`.
    2. Calcula a `pontuacaoFinal`:
        - Se `tipoPontuacao` for `'liquida'`, `pontuacaoFinal = acertos - erros`.
        - Caso contrário (ex: `'bruta'`), `pontuacaoFinal = acertos`.
    3. Calcula o percentual: `(pontuacaoFinal / totalQuestoesParaCalculo) * 100`. Garante que o percentual não seja negativo.
- **Saída**: Objeto `{ percentage: Float }` representando o aproveitamento em uma escala de 0 a 100 (ex: `{ percentage: 75.0 }` para 75%).

## 6. Estrutura do Frontend (`meu-dashboard-pro/src/`)
O código-fonte do frontend está organizado da seguinte maneira para promover modularidade e manutenibilidade:

- **`main.jsx`**: Ponto de entrada da aplicação React. Renderiza o componente `App` principal e envolve-o com os provedores de contexto necessários (`ThemeProvider`, `ProofsProvider`).
- **`App.jsx`**: Componente raiz que configura o roteamento principal da aplicação usando `React Router`.
- **`api/`**:
    - `apiService.js`: Contém funções para realizar chamadas HTTP para o backend (ex: buscar provas, criar prova, corrigir prova).
- **`assets/`**: Arquivos estáticos como imagens e SVGs.
- **`components/`**: Componentes React reutilizáveis usados em várias partes da aplicação.
    - `common/`: Subdiretório para componentes genéricos e utilitários (ex: `Modal.jsx`, `LoadingSpinner.jsx`, `ThemeToggle.jsx`, `ResultGrid.jsx`).
    - `icons/`: Componentes de ícones SVG.
- **`contexts/`**:
    - `ProofsContext.jsx`: Gerencia o estado global relacionado às provas (lista de provas, carregamento, funções de CRUD e correção).
    - `ThemeContext.jsx`: Gerencia o tema da aplicação (claro/escuro) e sua persistência.
- **`hooks/`**:
    - `useProofs.js`: Hook customizado que consome o `ProofsContext` para facilitar o acesso aos dados e funções das provas nos componentes.
- **`layouts/`**: Componentes que definem a estrutura visual das páginas.
    - `MainLayout.jsx`: Layout principal com barra de navegação lateral e cabeçalho.
    - `FocusedLayout.jsx`: Layout simplificado, geralmente usado para formulários ou páginas de edição, sem a navegação principal.
- **`pages/`**: Componentes que representam as diferentes páginas/rotas da aplicação.
    - `Dashboard.jsx`: Página inicial com resumo do desempenho.
    - `AddProof.jsx`, `AddSimulado.jsx`: Formulários para adicionar novas provas e simulados.
    - `ProofDetail.jsx`: Página para visualizar e gerenciar os detalhes de uma prova específica, contendo abas.
    - `Controle.jsx`: Página com a tabela de controle de concursos.
    - `MeusConcursos.jsx`: Página que exibe a evolução do desempenho através de um gráfico de linha e uma visão geral dos concursos e simulados em formato de cards. Esta página contém abas para alternar entre as visualizações.
    - `tabs/`: Contém os componentes que funcionam como "abas" em diferentes partes da aplicação.
        - Dentro de `ProofDetail.jsx`: `InfoTab.jsx`, `OfficialKeysTab.jsx`, `ResultTab.jsx`, etc., para gerenciar uma prova específica.
        - Dentro de `MeusConcursos.jsx`: `DesempenhoTab.jsx` (exibe o gráfico de evolução) e `VisaoGeralTab.jsx` (exibe os cards de concursos/simulados).
- **`utils/`**: Funções utilitárias diversas.
    - `calculators.js`: Funções para cálculos específicos do frontend.
    - `formatters.js`: Funções para formatação de dados (ex: datas, percentuais).
- **`App.css`, `index.css`**: Arquivos CSS globais e de configuração do Tailwind CSS.

## 7. Guia de Instalação e Execução
Para configurar e executar o projeto em um ambiente de desenvolvimento local:

**Pré-requisitos**:
- Node.js (versão LTS recomendada)
- npm (geralmente instalado com o Node.js)
- Git (para clonar o repositório)

**Passos**:

1.  **Clone o repositório** (se ainda não o fez):
    ```bash
    git clone <URL_DO_REPOSITORIO>
    cd <NOME_DA_PASTA_DO_PROJETO>
    ```

2.  **Configuração do Backend**:
    - Navegue até a pasta do backend:
      ```bash
      cd backend
      ```
    - Instale as dependências:
      ```bash
      npm install
      ```
    - **Configuração do Banco de Dados (Prisma)**:
        - Certifique-se de que o arquivo `backend/prisma/schema.prisma` está configurado corretamente. Para desenvolvimento com SQLite, a variável de ambiente `DATABASE_URL` no arquivo `backend/.env` (crie-o se não existir) deve ser algo como:
          ```env
          DATABASE_URL="file:./dev.db"
          ```
        - Crie e aplique as migrações do banco de dados. Este comando lê o `schema.prisma`, cria o arquivo de banco de dados (ex: `dev.db`) e executa as migrações para definir as tabelas:
          ```bash
          npx prisma migrate dev --name init 
          ```
          (Substitua `init` por um nome descritivo para a migração, se desejar).
    - Inicie o servidor backend:
      ```bash
      node server.js
      # Ou, para desenvolvimento com recarregamento automático (se tiver nodemon instalado):
      # nodemon server.js
      ```
    - O servidor backend estará rodando, por padrão, em `http://localhost:3001`.

3.  **Configuração do Frontend**:
    - **Abra um novo terminal**. Não use o mesmo terminal onde o backend está rodando.
    - Navegue até a pasta do frontend:
      ```bash
      cd meu-dashboard-pro 
      # (Se você estiver na raiz do projeto, caso contrário, ajuste o caminho)
      ```
    - Instale as dependências:
      ```bash
      npm install
      ```
    - Inicie o servidor de desenvolvimento Vite:
      ```bash
      npm run dev
      ```
    - A aplicação frontend estará acessível, por padrão, em `http://localhost:5173`.

**Nota**: É crucial rodar o backend e o frontend em terminais separados, pois são processos distintos.

## 8. Estrutura do Projeto e Funcionalidades (Visão Geral Adicional)
A aplicação é rica em funcionalidades, organizadas de forma modular.

**Funcionalidades Implementadas (Revisão)**:
- **Cadastro Dual**: Formulários distintos para "Provas Oficiais" e "Simulados", que são salvos com um `type` diferente no banco.
- **Página de Gerenciamento Focada**: Ao clicar para editar uma prova, o usuário é levado para uma página com um layout simplificado (`FocusedLayout`) que remove a navegação principal e foca nas tarefas de gerenciamento.
- **Gerenciamento por Abas**: Dentro da página de detalhes de uma prova (`ProofDetail.jsx`), todas as funcionalidades são organizadas em abas:
    - **Informações**: Cadastro de matérias e quantidade de questões (`InfoTab.jsx`).
    - **Gabaritos Oficiais e do Usuário**: Interfaces com modais para inserir os gabaritos preliminar, definitivo (`OfficialKeysTab.jsx`) e do usuário (`UserAnswersTab.jsx`).
    - **Resultado Final**: Exibição detalhada do desempenho por matéria em tabela e uma grade de gabarito visual (`ResultGrid.jsx`) que mostra cada questão como acerto, erro ou em branco (`ResultTab.jsx`).
    - **Simuladores**: Ferramentas para simular o impacto de anulações (`SimulateAnnulmentTab.jsx`). A simulação no frontend agora espelha a lógica de correção do backend, utilizando o gabarito definitivo como prioridade e o preliminar como fallback para garantir a precisão do cálculo. A lógica ajusta corretamente a pontuação (especialmente a nota líquida), considerando o estado original da questão (acerto, erro ou branco) antes de aplicar a anulação.
- **Motor de Correção (Backend)**: Lógica robusta (`corrigirProva`) que compara os gabaritos, identifica acertos, erros, brancos e anuladas, e calcula a pontuação líquida e o aproveitamento final com base nas regras de negócio (incluindo as regras para questões anuladas).
- **Visualização de Dados**:
    - **Dashboard**: Apresenta dados consolidados com filtro por tipo.
    - **Controle de Concursos**: Tabela para gerenciamento rápido.
    - **Evolução**: Gráfico de linha do tempo do desempenho.
    - **Histórico**: Visualização em cards detalhados.

## 9. Próximos Passos e Possíveis Melhorias
A base do projeto é sólida e permite diversas expansões futuras:

- **Autenticação de Usuários**: Implementar um sistema de login e cadastro para que múltiplos usuários possam utilizar a plataforma de forma isolada.
- **Análise de Erros por Tópico/Conteúdo**: Expandir o modelo de dados para permitir o cadastro do tópico ou conteúdo programático de cada questão, possibilitando uma análise mais granular dos pontos fortes e fracos.
- **Melhorias na Simulação**: Adicionar mais opções de simulação, como alteração de gabarito de questões específicas.
- **Relatórios Avançados**: Geração de PDFs ou planilhas com os resultados e análises.
- **Internacionalização (i18n)**: Embora o foco atual seja PT-BR, preparar a aplicação para suportar múltiplos idiomas.
- **Testes Automatizados**: Introduzir testes unitários (ex: Jest, Vitest) para as lógicas de correção e componentes, e testes de integração (ex: Cypress, Playwright) para as funcionalidades chave.
- **Deployment**: Publicar a aplicação em serviços como Vercel (frontend) e Render ou Fly.io (backend/DB).
- **Otimizações de Performance**: Análise e otimização de queries de banco de dados e performance do frontend para grandes volumes de dados.
