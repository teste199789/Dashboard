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