import React, { useState, useMemo, useEffect } from 'react';
import * as api from '../../api/apiService';
import toast from 'react-hot-toast';
import { calculatePercentile, calculatePosition, generateDistributionData } from '../../utils/simulation';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, Label } from 'recharts';
import { useDebouncedState } from '../../hooks/useDebouncedState';
import StatCard from '../../components/common/StatCard';
import RankingProgress from '../../components/common/RankingProgress';

// Componente de Input Reutilizável (mantido da refatoração anterior)
const InputField = ({ label, value, onChange, min, max, step, type = "number" }) => (
    <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">{label}</label>
        <input
            type={type}
            value={value}
            onChange={e => onChange(e.target.value)}
            min={min}
            max={max}
            step={step}
            className="w-full p-3 border bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-colors text-center font-mono text-base"
        />
        <input
            type="range"
            value={value}
            onChange={e => onChange(e.target.value)}
            min={min}
            max={max}
            step={step}
            className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
        />
    </div>
);

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

    // Efeito para inicializar/resetar os valores quando a prova muda
    useEffect(() => {
        setInscritos(String(proof.inscritos || 1000));
        setMedia(String(proof.simulacaoMedia || (userScore > 0 ? (userScore * 0.9).toFixed(1) : '50.0')));
        setDesvioPadrao(String(proof.simulacaoDesvioPadrao || (proof.totalQuestoes * 0.1).toFixed(1) || '10.0'));
        setNotaCorte(String(proof.simulacaoNotaDeCorte || (userScore > 0 ? (userScore * 0.95).toFixed(1) : '60.0')));
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
        
        return {
            percentile: userPercentile * 100,
            position: userPosition,
            competitorsAbove: Math.max(0, userPosition - 1),
            isAboveCutoff: userScore >= numCorte,
            approvedCount: Math.max(0, Math.round((1 - cutoffPercentile) * numInscritos)),
            distributionData: generateDistributionData(numMedia, numDesvio, proof.totalQuestoes)
        };
    }, [userScore, debouncedInscritos, debouncedMedia, debouncedDesvioPadrao, debouncedNotaCorte, proof.totalQuestoes]);

    const handleSaveSimulation = async () => {
        setIsSaving(true);
        // FIX: Garante que valores vazios se tornem `null` e o resto se torne `float`.
        const safeParseFloat = (val) => val === '' || val === null ? null : parseFloat(val);
        const safeParseInt = (val) => val === '' || val === null ? null : parseInt(val, 10);

        const params = {
            inscritos: safeParseInt(inscritos),
            simulacaoMedia: safeParseFloat(media),
            simulacaoDesvioPadrao: safeParseFloat(desvioPadrao),
            simulacaoNotaDeCorte: safeParseFloat(notaCorte),
        };

        try {
            await api.updateProofDetails(proof.id, params);
            toast.success('Parâmetros da simulação salvos!');
            if (refreshProof) refreshProof();
        } catch (error) {
            toast.error('Falha ao salvar. Verifique o console do backend para mais detalhes.');
            console.error('[SAVE] Erro:', error);
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

    return (
        <div className="p-4 sm:p-6 space-y-8">
            {/* Seção de Stats Detalhados */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <StatCard title="Sua Nota" value={userScore.toFixed(2)} color="blue" />
                <StatCard title="Percentil" value={`${rankingStats.percentile.toFixed(1)}%`} subValue={`À frente de ${rankingStats.competitorsAbove.toLocaleString('pt-BR')} candidatos`} color="green" />
                <StatCard title="Status" value={rankingStats.isAboveCutoff ? 'Aprovado' : 'Reprovado'} subValue={`Nota de corte: ${(parseFloat(debouncedNotaCorte) || 0).toFixed(1)}`} color={rankingStats.isAboveCutoff ? 'green' : 'red'} />
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
                    <InputField label="Candidatos Inscritos" value={inscritos} onChange={setInscritos} min="1" max={Math.max(200000, proof.inscritos || 0)} step="100" />
                    <InputField label="Nota de Corte Simulada" value={notaCorte} onChange={setNotaCorte} min="0" max={proof.totalQuestoes} step="0.1" />
                    {showAdvancedControls && (
                        <>
                            <InputField label="Nota Média Estimada" value={media} onChange={setMedia} min="0" max={proof.totalQuestoes} step="0.1" />
                            <InputField label="Desvio Padrão" value={desvioPadrao} onChange={setDesvioPadrao} min="0.1" max={proof.totalQuestoes / 2} step="0.1" />
                        </>
                    )}
                </div>
                <div className="flex justify-end mt-6">
                    <button onClick={handleSaveSimulation} disabled={isSaving} className="bg-teal-600 hover:bg-teal-700 disabled:bg-gray-400 text-white font-semibold py-3 px-6 rounded-lg transition-colors shadow-sm">
                        {isSaving ? 'Salvando...' : 'Salvar Parâmetros'}
                    </button>
                </div>
            </div>

            {/* Gráfico de Distribuição */}
            <div className="bg-white dark:bg-gray-800/50 rounded-xl p-6 border border-gray-200 dark:border-gray-700 h-96">
                <h4 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4">Distribuição de Notas (Curva Normal)</h4>
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={rankingStats.distributionData} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.2} />
                        <XAxis dataKey="score" tick={{ fill: 'currentColor', fontSize: 12 }} />
                        <YAxis tickFormatter={(value) => `${(value * 100).toFixed(0)}%`} tick={{ fill: 'currentColor', fontSize: 12 }} />
                        <Tooltip
                            content={({ active, payload, label }) => active && payload?.length && (
                                <div className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm p-3 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl">
                                    <p className="font-semibold text-gray-800 dark:text-gray-100">{`Nota: ${label}`}</p>
                                    <p className="text-sm text-teal-600 dark:text-teal-400">{`Densidade: ~${(payload[0].value * 100).toFixed(2)}%`}</p>
                                </div>
                            )}
                        />
                        <Area type="monotone" dataKey="density" stroke="#14b8a6" fill="#14b8a6" fillOpacity={0.3} />
                        <ReferenceLine x={userScore} stroke="#3b82f6" strokeWidth={2}>
                            <Label value={`Sua Nota (${userScore.toFixed(1)})`} position="top" fill="#3b82f6" fontSize={12} fontWeight="bold" />
                        </ReferenceLine>
                        <ReferenceLine x={parseFloat(debouncedNotaCorte) || 0} stroke="#f43f5e" strokeWidth={2} strokeDasharray="3 3">
                            <Label value={`Corte (${(parseFloat(debouncedNotaCorte) || 0).toFixed(1)})`} position="top" fill="#f43f5e" fontSize={12} fontWeight="bold" />
                        </ReferenceLine>
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

export default RankingTab;