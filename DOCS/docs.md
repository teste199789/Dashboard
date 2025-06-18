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
    - `react-chartjs-2` e `chart.js`: Utilizadas para a renderização de gráficos de desempenho mais detalhados.
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
    - `styleHelpers.js`: Funções auxiliares de estilização, como `getPerformanceColor`, que padroniza as cores de feedback visual (vermelho, amarelo, verde) com base no desempenho.
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
    - Execute as migrações do banco de dados:
      ```bash
      npx prisma migrate dev
      ```
    - Inicie o servidor do backend:
      ```bash
      npm run dev
      ```
      O servidor estará rodando em `http://localhost:3001`.

3.  **Configuração do Frontend**:
    - Em um novo terminal, navegue até a pasta do frontend:
      ```bash
      cd meu-dashboard-pro
      ```
    - Instale as dependências:
      ```bash
      npm install
      ```
    - Inicie a aplicação de desenvolvimento:
      ```bash
      npm run dev
      ```
      A aplicação estará acessível em `http://localhost:5173`.

**Observação**: Certifique-se de que ambos os servidores (frontend e backend) estejam em execução simultaneamente para que a aplicação funcione corretamente.

## 8. Log de Alterações (Changelog)
Esta seção documenta as principais mudanças e melhorias implementadas no projeto ao longo do tempo.

- **v1.3.0 (18/06/2025)**
    - **Wizard de Resultados**: Adicionada uma nova etapa de "Resultados" ao formulário de cadastro/edição de concursos. Agora é possível inserir a nota da prova discursiva e os resultados de aprovação (`Aprovado`, `Reprovado`, etc.).
    - **Melhoria Visual na Tabela**: Os resultados na tabela de "Controle de Concursos" agora são exibidos como "badges" coloridos, facilitando a identificação rápida do status (ex: verde para "Aprovado", vermelho para "Reprovado").

- **v1.2.0 (17/06/2025)**
    - **Unificação de Formulários**: Substituídos os formulários `AddProof.jsx`, `AddSimulado.jsx` e o modal de edição por um único componente reutilizável e multi-etapas (`ProofFormContent.jsx`), simplificando a manutenção e garantindo uma UI consistente.
    - **Melhoria no Card de Concursos**: O `ContestCard.jsx` foi redesenhado para exibir o nome completo do órgão, a nota de aproveitamento e um status visual claro (`Pendente`, `Finalizado`), melhorando a hierarquia da informação e a usabilidade. O componente `ProofLogo` foi removido.

- **v1.1.0 (16/06/2025)**
    - **Refatoração Visual do Dashboard**: Corrigida a formatação de percentuais e adicionados cabeçalhos ausentes na tabela de dados consolidados. A lógica de cálculo foi centralizada no componente `StatsRow` para garantir consistência.
    - **Centralização de Utilitários**: Criada a função `formatPercent` em `src/utils/formatters.js` para padronizar a formatação de porcentagens em toda a aplicação, removendo implementações duplicadas.

- **v1.0.0 (15/06/2025)**
    - Lançamento inicial do projeto.
    - Funcionalidades principais: Cadastro de provas e simulados, upload de gabaritos (usuário e oficial), correção automática, visualização de resultados por disciplina e cálculo de aproveitamento.
    - Backend com Node.js/Express/Prisma e frontend com React/Vite/Tailwind CSS.
