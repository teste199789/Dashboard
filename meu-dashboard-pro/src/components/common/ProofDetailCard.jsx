import React from 'react';
import { useNavigate } from 'react-router-dom';
import StatusBadge from './StatusBadge';
import { DotsVerticalIcon } from '../icons';
import { formatDate } from '../../utils/formatters';

const ProofDetailCard = ({ proof }) => {
    const navigate = useNavigate();

    const handleNavigation = () => {
        navigate(`/proof/${proof.id}`);
    };

    const handleMenuClick = (e) => {
        e.stopPropagation();
        // Lógica para abrir o menu de opções (ex: excluir) será adicionada aqui.
        console.log("Menu clicked for proof:", proof.id);
    };

    return (
        <div
            className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-4 flex items-center space-x-4 border-l-4 border-teal-500 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-150"
            onClick={handleNavigation}
        >
            <div className="flex-1">
                <div className="flex justify-between items-center">
                    <p className="text-sm text-gray-500 dark:text-gray-400">{proof.banca}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{formatDate(proof.data_prova)}</p>
                </div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mt-1">{proof.cargo}</h3>
                <div className="mt-4 border-t border-gray-200 dark:border-gray-700 pt-4">
                    <div className="flex justify-between items-center">
                        <StatusBadge status={proof.status} />
                        <p className="text-green-600 dark:text-green-400 font-semibold">{proof.aproveitamento?.toFixed(2).replace('.', ',')}%</p>
                    </div>
                </div>
            </div>
            <div className="flex-shrink-0">
                <button
                    onClick={handleMenuClick}
                    className="p-1 rounded-full text-gray-400 hover:text-gray-600 dark:hover:text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                    <DotsVerticalIcon className="h-5 w-5" />
                </button>
            </div>
        </div>
    );
};

export default ProofDetailCard;