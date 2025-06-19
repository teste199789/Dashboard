import React, { useState, useEffect } from 'react';
import * as api from '../../api/apiService';
import toast from 'react-hot-toast';

const SmartBankSelector = ({ 
    selectedBank, 
    selectedTipoPontuacao, 
    onBankChange, 
    onTipoPontuacaoChange,
    onConfigChange,
    className = "",
    currentRegraAnulacao,
    currentValorAnulacao
}) => {
    const [loading, setLoading] = useState(false);
    const [showDetails, setShowDetails] = useState(false);
    const [bankConfig, setBankConfig] = useState(null);
    const [suggestions, setSuggestions] = useState([]);
    const [selectedSuggestion, setSelectedSuggestion] = useState(null);

    const BANCAS_PREDEFINIDAS = [
        "Cespe/Cebraspe", 
        "FGV", 
        "FCC", 
        "Quadrix", 
        "IBFC", 
        "Outra"
    ];

    // Carregar configurações quando a banca muda
    useEffect(() => {
        if (selectedBank) {
            loadBankConfiguration();
        }
    }, [selectedBank]);

    const loadBankConfiguration = async () => {
        if (!selectedBank) return;
        
        setLoading(true);
        try {
            const response = await api.getBankConfigurations(selectedBank);
            const config = response.configuracaoPadrao;
            setBankConfig(config);
            setSuggestions(response.sugestoes || []); // Carregar sugestões
            
            // Auto-configurar tipo de pontuação baseado na banca
            if (config.tipoPontuacao && config.tipoPontuacao !== selectedTipoPontuacao) {
                onTipoPontuacaoChange(config.tipoPontuacao);
                
                // Notificar sobre outras configurações se callback fornecido
                if (onConfigChange) {
                    onConfigChange({
                        regraAnulacao: config.regraAnulacao,
                        valorAnulacao: config.valorAnulacao,
                        tipoNotaCorte: config.tipoNotaCorte,
                        precisaoDecimal: config.precisaoDecimal,
                        tipoPontuacao: config.tipoPontuacao
                    });
                }
                
                // Mostrar toast informativo
                const tipoTexto = config.tipoPontuacao === 'liquida' ? 'Certo/Errado (Líquida)' : 'Múltipla Escolha (Bruta)';
                toast.success(`✅ ${selectedBank}: ${tipoTexto} configurado automaticamente!`, {
                    duration: 4000,
                    position: 'top-center'
                });
            }
        } catch (error) {
            console.error('❌ Erro ao carregar configuração da banca:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleBankChange = (newBank) => {
        onBankChange(newBank);
    };

    const getTipoPontuacaoLabel = (tipo) => {
        return tipo === 'liquida' ? 'Líquida (Certo/Errado)' : 'Bruta (Múltipla Escolha)';
    };

    const getTipoPontuacaoDescription = (tipo) => {
        if (tipo === 'liquida') {
            return 'Cada erro desconta 1 ponto. Usado em provas Certo/Errado (ex: Cespe/Cebraspe)';
        } else {
            return 'Apenas acertos contam. Usado em provas de Múltipla Escolha (ex: FGV, FCC)';
        }
    };

    const getBankIcon = (bank) => {
        const icons = {
            'Cespe/Cebraspe': '⚖️',
            'FGV': '🎓',
            'FCC': '📋',
            'Quadrix': '📝',
            'IBFC': '🏛️',
            'Outra': '🏢'
        };
        return icons[bank] || '📄';
    };

    const applySuggestion = (suggestion) => {
        setSelectedSuggestion(suggestion);
        
        if (onConfigChange) {
            onConfigChange({
                regraAnulacao: suggestion.regraAnulacao,
                valorAnulacao: suggestion.valorAnulacao,
                tipoNotaCorte: bankConfig?.tipoNotaCorte,
                precisaoDecimal: bankConfig?.precisaoDecimal,
                tipoPontuacao: selectedTipoPontuacao
            });
        }
        
        toast.success(`✅ Configuração "${suggestion.nome}" aplicada!`, {
            duration: 3000,
            position: 'top-center'
        });
    };

    // Função para verificar se uma sugestão está selecionada
    const isSuggestionSelected = (suggestion) => {
        if (selectedSuggestion) {
            return suggestion.regraAnulacao === selectedSuggestion.regraAnulacao;
        }
        // Fallback: verificar pela configuração atual
        return suggestion.regraAnulacao === currentRegraAnulacao;
    };

    return (
        <div className={`space-y-4 ${className}`}>
            {/* Seleção de Banca */}
            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Banca Organizadora
                </label>
                <div className="relative">
                    <select 
                        value={selectedBank || ''} 
                        onChange={(e) => handleBankChange(e.target.value)}
                        className="w-full p-3 border bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 rounded-lg appearance-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    >
                        <option value="">Selecione a banca...</option>
                        {BANCAS_PREDEFINIDAS.map(banca => (
                            <option key={banca} value={banca}>
                                {getBankIcon(banca)} {banca}
                            </option>
                        ))}
                    </select>
                    {loading && (
                        <div className="absolute right-10 top-1/2 transform -translate-y-1/2">
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-teal-600"></div>
                        </div>
                    )}
                </div>
            </div>

            {/* Tipo de Pontuação */}
            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Tipo de Pontuação
                </label>
                <div className="grid grid-cols-1 gap-3">
                    <div 
                        className={`p-4 border rounded-lg cursor-pointer transition-all ${
                            selectedTipoPontuacao === 'liquida' 
                                ? 'border-teal-500 bg-teal-50 dark:bg-teal-900/20' 
                                : 'border-gray-300 dark:border-gray-600 hover:border-gray-400'
                        }`}
                        onClick={() => onTipoPontuacaoChange('liquida')}
                    >
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                                <input
                                    type="radio"
                                    checked={selectedTipoPontuacao === 'liquida'}
                                    onChange={() => onTipoPontuacaoChange('liquida')}
                                    className="h-4 w-4 text-teal-600 focus:ring-teal-500"
                                />
                                <div>
                                    <div className="font-medium text-gray-900 dark:text-gray-100">
                                        ⚖️ Líquida (Certo/Errado)
                                    </div>
                                    <div className="text-sm text-gray-600 dark:text-gray-400">
                                        Cada erro desconta 1 ponto
                                    </div>
                                </div>
                            </div>
                            <div className="text-xs bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 px-2 py-1 rounded">
                                Cespe/Cebraspe
                            </div>
                        </div>
                    </div>

                    <div 
                        className={`p-4 border rounded-lg cursor-pointer transition-all ${
                            selectedTipoPontuacao === 'bruta' 
                                ? 'border-teal-500 bg-teal-50 dark:bg-teal-900/20' 
                                : 'border-gray-300 dark:border-gray-600 hover:border-gray-400'
                        }`}
                        onClick={() => onTipoPontuacaoChange('bruta')}
                    >
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                                <input
                                    type="radio"
                                    checked={selectedTipoPontuacao === 'bruta'}
                                    onChange={() => onTipoPontuacaoChange('bruta')}
                                    className="h-4 w-4 text-teal-600 focus:ring-teal-500"
                                />
                                <div>
                                    <div className="font-medium text-gray-900 dark:text-gray-100">
                                        📝 Bruta (Múltipla Escolha)
                                    </div>
                                    <div className="text-sm text-gray-600 dark:text-gray-400">
                                        Apenas acertos contam
                                    </div>
                                </div>
                            </div>
                            <div className="text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-2 py-1 rounded">
                                FGV, FCC, Outras
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Opções Específicas do Cespe */}
            {selectedBank === 'Cespe/Cebraspe' && (
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Regra de Anulação do Cespe
                    </label>
                    
                    {/* Resumo da Configuração Atual */}
                    {(selectedSuggestion || currentRegraAnulacao) && (
                        <div className="mb-4 p-3 bg-teal-50 dark:bg-teal-900/20 border border-teal-200 dark:border-teal-800 rounded-lg">
                            <div className="flex items-center space-x-2">
                                <div className="w-2 h-2 bg-teal-500 rounded-full animate-pulse"></div>
                                <span className="text-sm font-medium text-teal-800 dark:text-teal-200">
                                    Configuração Ativa:
                                </span>
                                <span className="text-sm text-teal-700 dark:text-teal-300 font-semibold">
                                    {selectedSuggestion?.nome || 
                                     suggestions.find(s => s.regraAnulacao === currentRegraAnulacao)?.nome || 
                                     'Configuração Personalizada'}
                                </span>
                                <span className="text-xs bg-teal-100 dark:bg-teal-800 text-teal-800 dark:text-teal-200 px-2 py-1 rounded-full">
                                    🎯 Ativo
                                </span>
                            </div>
                        </div>
                    )}
                    
                    {suggestions.length > 0 ? (
                        <div className="grid gap-3">
                            {suggestions.map((suggestion, index) => {
                                const isSelected = isSuggestionSelected(suggestion);
                                return (
                                    <div 
                                        key={index} 
                                        className={`p-4 border rounded-lg cursor-pointer transition-all ${
                                            isSelected 
                                                ? 'border-teal-500 bg-teal-50 dark:bg-teal-900/20 ring-2 ring-teal-200 dark:ring-teal-800' 
                                                : 'border-gray-300 dark:border-gray-600 hover:border-teal-400 hover:bg-teal-50 dark:hover:bg-teal-900/10'
                                        }`}
                                        onClick={() => applySuggestion(suggestion)}
                                    >
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center space-x-3 flex-1">
                                                {/* Indicador visual de seleção */}
                                                <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                                                    isSelected 
                                                        ? 'border-teal-500 bg-teal-500' 
                                                        : 'border-gray-300 dark:border-gray-600'
                                                }`}>
                                                    {isSelected && (
                                                        <div className="w-2 h-2 bg-white rounded-full"></div>
                                                    )}
                                                </div>
                                                
                                                <div className="flex-1">
                                                    <h6 className={`font-medium mb-1 ${
                                                        isSelected 
                                                            ? 'text-teal-900 dark:text-teal-100' 
                                                            : 'text-gray-900 dark:text-gray-100'
                                                    }`}>
                                                        {suggestion.nome}
                                                        {isSelected && (
                                                            <span className="ml-2 text-xs bg-teal-100 dark:bg-teal-800 text-teal-800 dark:text-teal-200 px-2 py-1 rounded-full">
                                                                ✓ Selecionado
                                                            </span>
                                                        )}
                                                    </h6>
                                                    <p className={`text-sm ${
                                                        isSelected 
                                                            ? 'text-teal-700 dark:text-teal-300' 
                                                            : 'text-gray-600 dark:text-gray-400'
                                                    }`}>
                                                        {suggestion.descricao}
                                                    </p>
                                                </div>
                                            </div>
                                            
                                            <button className={`ml-3 px-3 py-1 text-sm rounded transition ${
                                                isSelected 
                                                    ? 'bg-teal-700 text-white hover:bg-teal-800' 
                                                    : 'bg-teal-600 text-white hover:bg-teal-700'
                                            }`}>
                                                {isSelected ? 'Selecionado' : 'Aplicar'}
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="p-4 border border-gray-200 dark:border-gray-600 rounded-lg">
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                {loading ? 'Carregando opções...' : 'Nenhuma opção disponível'}
                            </p>
                        </div>
                    )}
                </div>
            )}

            {/* Detalhes da Configuração */}
            {bankConfig && (
                <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border">
                    <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-gray-900 dark:text-gray-100">
                            Configuração Automática
                        </h4>
                        <button
                            onClick={() => setShowDetails(!showDetails)}
                            className="text-sm text-teal-600 hover:text-teal-700"
                        >
                            {showDetails ? 'Ocultar' : 'Ver detalhes'}
                        </button>
                    </div>
                    
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                        {bankConfig.descricao}
                    </p>

                    {showDetails && (
                        <div className="space-y-2 text-xs text-gray-500 dark:text-gray-400 border-t pt-3">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <span className="font-medium">Tipo de Pontuação:</span>
                                    <br />
                                    {getTipoPontuacaoLabel(bankConfig.tipoPontuacao)}
                                </div>
                                <div>
                                    <span className="font-medium">Regra de Anulação:</span>
                                    <br />
                                    {bankConfig.regraAnulacao}
                                </div>
                                <div>
                                    <span className="font-medium">Nota de Corte:</span>
                                    <br />
                                    {bankConfig.tipoNotaCorte} ({bankConfig.precisaoDecimal} casas)
                                </div>
                                <div>
                                    <span className="font-medium">Valor Anulada:</span>
                                    <br />
                                    {bankConfig.valorAnulacao} ponto(s)
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Dica Educativa */}
            {selectedTipoPontuacao && (
                <div className="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                    <div className="flex items-start space-x-2">
                        <div className="text-blue-600 dark:text-blue-400 mt-0.5">💡</div>
                        <div className="text-sm text-blue-700 dark:text-blue-300">
                            <strong>Dica:</strong> {getTipoPontuacaoDescription(selectedTipoPontuacao)}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SmartBankSelector; 