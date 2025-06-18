import React, { useState, useMemo } from 'react';
import { useProofs } from '../hooks/useProofs';
import ProofDetailCard from '../components/common/ProofDetailCard';
import LoadingSpinner from '../components/common/LoadingSpinner';

const ProofsList = () => {
    const { proofsList, openDeleteModal, isLoading } = useProofs();
    const [viewType, setViewType] = useState('CONCURSO');

    const processedProofs = useMemo(() => {
        return proofsList
            .filter(p => (p.type || 'CONCURSO') === viewType)
            .sort((a, b) => new Date(b.data) - new Date(a.data));
    }, [proofsList, viewType]);

    if (isLoading) {
        return <LoadingSpinner message="Carregando seu histórico..." />
    }

    return (
    <div className="space-y-6">
        <div className="flex justify-center mb-4 p-1 bg-gray-200 dark:bg-gray-700 rounded-lg max-w-sm mx-auto">
            <button onClick={() => setViewType('CONCURSO')} className={`w-full py-2 px-4 rounded-md font-semibold transition-colors ${viewType === 'CONCURSO' ? 'bg-white dark:bg-gray-800 shadow' : 'text-gray-500 dark:text-gray-300'}`}>Concursos</button>
            <button onClick={() => setViewType('SIMULADO')} className={`w-full py-2 px-4 rounded-md font-semibold transition-colors ${viewType === 'SIMULADO' ? 'bg-white dark:bg-gray-800 shadow' : 'text-gray-500 dark:text-gray-300'}`}>Simulados</button>
        </div>
        <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-100">
                Meu Histórico de {viewType === 'CONCURSO' ? 'Provas' : 'Simulados'}
            </h2>
        </div>
        
        {processedProofs.length === 0 ? (
             <div className="text-center py-20 bg-white dark:bg-gray-800/50 rounded-xl">
                <p className="font-semibold text-gray-600 dark:text-gray-300">Nenhum item encontrado.</p>
                <p className="text-sm text-gray-400 dark:text-gray-500 mt-2">Cadastre um novo item para começar.</p>
             </div>
        ) : (
            <div className="space-y-6">
                {processedProofs.map(proof => (
                    <ProofDetailCard key={proof.id} proof={proof} />
                ))}
            </div>
        )}
    </div>
    );
};

export default ProofsList;