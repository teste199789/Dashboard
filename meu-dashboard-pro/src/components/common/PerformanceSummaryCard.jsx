import React from 'react';
import { CheckIcon, XIcon, ChartBarIcon, MinusCircleIcon } from '../icons';

const StatDetail = ({ icon, value, label, color }) => (
    <div className={`flex items-center text-sm ${color || 'text-gray-600 dark:text-gray-300'}`}>
        {icon}
        <span className="font-semibold ml-2">{value}</span>
        <span className="ml-1 text-gray-500 dark:text-gray-400">{label}</span>
    </div>
);

const Section = ({ title, stats, colorClass }) => (
    <div className="flex-1 p-4">
        <h4 className={`font-bold text-lg ${colorClass}`}>{title}</h4>
        <p className="text-gray-500 dark:text-gray-400 text-sm mb-3">{stats.questoes} Questões</p>
        
        <div className="space-y-2">
            <StatDetail 
                icon={<CheckIcon className="w-5 h-5 text-green-500" />}
                value={stats.acertos}
                label="Acertos"
            />
            <StatDetail 
                icon={<XIcon className="w-5 h-5 text-red-500" />}
                value={stats.erros}
                label="Erros"
            />
            <StatDetail 
                icon={<MinusCircleIcon className="w-5 h-5 text-gray-500" />}
                value={stats.brancos}
                label="Brancos"
            />
            <StatDetail 
                icon={<ChartBarIcon className="w-5 h-5 text-gray-500" />}
                value={`${stats.aproveitamento.toFixed(1)}%`}
                label="Aproveitamento"
            />
        </div>
    </div>
);

const PerformanceSummaryCard = ({ summary }) => {
    if (!summary) return null;

    const { total, basic, specific } = summary;
    const totalQuestoes = total.questoes > 0 ? total.questoes : 1;
    const basicPercent = (basic.questoes / totalQuestoes) * 100;
    const specificPercent = (specific.questoes / totalQuestoes) * 100;

    return (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4">
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-4 mb-4 flex overflow-hidden" title={`Composição da Prova: ${basic.questoes} (Básicas) + ${specific.questoes} (Específicas) = ${total.questoes} (Total)`}>
                <div 
                    className="h-4 bg-blue-500"
                    style={{ width: `${basicPercent}%` }}
                />
                <div 
                    className="h-4 bg-purple-500"
                    style={{ width: `${specificPercent}%` }}
                />
            </div>

            <div className="flex flex-col md:flex-row divide-y md:divide-y-0 md:divide-x divide-gray-200 dark:divide-gray-700">
                <Section title="Total" stats={total} colorClass="text-gray-800 dark:text-gray-100" />
                <Section title="Conhecimentos Básicos" stats={basic} colorClass="text-blue-500" />
                <Section title="Conhecimentos Específicos" stats={specific} colorClass="text-purple-500" />
            </div>
        </div>
    );
};

export default PerformanceSummaryCard; 