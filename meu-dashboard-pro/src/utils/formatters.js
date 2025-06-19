export const formatPercent = (value) => {
  if (typeof value !== 'number' || isNaN(value) || !isFinite(value)) {
    return '-';
  }
  return `${(value).toFixed(2).replace('.', ',')}%`;
};

// Nova função para formatar a data
export const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    // Adiciona a opção timeZone: 'UTC' para garantir que a data não mude por causa do fuso horário do navegador
    return date.toLocaleDateString('pt-BR', { timeZone: 'UTC' });
};

// Função para formatar números com separador de milhares em português
export const formatNumber = (value) => {
    if (typeof value !== 'number' || isNaN(value) || !isFinite(value)) {
        return '-';
    }
    return value.toLocaleString('pt-BR');
};

// Função para formatar posição/ranking
export const formatPosition = (position, total) => {
    if (!position || position <= 0) return '-';
    return `${formatNumber(position)}º`;
};

// Função para formatar percentil
export const formatPercentile = (percentile) => {
    if (typeof percentile !== 'number' || isNaN(percentile) || !isFinite(percentile)) {
        return '-';
    }
    return `${percentile.toFixed(1)}%`;
};

// Função para formatar nota/score
export const formatScore = (score) => {
    if (typeof score !== 'number' || isNaN(score) || !isFinite(score)) {
        return '-';
    }
    return score.toFixed(2).replace('.', ',');
};