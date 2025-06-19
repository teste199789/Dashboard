import React, { useState, useEffect } from 'react';
import * as api from '../../api/apiService';
import toast from 'react-hot-toast';

const AdvancedBankConfig = ({ proof, onConfigChange, className = "" }) => {
    const [showAdvanced, setShowAdvanced] = useState(false);
    const [suggestions, setSuggestions] = useState([]);
    const [loading, setLoading] = useState(false);
    
    const [config, setConfig] = useState({
        regraAnulacao: proof.regraAnulacao || 'PADRAO',
        valorAnulacao: proof.valorAnulacao || 1.0,
        formulaAnulacao: proof.formulaAnulacao || '',
        tipoNotaCorte: proof.tipoNotaCorte || 'DECIMAL',
        precisaoDecimal: proof.precisaoDecimal || 1
    });

    // Carregar sugestões quando a banca muda
    useEffect(() => {
        if (proof.banca && showAdvanced) {
            loadBankSuggestions();
        }
    }, [proof.banca, showAdvanced]);

    const loadBankSuggestions = async () => {
        if (!proof.banca) return;
        
        setLoading(true);
        try {
            const response = await api.getBankConfigurations(proof.banca);
            setSuggestions(response.sugestoes || []);
            
            // Se não há configuração definida, usar a padrão da banca
            if (proof.regraAnulacao === null || proof.regraAnulacao === undefined) {
                const padrao = response.configuracaoPadrao;
                setConfig(prev => ({
                    ...prev,
                    regraAnulacao: padrao.regraAnulacao,
                    valorAnulacao: padrao.valorAnulacao,
                    tipoNotaCorte: padrao.tipoNotaCorte,
                    precisaoDecimal: padrao.precisaoDecimal
                }));
            }
        } catch (error) {
            console.error('Erro ao carregar sugestões da banca:', error);
            toast.error('Erro ao carregar configurações da banca');
        } finally {
            setLoading(false);
        }
    };

    const handleConfigChange = (field, value) => {
        const newConfig = { ...config, [field]: value };
        setConfig(newConfig);
        
        if (onConfigChange) {
            onConfigChange(newConfig);
        }
    };

    const applySuggestion = (suggestion) => {
        const newConfig = {
            ...config,
            regraAnulacao: suggestion.regraAnulacao,
            valorAnulacao: suggestion.valorAnulacao
        };
        setConfig(newConfig);
        
        if (onConfigChange) {
            onConfigChange(newConfig);
        }
        
        toast.success(`✅ Configuração "${suggestion.nome}" aplicada!`);
    };

    const getRegraDescription = (regra) => {
        const descriptions = {
            'PADRAO': 'Cada questão anulada vale +1 ponto',
            'CESPE_INTEGRAL': 'Anulada cancela 1 erro ou adiciona 1 ponto',
            'CESPE_MEIO': 'Cada questão anulada vale +0.5 ponto',
            'CESPE_CALCULADO': 'Valor dinâmico baseado na quantidade de anuladas',
            'PERSONALIZADO': 'Valor customizado definido pelo usuário'
        };
        return descriptions[regra] || 'Regra personalizada';
    };

    if (!showAdvanced) {
        return (
            <div className={`p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border ${className}`}>
                <div className="flex items-center justify-between">
                    <div>
                        <h4 className="font-medium text-gray-900 dark:text-gray-100">
                            Configurações da Banca
                        </h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                            {proof.banca} - {getRegraDescription(config.regraAnulacao)}
                        </p>
                    </div>
                    <button
                        onClick={() => setShowAdvanced(true)}
                        className="px-3 py-1 text-sm bg-teal-600 text-white rounded hover:bg-teal-700 transition"
                    >
                        Configurar
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className={`p-6 bg-gray-50 dark:bg-gray-800 rounded-lg border ${className}`}>
            <div className="flex items-center justify-between mb-4">
                <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                    Configurações Avançadas - {proof.banca}
                </h4>
                <button
                    onClick={() => setShowAdvanced(false)}
                    className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                >
                    ✕
                </button>
            </div>

            {/* Sugestões da Banca */}
            {suggestions.length > 0 && (
                <div className="mb-6">
                    <h5 className="font-medium text-gray-700 dark:text-gray-300 mb-3">
                        Configurações Sugeridas para {proof.banca}:
                    </h5>
                    <div className="grid gap-3">
                        {suggestions.map((suggestion, index) => (
                            <div key={index} className="p-3 bg-white dark:bg-gray-700 rounded border">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h6 className="font-medium text-gray-900 dark:text-gray-100">
                                            {suggestion.nome}
                                        </h6>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">
                                            {suggestion.descricao}
                                        </p>
                                    </div>
                                    <button
                                        onClick={() => applySuggestion(suggestion)}
                                        className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition"
                                    >
                                        Aplicar
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Configuração Manual */}
            <div className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Regra de Anulação
                    </label>
                    <select
                        value={config.regraAnulacao}
                        onChange={(e) => handleConfigChange('regraAnulacao', e.target.value)}
                        className="w-full p-3 border bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 rounded-lg"
                    >
                        <option value="PADRAO">Padrão (+1 ponto)</option>
                        <option value="CESPE_INTEGRAL">Cespe Integral (cancela erro)</option>
                        <option value="CESPE_MEIO">Cespe Meio (+0.5 ponto)</option>
                        <option value="CESPE_CALCULADO">Cespe Calculado (dinâmico)</option>
                        <option value="PERSONALIZADO">Personalizado</option>
                    </select>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        {getRegraDescription(config.regraAnulacao)}
                    </p>
                </div>

                {config.regraAnulacao === 'PERSONALIZADO' && (
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Valor da Anulada
                        </label>
                        <input
                            type="number"
                            step="0.1"
                            min="0"
                            max="2"
                            value={config.valorAnulacao}
                            onChange={(e) => handleConfigChange('valorAnulacao', parseFloat(e.target.value))}
                            className="w-full p-3 border bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 rounded-lg"
                        />
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            Quantos pontos cada questão anulada vale (ex: 1.0, 0.5, 0.25)
                        </p>
                    </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Tipo de Nota de Corte
                        </label>
                        <select
                            value={config.tipoNotaCorte}
                            onChange={(e) => handleConfigChange('tipoNotaCorte', e.target.value)}
                            className="w-full p-3 border bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 rounded-lg"
                        >
                            <option value="DECIMAL">Decimal (ex: 80.5)</option>
                            <option value="INTEIRO">Inteiro (ex: 80)</option>
                        </select>
                    </div>

                    {config.tipoNotaCorte === 'DECIMAL' && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Casas Decimais
                            </label>
                            <select
                                value={config.precisaoDecimal}
                                onChange={(e) => handleConfigChange('precisaoDecimal', parseInt(e.target.value))}
                                className="w-full p-3 border bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 rounded-lg"
                            >
                                <option value={1}>1 casa (80.5)</option>
                                <option value={2}>2 casas (80.50)</option>
                                <option value={3}>3 casas (80.500)</option>
                            </select>
                        </div>
                    )}
                </div>
            </div>

            {loading && (
                <div className="flex items-center justify-center py-4">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-teal-600"></div>
                    <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">
                        Carregando configurações...
                    </span>
                </div>
            )}
        </div>
    );
};

export default AdvancedBankConfig; 