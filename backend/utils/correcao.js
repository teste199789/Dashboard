function parseGabarito(gabaritoString) {
    if (!gabaritoString || gabaritoString.trim() === '') return new Map();
    return new Map(gabaritoString.split(',').map(pair => {
        const [q, a] = pair.split(':');
        return [q, a];
    }));
}

const findSubjectForQuestion = (questionNumber, subjects) => {
    const subject = subjects.find(s => questionNumber >= s.questaoInicio && questionNumber <= s.questaoFim);
    return subject ? subject.nome : 'Não encontrada';
};

function corrigirProva(proof) {
    const {
        userAnswers,
        gabaritoDefinitivo,
        gabaritoPreliminar,
        totalQuestoes,
        subjects
    } = proof;

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

    for (let i = 1; i <= totalQuestoes; i++) {
        const qStr = String(i);
        const materiaDaQuestao = findSubjectForQuestion(i, subjects);

        if (!resultadoPorMateria[materiaDaQuestao]) continue;

        const respostaUser = userAnswersMap.get(qStr);
        const respostaFinal = gabaritoFinalMap.get(qStr);

        // A questão é considerada anulada se a resposta no gabarito final for 'X', 'N' ou 'ANULADA' (ignorando espaços e maiúsculas/minúsculas).
        const finalAnswerUpper = respostaFinal ? respostaFinal.trim().toUpperCase() : '';
        const isAnulada = finalAnswerUpper === 'X' || finalAnswerUpper === 'ANULADA' || finalAnswerUpper === 'N';

        if (isAnulada) {
            // REGRA: Questão anulada sempre conta como acerto, mesmo que o usuário tenha deixado em branco.
            resultadoPorMateria[materiaDaQuestao].anuladas++;
            resultadoPorMateria[materiaDaQuestao].acertos++;
        } else {
            if (!respostaUser || respostaUser.trim() === '') {
                resultadoPorMateria[materiaDaQuestao].brancos++;
            } else if (respostaUser === respostaFinal) {
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

function calculateOverallPerformance(proof, calculatedResults) {
    if (!proof || !proof.totalQuestoes || !calculatedResults) {
        return { percentage: 0 };
    }
    const totals = calculatedResults.reduce((acc, r) => {
        acc.acertos += r.acertos;
        acc.erros += r.erros;
        acc.anuladas += r.anuladas;
        return acc;
    }, { acertos: 0, erros: 0, brancos: 0, anuladas: 0 });

    const totalQuestoesParaCalculo = proof.totalQuestoes;
    let pontuacaoFinal;
    if (proof.tipoPontuacao === 'liquida') {
        pontuacaoFinal = (totals.acertos - totals.erros);
    } else {
        pontuacaoFinal = totals.acertos;
    }
    const percentage = totalQuestoesParaCalculo > 0 ? (pontuacaoFinal / totalQuestoesParaCalculo) * 100 : 0;
    return { percentage: Math.max(0, percentage) };
}

module.exports = { corrigirProva, calculateOverallPerformance };