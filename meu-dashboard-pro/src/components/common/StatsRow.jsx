import React from 'react';
import { formatPercent } from '../../utils/formatters';

const StatsRow = ({ item, isFooter = false }) => {
  const textClass = isFooter ? 'font-bold' : '';
  const bgClass = isFooter ? `bg-gray-100 dark:bg-gray-800` : `bg-white dark:bg-gray-900`;

  const totalQuestoes = item.acertos + item.erros + item.brancos;
  const acertosLiquidos = item.acertos - item.erros;
  
  const percentualBruta = totalQuestoes > 0 ? (item.acertos / totalQuestoes) * 100 : 0;
  const percentualLiquidos = totalQuestoes > 0 ? (acertosLiquidos / totalQuestoes) * 100 : 0;
  
  return (
    <div className={`grid grid-cols-9 text-center items-center py-3 ${bgClass}`}>
      <p className={`col-span-1 text-left pl-4 ${textClass}`}>{item.disciplina}</p>
      <p className={`col-span-1 ${textClass}`}>{item.acertos}</p>
      <p className={`col-span-1 ${textClass}`}>{item.erros}</p>
      <p className={`col-span-1 ${textClass}`}>{item.brancos}</p>
      <p className={`col-span-1 ${textClass}`}>{item.anuladas}</p>
      <p className={`col-span-1 ${textClass}`}>{totalQuestoes}</p>
      <p className={`col-span-1 ${textClass}`}>{acertosLiquidos < 0 ? 0 : acertosLiquidos}</p>
      <p className={`col-span-1 ${textClass}`}>{formatPercent(percentualBruta)}</p>
      <p className={`col-span-1 ${textClass}`}>{formatPercent(percentualLiquidos < 0 ? 0 : percentualLiquidos)}</p>
    </div>
  );
};

export default StatsRow;