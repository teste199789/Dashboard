import React from 'react';
import { useNavigate } from 'react-router-dom';
import { formatDate } from '../../utils/formatters';
import ProofLogo from './ProofLogo';

const ContestCard = ({ proof }) => {
    const navigate = useNavigate();

    const handleCardClick = () => {
        navigate(`/minhas-provas/${proof.id}`);
    };

    return (
        <div 
            className="bg-white dark:bg-gray-800/50 rounded-xl shadow-lg w-full transition-all duration-300 hover:shadow-xl hover:-translate-y-1 cursor-pointer"
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
                                    {proof.banca?.toUpperCase()} • {proof.orgao?.toUpperCase()}
                                </p>
                                <h3 className="text-base font-bold text-gray-800 dark:text-gray-100 mt-1 leading-tight">
                                    {proof.cargo || proof.titulo}
                                </h3>
                            </div>
                            <p className="flex-shrink-0 text-xs font-mono text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700/50 px-2 py-1 rounded-md">
                                {formatDate(proof.data)}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ContestCard; 