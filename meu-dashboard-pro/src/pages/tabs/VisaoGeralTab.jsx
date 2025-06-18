import React, { useMemo } from 'react';
import ContestCard from '../../components/common/ContestCard';

const VisaoGeralTab = ({ proofs }) => {
    const sortedProofs = useMemo(() => {
        if (!proofs) return [];
        return [...proofs].sort((a, b) => new Date(b.data) - new Date(a.data));
    }, [proofs]);

    if (!proofs) {
        return <div className="text-center py-20 bg-white dark:bg-gray-800/50 rounded-xl">
            <p className="font-semibold text-gray-600 dark:text-gray-300">Carregando informações...</p>
        </div>;
    }

    return (
        <div className="py-6">
            {sortedProofs.length === 0 ? (
                <div className="text-center py-20 bg-white dark:bg-gray-800/50 rounded-xl">
                    <p className="font-semibold text-gray-600 dark:text-gray-300">Nenhum item encontrado para a categoria selecionada.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {sortedProofs.map(proof => (
                        <ContestCard key={proof.id} proof={proof} />
                    ))}
                </div>
            )}
        </div>
    );
};

export default VisaoGeralTab; 