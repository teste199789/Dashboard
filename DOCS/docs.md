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
- **Lógica Principal**:
    1. Parseia os gabaritos (`userAnswers`, `gabaritoDefinitivo`, `gabaritoPreliminar`) usando `parseGabarito`.
    2. Inicializa um objeto `resultadoPorMateria` para acumular os resultados de cada disciplina.
    3. Itera por cada questão de `1` a `totalQuestoes`:
        a. Identifica a matéria da questão com base nos intervalos `questaoInicio` e `questaoFim` definidos em `subjects`.
        b. **Regra de Anulação**: Uma questão é considerada anulada se sua resposta no gabarito oficial for 'X', 'N' ou 'ANULADA'. Se anulada, conta como `anulada` e também como `acerto`. Um erro que o usuário possa ter cometido nessa questão não é contabilizado.
        c. Se não for anulada:
            i. Se o usuário não respondeu (`!respostaUser`), conta como `branco`.
            ii. Se `respostaUser` === `respostaFinal`, conta como `acerto`.
            iii. Caso contrário, conta como `erro`.
- **Saída**: Objeto `{ resultados: Array, log: Array }`.

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
    - **`common/`**: Componentes genéricos de UI (ex: `Modal`, `Button`, `Card`).
        - `ResultGrid.jsx`: Renderiza o "Gabarito Visual" nas abas de resultado. Questões anuladas oficialmente são exibidas em verde se o `gabaritoDefinitivo` estiver presente, indicando um acerto consolidado.
    - **`icons/`**: Ícones usados na aplicação.
    - `ProofForm.jsx`: Formulário em wizard para criar e editar concursos e simulados.
- **`contexts/`**: Provedores de contexto para gerenciamento de estado global (`ProofsContext`, `ThemeContext`).
- **`hooks/`**: Hooks customizados, como `useProofs`, que encapsula a lógica de manipulação de dados de provas.
- **`layouts/`**: Componentes que definem a estrutura visual das páginas.
    - `MainLayout.jsx`: Layout principal com barra de navegação lateral e cabeçalho.
    - `FocusedLayout.jsx`: Layout simplificado, geralmente usado para formulários ou páginas de edição, sem a navegação principal.
- **`pages/`**: Componentes que representam páginas ou seções principais da aplicação.
    - `Dashboard.jsx`: A página inicial.
    - `ProofDetail.jsx`: Página de detalhes de uma prova, que gerencia as abas de conteúdo.
    - **`tabs/`**: Componentes para cada uma das abas da página `ProofDetail`.
        - `SimulateAnnulmentTab.jsx`: Permite ao usuário selecionar questões para simular o impacto de anulações. A seleção é salva no banco de dados e persistida entre as sessões. A grade visual indica em verde as questões já anuladas oficialmente, e a lógica de cálculo previne que a pontuação simulada ultrapasse o máximo da prova.
- **`utils/`**: Funções utilitárias, como formatação de datas e cálculos.
- **`App.css`, `index.css`**: Arquivos CSS globais e de configuração do Tailwind CSS.

## 7. Fluxos de Trabalho do Usuário

### Cadastro e Correção de uma Prova
1.  **Criação**: O usuário clica em "Adicionar Concurso" ou "Adicionar Simulado".
2.  **Preenchimento do Formulário**: O formulário `ProofForm` é exibido, e o usuário preenche os dados em etapas (wizard).
3.  **Detalhamento (Página `ProofDetail`)**: Após a criação, o usuário é direcionado para a página de detalhes, onde pode:
    - Cadastrar as matérias (`InfoTab`).
    - Inserir os gabaritos da banca (`OfficialKeysTab`).
    - Inserir suas próprias respostas (`UserAnswersTab`).
4.  **Correção**: Na aba `ResultTab`, o usuário clica em "Corrigir".
5.  **Visualização do Resultado**: A página é atualizada para exibir o desempenho detalhado e o `ResultGrid` com o gabarito visual colorido.

### Simulação de Anulações
1.  **Acesso**: Na página de detalhes, o usuário navega para a aba `SimulateAnnulmentTab`.
2.  **Seleção**: O usuário clica nos números das questões que deseja simular como anuladas.
3.  **Cálculo em Tempo Real**: O card "Pontuação Simulada" é atualizado instantaneamente.
4.  **Persistência**: O usuário clica em "Salvar Simulação". A seleção é enviada para o backend. Ao retornar a esta tela, as seleções salvas são recarregadas.

## 8. Guia de Instalação e Execução
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

**Executando os Testes**

Para garantir a qualidade e a estabilidade do código, o projeto conta com uma suíte de testes automatizados tanto para o backend quanto para o frontend.

- **Executando Testes do Backend**:
  ```bash
  cd backend
  npm test
  ```
  Para gerar um relatório de cobertura de testes:
  ```bash
  npm run coverage
  ```

- **Executando Testes do Frontend**:
  ```bash
  cd meu-dashboard-pro
  npm test
  ```
  Para gerar um relatório de cobertura de testes:
  ```bash
  npm run coverage
  ```

## 9. Log de Alterações (Changelog)
Esta seção documenta as principais mudanças e melhorias implementadas no projeto ao longo do tempo.

- **v1.9.4 (DATA_ATUAL)**
    - **Melhoria na Exibição de Resultados no Dashboard**:
        - **Novas Colunas de Resultado**: Adicionadas colunas dedicadas ("Objetiva", "Discursiva", "Final") à tabela principal para exibir o status de cada fase do concurso (ex: "Aprovado", "Eliminado"), oferecendo uma visão geral mais completa.
        - **Ajuste de Layout**: Os cabeçalhos da tabela foram encurtados e centralizados para melhor legibilidade e para acomodar as novas colunas sem quebrar o layout.
        - **Correção de Fluxo de Dados**: Corrigido um bug no backend que não enviava os dados de resultado para o frontend. Também foi ajustado o formulário de edição para garantir que os status sejam salvos no formato JSON correto (`{ "status": "..." }`), garantindo a comunicação correta entre o frontend e o backend.
        - **Coluna "Status"**: A antiga coluna "Próxima Ação" foi renomeada para "Status", tornando seu propósito mais claro ao exibir tanto o andamento quanto o resultado final de um concurso.

- **v1.9.3 (DATA_ATUAL)**
    - **Correção de Bug Crítico e Melhoria de UX na Exclusão**:
        - **Correção do Bug de Exclusão**: Resolvido um bug crítico que impedia a exclusão de concursos. O erro ocorria porque o frontend enviava o objeto de prova inteiro (`[object Object]`) para a API de exclusão em vez de apenas o ID numérico, causando uma falha no backend. A lógica no `ProofsContext` foi corrigida para garantir que apenas o ID seja enviado.
        - **Botão de Excluir na Página de Detalhes**: Adicionado um botão "Excluir" na página de detalhes da prova, permitindo que o usuário delete um concurso diretamente dessa tela, melhorando o fluxo de trabalho.
        - **Refatoração do Modal de Confirmação**: O modal de confirmação de exclusão foi centralizado no layout principal da aplicação (`MainLayout.jsx`) para garantir consistência e reutilização de código, em vez de ser implementado em cada página separadamente.

- **v1.9.2 (DATA_ATUAL)**
    - **Implementação de Testes Abrangentes e Correção de Bugs**:
        - **Backend (Jest & Supertest)**: Introduzida uma suíte de testes completa para o backend. Testes unitários para a lógica de correção (`correcao.js`) e testes de integração para todos os primeiros da API. Corrigidos bugs na lógica de parsing de gabaritos e no cálculo de aproveitamento revelados pelos testes.
        - **Frontend (Vitest & React Testing Library)**: Configurado ambiente de teste com Vitest. Adicionados testes unitários para utilitários (`formatters.js`), hooks (`useDebouncedState.js`) e componentes (`StatusBadge`, `AdvancedBankConfig`). Corrigida falha de lógica no componente `StatusBadge`.
        - **Infraestrutura de Testes**: Configurados bancos de dados de teste isolados, scripts de execução (`npm test`, `npm run coverage`) e simulação de API (mocking) para garantir testes rápidos, confiáveis e independentes.

- **v1.7.0 (06/01/2025)**
    - **Análise Completa e Limpeza do Projeto**:
        - **Limpeza de Código Backend**: Removida pasta `services/` vazia, estrutura duplicada `prisma/backend/prisma/`, dependência não utilizada `random-js`. Corrigido `package.json` (script `dev`, `main` field, descrição). Melhorados logs excessivos no `server.js` e adicionado tratamento de erros. Campo `resultadoObjetiva` corrigido de `String?` para `Json?` no schema. Documentação JSDoc completa adicionada ao `utils/correcao.js`.
        - **Limpeza de Código Frontend**: Removidos arquivos não utilizados (`App.css`, `assets/react.svg`). Downgrade do React Router v7→v6 para compatibilidade. Configuração Vite otimizada com chunks separados. Corrigidos 21 problemas de linting incluindo hook condicional crítico, variáveis não utilizadas, imports não utilizados.
        - **Correção de Cálculos de Porcentagem**: Corrigido problema de dupla multiplicação por 100 nas porcentagens. Criada função `formatPercentAlreadyScaled` para valores já em escala 0-100. Aplicada correção em `Dashboard`, `ResultTab`, `ProofDetailCard`, `ContestCard`. Porcentagens agora exibem valores corretos (85,00% em vez de 0,85% ou 8500,00%).
        - **Novo Design Visual**: Dashboard redesenhado com estilo moderno: cabeçalho laranja (`bg-orange-400`), colunas em verde-azulado (`bg-teal-200`), linhas alternadas, layout de 9 colunas incluindo campo "Anuladas". Mantida funcionalidade completa com visual aprimorado.
        - **Correções React Router**: Adicionadas flags de future (`v7_startTransition`, `v7_relativeSplatPath`) para eliminar warnings de compatibilidade.

- **v1.9.0 (DATA_ATUAL)**
    - **Melhoria Abrangente da Tabela de Controle de Concursos**:
        - **Indicadores Visuais de Desempenho**: A coluna "Aproveitamento" foi transformada em uma barra de progresso colorida, proporcionando uma leitura visual imediata e comparativa do desempenho.
        - **Hierarquia Visual e Ações Simplificadas**: O título do concurso agora é destacado em negrito para melhor legibilidade. As ações secundárias ("Editar", "Deletar") foram agrupadas em um menu de "três pontos", limpando a interface e focando na ação principal.
        - **Status Inteligente de Próxima Ação**: Foi introduzida a coluna "Próxima Ação", que utiliza badges coloridos para indicar o estado de cada concurso (ex: "Pendente Meu Gabarito", "Pronto para Corrigir", "Finalizado"), guiando o usuário no seu fluxo de trabalho.
        - **Filtros Avançados e Busca**: A tabela agora conta com um campo de busca global e filtros específicos por "Banca" e "Próxima Ação", permitindo uma análise de dados muito mais granular e poderosa.
        - **Ordenação por Colunas**: Todas as colunas agora são ordenáveis, facilitando a análise de tendências ao longo do tempo.
        - **Unificação Visual**: O estilo da tabela foi alinhado ao da seção "Dados Consolidados", com cabeçalho verde-azulado e linhas zebradas para maior consistência visual.

- **v1.9.1 (DATA_ATUAL)**
    - **Aprimoramento do Card de Resumo de Resultados**:
        - **Métricas Detalhadas**: O card de resumo na aba "Resultado Final" foi redesenhado para exibir métricas detalhadas (Acertos, Erros, Brancos, Aproveitamento) para o Total, Conhecimentos Básicos e Conhecimentos Específicos.
        - **Visualização Hierárquica**: O card agora inclui uma barra de progresso empilhada que mostra a proporção de questões básicas e específicas na prova.
        - **Clareza e Contexto**: Ícones e cores foram adicionados para reforçar o significado de cada métrica, e as cores da barra correspondem às seções para uma associação visual clara.

- **v1.6.0 (19/06/2025)**
    - **Refatoração da Interface e Correção de Bugs Críticos**:
        - **Melhoria Geral da UI/UX**: Realizada uma refatoração completa da navegação principal, extraindo-a para um componente modular e centralizando a configuração de links para facilitar a manutenção. Melhorada a consistência visual dos temas claro/escuro em diversos componentes (botões, cartões, inputs).
        - **Otimização da Aba de Ranking**: A aba de simulação de ranking foi completamente reescrita para otimizar a performance, utilizando um hook customizado (`useDebouncedState`) para evitar recálculos excessivos e lentidão na interface.
        - **Correção de Bug Crítico no Backend**: Resolvido um erro HTTP 500 persistente que ocorria ao salvar dados da aba de ranking. A causa raiz era uma dessincronização entre o schema do banco de dados e o cliente Prisma, que foi corrigida através da aplicação de uma migração manual e da implementação de funções mais robustas no servidor para tratar diferentes formatos numéricos.

- **v1.5.1 (19/06/2025)**
    - **Correção Crítica de Conectividade Backend-Frontend**:
        - **Configuração CORS Aprimorada**: Corrigida a configuração do CORS no backend para aceitar especificamente as origens do frontend (`http://localhost:5173`, `http://localhost:3000`, `http://127.0.0.1:5173`), resolvendo erros HTTP 500 na busca de dados.
        - **Logs de Debug Estruturados**: Implementados logs detalhados tanto no backend quanto no frontend para facilitar identificação de problemas de conectividade. Adicionado middleware no backend para registrar todas as requisições com timestamp e headers.
        - **Configuração de Ambiente Frontend**: Criado arquivo `.env` no frontend com `VITE_API_URL=http://localhost:3001/api` para garantir conexão correta com a API.
        - **Tratamento de Erros Robusto**: Melhorado o tratamento de erros na função `getProofs` do `apiService.js` com logs detalhados para facilitar debug.

- **v1.5.0 (19/06/2025)**
    - **Melhoria da Experiência do Usuário (UX) no Detalhe da Prova**:
        - **Fluxo de Cadastro Guiado**: O sistema agora exige que o usuário cadastre as matérias de uma prova antes de habilitar as abas de "Gabaritos", "Resultado", "Simulação" e "Ranking". Isso previne erros de fluxo e garante que a estrutura da prova seja definida primeiro.
        - **Feedback Visual Aprimorado**: As abas inativas agora são claramente marcadas como desabilitadas, exibindo um ícone de cadeado e um tooltip informativo, melhorando a clareza da interface e guiando o usuário sobre os próximos passos necessários.

- **v1.4.0 (19/06/2025)**
    - **Melhoria da Experiência do Usuário (UX)**:
        - **Ações Contextuais**: A tabela de controle no Dashboard agora exibe ações inteligentes (ex: "Preencher Gabarito", "Corrigir", "Lançar Resultado") com base no estado de cada concurso, guiando o usuário no fluxo de trabalho.
        - **Navegação Inteligente**: A página de detalhes da prova agora abre automaticamente na aba mais relevante (ex: "Meu Gabarito" se estiver em branco, "Resultado" se a prova já foi corrigida), melhorando a navegação.
        - **Wizard Direto ao Ponto**: O formulário de edição agora abre diretamente na etapa de "Resultados" quando essa ação é selecionada no dashboard.
    - **Correção de Bug**: Corrigido o cálculo de porcentagens na aba "Resultado Final", que exibia valores incorretos (ex: 0,80% em vez de 80%).

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

## Versão 1.7.1 - Melhorias na Precisão das Previsões de Ranking

### Ajustes Implementados (Janeiro 2025)

#### 🎯 **Correção dos Cálculos de Previsão**
- **Margem de erro mais realista**: Implementado sistema de margem composto por:
  - Base de 2% (anterior: até 10%)
  - Fator de competição: até 8% para concursos grandes
  - Fator de distância da média: até 5% baseado na performance
- **Aplicação assimétrica**: Menos otimismo, mais conservadorismo
- **Limite mínimo de faixa**: Pelo menos 1% do total de inscritos ou 3 posições

#### 📊 **Parâmetros Padrão Mais Realistas**
- **Nota média padrão**: 
  - Anterior: 90% da nota do usuário
  - Atual: 75% da nota do usuário (mais conservador)
- **Desvio padrão aumentado**: 
  - Anterior: 10% do total de questões
  - Atual: 15% do total de questões (maior variabilidade)
- **Nota de corte ajustada**:
  - Anterior: 95% da nota do usuário
  - Atual: 110% da nota do usuário (mais realista)

#### 🔧 **Botões de Cenário Rápido**
- **Cenário Conservador**: Para concursos muito competitivos
  - Média: 65% da nota do usuário
  - Desvio: 18% do total de questões
  - Corte: 115% da nota do usuário
- **Cenário Moderado**: Equilibrado
  - Média: 75% da nota do usuário
  - Desvio: 15% do total de questões
  - Corte: 108% da nota do usuário

#### 📋 **Melhorias na Interface**
- Instruções mais claras sobre interpretação dos resultados
- Dicas para ajustar parâmetros para simulações mais conservadoras
- Confiança limitada entre 30% e 85% (mais realista)
- Cálculo de confiança baseado na qualidade dos parâmetros

#### 🎲 **Impacto nas Estatísticas**
- Faixas de classificação mais estreitas e realistas
- Redução significativa de previsões excessivamente otimistas
- Melhor alinhamento com estatísticas reais de concursos
- Margem de erro adaptativa baseada no contexto do concurso

#### ✅ **Resultados Obtidos**
- ✅ **Nenhuma informação cortada**: Todas as labels visíveis
- ✅ **Layout responsivo**: Funciona em diferentes tamanhos de tela
- ✅ **Espaçamento adequado**: Elementos bem distribuídos
- ✅ **Legibilidade otimizada**: Fontes e offsets balanceados
- ✅ **Experiência consistente**: Visual limpo e profissional

## Versão 1.7.2 - Correção de Salvamento de Valores Decimais

### Correções Críticas Implementadas (Janeiro 2025)

#### 🐛 **Bug Corrigido: Valores Decimais Incorretos**
- **Problema**: Valores como "16.1" eram salvos como "161" (multiplicação por 10)
- **Causa**: Função `parseFlexibleFloat` no backend removendo incorretamente todos os pontos
- **Solução**: Implementada lógica de parsing inteligente que detecta formato:
  - Formato padrão: "16.1" → 16.1 ✅
  - Formato brasileiro: "16,1" → 16.1 ✅
  - Formato milhares: "1.000,50" → 1000.5 ✅

#### 💫 **Melhorias na Experiência do Usuário**
- **Função de salvamento melhorada**:
  - ✅ Permanece na página após salvar (não redireciona)
  - ✅ Feedback visual aprimorado com ícones e posicionamento
  - ✅ Atualização automática dos valores salvos na interface
  - ✅ Delay inteligente para sincronização com o backend

#### 🔍 **Nova Funcionalidade: Prévia dos Valores**
- **Botão "Ver Prévia"**: Mostra exatamente quais valores serão salvos
- **Validação visual**: Confirma que os valores decimais estão corretos
- **Grid responsivo**: Exibe inscritos, média, desvio padrão e nota de corte
- **Formato adequado**: Números com formatação brasileira quando apropriado

#### 🎯 **Melhorias Técnicas**
- Parse de float robusto com detecção automática de formato
- Tratamento de casos extremos (valores nulos, strings vazias)
- Logs de erro mais informativos para depuração
- Validação de entrada mais resiliente

#### 📱 **Interface Aprimorada**
- Toast notifications com ícones e posicionamento otimizado
- Botões de cenário rápido mantidos
- Estado de loading aprimorado durante salvamento
- Feedback visual imediato após operações

#### 🎯 **Garantias de Funcionamento**
- ✅ Valores decimais preservados corretamente (16.1 permanece 16.1)
- ✅ Validação impede valores maiores que total de questões
- ✅ Gráfico renderiza adequadamente com todos os parâmetros
- ✅ Sistema permanece na página após salvar
- ✅ Feedback visual imediato e informativo
- ✅ Tratamento robusto de todos os cenários de erro

## Versão 1.7.4 - Melhorias na Visualização do Gráfico

### Aprimoramentos de UX/UI (Janeiro 2025)

#### 📊 **Gráfico Otimizado para Concursos Reais**
- **Escala realista**: Limitada ao total de questões da prova
  - Uso de 2.5 desvios padrão (ao invés de 4) para visualização focada
  - Escala mínima de 20% do total ou 5 pontos para garantir visibilidade
  - Arredondamento para valores inteiros mais limpos
- **Eixos informativos**: 
  - Eixo X: "Pontuação (questões corretas)" com formatação inteira
  - Eixo Y: "Densidade (%)" com precisão decimal
  - Indicação clara da escala "0 a X questões" no título

#### 🎨 **Elementos Visuais Aprimorados**
- **Linhas de referência melhoradas**:
  - 🔵 **Linha Azul** (sua nota): Tracejada, mais espessa, posicionamento otimizado
  - 🔴 **Linha Vermelha** (nota de corte): Tracejada diferenciada, bem visível
  - 🟡 **Linha Amarela** (média): Nova linha pontilhada para referência
- **Tooltips informativos**: 
  - Formato "X questões corretas" ao invés de apenas números
  - Explicação do significado da densidade
  - Contexto adicional sobre percentual de candidatos

#### 📋 **Legenda Educativa Completa**
- **Interpretação visual**: Grid responsivo com símbolos das linhas
- **Cores consistentes**: Correspondência exata com elementos do gráfico
- **Dica pedagógica**: Explicação sobre posicionamento e classificação
- **Design acessível**: Cores e contrastes otimizados para leitura

#### 🧠 **Melhorias na Compreensão**
- **Contexto claro**: Escala sempre relacionada ao total de questões
- **Terminologia precisa**: "questões corretas" ao invés de valores abstratos
- **Feedback educativo**: Explicações sobre como interpretar a posição
- **Visualização focada**: Eliminação de ruído visual desnecessário

#### 🎯 **Impacto na Experiência**
- **Gráfico intuitivo**: Escala condizente com a realidade do concurso
- **Interpretação facilitada**: Legenda explicativa completa
- **Aprendizado efetivo**: Usuário compreende melhor sua posição
- **Decisões informadas**: Visualização clara para ajustar estratégias

#### ✅ **Resultados Obtidos**
- ✅ **Nenhuma informação cortada**: Todas as labels visíveis
- ✅ **Layout responsivo**: Funciona em diferentes tamanhos de tela
- ✅ **Espaçamento adequado**: Elementos bem distribuídos
- ✅ **Legibilidade otimizada**: Fontes e offsets balanceados
- ✅ **Experiência consistente**: Visual limpo e profissional

## Versão 1.7.5 - Correções de Layout e Responsividade

### Ajustes de Interface (Janeiro 2025)

#### 📐 **Correções de Layout do Gráfico**
- **Problema resolvido**: Informações cortadas nas bordas do gráfico
- **Margens aumentadas**: 
  - Superior: 40px → 50px
  - Direita: 40px → 50px
  - Esquerda: 60px → 70px
  - Inferior: 60px → 70px
- **Container otimizado**:
  - Altura fixa de 450px para consistência
  - Cálculo dinâmico do espaço interno
  - Wrapper adicional para melhor controle

#### 📱 **Melhorias Responsivas**
- **Padding adaptativo**: `p-4 sm:p-6` para diferentes telas
- **Título responsivo**: Quebra de linha em telas menores
- **Eixos otimizados**:
  - Largura do eixo Y aumentada para 60px
  - Font-size reduzido para 11px (melhor legibilidade)
  - Offsets ajustados para evitar sobreposição

#### 🏷️ **Labels e Referências Reposicionadas**
- **Labels de eixos**: Offset otimizado para evitar cortes
- **Linhas de referência**: 
  - Offset superior aumentado para 25px
  - Offset inferior para linha da média: 15px
  - Font-size ajustado para melhor proporção
- **Tooltips**: Posicionamento aprimorado

#### 🎨 **Elementos Visuais Ajustados**
- **Grid de layout**: Espaçamento otimizado (space-y-6)
- **Stats cards**: Margem inferior adicional (mb-6)
- **Container principal**: Padding responsivo consistente
- **Legenda**: Mantida posicionamento adequado

#### ✅ **Resultados Obtidos**
- ✅ **Nenhuma informação cortada**: Todas as labels visíveis
- ✅ **Layout responsivo**: Funciona em diferentes tamanhos de tela
- ✅ **Espaçamento adequado**: Elementos bem distribuídos
- ✅ **Legibilidade otimizada**: Fontes e offsets balanceados
- ✅ **Experiência consistente**: Visual limpo e profissional

## Versão 1.7.6 - Correção de Sobreposição e Eixo X

### Correções Visuais Críticas (Janeiro 2025)

#### 🎯 **Problema de Sobreposição de Labels Resolvido**
- **Problema identificado**: Labels das linhas de referência se sobrepondo
- **Solução implementada**: Sistema de posicionamento inteligente
  - **Sua Nota**: Posição dinâmica (topLeft/topRight) baseada na relação com nota de corte
  - **Nota de Corte**: Posição adaptativa (top/bottom) dependendo da proximidade
  - **Média**: Mantida na posição bottom com offset reduzido
- **Textos encurtados**: "Nota de Corte" → "Corte" para economizar espaço

#### 📊 **Eixo X Completamente Corrigido**
- **Problema resolvido**: Sequência incorreta "0 1 1 2 2" 
- **Implementação**:
  - **Domínio fixo**: `[0, totalQuestoes]` para controle preciso
  - **tickCount limitado**: Máximo 11 ticks para evitar sobreposição
  - **Formatação inteligente**: Apenas valores inteiros válidos
  - **allowDecimals**: `false` para garantir valores limpos
  - **Validação**: Valores dentro do range 0-totalQuestoes

#### 🧮 **Melhorias na Geração de Dados**
- **Precisão aumentada**: 100 pontos para curva mais suave
- **Step otimizado**: Cálculo baseado no range total
- **Arredondamento inteligente**: Floor/ceil para limites inteiros
- **Dados limpos**: Score com 2 casas decimais para precisão

#### 🎨 **Ajustes Visuais Complementares**
- **Offsets reduzidos**: Evitar conflitos visuais
- **Font-size otimizado**: 10-11px para melhor proporção
- **Posicionamento dinâmico**: Baseado na proximidade entre valores
- **Cores mantidas**: Azul, vermelho e amarelo para consistência

#### 🔧 **Benefícios Técnicos**
- **Performance**: Menos ticks = renderização mais rápida
- **Legibilidade**: Sem duplicatas ou sobreposições
- **Responsividade**: Funciona em todas as resoluções
- **Manutenibilidade**: Código mais limpo e previsível

#### ✅ **Resultados Visuais Finais**
- ✅ **Eixo X sequencial**: 0, 1, 2, 3... (sem duplicatas)
- ✅ **Labels não sobrepostas**: Posicionamento inteligente
- ✅ **Visual limpo**: Espaçamento adequado em todos os elementos
- ✅ **Responsividade total**: Funciona em diferentes telas
- ✅ **Performance otimizada**: Renderização suave e rápida

### Correções Finais - Versão 1.7.6

#### Sobreposição de Labels
- Sistema de posicionamento inteligente implementado
- Posição dinâmica baseada na proximidade entre valores
- Textos encurtados ("Nota de Corte" → "Corte")
- Offsets reduzidos para evitar conflitos

#### Eixo X Corrigido
- **Problema**: Sequência "0 1 1 2 2" 
- **Solução**: Domínio fixo [0, totalQuestoes]
- tickCount limitado a máximo 11
- allowDecimals: false para valores limpos
- Validação para valores dentro do range

#### Melhorias na Geração de Dados
- Precisão aumentada para 100 pontos
- Step otimizado baseado no range total
- Arredondamento inteligente floor/ceil
- Performance otimizada

### Correção Definitiva do Eixo X - Versão 1.7.7

#### Problema Crítico Identificado
O Recharts continuava gerando ticks duplicados ("0 0 1 1 2 2...") devido a conflitos entre múltiplas propriedades de configuração do eixo X.

#### Solução Implementada
- **Configuração simplificada**: Removidas propriedades conflitantes (`tickCount`, `interval`, `minTickGap`, `allowDecimals`, etc.)
- **Ticks explícitos customizados**: Array de valores definido manualmente baseado no total de questões
- **Lógica otimizada por faixa**:
  - **≤10 questões**: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10] (todos os valores)
  - **≤20 questões**: [0, 4, 8, 12, 16, totalQuestoes] (intervalos de 4)
  - **>20 questões**: 5 intervalos equidistantes + valor final

#### Melhorias Técnicas
- **Código mais limpo**: Apenas propriedades essenciais no XAxis
- **Performance otimizada**: Menos processamento desnecessário
- **Manutenibilidade**: Lógica clara e direta
- **Compatibilidade**: Funciona consistentemente com diferentes versões do Recharts

#### Resultado Final
- ✅ Eixo X sequencial limpo (ex: "0, 4, 8, 12, 16, 20")
- ✅ Sem duplicatas ou sobreposições
- ✅ Valores apropriados para cada tamanho de prova
- ✅ Renderização consistente e confiável

### Sistema Avançado de Regras de Anulação - Versão 1.8.0

#### Problema de Negócio Identificado
O sistema anterior tratava todas as bancas de forma igual, não contemplando as especificidades reais de cada organizadora, especialmente o Cespe/Cebraspe que possui regras únicas de anulação.

#### Solução Implementada
- **Sistema modular de regras**: 5 tipos diferentes de tratamento de anuladas
- **Configurações por banca**: Cada organizadora com suas especificidades
- **Interface inteligente**: Sugestões automáticas baseadas na banca selecionada
- **Notas de corte adaptáveis**: Formato decimal vs inteiro conforme a banca

#### Tipos de Regras de Anulação
- **PADRAO**: Anulada = +1 ponto (sistema anterior)
- **CESPE_INTEGRAL**: Anulada cancela 1 erro OU adiciona 1 ponto
- **CESPE_MEIO**: Anulada vale 0.5 ponto
- **CESPE_CALCULADO**: Valor dinâmico baseado no % de anuladas
- **PERSONALIZADO**: Valor customizado pelo usuário

#### Configurações Automáticas por Banca
- **Cespe/Cebraspe**: Pontuação líquida, regra integral, notas decimais
- **FGV**: Pontuação bruta, regra padrão, notas decimais
- **FCC**: Pontuação bruta, regra padrão, notas inteiras
- **Quadrix**: Pontuação bruta, regra padrão, notas decimais
- **IBFC**: Pontuação bruta, regra padrão, notas inteiras

#### Melhorias na Interface
- **AdvancedBankConfig**: Componente para configurações avançadas
- **Sugestões automáticas**: Templates por banca com 1 clique
- **Preview das regras**: Visualização clara das configurações aplicadas
- **Validação inteligente**: Impede configurações inválidas

### Padronização Automática de Bancas - Versão 1.8.1

#### Problema de UX Identificado
Usuários precisavam configurar manualmente o tipo de pontuação (líquida vs bruta) mesmo sabendo que cada banca tem um padrão específico, causando confusão e erros de configuração.

#### Solução Implementada
- **SmartBankSelector**: Componente que detecta automaticamente o tipo de pontuação
- **Configuração automática**: Sistema aplica configurações baseadas na banca selecionada
- **Interface educativa**: Explicações claras sobre as diferenças entre os tipos
- **Feedback visual**: Toast notifications informando sobre configurações automáticas

#### Funcionalidades do SmartBankSelector
- **Auto-detecção**: Seleciona automaticamente pontuação líquida para Cespe, bruta para outras
- **Interface visual**: Cards com ícones e cores diferenciadas por tipo
- **Detalhes expandíveis**: Informações técnicas sobre cada configuração
- **Dicas educativas**: Explicações sobre quando usar cada tipo

#### Mapeamento Automático
- **Cespe/Cebraspe** → Pontuação Líquida (Certo/Errado)
- **FGV, FCC, Quadrix, IBFC, Outras** → Pontuação Bruta (Múltipla Escolha)

#### Melhorias na Experiência
- **Redução de erros**: Configuração automática baseada em conhecimento real
- **Onboarding melhorado**: Usuários aprendem as diferenças entre as bancas
- **Eficiência**: Configuração correta com 1 clique
- **Flexibilidade**: Usuário pode alterar se necessário

#### Impacto Técnico
- **Script de migração**: Atualiza provas existentes com configurações padrão
- **Backward compatibility**: Provas antigas funcionam normalmente
- **Validação robusta**: Sistema impede configurações inconsistentes
- **Logs detalhados**: Auditoria completa das configurações aplicadas

### Estado Final do Sistema - Versão 1.8.1
- ✅ Valores decimais preservados corretamente (16.1 permanece 16.1)
- ✅ Validação impede valores maiores que total de questões
- ✅ Gráfico renderiza adequadamente com escala realista
- ✅ Sistema permanece na página após salvar
- ✅ Feedback visual claro e informativo
- ✅ Eixo X sequencial limpo (0, 4, 8, 12...) sem duplicatas
- ✅ Labels sem sobreposição com posicionamento inteligente
- ✅ Previsões de classificação mais conservadoras e realistas
- ✅ Interface responsiva e acessível
- ✅ Tratamento robusto de erros
- ✅ Configuração de gráfico otimizada e maintível
- ✅ **Sistema avançado de regras de anulação por banca**
- ✅ **Configuração automática baseada na banca selecionada**
- ✅ **Tipos de pontuação inteligentes (líquida vs bruta)**
- ✅ **Notas de corte adaptáveis (decimal vs inteiro)**
- ✅ **Interface educativa com dicas por banca**
- ✅ **Sugestões automáticas de configuração**
- ✅ **Migração automática de dados existentes**

### Correção de Conectividade e Salvamento de Dados - Versão 1.8.2

#### Correções Críticas Implementadas (Janeiro 2025)

##### 🐛 **Correção de Conectividade (CORS)**
- **Problema**: O frontend não conseguia se comunicar com o backend devido a erros de CORS (`NetworkError`), mesmo com uma configuração básica existente.
- **Solução**:
  - Implementada uma **configuração de CORS mais robusta** no `server.js` usando uma função de validação de origem (`origin function`) e uma `whitelist` de domínios permitidos.
  - Adicionado um **middleware de log** para registrar todas as requisições recebidas, facilitando a depuração e confirmando que as requisições do frontend estavam (ou não) chegando ao servidor.

##### 💾 **Correção no Salvamento de Detalhes da Prova**
- **Problema**: Após resolver o CORS, salvar as matérias de uma prova falhava com um erro genérico no frontend e um `ReferenceError: resultadoFinal is not defined` no backend.
- **Solução**:
  - **Lógica de Atualização Atômica**: A rota `PUT /api/proofs/:id/details` foi refatorada para usar `prisma.$transaction`. Isso garante que a atualização dos dados da prova e a recriação de suas matérias associadas ocorram de forma atômica, prevenindo estados de dados inconsistentes.
  - **Correção do `ReferenceError`**: A variável `resultadoFinal` foi adicionada à desestruturação do corpo da requisição (`req.body`), resolvendo o erro que impedia a execução da lógica de salvamento.
  - **Melhora nas Mensagens de Erro**: As mensagens de erro no backend foram aprimoradas para fornecer mais detalhes no console em caso de falhas futuras.

##### ✅ **Resultados Obtidos**
- ✅ **Conectividade Restaurada**: Frontend e backend se comunicam sem erros de CORS.
- ✅ **Salvamento Confiável**: Os detalhes da prova e as matérias são salvos de forma segura e consistente.
- ✅ **Maior Robustez**: O backend está mais resiliente a erros durante as atualizações de dados.
- ✅ **Depuração Facilitada**: Logs aprimorados agilizam a identificação de futuros problemas.

### Melhoria Visual do Gráfico de Desempenho - Versão 1.8.3

#### Aprimoramentos de UX/UI (Janeiro 2025)

##### 📊 **Gráfico de Desempenho Redesenhado**
- **Problema**: O gráfico de desempenho padrão era funcional, mas visualmente básico e não estava alinhado com uma estética mais moderna.
- **Solução**:
  - **Estilo Visual Moderno**: O gráfico foi completamente redesenhado para corresponder a um design de referência, utilizando a biblioteca `react-chartjs-2`.
  - **Linha Suavizada e Preenchimento**: A linha de desempenho agora é uma curva suave (`tension: 0.4`) e possui uma área de preenchimento com um gradiente ciano (`backgroundColor: 'rgba(56, 189, 248, 0.15)'`), tornando o visual mais agradável.
  - **Cores e Pontos Ajustados**: As cores da linha, dos pontos e do preenchimento foram padronizadas para um tom de azul ciano, e os pontos de dados foram estilizados para melhor visibilidade.

##### 📋 **Clareza da Informação Aprimorada**
- **Hierarquia Visual**: O título com a contagem total de concursos foi movido para uma posição de maior destaque acima do gráfico, enquanto o título do gráfico ("Desempenho nos concursos") agora funciona como um subtítulo, melhorando a estrutura da informação.
- **Rótulos do Eixo X Contextualizados**: Os rótulos do eixo X foram alterados para exibir o **órgão** do concurso e o **ano**, fornecendo informações mais diretas e relevantes sobre cada ponto de dados, em vez do título completo ou da banca.
- **Grid Sutil**: As linhas de grade do eixo Y foram tornadas mais sutis para reduzir o ruído visual e focar a atenção nos dados.

##### ✅ **Resultados Obtidos**
- ✅ **Visual Profissional**: O gráfico agora possui uma aparência moderna e limpa.
- ✅ **Leitura Facilitada**: As informações são apresentadas de forma mais clara e hierárquica.
- ✅ **Contexto Imediato**: Os rótulos do gráfico fornecem informações mais relevantes, melhorando a experiência do usuário.

### Simplificação das Regras de Anulação - Versão 1.8.4

#### Aprimoramentos de Lógica (Janeiro 2025)

##### 🗑️ **Remoção da Regra "Cespe Dinâmico"**
- **Problema**: A opção "Cespe Dinâmico" para o tratamento de questões anuladas era uma regra complexa e raramente utilizada, adicionando uma sobrecarga desnecessária à interface do usuário.
- **Solução**:
  - **Remoção da Interface**: A opção "Cespe Dinâmico" foi removida da lista de sugestões de regras para a banca "Cespe/Cebraspe", simplificando a tela de configuração.
  - **Limpeza do Backend**: Toda a lógica associada à regra `CESPE_CALCULADO` foi removida do arquivo `regrasAnulacao.js`, incluindo a constante `TIPOS_REGRA_ANULACAO` e o bloco `case` correspondente na função `aplicarRegraAnulacao`.
  - **Foco nas Regras Essenciais**: A interface agora se concentra nas duas regras mais comuns e compreensíveis para o Cespe: "Cespe Padrão" e "Cespe Meio Ponto".

##### ✅ **Resultados Obtidos**
- ✅ **Interface Mais Limpa**: Menos opções na tela de configuração, tornando a escolha do usuário mais direta.
- ✅ **Código Simplificado**: O backend ficou mais enxuto e fácil de manter com a remoção de uma lógica complexa.
- ✅ **Experiência Focada**: O usuário é guiado para as configurações mais relevantes e utilizadas.

## 9. Histórico de Alterações Recentes

### Melhorias no Card de Resumo de Desempenho (`ResultTab`)
Para fornecer uma visão mais clara e imediata do resultado, o card de resumo de desempenho na aba "Resultado Final" foi reestruturado significativamente.

1.  **Destaque para a Pontuação Final**: A pontuação líquida total foi movida para o topo do card, recebendo o maior destaque visual. Ela agora é o primeiro item que o usuário vê, com uma fonte grande e uma linha divisória que a separa dos demais detalhes.
2.  **Reorganização Hierárquica**: O layout foi alterado para seguir a hierarquia: Pontuação Final > Barra de Progresso > Detalhes das Seções. As seções "Total", "Conhecimentos Básicos" e "Conhecimentos Específicos" foram mantidas, mas agora são apresentadas de forma mais limpa e consistente, abaixo da pontuação principal.
3.  **Simplificação do Componente**: A lógica interna do componente `PerformanceSummaryCard` foi refatorada. O componente filho `Section` foi simplificado para ser puramente de apresentação, removendo a lógica condicional que tratava a seção "Total" de forma diferente. Isso torna o código mais limpo, reutilizável e fácil de manter. A responsabilidade de destacar a pontuação final agora reside inteiramente no componente pai, `PerformanceSummaryCard`.
