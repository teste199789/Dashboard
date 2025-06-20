import React from 'react';

const statusConfig = {
    'Finalizado': { color: 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-200' },
    'Aprovado': { color: 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-200' },
    'Reprovado': { color: 'bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-200' },
    'Eliminado': { color: 'bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-200' },
    'Excedente': { color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-200' },
    'Lançar Resultado': { color: 'bg-purple-100 text-purple-800 dark:bg-purple-800 dark:text-purple-200' },
    'Pronto para Corrigir': { color: 'bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-200' },
    'Pendente Meu Gabarito': { color: 'bg-orange-100 text-orange-800 dark:bg-orange-800 dark:text-orange-200' },
    'Pendente Gabarito Oficial': { color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-200' },
    'Pendente': { color: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200' },
};

const StatusBadge = ({ status }) => {
    // Define um fallback para o caso de um status desconhecido.
    const { color } = statusConfig[status] || statusConfig['Pendente'];

    return (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${color}`}>
            {status || 'Pendente'}
        </span>
    );
};

export default StatusBadge; 