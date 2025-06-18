import React from 'react';
import { useProofs } from '../hooks/useProofs';
import StatsRow from '../components/common/StatsRow.jsx';
import LoadingSpinner from '../components/common/LoadingSpinner.jsx';
import SparklesIcon from '../components/icons/SparklesIcon.jsx';

const Dashboard = () => {
    const { consolidatedData, isLoading, dashboardFilter, setDashboardFilter } = useProofs();

    if (isLoading) return <LoadingSpinner message="Carregando dados consolidados..." />;

    const { disciplinas, totais } = consolidatedData;

    const FilterButton = ({ filterValue, label }) => (
        <button 
            onClick={() => setDashboardFilter(filterValue)}
            className={`w-full py-2 px-4 rounded-md font-semibold transition-colors text-sm ${dashboardFilter === filterValue ? 'bg-white dark:bg-gray-800 shadow text-teal-600 dark:text-teal-400' : 'text-gray-500 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
        >
            {label}
        </button>
    );

    return (
        <div className="space-y-6">
            <div className="flex justify-center p-1 bg-gray-200 dark:bg-gray-700/50 rounded-lg max-w-lg mx-auto">
                <FilterButton filterValue="TODOS" label="Total" />
                <FilterButton filterValue="CONCURSO" label="Concursos" />
                <FilterButton filterValue="SIMULADO" label="Simulados" />
            </div>

            <div className="bg-white dark:bg-gray-800/50 shadow-lg rounded-xl overflow-hidden">
                <div className="bg-orange-400 dark:bg-orange-600 text-white flex justify-between items-center py-4 px-6">
                    <h2 className="text-xl font-bold tracking-wider uppercase">Dados Consolidados</h2>
                </div>
                {disciplinas && disciplinas.length > 0 ? (
                    <div className="text-sm text-gray-800 dark:text-gray-200">
                        <div className="hidden md:grid grid-cols-9 text-center font-semibold bg-teal-200 dark:bg-teal-800/50 py-3 border-b-2 border-teal-300 dark:border-teal-700">
                            <p className="text-left pl-4">Disciplinas</p>
                            <p>Acertos</p><p>Erros</p><p>Brancos</p><p>Anuladas</p>
                            <p>Questões</p><p>Líquidos</p><p>% Bruta</p><p>% Líquidos</p>
                        </div>
                        <div className="divide-y divide-gray-200 dark:divide-gray-700">
                            {disciplinas.map(item => <StatsRow key={item.id} item={item} />)}
                        </div>
                        <StatsRow item={totais} isFooter={true} />
                    </div>
                ) : (
                    <div className="text-center py-16 text-gray-500 dark:text-gray-400">
                        <p className="font-semibold">Nenhum dado encontrado para a categoria "{dashboardFilter.toLowerCase()}".</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Dashboard;