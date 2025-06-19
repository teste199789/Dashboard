import React from 'react';
import { useNavigate } from 'react-router-dom';
import { formatDate, formatPercent } from '../../utils/formatters';
import { getPerformanceColor } from '../../utils/styleHelpers';

const getProofStatus = (proof) => {
    if (proof.results && proof.results.length > 0) {
        return { text: 'Finalizada', color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' };
    }
    if (proof.userAnswers) {
        return { text: 'Pronta p/ Corrigir', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300' };
    }
    if (proof.gabaritoDefinitivo || proof.gabaritoPreliminar) {
        return { text: 'Aguardando Gabarito', color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300' };
    }
    return { text: 'Pendente', color: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300' };
};

const ContestCard = ({ proof }) => {
    const navigate = useNavigate();
    const status = getProofStatus(proof);
    const isSimulado = proof.type === 'SIMULADO';

    const handleCardClick = () => {
        navigate(`/minhas-provas/${proof.id}`);
    };

    const cardBorderColor = isSimulado ? 'border-l-4 border-purple-500' : 'border-l-4 border-teal-500';
    const aproveitamentoColor = getPerformanceColor(proof.aproveitamento);

    return (
        <div 
            className={`bg-white dark:bg-gray-800/50 rounded-xl shadow-lg w-full transition-all duration-300 hover:shadow-xl hover:-translate-y-1 cursor-pointer ${cardBorderColor}`}
            onClick={handleCardClick}
        >
            <div className="p-5 flex flex-col justify-between h-full">
                            <div>
                    <div className="flex justify-between items-start mb-2">
                                <p className="text-sm font-semibold text-gray-500 dark:text-gray-400">
                           {proof.banca?.toUpperCase()}
                                </p>
                            <p className="flex-shrink-0 text-xs font-mono text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700/50 px-2 py-1 rounded-md">
                                {formatDate(proof.data)}
                            </p>
                        </div>
                    
                    <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100 leading-tight">
                        {proof.orgao || proof.titulo}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300 text-sm">{proof.cargo}</p>
                </div>
                
                <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <div className="flex items-center gap-2">
                         <span className={`text-xs font-bold px-2 py-1 rounded-md ${status.color}`}>
                            {status.text}
                        </span>
                        {isSimulado && (
                            <span className="text-xs font-bold px-2 py-1 rounded-md bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300">
                                SIMULADO
                            </span>
                        )}
                    </div>

                    {status.text === 'Finalizada' && typeof proof.aproveitamento === 'number' && (
                        <p className={`text-xl font-bold ${aproveitamentoColor}`}>
                            {formatPercent(proof.aproveitamento)}
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ContestCard; 