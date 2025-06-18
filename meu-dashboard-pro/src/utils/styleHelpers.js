/**
 * Retorna uma classe de cor da Tailwind CSS com base na porcentagem de desempenho.
 * @param {number} percentage - O valor percentual (0 a 100).
 * @returns {string} Uma string contendo as classes da Tailwind para a cor do texto.
 */
export const getPerformanceColor = (percentage) => {
    if (percentage === null || percentage === undefined) {
        return 'text-gray-500 dark:text-gray-400'; // Cor padrão para dados ausentes
    }

    if (percentage >= 80) {
        return 'text-green-600 dark:text-green-400'; // Bom desempenho
    } else if (percentage >= 60) {
        return 'text-yellow-600 dark:text-yellow-400'; // Desempenho mediano
    } else {
        return 'text-red-600 dark:text-red-400'; // Desempenho baixo
    }
}; 