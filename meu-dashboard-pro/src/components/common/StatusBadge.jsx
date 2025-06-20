import React from 'react';

export const getStatus = (proof) => {
    const hasUserAnswers = proof.userAnswers && proof.userAnswers.length > 0;
    const hasOfficialKey = (proof.gabaritoDefinitivo && proof.gabaritoDefinitivo.length > 0) || (proof.gabaritoPreliminar && proof.gabaritoPreliminar.length > 0);
    const isGraded = typeof proof.aproveitamento === 'number';
    const hasResults = proof.resultadoFinal; // Usando resultadoFinal para o status "Finalizado"

    if (hasResults) {
        return { text: 'Finalizado', color: 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-200' };
    }
    if (isGraded) {
        return { text: 'Lançar Resultado', color: 'bg-purple-100 text-purple-800 dark:bg-purple-800 dark:text-purple-200' };
    }
    if (hasUserAnswers && hasOfficialKey) {
        return { text: 'Pronto para Corrigir', color: 'bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-200' };
    }
    if (!hasOfficialKey) {
        return { text: 'Pendente Gabarito Oficial', color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-200' };
    }
    if (!hasUserAnswers) {
        return { text: 'Pendente Meu Gabarito', color: 'bg-orange-100 text-orange-800 dark:bg-orange-800 dark:text-orange-200' };
    }
    return { text: 'Pendente', color: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200' };
};

const StatusBadge = ({ proof }) => {
    const { text, color } = getStatus(proof);

    return (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${color}`}>
            {text}
        </span>
    );
};

export default StatusBadge; 