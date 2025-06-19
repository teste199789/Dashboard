import React, { useState, useMemo, useEffect } from 'react';
import * as api from '../../api/apiService';
import toast from 'react-hot-toast';
import { calculatePercentile, calculatePosition, generateDistributionData } from '../../utils/simulation';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, Label } from 'recharts';
import { useDebouncedState } from '../../hooks/useDebouncedState';
import StatCard from '../../components/common/StatCard';
import RankingProgress from '../../components/common/RankingProgress';

// Componente de Input Reutilizável (mantido da refatoração anterior)
const InputField = ({ label, value, onChange, min, max, step, type = "number", totalQuestoes }) => {
    const handleInputChange = (newValue) => {
        // Validação para campos de nota (que devem ser <= totalQuestoes)
        if (label.includes("Nota") && totalQuestoes) {
            const numValue = parseFloat(newValue);
            if (!isNaN(numValue) && numValue > totalQuestoes) {
                // Limitar ao máximo de questões
                onChange(totalQuestoes.toString());
                return;
            }
        }
        onChange(newValue);
    };

    return (
        <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {label}
                {label.includes("Nota") && totalQuestoes && (
                    <span className="text-xs text-gray-500 dark:text-gray-400 ml-1">
                        (máx: {totalQuestoes})
                    </span>
                )}
            </label>
            <input
                type={type}
                value={value}
                onChange={e => handleInputChange(e.target.value)}
                min={min}
                max={max}
                step={step}
                className="w-full p-3 border bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-colors text-center font-mono text-base"
            />
            <input
                type="range"
                value={value}
                onChange={e => handleInputChange(e.target.value)}
                min={min}
                max={max}
                step={step}
                className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
            />
        </div>
    );
};

const RankingTab = ({ proof, refreshProof }) => {
    const userScore = useMemo(() => {
        if (!proof.results || proof.results.length === 0) return 0;
        const totals = proof.results.reduce((acc, r) => ({ acertos: acc.acertos + r.acertos, erros: acc.erros + r.erros }), { acertos: 0, erros: 0 });
        return proof.tipoPontuacao === 'liquida' ? totals.acertos - totals.erros : totals.acertos;
    }, [proof]);
    
    // Estados com Debounce para performance
    const [inscritos, setInscritos, debouncedInscritos] = useDebouncedState(proof.inscritos || '1000', 300);
    const [media, setMedia, debouncedMedia] = useDebouncedState(proof.simulacaoMedia?.toString() || '50', 300);
    const [desvioPadrao, setDesvioPadrao, debouncedDesvioPadrao] = useDebouncedState(proof.simulacaoDesvioPadrao?.toString() || '10', 300);
    const [notaCorte, setNotaCorte, debouncedNotaCorte] = useDebouncedState(proof.simulacaoNotaDeCorte?.toString() || '60', 300);

    const [isSaving, setIsSaving] = useState(false);
    const [showAdvancedControls, setShowAdvancedControls] = useState(false);
    const [showSavePreview, setShowSavePreview] = useState(false);

    // Valores que serão efetivamente salvos (para preview)
    const valuesToSave = useMemo(() => ({
        inscritos: parseInt(inscritos, 10) || null,
        simulacaoMedia: parseFloat(media) || null,
        simulacaoDesvioPadrao: parseFloat(desvioPadrao) || null,
        simulacaoNotaDeCorte: parseFloat(notaCorte) || null,
    }), [inscritos, media, desvioPadrao, notaCorte]);

    // Efeito para inicializar/resetar os valores quando a prova muda
    useEffect(() => {
        setInscritos(String(proof.inscritos || 1000));
        // Valores mais realistas baseados em estatísticas de concursos reais
        const defaultMedia = userScore > 0 ? Math.max(userScore * 0.75, userScore - 5) : Math.max(proof.totalQuestoes * 0.4, 30);
        const defaultDesvio = Math.max(proof.totalQuestoes * 0.15, 8); // Desvio maior para mais realismo
        const defaultCorte = userScore > 0 ? Math.min(userScore * 1.1, userScore + 3) : Math.max(proof.totalQuestoes * 0.65, 45);
        
        setMedia(String(proof.simulacaoMedia || defaultMedia.toFixed(1)));
        setDesvioPadrao(String(proof.simulacaoDesvioPadrao || defaultDesvio.toFixed(1)));
        setNotaCorte(String(proof.simulacaoNotaDeCorte || defaultCorte.toFixed(1)));
    }, [proof, userScore, setInscritos, setMedia, setDesvioPadrao, setNotaCorte]);

    // Cálculos estatísticos baseados nos valores com debounce
    const rankingStats = useMemo(() => {
        const numMedia = parseFloat(debouncedMedia) || 0;
        const numDesvio = parseFloat(debouncedDesvioPadrao) || 0.1;
        const numInscritos = parseInt(debouncedInscritos, 10) || 1;
        const numCorte = parseFloat(debouncedNotaCorte) || 0;

        if (numDesvio <= 0 || numInscritos <= 0) return { percentile: 0, position: 1, competitorsAbove: 0, isAboveCutoff: false, approvedCount: 0, distributionData: [] };

        const userPercentile = calculatePercentile(userScore, numMedia, numDesvio);
        const userPosition = calculatePosition(userPercentile, numInscritos);
        const cutoffPercentile = calculatePercentile(numCorte, numMedia, numDesvio);
        
        // Calcular faixa de classificação com abordagem mais realista
        // Margem de erro baseada em múltiplos fatores para ser mais conservadora
        const baseMargin = 0.02; // 2% base
        const competitionFactor = Math.min(0.08, numInscritos / 10000); // Até 8% para concursos grandes
        const scoreFactor = Math.min(0.05, Math.abs(userScore - numMedia) / numMedia * 0.1); // Margem baseada na distância da média
        const marginOfError = baseMargin + competitionFactor + scoreFactor;
        
        // Aplicar margem de forma assimétrica - mais conservadora para posições melhores
        const lowerPercentile = Math.max(0, userPercentile - marginOfError * 0.7); // Menos otimismo
        const upperPercentile = Math.min(1, userPercentile + marginOfError * 1.3); // Mais pessimismo
        
        // Cálculo de posições com arredondamento mais conservador
        const calculatedBestPosition = Math.max(1, Math.floor((1 - upperPercentile) * numInscritos) + 1);
        const calculatedWorstPosition = Math.min(numInscritos, Math.ceil((1 - lowerPercentile) * numInscritos));
        
        // Aplicar limite mínimo na faixa para evitar previsões irrealistas
        const minRange = Math.max(3, Math.floor(numInscritos * 0.01)); // Pelo menos 1% do total ou 3 posições
        const bestPosition = calculatedBestPosition;
        const worstPosition = Math.max(calculatedWorstPosition, bestPosition + minRange);
        
        // Ajustar confiança baseada na qualidade dos parâmetros
        const parameterQuality = Math.min(1, (numInscritos > 100 ? 0.5 : 0.3) + (numDesvio > 2 ? 0.3 : 0.1) + 0.2);
        const adjustedConfidence = Math.round(parameterQuality * (1 - marginOfError * 1.5) * 100);

        return {
            percentile: userPercentile * 100,
            position: userPosition,
            competitorsAbove: Math.max(0, userPosition - 1),
            isAboveCutoff: userScore >= numCorte,
            approvedCount: Math.max(0, Math.round((1 - cutoffPercentile) * numInscritos)),
            distributionData: generateDistributionData(numMedia, numDesvio, proof.totalQuestoes),
            positionRange: {
                best: bestPosition,
                worst: Math.min(numInscritos, worstPosition),
                confidence: Math.max(30, Math.min(85, adjustedConfidence)) // Entre 30% e 85%
            }
        };
    }, [userScore, debouncedInscritos, debouncedMedia, debouncedDesvioPadrao, debouncedNotaCorte, proof.totalQuestoes]);

    const handleSaveSimulation = async () => {
        setIsSaving(true);
        
        // Validações antes de salvar
        const mediaNum = parseFloat(media);
        const desvioNum = parseFloat(desvioPadrao);
        const corteNum = parseFloat(notaCorte);
        const inscritosNum = parseInt(inscritos, 10);
        
        // Validar se as notas não excedem o total de questões
        if (!isNaN(mediaNum) && mediaNum > proof.totalQuestoes) {
            toast.error(`❌ Nota média não pode ser maior que ${proof.totalQuestoes} (total de questões)`);
            setIsSaving(false);
            return;
        }
        
        if (!isNaN(corteNum) && corteNum > proof.totalQuestoes) {
            toast.error(`❌ Nota de corte não pode ser maior que ${proof.totalQuestoes} (total de questões)`);
            setIsSaving(false);
            return;
        }
        
        if (!isNaN(desvioNum) && desvioNum > proof.totalQuestoes) {
            toast.error(`❌ Desvio padrão não pode ser maior que ${proof.totalQuestoes} (total de questões)`);
            setIsSaving(false);
            return;
        }

        // Preparar dados como strings para preservar decimais
        const params = {
            inscritos: inscritosNum || null,
            simulacaoMedia: media.trim() !== '' ? media : null,
            simulacaoDesvioPadrao: desvioPadrao.trim() !== '' ? desvioPadrao : null,
            simulacaoNotaDeCorte: notaCorte.trim() !== '' ? notaCorte : null,
        };

        console.log('Enviando parâmetros para salvamento:', params);

        try {
            const updatedProof = await api.updateProofDetails(proof.id, params);
            
            console.log('Dados recebidos do backend:', updatedProof);
            
            // Atualizar os valores na interface com os dados salvos
            if (updatedProof.inscritos !== null) setInscritos(String(updatedProof.inscritos));
            if (updatedProof.simulacaoMedia !== null) setMedia(String(updatedProof.simulacaoMedia));
            if (updatedProof.simulacaoDesvioPadrao !== null) setDesvioPadrao(String(updatedProof.simulacaoDesvioPadrao));
            if (updatedProof.simulacaoNotaDeCorte !== null) setNotaCorte(String(updatedProof.simulacaoNotaDeCorte));
            
            toast.success('✅ Parâmetros da simulação salvos com sucesso!', {
                duration: 3000,
                position: 'top-center'
            });
            
            // Atualizar a prova no contexto se a função estiver disponível
            if (refreshProof) {
                await new Promise(resolve => setTimeout(resolve, 500));
                refreshProof();
            }
        } catch (error) {
            console.error('[SAVE] Erro ao salvar simulação:', error);
            
            // Tratar erros específicos do backend
            if (error.message && error.message.includes('não pode ser maior')) {
                toast.error(`❌ ${error.message}`, {
                    duration: 5000,
                    position: 'top-center'
                });
            } else if (error.response && error.response.data && error.response.data.error) {
                toast.error(`❌ ${error.response.data.error}`, {
                    duration: 5000,
                    position: 'top-center'
                });
            } else {
                toast.error('❌ Erro ao salvar parâmetros. Verifique os valores e tente novamente.', {
                    duration: 4000,
                    position: 'top-center'
                });
            }
        } finally {
            setIsSaving(false);
        }
    };
    
    // ... o resto do componente JSX ...
    if (!proof.results || proof.results.length === 0) {
        return (
            <div className="p-8 text-center bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                <h3 className="text-lg font-semibold text-yellow-800 dark:text-yellow-200">Ranking Indisponível</h3>
                <p className="text-yellow-700 dark:text-yellow-300 mt-2">Corrija a prova na aba "Resultado" para habilitar esta simulação.</p>
            </div>
        );
    }
    
    const numInscritos = parseInt(debouncedInscritos, 10) || 1;

    // Função para gerar ticks únicos do eixo X
    const generateXAxisTicks = (totalQuestoes) => {
        if (totalQuestoes <= 10) {
            return Array.from({ length: totalQuestoes + 1 }, (_, i) => i);
        } else if (totalQuestoes <= 20) {
            return [0, 2, 4, 6, 8, 10, 12, 14, 16, 18, totalQuestoes].filter(v => v <= totalQuestoes);
        } else {
            const step = Math.ceil(totalQuestoes / 10);
            const ticks = [];
            for (let i = 0; i <= totalQuestoes; i += step) {
                ticks.push(i);
            }
            if (ticks[ticks.length - 1] !== totalQuestoes) {
                ticks.push(totalQuestoes);
            }
            return [...new Set(ticks)].sort((a, b) => a - b); // Remove duplicatas e ordena
        }
    };

    return (
        <div className="p-4 sm:p-6 space-y-6">
            {/* Seção Informativa */}
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0">
                        <svg className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                        </svg>
                    </div>
                    <div>
                        <h3 className="text-sm font-medium text-blue-800 dark:text-blue-200">Como interpretar esta simulação?</h3>
                        <div className="text-xs text-blue-700 dark:text-blue-300 mt-1 space-y-1">
                            <p>Esta simulação estima sua colocação baseada em estatística, assumindo distribuição normal de notas.</p>
                            <p><strong>Importante:</strong> Para resultados mais precisos, ajuste os parâmetros com dados reais do concurso.</p>
                            <p><strong>Dica:</strong> Reduza a "Nota Média" e aumente o "Desvio Padrão" para simulações mais conservadoras.</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Seção de Stats Detalhados */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <StatCard 
                    label="Pontuação Final" 
                    value={userScore.toFixed(2)} 
                    colorClass="text-blue-600 dark:text-blue-400"
                    description="Sua nota final nesta prova, calculada conforme o tipo de pontuação configurado"
                    subValue={`${proof.tipoPontuacao === 'liquida' ? 'Pontuação líquida' : 'Pontuação bruta'}`}
                />
                <StatCard 
                    label="Percentil de Classificação" 
                    value={`${rankingStats.percentile.toFixed(1)}%`} 
                    colorClass="text-green-600 dark:text-green-400"
                    description="Porcentagem de candidatos que você superou com base na simulação estatística"
                    subValue={`Superou ${rankingStats.competitorsAbove.toLocaleString('pt-BR')} candidatos`}
                />
                <StatCard 
                    label="Status na Classificação" 
                    value={rankingStats.isAboveCutoff ? 'Aprovado' : 'Reprovado'} 
                    colorClass={rankingStats.isAboveCutoff ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}
                    description="Resultado baseado na comparação entre sua nota e a nota de corte simulada"
                    subValue={`Nota de corte: ${(parseFloat(debouncedNotaCorte) || 0).toFixed(1)} pts`}
                />
                <StatCard 
                    label="Sua Possível Classificação" 
                    value={`${rankingStats.positionRange.best.toLocaleString('pt-BR')}º - ${rankingStats.positionRange.worst.toLocaleString('pt-BR')}º`} 
                    colorClass="text-purple-600 dark:text-purple-400"
                    description="Faixa de classificação possível considerando variações estatísticas na distribuição de notas"
                    subValue={`Confiança: ${rankingStats.positionRange.confidence}%`}
                />
            </div>

            {/* Seção da Barra de Progresso */}
            <RankingProgress
                position={rankingStats.position}
                total={numInscritos}
                percentile={rankingStats.percentile}
            />

            {/* Seção dos Parâmetros */}
            <div className="bg-white dark:bg-gray-800/50 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
                <div className="flex justify-between items-center mb-6">
                    <h4 className="text-lg font-semibold text-gray-800 dark:text-gray-100">Parâmetros da Simulação</h4>
                    <button onClick={() => setShowAdvancedControls(!showAdvancedControls)} className="text-sm text-teal-600 dark:text-teal-400 hover:text-teal-700 dark:hover:text-teal-300 font-medium transition-colors">
                        {showAdvancedControls ? 'Ocultar controles avançados' : 'Mostrar controles avançados'}
                    </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <InputField label="Total de Candidatos Inscritos" value={inscritos} onChange={setInscritos} min="1" max={Math.max(200000, proof.inscritos || 0)} step="100" totalQuestoes={proof.totalQuestoes} />
                        <p className="text-xs text-gray-500 dark:text-gray-400">Número total de pessoas que fizeram a prova</p>
                    </div>
                    <div className="space-y-2">
                        <InputField label="Nota de Corte para Aprovação" value={notaCorte} onChange={setNotaCorte} min="0" max={proof.totalQuestoes} step="0.1" totalQuestoes={proof.totalQuestoes} />
                        <p className="text-xs text-gray-500 dark:text-gray-400">Pontuação mínima necessária para ser aprovado</p>
                    </div>
                    {showAdvancedControls && (
                        <>
                            <div className="space-y-2">
                                <InputField label="Nota Média dos Candidatos" value={media} onChange={setMedia} min="0" max={proof.totalQuestoes} step="0.1" totalQuestoes={proof.totalQuestoes} />
                                <p className="text-xs text-gray-500 dark:text-gray-400">Pontuação média esperada dos candidatos</p>
                            </div>
                            <div className="space-y-2">
                                <InputField label="Variação das Notas (Desvio Padrão)" value={desvioPadrao} onChange={setDesvioPadrao} min="0.1" max={proof.totalQuestoes / 2} step="0.1" totalQuestoes={proof.totalQuestoes} />
                                <p className="text-xs text-gray-500 dark:text-gray-400">Quanto as notas variam em relação à média</p>
                            </div>
                        </>
                    )}
                </div>
                <div className="flex justify-end mt-6">
                    <div className="flex gap-3">
                        <button 
                            onClick={() => {
                                // Cenário Conservador - mais realista para concursos competitivos
                                const conservativeMedia = Math.max(userScore * 0.65, proof.totalQuestoes * 0.35);
                                const conservativeDesvio = Math.max(proof.totalQuestoes * 0.18, 10);
                                const conservativeCorte = Math.min(userScore * 1.15, userScore + 5);
                                
                                setMedia(conservativeMedia.toFixed(1));
                                setDesvioPadrao(conservativeDesvio.toFixed(1));
                                setNotaCorte(conservativeCorte.toFixed(1));
                            }}
                            className="bg-orange-600 hover:bg-orange-700 text-white font-medium py-2 px-4 rounded-lg transition-colors text-sm"
                        >
                            Cenário Conservador
                        </button>
                        <button 
                            onClick={() => {
                                // Cenário Moderado - equilibrado
                                const moderateMedia = Math.max(userScore * 0.75, proof.totalQuestoes * 0.45);
                                const moderateDesvio = Math.max(proof.totalQuestoes * 0.15, 8);
                                const moderateCorte = Math.min(userScore * 1.08, userScore + 2);
                                
                                setMedia(moderateMedia.toFixed(1));
                                setDesvioPadrao(moderateDesvio.toFixed(1));
                                setNotaCorte(moderateCorte.toFixed(1));
                            }}
                            className="bg-yellow-600 hover:bg-yellow-700 text-white font-medium py-2 px-4 rounded-lg transition-colors text-sm"
                        >
                            Cenário Moderado
                        </button>
                        <button 
                            onClick={() => setShowSavePreview(!showSavePreview)}
                            className="bg-gray-600 hover:bg-gray-700 text-white font-medium py-2 px-4 rounded-lg transition-colors text-sm"
                        >
                            {showSavePreview ? 'Ocultar Prévia' : 'Ver Prévia'}
                        </button>
                        <button onClick={handleSaveSimulation} disabled={isSaving} className="bg-teal-600 hover:bg-teal-700 disabled:bg-gray-400 text-white font-semibold py-3 px-6 rounded-lg transition-colors shadow-sm">
                            {isSaving ? 'Salvando...' : 'Salvar Parâmetros'}
                        </button>
                    </div>
                </div>
                
                {/* Prévia dos valores que serão salvos */}
                {showSavePreview && (
                    <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600">
                        <h5 className="text-sm font-medium text-gray-800 dark:text-gray-200 mb-3">📋 Valores que serão salvos:</h5>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                            <div>
                                <span className="text-gray-600 dark:text-gray-400">Inscritos:</span>
                                <div className="font-mono font-semibold text-teal-600 dark:text-teal-400">
                                    {valuesToSave.inscritos?.toLocaleString('pt-BR') || 'Não definido'}
                                </div>
                            </div>
                            <div>
                                <span className="text-gray-600 dark:text-gray-400">Nota Média:</span>
                                <div className="font-mono font-semibold text-teal-600 dark:text-teal-400">
                                    {valuesToSave.simulacaoMedia?.toFixed(1) || 'Não definido'}
                                </div>
                            </div>
                            <div>
                                <span className="text-gray-600 dark:text-gray-400">Desvio Padrão:</span>
                                <div className="font-mono font-semibold text-teal-600 dark:text-teal-400">
                                    {valuesToSave.simulacaoDesvioPadrao?.toFixed(1) || 'Não definido'}
                                </div>
                            </div>
                            <div>
                                <span className="text-gray-600 dark:text-gray-400">Nota de Corte:</span>
                                <div className="font-mono font-semibold text-teal-600 dark:text-teal-400">
                                    {valuesToSave.simulacaoNotaDeCorte?.toFixed(1) || 'Não definido'}
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Gráfico de Distribuição */}
            <div className="bg-white dark:bg-gray-800/50 rounded-xl p-4 sm:p-6 border border-gray-200 dark:border-gray-700" style={{ height: '450px' }}>
                <h4 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4">
                    Distribuição de Notas (Curva Normal)
                    <span className="text-sm font-normal text-gray-600 dark:text-gray-400 ml-2 block sm:inline">
                        Escala de 0 a {proof.totalQuestoes} questões
                    </span>
                </h4>
                {rankingStats.distributionData && rankingStats.distributionData.length > 0 ? (
                    <div style={{ width: '100%', height: 'calc(100% - 60px)' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart 
                                data={rankingStats.distributionData} 
                                margin={{ 
                                    top: 50, 
                                    right: 50, 
                                    left: 70, 
                                    bottom: 70 
                                }}
                            >
                                <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.2} />
                                <XAxis 
                                    dataKey="score" 
                                    type="number"
                                    domain={[0, proof.totalQuestoes]}
                                    ticks={(() => {
                                        const total = proof.totalQuestoes;
                                        if (total <= 10) {
                                            return [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].slice(0, total + 1);
                                        } else if (total <= 20) {
                                            return [0, 4, 8, 12, 16, total];
                                        } else {
                                            const step = Math.ceil(total / 5);
                                            return [0, step, step * 2, step * 3, step * 4, total];
                                        }
                                    })()}
                                    tick={{ fontSize: 11 }}
                                    label={{ 
                                        value: 'Pontuação (questões corretas)', 
                                        position: 'insideBottom', 
                                        offset: -20 
                                    }}
                                />
                                <YAxis 
                                    tickFormatter={(value) => `${(value * 100).toFixed(1)}%`} 
                                    tick={{ fill: 'currentColor', fontSize: 11 }}
                                    domain={[0, 'dataMax']}
                                    width={60}
                                    label={{ 
                                        value: 'Densidade (%)', 
                                        angle: -90, 
                                        position: 'insideLeft', 
                                        style: { textAnchor: 'middle', fontSize: '11px', fill: 'currentColor' } 
                                    }}
                                />
                                <Tooltip
                                    content={({ active, payload, label }) => active && payload?.length && (
                                        <div className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm p-3 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl">
                                            <p className="font-semibold text-gray-800 dark:text-gray-100">
                                                {`${parseFloat(label).toFixed(1)} questões corretas`}
                                            </p>
                                            <p className="text-sm text-teal-600 dark:text-teal-400">
                                                {`Densidade: ${(payload[0].value * 100).toFixed(2)}%`}
                                            </p>
                                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                                {`Percentual de candidatos nesta faixa`}
                                            </p>
                                        </div>
                                    )}
                                />
                                <Area 
                                    type="monotone" 
                                    dataKey="density" 
                                    stroke="#14b8a6" 
                                    fill="#14b8a6" 
                                    fillOpacity={0.3}
                                    strokeWidth={2}
                                />
                                {/* Linhas de referência com posicionamento inteligente */}
                                <ReferenceLine x={userScore} stroke="#3b82f6" strokeWidth={3} strokeDasharray="2 2">
                                    <Label 
                                        value={`Sua Nota: ${userScore.toFixed(1)}`} 
                                        position={userScore > (parseFloat(debouncedNotaCorte) || 0) ? "topLeft" : "topRight"}
                                        fill="#3b82f6" 
                                        fontSize={11} 
                                        fontWeight="bold" 
                                        offset={10}
                                    />
                                </ReferenceLine>
                                <ReferenceLine x={parseFloat(debouncedNotaCorte) || 0} stroke="#f43f5e" strokeWidth={3} strokeDasharray="4 2">
                                    <Label 
                                        value={`Corte: ${(parseFloat(debouncedNotaCorte) || 0).toFixed(1)}`} 
                                        position={Math.abs((parseFloat(debouncedNotaCorte) || 0) - userScore) < 2 ? "bottom" : "top"}
                                        fill="#f43f5e" 
                                        fontSize={11} 
                                        fontWeight="bold" 
                                        offset={Math.abs((parseFloat(debouncedNotaCorte) || 0) - userScore) < 2 ? 15 : 10}
                                    />
                                </ReferenceLine>
                                <ReferenceLine x={parseFloat(debouncedMedia) || 0} stroke="#f59e0b" strokeWidth={2} strokeDasharray="1 3">
                                    <Label 
                                        value={`Média: ${(parseFloat(debouncedMedia) || 0).toFixed(1)}`} 
                                        position="bottom" 
                                        fill="#f59e0b" 
                                        fontSize={10} 
                                        fontWeight="bold" 
                                        offset={5}
                                    />
                                </ReferenceLine>
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                ) : (
                    <div className="flex items-center justify-center h-full text-gray-500 dark:text-gray-400">
                        <div className="text-center">
                            <p className="text-lg font-medium">📊 Carregando gráfico...</p>
                            <p className="text-sm mt-2">Ajuste os parâmetros para visualizar a distribuição</p>
                        </div>
                    </div>
                )}
            </div>
            
            {/* Legenda do Gráfico */}
            <div className="bg-gray-50 dark:bg-gray-700/30 rounded-lg p-4 border border-gray-200 dark:border-gray-600">
                <h5 className="text-sm font-semibold text-gray-800 dark:text-gray-200 mb-3">📋 Como interpretar o gráfico:</h5>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                    <div className="flex items-center space-x-2">
                        <div className="w-4 h-0.5 bg-blue-500" style={{borderStyle: 'dashed'}}></div>
                        <span className="text-gray-700 dark:text-gray-300">
                            <strong className="text-blue-600 dark:text-blue-400">Linha Azul:</strong> Sua pontuação atual
                        </span>
                    </div>
                    <div className="flex items-center space-x-2">
                        <div className="w-4 h-0.5 bg-red-500" style={{borderStyle: 'dashed'}}></div>
                        <span className="text-gray-700 dark:text-gray-300">
                            <strong className="text-red-600 dark:text-red-400">Linha Vermelha:</strong> Nota de corte para aprovação
                        </span>
                    </div>
                    <div className="flex items-center space-x-2">
                        <div className="w-4 h-0.5 bg-yellow-500" style={{borderStyle: 'dotted'}}></div>
                        <span className="text-gray-700 dark:text-gray-300">
                            <strong className="text-yellow-600 dark:text-yellow-400">Linha Amarela:</strong> Nota média dos candidatos
                        </span>
                    </div>
                    <div className="flex items-center space-x-2">
                        <div className="w-4 h-2 bg-teal-300 rounded"></div>
                        <span className="text-gray-700 dark:text-gray-300">
                            <strong className="text-teal-600 dark:text-teal-400">Área Verde:</strong> Distribuição de notas simulada
                        </span>
                    </div>
                </div>
                <div className="mt-2 p-2 bg-blue-50 dark:bg-blue-900/20 rounded text-xs text-blue-800 dark:text-blue-200">
                    <strong>💡 Dica:</strong> O pico da curva representa a nota mais comum. Quanto mais à direita sua linha estiver, melhor sua classificação!
                </div>
            </div>
        </div>
    );
};

export default RankingTab;