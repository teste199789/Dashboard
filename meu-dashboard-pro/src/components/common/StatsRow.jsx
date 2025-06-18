import React from 'react';
import { formatPercent } from '../../utils/formatters';

const StatsRow = ({ item, isFooter = false }) => {
  const textClass = isFooter ? 'font-bold' : '';
  const bgClass = isFooter ? 'bg-teal-100' : 'bg-white';
  
  return (
    <div className={`grid grid-cols-9 text-center items-center py-3 ${bgClass}`}>
      <p className={`text-left pl-4 ${textClass}`}>{item.disciplina}</p>
      <p className={textClass}>{item.acertos}</p>
      <p className={textClass}>{item.erros}</p>
      <p className={textClass}>{item.brancos}</p>
      <p className={textClass}>{item.anuladas}</p>
      <p className={textClass}>{item.totalQuestoes}</p>
      <p className={textClass}>{item.acertosLiquidos}</p>
      <p className={textClass}>{formatPercent(item.percentualBruta)}</p>
      <p className={textClass}>{formatPercent(item.percentualLiquidos)}</p>
    </div>
  );
};

export default StatsRow;