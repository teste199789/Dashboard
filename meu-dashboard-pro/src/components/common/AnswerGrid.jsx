import React from 'react';

const AnswerGrid = ({ totalQuestoes, answersMap, onAnswerChange, readOnly = false, comparisonMap = {} }) => {

    const handleInputChange = (qNumber, value) => {
        // Limita a um caractere e converte para maiúsculas
        const sanitizedValue = value.slice(0, 1).toUpperCase();
        onAnswerChange(qNumber, sanitizedValue);

        // LÓGICA DE FOCO AUTOMÁTICO
        if (sanitizedValue.length === 1 && qNumber < totalQuestoes) {
            const nextInput = document.querySelector(`input[data-q="${qNumber + 1}"]`);
            if (nextInput) {
                nextInput.focus();
                nextInput.select();
            }
        }
    };

    const questions = Array.from({ length: totalQuestoes || 0 }, (_, i) => i + 1);

    return (
        <div className="grid grid-cols-5 sm:grid-cols-10 gap-x-4 gap-y-6">
            {questions.map(qNumber => {
                const qStr = String(qNumber);
                const answer = answersMap[qStr] || '';
                
                // Verifica se a resposta foi alterada ou anulada
                const definAnswer = answersMap[qStr];
                const prelimAnswer = comparisonMap[qStr];
                const isChangedOrAnnulled = (prelimAnswer && definAnswer && prelimAnswer !== definAnswer) || definAnswer === 'N';

                const inputClass = isChangedOrAnnulled
                    ? "text-blue-600 font-bold border-blue-500" // Estilo para alteradas/anuladas
                    : "border-gray-300 focus:border-teal-500";

                return (
                    <div key={qNumber} className="text-center">
                        <label className="font-bold text-gray-700">{qNumber}</label>
                        <input
                            type="text"
                            maxLength="1"
                            data-q={qNumber}
                            value={answer}
                            onChange={(e) => handleInputChange(qNumber, e.target.value)}
                            readOnly={readOnly}
                            className={`w-full mt-1 p-1 text-center bg-transparent border-0 border-b-2 focus:ring-0 transition ${inputClass}`}
                        />
                    </div>
                );
            })}
        </div>
    );
};

export default AnswerGrid;