function parseGabarito(gabaritoString) {
    if (!gabaritoString || gabaritoString.trim() === '') return new Map();
    return new Map(gabaritoString.split(',').map(pair => {
        const [q, a] = pair.split(':');
        return [q, a];
    }));
}

function corrigirProva(proof) {
    const { totalQuestoes, userAnswers, gabaritoDefinitivo, gabaritoPreliminar, subjects } = proof;
    const gabaritoBaseParaCorrecao = gabaritoDefinitivo || gabaritoPreliminar;

    const userMap = parseGabarito(userAnswers);
    const definMap = parseGabarito(gabaritoBaseParaCorrecao);
    const prelimMap = parseGabarito(gabaritoPreliminar);

    const resultadoPorMateria = {};
    if (subjects) {
        subjects.forEach(m => {
            if (m.nome) {
                resultadoPorMateria[m.nome] = { disciplina: m.nome, acertos: 0, erros: 0, brancos: 0, anuladas: 0 };
            }
        });
    }

    for (let i = 1; i <= totalQuestoes; i++) {
        const iStr = String(i);
        const respostaUser = userMap.get(iStr);
        const respostaDefin = definMap.get(iStr);
        const respostaPrelim = prelimMap.get(iStr);
        const materiaInfo = subjects.find(s => s.nome && i >= s.questaoInicio && i <= s.questaoFim);
        
        if (!materiaInfo || !resultadoPorMateria[materiaInfo.nome]) {
            continue;
        }
        
        const materiaDaQuestao = resultadoPorMateria[materiaInfo.nome];
        const isAnnulled = gabaritoDefinitivo && gabaritoPreliminar && respostaPrelim && respostaDefin && respostaPrelim !== respostaDefin;

        if (isAnnulled) {
            materiaDaQuestao.anuladas++;
            materiaDaQuestao.acertos++; 
            continue;
        }
        if (!respostaUser) {
            materiaDaQuestao.brancos++;
            continue;
        }
        if (respostaUser === respostaDefin) {
            materiaDaQuestao.acertos++;
        } else {
            materiaDaQuestao.erros++;
        }
    }
    
    // Garante que o retorno seja sempre um objeto com a estrutura esperada
    return {
        resultados: Object.values(resultadoPorMateria),
        log: [] // Retorna um log vazio, pois a depuração anterior foi concluída
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
    const percentage = totalQuestoesParaCalculo > 0 ? (pontuacaoFinal / totalQuestoesParaCalculo) : 0;
    return { percentage: Math.max(0, percentage) };
}

module.exports = { corrigirProva, calculateOverallPerformance };