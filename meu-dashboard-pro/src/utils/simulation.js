import { standardNormalTable } from 'simple-statistics';

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
 * Calcula o percentil de um valor em uma distribuição normal.
 * O percentil representa a porcentagem de observações abaixo do valor dado.
 * @param {number} x - O valor para o qual o percentil será calculado.
 * @param {number} mean - A média da distribuição.
 * @param {number} stdDev - O desvio padrão da distribuição.
 * @returns {number} O percentil (entre 0 e 1).
 */
export function calculatePercentile(x, mean, stdDev) {
    const z = getZScore(x, mean, stdDev);
    // standardNormalTable (CDF) nos dá a área à esquerda do Z-score.
    return standardNormalTable[Math.round(z * 100) / 100] || (z < 0 ? 0 : 1);
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
    return Math.max(1, position); // Garante que a posição seja no mínimo 1.
}

/**
 * Gera os pontos de dados para desenhar uma curva de distribuição normal (curva de sino).
 * @param {number} mean - A média da distribuição.
 * @param {number} stdDev - O desvio padrão da distribuição.
 * @param {number} points - O número de pontos a serem gerados para a curva.
 * @returns {Array<Object>} Um array de objetos { x, y } para o gráfico.
 */
export function generateDistributionData(mean, stdDev, points = 100) {
    if (!stdDev) return [];
    
    // Define o alcance do eixo X (geralmente 3-4 desvios padrão da média)
    const minX = mean - 4 * stdDev;
    const maxX = mean + 4 * stdDev;
    const step = (maxX - minX) / points;
    
    const data = [];
    for (let i = 0; i <= points; i++) {
        const x = minX + i * step;
        // A densidade de probabilidade (PDF) nos dá a altura da curva (valor Y)
        const y = (1 / (stdDev * Math.sqrt(2 * Math.PI))) * Math.exp(-0.5 * Math.pow((x - mean) / stdDev, 2));
        data.push({ x: parseFloat(x.toFixed(2)), y: parseFloat(y.toFixed(4)) });
    }
    return data;
} 