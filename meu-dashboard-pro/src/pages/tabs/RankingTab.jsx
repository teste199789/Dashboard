import React, { useState, useMemo, useEffect, useCallback } from 'react';
import * as api from '../../api/apiService';
import toast from 'react-hot-toast';
import { calculatePercentile, calculatePosition, generateDistributionData } from '../../utils/simulation';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, Label } from 'recharts';
import StatCard from '../../components/common/StatCard';
import RankingProgress from '../../components/common/RankingProgress';

const RankingTab = ({ proof, refreshProof }) => {
    // Calcula a nota final do usuário a partir dos resultados da correção
    const userScore = useMemo(() => {
        if (!proof.results || proof.results.length === 0) return 0;
        const totals = proof.results.reduce((acc, r) => {
            acc.acertos += r.acertos;
            acc.erros += r.erros;
            return acc;
        }, { acertos: 0, erros: 0 });
        return proof.tipoPontuacao === 'liquida' ? totals.acertos - totals.erros : totals.acertos;
    }, [proof]);

    // NOVO: Estado completamente separado para inputs e valores numéricos
    const [rawInputs, setRawInputs] = useState({
        inscritos: '',
        media: '',
        desvioPadrao: '',
        notaCorte: ''
    });
    
    const [isSaving, setIsSaving] = useState(false);
    const [showAdvancedControls, setShowAdvancedControls] = useState(false);

    // Inicializar inputs quando a prova carregar
    useEffect(() => {
        setRawInputs({
            inscritos: String(proof.inscritos || 1000),
            media: String(proof.simulacaoMedia || (userScore > 0 ? (userScore * 0.9).toFixed(1) : '50.0')),
            desvioPadrao: String(proof.simulacaoDesvioPadrao || '2.0'),
            notaCorte: String(proof.simulacaoNotaDeCorte || (userScore > 0 ? (userScore * 0.95).toFixed(1) : '60.0'))
        });
    }, [proof, userScore]);

    // Corrigido: Simplificado para apenas atualizar o estado bruto.
    // A limpeza e validação são centralizadas no `useMemo` de `numericValues`.
    const handleInputChange = useCallback((field, rawValue) => {
        setRawInputs(prev => ({
            ...prev,
            [field]: rawValue
        }));
    }, []);

    // Corrigido: Slider agora também usa o `handleInputChange` para consistência.
    const handleSliderChange = useCallback((field, sliderValue) => {
        handleInputChange(field, String(sliderValue));
    }, [handleInputChange]);

    // Valores numéricos processados para cálculos
    const numericValues = useMemo(() => {
        const defaultInscritos = proof.inscritos || 1000;
        const defaultMedia = userScore > 0 ? userScore * 0.9 : 50;
        const defaultNotaCorte = userScore > 0 ? userScore * 0.95 : 60;

        // Limpeza e normalização dos valores brutos
        const cleanInscritos = String(rawInputs.inscritos).replace(/[^0-9]/g, '');
        
        const normalizeDecimal = (value) => {
            let clean = String(value).replace(/[^0-9.,]/g, '').replace(',', '.');
            const parts = clean.split('.');
            if (parts.length > 2) {
                return parts[0] + '.' + parts.slice(1).join('');
            }
            return clean;
        };

        const cleanMedia = normalizeDecimal(rawInputs.media);
        const cleanDesvioPadrao = normalizeDecimal(rawInputs.desvioPadrao);
        const cleanNotaCorte = normalizeDecimal(rawInputs.notaCorte);

        const parsed = {
            inscritos: Math.max(1, parseInt(cleanInscritos, 10) || defaultInscritos),
            media: Math.max(0, parseFloat(cleanMedia) || defaultMedia),
            desvioPadrao: Math.max(0.1, parseFloat(cleanDesvioPadrao) || 2.0),
            notaCorte: Math.max(0, parseFloat(cleanNotaCorte) || defaultNotaCorte)
        };

        console.log('[NUMERIC] Valores processados:', parsed);
        return parsed;
    }, [rawInputs, userScore, proof.inscritos]);

    // Cálculos estatísticos em tempo real
    const rankingStats = useMemo(() => {
        const { inscritos, media, desvioPadrao, notaCorte } = numericValues;

        if (desvioPadrao <= 0 || inscritos <= 0) {
            return { 
                percentile: 50, 
                position: Math.ceil(inscritos / 2), 
                approvedCount: 0, 
                distributionData: [], 
                competitorsAbove: Math.ceil(inscritos / 2) - 1, 
                isAboveCutoff: false 
            };
        }
        
        const userPercentile = calculatePercentile(userScore, media, desvioPadrao);
        const userPosition = calculatePosition(userPercentile, inscritos);
        const cutoffPercentile = calculatePercentile(notaCorte, media, desvioPadrao);
        const approvedCount = Math.max(0, Math.round((1 - cutoffPercentile) * inscritos));
        const distributionData = generateDistributionData(media, desvioPadrao);
        const competitorsAbove = Math.max(0, userPosition - 1);

        return {
            percentile: userPercentile * 100,
            position: userPosition,
            approvedCount,
            distributionData,
            competitorsAbove,
            isAboveCutoff: userScore >= notaCorte
        };
    }, [userScore, numericValues]);

    // Função para salvar todos os parâmetros da simulação
    const handleSaveSimulation = async () => {
        setIsSaving(true);
        try {
            const params = {
                inscritos: numericValues.inscritos,
                simulacaoMedia: numericValues.media,
                simulacaoDesvioPadrao: numericValues.desvioPadrao,
                simulacaoNotaDeCorte: numericValues.notaCorte,
            };
            
            console.log('[SAVE] Salvando parâmetros:', params);
            await api.updateProofDetails(proof.id, params);
            toast.success('Parâmetros da simulação salvos!');
            if (refreshProof) refreshProof();
        } catch (error) {
            toast.error('Falha ao salvar os parâmetros.');
            console.error('[SAVE] Erro:', error);
        } finally {
            setIsSaving(false);
        }
    };

    // Mensagem exibida se a prova ainda não foi corrigida
    if (!proof.results || proof.results.length === 0) {
        return (
            <div className="p-8 text-center">
                <div className="max-w-md mx-auto">
                    <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl p-6">
                        <div className="flex items-center justify-center w-12 h-12 mx-auto bg-yellow-100 dark:bg-yellow-900/40 rounded-full mb-4">
                            <svg className="w-6 h-6 text-yellow-600 dark:text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <h3 className="text-lg font-semibold text-yellow-800 dark:text-yellow-200 mb-2">
                            Ranking Indisponível
                        </h3>
                        <p className="text-yellow-700 dark:text-yellow-300">
                            É necessário corrigir a prova na aba "Resultado Final" antes de gerar a simulação de ranking.
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    const renderCustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm p-3 border border-gray-200 dark:border-gray-600 rounded-lg shadow-lg">
                    <p className="font-semibold text-gray-800 dark:text-gray-200">{`Nota: ${label}`}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{`Densidade: ${(payload[0].value * 100).toFixed(2)}%`}</p>
                </div>
            );
        }
        return null;
    };

    // NOVO: Componente InputField completamente reescrito
    const InputField = ({ label, field, min, max, step, placeholder, description, type = "decimal" }) => {
        const rawValue = rawInputs[field];
        const numericValue = numericValues[field];
        const displayValue = type === "integer" ? Math.floor(numericValue) : numericValue;
        
        return (
            <div className="space-y-3">
                <div className="flex justify-between items-center">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">{label}</label>
                    <span className="text-xs text-gray-500 dark:text-gray-400 px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded font-mono">
                        {type === "integer" ? displayValue.toLocaleString('pt-BR') : displayValue.toFixed(1)}
                    </span>
                </div>
                
                <div className="space-y-2">
                    <input 
                        type="text"
                        value={rawValue}
                        onChange={e => handleInputChange(field, e.target.value)}
                        placeholder={placeholder}
                        className="w-full p-3 border bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-colors text-center font-mono text-base"
                        autoComplete="off"
                        spellCheck="false"
                    />
                    <input
                        type="range"
                        value={String(displayValue)} // Garantir que o valor seja sempre string
                        onChange={e => handleSliderChange(field, e.target.value)}
                        min={min}
                        max={max}
                        step={step}
                        className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
                    />
                </div>
                
                {description && (
                    <p className="text-xs text-gray-500 dark:text-gray-400">{description}</p>
                )}
            </div>
        );
    };

    return (
        <div className="p-6 space-y-8">
            {/* Header */}
            <div className="text-center">
                <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-2">
                    Simulação de Ranking
                </h3>
                <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                    Visualize sua posição estimada no ranking baseada em parâmetros estatísticos do concurso.
                </p>
            </div>



            {/* Destaque da Posição do Usuário */}
            <div className="bg-gradient-to-r from-blue-50 to-teal-50 dark:from-blue-900/20 dark:to-teal-900/20 border border-blue-200 dark:border-blue-800 rounded-2xl p-6">
                <div className="text-center">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 dark:bg-blue-900/40 rounded-full mb-4">
                        <svg className="w-8 h-8 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                        </svg>
                    </div>
                    <h4 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-2">Sua Posição Estimada</h4>
                    <div className="space-y-4">
                        <div>
                            <div className="text-4xl font-bold text-blue-600 dark:text-blue-400 mb-1">
                                {rankingStats.position.toLocaleString('pt-BR')}º
                            </div>
                            <p className="text-gray-600 dark:text-gray-400">
                                de {numericValues.inscritos.toLocaleString('pt-BR')} candidatos
                            </p>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm mb-6">
                             <div className="bg-white/60 dark:bg-gray-800/60 rounded-lg p-3">
                                 <div className="font-semibold text-gray-800 dark:text-gray-200">Sua Nota</div>
                                 <div className="text-lg font-bold text-blue-600 dark:text-blue-400">
                                     {userScore.toFixed(2)}
                                 </div>
                             </div>
                             <div className="bg-white/60 dark:bg-gray-800/60 rounded-lg p-3">
                                 <div className="font-semibold text-gray-800 dark:text-gray-200">Percentil</div>
                                 <div className="text-lg font-bold text-green-600 dark:text-green-400">
                                     {rankingStats.percentile.toFixed(1)}%
                                 </div>
                                 <div className="text-xs text-gray-500 dark:text-gray-400">
                                     À frente de {rankingStats.competitorsAbove.toLocaleString('pt-BR')} candidatos
                                 </div>
                             </div>
                             <div className="bg-white/60 dark:bg-gray-800/60 rounded-lg p-3">
                                 <div className="font-semibold text-gray-800 dark:text-gray-200">Status</div>
                                 <div className={`text-lg font-bold ${rankingStats.isAboveCutoff 
                                     ? 'text-green-600 dark:text-green-400' 
                                     : 'text-red-600 dark:text-red-400'}`}>
                                     {rankingStats.isAboveCutoff ? 'Aprovado' : 'Reprovado'}
                                 </div>
                                 <div className="text-xs text-gray-500 dark:text-gray-400">
                                     Nota de corte: {numericValues.notaCorte.toFixed(1)}
                                 </div>
                             </div>
                         </div>
                         
                         {/* Visualização de progresso no ranking */}
                         <RankingProgress 
                             position={rankingStats.position}
                             total={numericValues.inscritos}
                             percentile={rankingStats.percentile}
                             isAboveCutoff={rankingStats.isAboveCutoff}
                         />
                    </div>
                </div>
            </div>

            {/* Controles de Simulação */}
            <div className="bg-white dark:bg-gray-800/50 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
                <div className="flex justify-between items-center mb-6">
                    <h4 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
                        Parâmetros da Simulação
                    </h4>
                    <button
                        onClick={() => setShowAdvancedControls(!showAdvancedControls)}
                        className="text-sm text-teal-600 dark:text-teal-400 hover:text-teal-700 dark:hover:text-teal-300 font-medium transition-colors"
                    >
                        {showAdvancedControls ? 'Ocultar controles avançados' : 'Mostrar controles avançados'}
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <InputField 
                        label="Candidatos Inscritos" 
                        field="inscritos"
                        min="1" 
                        max="500000" 
                        step="100" 
                        placeholder="Ex: 50000"
                        description="Número total de candidatos que realizaram a prova"
                        type="integer"
                    />
                    <InputField 
                        label="Nota de Corte Simulada" 
                        field="notaCorte"
                        min="0" 
                        max={proof.totalQuestoes || 100} 
                        step="0.1" 
                        placeholder="Ex: 70.0"
                        description="Nota mínima para aprovação (estimativa)"
                        type="decimal"
                    />
                    
                    {showAdvancedControls && (
                        <>
                            <InputField 
                                label="Nota Média Estimada" 
                                field="media"
                                min="0" 
                                max={proof.totalQuestoes || 100} 
                                step="0.1" 
                                placeholder="Ex: 65.5"
                                description="Média estimada de todos os candidatos"
                                type="decimal"
                            />
                            <InputField 
                                label="Desvio Padrão" 
                                field="desvioPadrao"
                                min="0.1" 
                                max="20" 
                                step="0.1" 
                                placeholder="Ex: 2.0"
                                description="Dispersão das notas (1.5 a 3.0 é comum)"
                                type="decimal"
                            />
                        </>
                    )}
                </div>

                <div className="flex justify-end mt-6">
                    <button 
                        onClick={handleSaveSimulation} 
                        disabled={isSaving} 
                        className="bg-teal-600 hover:bg-teal-700 disabled:bg-gray-400 text-white font-semibold py-3 px-6 rounded-lg transition-colors shadow-sm"
                    >
                        {isSaving ? 'Salvando...' : 'Salvar Parâmetros'}
                    </button>
                </div>
            </div>
            
            {/* Estatísticas Detalhadas */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard 
                    title="Candidatos Aprovados" 
                    value={rankingStats.approvedCount.toLocaleString('pt-BR')} 
                    subValue={`${((rankingStats.approvedCount / numericValues.inscritos) * 100).toFixed(1)}% do total`}
                    color="green" 
                />
                <StatCard 
                    title="Candidatos Reprovados" 
                    value={(numericValues.inscritos - rankingStats.approvedCount).toLocaleString('pt-BR')} 
                    subValue={`${(100 - (rankingStats.approvedCount / numericValues.inscritos) * 100).toFixed(1)}% do total`}
                    color="red" 
                />
                <StatCard 
                    title="Distância da Média" 
                    value={`${(userScore - numericValues.media) >= 0 ? '+' : ''}${(userScore - numericValues.media).toFixed(2)}`} 
                    subValue="pontos"
                    color={userScore >= numericValues.media ? "green" : "red"} 
                />
                <StatCard 
                    title="Margem de Segurança" 
                    value={`${(userScore - numericValues.notaCorte) >= 0 ? '+' : ''}${(userScore - numericValues.notaCorte).toFixed(2)}`}
                    subValue="pontos do corte"
                    color={userScore >= numericValues.notaCorte ? "green" : "red"} 
                />
            </div>

            {/* Gráfico de Distribuição */}
            <div className="bg-white dark:bg-gray-800/50 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
                <h4 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4">
                    Distribuição de Notas (Curva Normal)
                </h4>
                <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={rankingStats.distributionData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                            <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.2} />
                            <XAxis 
                                dataKey="x" 
                                type="number" 
                                domain={['dataMin', 'dataMax']} 
                                stroke="rgb(156 163 175)" 
                                fontSize={12}
                            />
                            <YAxis 
                                tickFormatter={(tick) => `${(tick * 100).toFixed(1)}%`} 
                                stroke="rgb(156 163 175)" 
                                fontSize={12}
                            />
                            <Tooltip content={renderCustomTooltip} />
                            <Area 
                                type="monotone" 
                                dataKey="y" 
                                stroke="#14b8a6" 
                                fill="#14b8a6" 
                                fillOpacity={0.3} 
                            />
                            
                            <ReferenceLine x={userScore} stroke="#3b82f6" strokeWidth={3}>
                               <Label 
                                   value={`Sua Nota (${userScore.toFixed(1)})`} 
                                   position="top" 
                                   fill="#3b82f6" 
                                   fontSize={12} 
                                   fontWeight="bold" 
                               />
                            </ReferenceLine>

                            <ReferenceLine x={numericValues.notaCorte} stroke="#22c55e" strokeWidth={2} strokeDasharray="5 5">
                               <Label 
                                   value={`Nota de Corte (${numericValues.notaCorte.toFixed(1)})`} 
                                   position="top" 
                                   fill="#22c55e" 
                                   fontSize={12} 
                                   fontWeight="bold" 
                               />
                            </ReferenceLine>
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
                <div className="mt-4 text-sm text-gray-600 dark:text-gray-400 text-center">
                    <p>A linha azul sólida representa sua nota. A linha verde tracejada representa a nota de corte.</p>
                </div>
            </div>
        </div>
    );
};

export default RankingTab;