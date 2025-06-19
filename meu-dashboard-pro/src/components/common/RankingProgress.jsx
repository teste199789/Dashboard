import React from 'react';

const RankingProgress = ({ position, total, percentile, isAboveCutoff }) => {
    // CORRIGIDO: Conversões seguras para números
    const safePosition = Math.max(1, parseInt(position) || 1);
    const safeTotal = Math.max(1, parseInt(total) || 1000);
    const safePercentile = Math.max(0, Math.min(100, parseFloat(percentile) || 0));
    
    const progressPercentage = Math.max(0, Math.min(100, ((safeTotal - safePosition + 1) / safeTotal) * 100));
    
    return (
        <div className="space-y-4">
            <div className="flex justify-between text-sm font-medium text-gray-700 dark:text-gray-300">
                <span>Pior posição</span>
                <span>Melhor posição</span>
            </div>
            
            <div className="relative">
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-6">
                    <div 
                        className={`h-6 rounded-full transition-all duration-500 ${
                            isAboveCutoff 
                                ? 'bg-gradient-to-r from-green-400 to-green-600' 
                                : 'bg-gradient-to-r from-yellow-400 to-red-500'
                        }`}
                        style={{ width: `${progressPercentage}%` }}
                    ></div>
                    
                    {/* Marcador da posição atual */}
                    <div 
                        className="absolute top-0 transform -translate-x-1/2 -translate-y-1"
                        style={{ left: `${progressPercentage}%` }}
                    >
                        <div className="w-8 h-8 bg-white dark:bg-gray-800 border-2 border-blue-500 rounded-full flex items-center justify-center shadow-lg">
                            <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                        </div>
                        <div className="absolute top-full mt-1 left-1/2 transform -translate-x-1/2 whitespace-nowrap">
                            <div className="bg-gray-800 dark:bg-gray-200 text-white dark:text-gray-800 text-xs px-2 py-1 rounded">
                                {safePosition.toLocaleString('pt-BR')}º
                            </div>
                        </div>
                    </div>
                </div>
                
                <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-2">
                    <span>{safeTotal.toLocaleString('pt-BR')}</span>
                    <span>1º</span>
                </div>
            </div>
            
            <div className="grid grid-cols-3 gap-4 text-center text-sm">
                <div>
                    <div className="font-semibold text-gray-800 dark:text-gray-200">Percentil</div>
                    <div className={`text-lg font-bold ${
                        safePercentile >= 80 ? 'text-green-600 dark:text-green-400' :
                        safePercentile >= 60 ? 'text-yellow-600 dark:text-yellow-400' :
                        'text-red-600 dark:text-red-400'
                    }`}>
                        {safePercentile.toFixed(1)}%
                    </div>
                </div>
                <div>
                    <div className="font-semibold text-gray-800 dark:text-gray-200">À sua frente</div>
                    <div className="text-lg font-bold text-gray-600 dark:text-gray-400">
                        {Math.max(0, safePosition - 1).toLocaleString('pt-BR')}
                    </div>
                </div>
                <div>
                    <div className="font-semibold text-gray-800 dark:text-gray-200">Atrás de você</div>
                    <div className="text-lg font-bold text-blue-600 dark:text-blue-400">
                        {Math.max(0, safeTotal - safePosition).toLocaleString('pt-BR')}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RankingProgress; 