import React, { useMemo } from 'react';

const ResultGrid = ({ proof }) => {
    // Evita crashes se os dados não estiverem prontos
    if (!proof || !proof.userAnswers || (!proof.gabaritoDefinitivo && !proof.gabaritoPreliminar)) {
        return null;
    }

    // Usamos useMemo para não recalcular a cada renderização
    const resultsMap = useMemo(() => {
        const userMap = new Map(proof.userAnswers.split(',').filter(p => p).map(p => p.split(':')));
        const officialAnswers = proof.gabaritoDefinitivo || proof.gabaritoPreliminar;
        const officialMap = new Map(officialAnswers.split(',').filter(p => p).map(p => p.split(':')));

        const results = new Map();
        for (let i = 1; i <= proof.totalQuestoes; i++) {
            const qStr = String(i);
            const userAnswer = userMap.get(qStr);
            const officialAnswer = officialMap.get(qStr);
            const officialAnswerUpper = officialAnswer ? officialAnswer.trim().toUpperCase() : '';

            // A mesma lógica de anulação do backend é replicada aqui
            const isAnnulled = officialAnswerUpper === 'X' || officialAnswerUpper === 'N' || officialAnswerUpper === 'ANULADA';

            if (isAnnulled) {
                results.set(qStr, 'annulled'); // Anulada
            } else if (!userAnswer || userAnswer.trim() === '') {
                results.set(qStr, 'blank'); // Em branco
            } else if (userAnswer === officialAnswer) {
                results.set(qStr, 'correct'); // Acerto
            } else {
                results.set(qStr, 'incorrect'); // Erro
            }
        }
        return results;
    }, [proof]);

    const questions = Array.from({ length: proof.totalQuestoes || 0 }, (_, i) => i + 1);

    const getColorForStatus = (status) => {
        switch (status) {
            case 'correct':
                return 'bg-green-200 border-green-400 text-green-800 dark:bg-green-800/50 dark:border-green-600 dark:text-green-200';
            case 'incorrect':
                return 'bg-red-200 border-red-400 text-red-800 dark:bg-red-800/50 dark:border-red-600 dark:text-red-200';
            case 'annulled':
                return 'bg-blue-200 border-blue-400 text-blue-800 dark:bg-blue-800/50 dark:border-blue-600 dark:text-blue-200';
            case 'blank':
            default:
                return 'bg-gray-100 border-gray-300 text-gray-600 dark:bg-gray-700 dark:border-gray-500 dark:text-gray-300';
        }
    };

    return (
        <div>
            <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-4">Gabarito Visual</h3>
            <div className="p-4 border rounded-lg">
                 <div className="grid grid-cols-5 sm:grid-cols-10 gap-2">
                    {questions.map((qNumber) => {
                        const qStr = String(qNumber);
                        const status = resultsMap.get(qStr);
                        const colorClass = getColorForStatus(status);
                        
                        return (
                            <div
                                key={qNumber}
                                className={`flex items-center justify-center p-2 border-2 rounded-md font-semibold ${colorClass}`}
                            >
                                {qNumber}
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default ResultGrid; 