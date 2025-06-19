const { aplicarRegraAnulacao } = require('./regrasAnulacao');

/**
 * Converte uma string de gabarito (ex: "1:A,2:B,3:C") em um Map para fácil consulta
 * @param {string} gabaritoString - O gabarito em formato string
 * @returns {Map<string, string>} Map onde a chave é o número da questão e o valor é a alternativa
 */
function parseGabarito(gabaritoString) {
    if (!gabaritoString || gabaritoString.trim() === '') return new Map();
    return new Map(gabaritoString.split(',').map(pair => {
        const [q, a] = pair.split(':');
        return [q, a];
    }));
}

/**
 * Encontra a matéria correspondente a uma questão específica
 * @param {number} questionNumber - Número da questão
 * @param {Array} subjects - Array de matérias com intervalos de questões
 * @returns {string} Nome da matéria ou 'Não encontrada'
 */
const findSubjectForQuestion = (questionNumber, subjects) => {
    const subject = subjects.find(s => questionNumber >= s.questaoInicio && questionNumber <= s.questaoFim);
    return subject ? subject.nome : 'Não encontrada';
};

/**
 * Corrige uma prova comparando as respostas do usuário com o gabarito oficial
 * @param {Object} proof - Dados da prova incluindo gabaritos, respostas e matérias
 * @returns {Object} Objeto com resultados por matéria e log de operações
 */
function corrigirProva(proof) {
    const {
        userAnswers,
        gabaritoDefinitivo,
        gabaritoPreliminar,
        totalQuestoes,
        subjects
    } = proof;

    // Usa gabarito definitivo se disponível, senão usa o preliminar
    const gabaritoFinal = gabaritoDefinitivo || gabaritoPreliminar;

    if (!userAnswers || !gabaritoFinal) {
        return {
            resultados: subjects.map(s => ({
                disciplina: s.nome,
                acertos: 0,
                erros: 0,
                brancos: 0,
                anuladas: 0
            })),
            log: [{
                error: "Gabaritos insuficientes para correção."
            }]
        };
    }

    const userAnswersMap = parseGabarito(userAnswers);
    const gabaritoFinalMap = parseGabarito(gabaritoFinal);

    // Inicializa contadores para cada matéria
    const resultadoPorMateria = subjects.reduce((acc, subject) => {
        acc[subject.nome] = {
            disciplina: subject.nome,
            acertos: 0,
            erros: 0,
            brancos: 0,
            anuladas: 0
        };
        return acc;
    }, {});

    // Processa cada questão da prova
    for (let i = 1; i <= totalQuestoes; i++) {
        const qStr = String(i);
        const materiaDaQuestao = findSubjectForQuestion(i, subjects);

        if (!resultadoPorMateria[materiaDaQuestao]) continue;

        const respostaUser = userAnswersMap.get(qStr);
        const respostaFinal = gabaritoFinalMap.get(qStr);

        // Verifica se a questão foi anulada
        const finalAnswerUpper = respostaFinal ? String(respostaFinal).trim().toUpperCase() : '';
        const isAnulada = finalAnswerUpper === 'X' || finalAnswerUpper === 'ANULADA' || finalAnswerUpper === 'N';

        const userHadAnswered = respostaUser && respostaUser.trim() !== '';
        const userWasCorrect = userHadAnswered && respostaUser === respostaFinal;

        if (isAnulada) {
            // Questão anulada conta como acerto para todos
            resultadoPorMateria[materiaDaQuestao].anuladas++;
            resultadoPorMateria[materiaDaQuestao].acertos++;
        } else {
            // Questão normal - verifica se acertou, errou ou deixou em branco
            if (!userHadAnswered) {
                resultadoPorMateria[materiaDaQuestao].brancos++;
            } else if (userWasCorrect) {
                resultadoPorMateria[materiaDaQuestao].acertos++;
            } else {
                resultadoPorMateria[materiaDaQuestao].erros++;
            }
        }
    }

    return {
        resultados: Object.values(resultadoPorMateria),
        log: []
    };
}

/**
 * Calcula o desempenho geral da prova baseado nos resultados por matéria
 * @param {Object} proof - Dados da prova incluindo tipo de pontuação
 * @param {Array} calculatedResults - Resultados calculados por matéria
 * @returns {Object} Objeto com o percentual de aproveitamento
 */
function calculateOverallPerformance(proof, calculatedResults) {
    if (!proof || !proof.totalQuestoes || !calculatedResults) {
        return { percentage: 0 };
    }

    // Soma os totais de todas as matérias
    const totals = calculatedResults.reduce((acc, r) => {
        acc.acertos += r.acertos;
        acc.erros += r.erros;
        acc.brancos += r.brancos;
        acc.anuladas += r.anuladas;
        return acc;
    }, { acertos: 0, erros: 0, brancos: 0, anuladas: 0 });

    const totalQuestoesParaCalculo = proof.totalQuestoes;

    // NOVA LÓGICA: Usar sistema avançado de regras de anulação
    const resultadoAnulacao = aplicarRegraAnulacao(proof, totals);
    const pontuacaoFinal = resultadoAnulacao.pontuacao;

    const percentage = totalQuestoesParaCalculo > 0 
        ? (pontuacaoFinal / totalQuestoesParaCalculo) * 100 
        : 0;

    return { 
        percentage: Math.max(0, percentage),
        detalhesAnulacao: resultadoAnulacao.detalhes // Incluir detalhes para debug/log
    };
}

module.exports = { corrigirProva, calculateOverallPerformance };