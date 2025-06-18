import React from 'react';
import { formatPercent } from '../../utils/formatters';

const ScoreCard = ({ title, score, percentage, details }) => {
    const titleColor = () => {
        switch (title.toLowerCase()) {
            case 'total': return 'text-blue-600';
            case 'c.b.': return 'text-green-600';
            case 'c.e.': return 'text-orange-500';
            default: return 'text-gray-700';
        }
    };

    return (
        <div className="text-center p-4">
            <h4 className={`font-bold text-lg ${titleColor()}`}>{title.toUpperCase()}</h4>
            <p className="text-5xl font-light text-gray-800 my-2">{score}</p>
            <p className="font-bold text-sm text-gray-600">{formatPercent(percentage)}</p>
            
            {/* --- NOVA SEÇÃO DE DETALHES --- */}
            {details && (
                <div className="flex justify-center items-center space-x-3 mt-3 text-xs text-gray-500">
                    <span className="text-green-600" title="Acertos">
                        <span className="font-bold">A:</span> {details.acertos}
                    </span>
                    <span className="text-red-600" title="Erros">
                        <span className="font-bold">E:</span> {details.erros}
                    </span>
                    <span className="text-gray-600" title="Brancos">
                        <span className="font-bold">B:</span> {details.brancos}
                    </span>
                </div>
            )}
        </div>
    );
};

export default ScoreCard;