import React from 'react';
import { useNavigate } from 'react-router-dom';
import { formatDate } from '../../utils/formatters';
import ProofLogo from './ProofLogo';

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

    return (
        <div 
            className={`bg-white dark:bg-gray-800/50 rounded-xl shadow-lg w-full transition-all duration-300 hover:shadow-xl hover:-translate-y-1 cursor-pointer ${cardBorderColor}`}
            onClick={handleCardClick}
        >
            <div className="p-5">
                <div className="grid grid-cols-12 gap-4 items-center">
                    <div className="col-span-3 flex justify-center">
                        <ProofLogo titulo={proof.titulo} />
                    </div>
                    <div className="col-span-9">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-sm font-semibold text-gray-500 dark:text-gray-400">
                                    {[proof.banca, proof.orgao].filter(Boolean).map(s => s.toUpperCase()).join(' • ')}
                                </p>
                                <h3 className="text-base font-bold text-gray-800 dark:text-gray-100 mt-1 leading-tight">
                                    {proof.cargo || proof.titulo}
                                </h3>
                            </div>
                            <div className="flex flex-col items-end gap-2">
                                <p className="flex-shrink-0 text-xs font-mono text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700/50 px-2 py-1 rounded-md">
                                    {formatDate(proof.data)}
                                </p>
                                {isSimulado && (
                                    <span className="text-xs font-bold px-2 py-1 rounded-md bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300">
                                        SIMULADO
                                    </span>
                                )}
                            </div>
                        </div>
                        <div className="mt-3">
                            <span className={`text-xs font-bold px-2 py-1 rounded-md ${status.color}`}>
                                {status.text}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ContestCard; 