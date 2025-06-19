import React, { useState } from 'react';
import VisaoGeralTab from './tabs/VisaoGeralTab';
import DesempenhoTab from './tabs/DesempenhoTab';
import { useProofs } from '../hooks/useProofs';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ProofForm from '../components/ProofForm';

const MeusConcursos = () => {
    const [viewType, setViewType] = useState('CONCURSO');
    const { proofs, loading, error } = useProofs();
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingProof, setEditingProof] = useState(null);
    
    const FilterButton = ({ filterValue, label }) => (
        <button 
            onClick={() => setViewType(filterValue)}
            className={`w-full py-2 px-4 rounded-md font-semibold transition-colors text-sm ${viewType === filterValue 
                ? 'bg-white dark:bg-gray-800 shadow text-teal-600 dark:text-teal-400' 
                : 'text-gray-500 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
        >
            {label}
        </button>
    );

    const handleOpenForm = (proof = null) => {
        setEditingProof(proof);
        setIsFormOpen(true);
    };

    if (loading) return <div className="flex justify-center items-center h-64"><LoadingSpinner /></div>;
    if (error) return <div className="text-center text-red-500 mt-8">{error}</div>;

    const concursos = proofs.filter(p => p.type === 'CONCURSO');
    const simulados = proofs.filter(p => p.type === 'SIMULADO');

    const dataToShow = viewType === 'CONCURSO' ? concursos : simulados;

    return (
        <div className="space-y-8">
             <div className="flex justify-between items-center">
            <div className="bg-gray-200 dark:bg-gray-700/50 p-1 rounded-lg flex max-w-sm mx-auto">
                <FilterButton filterValue="CONCURSO" label="Concursos" />
                <FilterButton filterValue="SIMULADO" label="Simulados" />
                </div>
                <button onClick={() => handleOpenForm(null)} className="bg-teal-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-teal-700 transition-colors">
                    + Novo
                </button>
            </div>

            <div>
                <DesempenhoTab concursos={dataToShow} />
                <div className="mt-8">
                    <VisaoGeralTab proofs={dataToShow} />
                </div>
            </div>

            <ProofForm 
                isOpen={isFormOpen}
                onClose={() => setIsFormOpen(false)}
                proofData={editingProof}
                type={viewType}
            />
        </div>
    );
};

export default MeusConcursos; 