import React from 'react';
import { formatPercent } from '../../utils/formatters';

const StatsRow = ({ disciplina, isTotal = false, index = 0 }) => {
  // Proteção contra dados undefined
  if (!disciplina) {
    console.warn('StatsRow: disciplina é undefined');
    return null;
  }

  // Cores alternadas para as linhas e total destacado
  let bgClass;
  if (isTotal) {
    bgClass = 'bg-teal-300';
  } else {
    bgClass = index % 2 === 0 ? 'bg-gray-100' : 'bg-white';
  }

  const textClass = isTotal ? 'font-bold text-gray-800' : 'text-gray-700';

  // Usar os valores já calculados que vêm do consolidatedData
  const totalQuestoes = disciplina.questoes || 0;
  const acertos = disciplina.acertos || 0;
  const erros = disciplina.erros || 0;
  const brancos = disciplina.brancos || 0;
  const anuladas = disciplina.anuladas || 0;
  const liquidos = disciplina.liquidos || 0;
  const percentualBruta = disciplina.percentualBruta || 0;
  const percentualLiquidos = disciplina.percentualLiquidos || 0;
  
  return (
    <div className={`grid grid-cols-9 text-center items-center py-3 ${bgClass}`}>
      <p className={`col-span-1 text-left pl-4 ${textClass}`}>
        {disciplina.disciplina || 'N/A'}
      </p>
      <p className={`col-span-1 ${textClass}`}>
        {acertos}
      </p>
      <p className={`col-span-1 ${textClass}`}>
        {erros}
      </p>
      <p className={`col-span-1 ${textClass}`}>
        {brancos}
      </p>
      <p className={`col-span-1 ${textClass}`}>
        {anuladas}
      </p>
      <p className={`col-span-1 ${textClass}`}>
        {totalQuestoes}
      </p>
      <p className={`col-span-1 ${textClass}`}>
        {liquidos}
      </p>
      <p className={`col-span-1 ${textClass}`}>
        {formatPercent(percentualBruta)}
      </p>
      <p className={`col-span-1 ${textClass}`}>
        {formatPercent(percentualLiquidos)}
      </p>
    </div>
  );
};

export default StatsRow;