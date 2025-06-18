import React from 'react';
import SparklesIcon from '../icons/SparklesIcon';

const AIAnalysisCard = ({ analysis, isLoading, onClear }) => {
    if (!analysis && !isLoading) return null;

    return (
        <div className="bg-white shadow-lg rounded-xl p-6 mb-8">
             <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-gray-700 flex items-center">
                    <SparklesIcon className="w-6 h-6 mr-2 text-teal-500" />
                    Análise de Desempenho com IA
                </h2>
                <button onClick={onClear} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">&times;</button>
            </div>
            {isLoading ? (
                 <div className="flex justify-center items-center h-40">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-500"></div>
                 </div>
            ) : (
                <div 
                    className="prose prose-sm max-w-none text-gray-600" 
                    dangerouslySetInnerHTML={{ __html: analysis.replace(/\n/g, '<br />') }}
                ></div>
            )}
        </div>
    );
};

export default AIAnalysisCard;