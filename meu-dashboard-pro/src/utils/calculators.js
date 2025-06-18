/**
 * Calcula o desempenho de uma prova, aplicando regras de pontuação diferentes por banca.
 * @param {object} proof - O objeto da prova, contendo a banca e os resultados.
 * @returns {object} - Um objeto com o percentual de aproveitamento e os totais.
 */
export const calculatePerformance = (proof) => {
    if (!proof || !proof.results) {
        return { percentage: 0, acertos: 0, erros: 0, brancos: 0, totalQuestoes: 0 };
    }

    const totals = proof.results.reduce((acc, r) => {
        acc.acertos += r.acertos;
        acc.erros += r.erros;
        acc.brancos += r.brancos;
        return acc;
    }, { acertos: 0, erros: 0, brancos: 0 });

    const totalQuestoes = totals.acertos + totals.erros + totals.brancos;

    let pontuacaoFinal;

    // AQUI ESTÁ A REGRA DE NEGÓCIO
    // Verifica se o nome da banca inclui "cespe" ou "cebraspe" (ignorando maiúsculas/minúsculas)
    if (proof.banca.toLowerCase().includes('cespe') || proof.banca.toLowerCase().includes('cebraspe')) {
        // Para Cespe/Cebraspe, um erro anula um acerto.
        pontuacaoFinal = totals.acertos - totals.erros;
    } else {
        // Para as outras bancas (FGV, FCC, etc.), contamos apenas os acertos.
        pontuacaoFinal = totals.acertos;
    }

    // Calcula a porcentagem baseada na pontuação final
    const percentage = totalQuestoes > 0 ? (pontuacaoFinal / totalQuestoes) : 0;
    
    // Garante que a porcentagem não seja negativa
    const finalPercentage = Math.max(0, percentage);

    return { percentage: finalPercentage };
};