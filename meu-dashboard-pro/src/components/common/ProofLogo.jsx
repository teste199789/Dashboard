import React from 'react';

const ProofLogo = ({ titulo }) => {
    // Nova lógica para pegar as iniciais do TÍTULO do concurso
    const getInitials = (name) => {
        if (!name) return '?';
        const words = name.replace(/-/g, ' ').split(' ');
        if (words.length > 1) {
            // Pega a inicial da primeira e da última palavra, se houver mais de uma
            return (words[0][0] + words[words.length - 1][0]).toUpperCase();
        }
        // Se for uma palavra só, pega as duas primeiras letras
        return name.slice(0, 2).toUpperCase();
    };

    return (
        <div className="flex items-center justify-center h-20 w-20 bg-gray-200 rounded-lg">
            <span className="text-2xl font-bold text-gray-500">
                {getInitials(titulo)}
            </span>
        </div>
    );
};

export default ProofLogo;