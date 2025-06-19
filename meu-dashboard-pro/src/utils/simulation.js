/**
 * Calcula o Z-Score, que mede quantos desvios padrão uma observação está da média.
 * @param {number} x - O valor da observação (ex: nota do usuário).
 * @param {number} mean - A média da distribuição.
 * @param {number} stdDev - O desvio padrão da distribuição.
 * @returns {number} O Z-Score calculado.
 */
function getZScore(x, mean, stdDev) {
    if (stdDev === 0) return 0; // Evita divisão por zero
    return (x - mean) / stdDev;
}

/**
 * Implementação robusta da função de distribuição normal cumulativa (CDF)
 * Usando a aproximação de Abramowitz and Stegun
 * @param {number} z - O Z-score
 * @returns {number} O valor da CDF (entre 0 e 1)
 */
function normalCDF(z) {
    if (z < -6) return 0;
    if (z > 6) return 1;
    
    const sign = z >= 0 ? 1 : -1;
    z = Math.abs(z);
    
    // Constantes para a aproximação
    const a1 =  0.254829592;
    const a2 = -0.284496736;
    const a3 =  1.421413741;
    const a4 = -1.453152027;
    const a5 =  1.061405429;
    const p  =  0.3275911;
    
    // Aproximação
    const t = 1.0 / (1.0 + p * z);
    const y = 1.0 - (((((a5 * t + a4) * t) + a3) * t + a2) * t + a1) * t * Math.exp(-z * z);
    
    return 0.5 * (1 + sign * y);
}

/**
 * Calcula o percentil de um valor em uma distribuição normal.
 * O percentil representa a porcentagem de observações abaixo do valor dado.
 * @param {number} x - O valor para o qual o percentil será calculado.
 * @param {number} mean - A média da distribuição.
 * @param {number} stdDev - O desvio padrão da distribuição.
 * @returns {number} O percentil (entre 0 e 1).
 */
export function calculatePercentile(x, mean, stdDev) {
    if (stdDev <= 0) return 0.5; // Se não há variação, todos estão na média
    
    const z = getZScore(x, mean, stdDev);
    return normalCDF(z);
}

/**
 * Calcula a posição estimada de um candidato com base no seu percentil e no total de inscritos.
 * @param {number} percentile - O percentil do candidato (0 a 1).
 * @param {number} totalCandidates - O número total de candidatos.
 * @returns {number} A posição estimada.
 */
export function calculatePosition(percentile, totalCandidates) {
    // A posição é (1 - percentil) * total. Arredondamos para cima.
    const position = Math.ceil((1 - percentile) * totalCandidates);
    return Math.max(1, Math.min(totalCandidates, position)); // Garante que a posição esteja entre 1 e total
}

/**
 * Gera os pontos de dados para desenhar uma curva de distribuição normal (curva de sino).
 * @param {number} mean - A média da distribuição.
 * @param {number} stdDev - O desvio padrão da distribuição.
 * @param {number} maxScore - A pontuação máxima possível (total de questões).
 * @returns {Array<Object>} Um array de objetos { score, density } para o gráfico.
 */
export function generateDistributionData(mean, stdDev, maxScore = 100) {
    if (!stdDev || stdDev <= 0 || !mean || mean < 0) return [];
    
    // Garantir que a média seja válida
    const safeMean = Math.max(0, Math.min(mean, maxScore));
    const safeStdDev = Math.max(0.1, Math.min(stdDev, maxScore / 2));
    
    // Definir limites mais realistas para concursos
    // Usar 2.5 desvios ao invés de 4 para uma visualização mais focada
    const rangeMultiplier = 2.5;
    let minX = Math.max(0, safeMean - rangeMultiplier * safeStdDev);
    let maxX = Math.min(maxScore, safeMean + rangeMultiplier * safeStdDev);
    
    // Garantir uma distribuição mínima visível
    const minRange = Math.max(5, maxScore * 0.2); // Pelo menos 20% da escala total ou 5 pontos
    if (maxX - minX < minRange) {
        const center = (minX + maxX) / 2;
        minX = Math.max(0, center - minRange / 2);
        maxX = Math.min(maxScore, center + minRange / 2);
    }
    
    // Garantir que a escala inclua pontos importantes
    minX = Math.min(minX, Math.max(0, safeMean - safeStdDev * 3));
    maxX = Math.max(maxX, Math.min(maxScore, safeMean + safeStdDev * 2));
    
    // Arredondar para valores inteiros para evitar duplicatas no eixo
    minX = Math.floor(minX);
    maxX = Math.ceil(maxX);
    
    // Gerar dados com step de 0.1 para suavidade, mas garantir que incluímos todos os inteiros
    const totalRange = maxX - minX;
    const step = totalRange / 100; // 100 pontos para suavidade
    
    const data = [];
    for (let i = 0; i <= 100; i++) {
        const x = minX + i * step;
        // A densidade de probabilidade (PDF) nos dá a altura da curva
        const density = (1 / (safeStdDev * Math.sqrt(2 * Math.PI))) * Math.exp(-0.5 * Math.pow((x - safeMean) / safeStdDev, 2));
        data.push({ 
            score: parseFloat(x.toFixed(2)), 
            density: parseFloat(density.toFixed(6))
        });
    }
    
    return data;
} 