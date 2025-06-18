import React, { useState, useMemo, useEffect } from 'react';
import * as api from '../../api/apiService';
import toast from 'react-hot-toast';

// Função para gerar uma distribuição normal (Curva de Sino)
const generateNormalDistribution = (mean, stdDev, count, maxScore, minScore) => {
    let scores = [];
    for (let i = 0; i < count; i++) {
        let u = 0, v = 0;
        while(u === 0) u = Math.random();
        while(v === 0) v = Math.random();
        let num = Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
        num = num * stdDev + mean;
        num = Math.round(num);
        num = Math.min(maxScore, Math.max(minScore, num));
        scores.push(num);
    }
    return scores;
};

const RankingTab = ({ proof }) => {
    const userScore = useMemo(() => {
        if (!proof || !proof.results || proof.results.length === 0) return 0;
        const totals = proof.results.reduce((acc, r) => {
            acc.acertos += r.acertos;
            acc.erros += r.erros;
            return acc;
        }, { acertos: 0, erros: 0 });
        return proof.tipoPontuacao === 'liquida' ? totals.acertos - totals.erros : totals.acertos;
    }, [proof]);

    const [inscritos, setInscritos] = useState(proof.inscritos || 1000);
    const [estimatedCutoff, setEstimatedCutoff] = useState(0);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        setEstimatedCutoff(Math.round(userScore * 0.95));
    }, [userScore]);

    const simulatedScores = useMemo(() => {
        if (!proof.totalQuestoes || userScore === undefined) return [];
        
        const candidateCount = inscritos > 1 ? inscritos - 1 : 999;
        const stdDev = (proof.totalQuestoes * 0.20); 
        const mean = estimatedCutoff - (stdDev / 2);
        const minScorePossible = proof.tipoPontuacao === 'liquida' ? -Math.round(proof.totalQuestoes / 4) : 0;

        const population = generateNormalDistribution(mean, stdDev, candidateCount, proof.totalQuestoes, minScorePossible);
        
        population.push(userScore);
        return population.sort((a, b) => b - a);
    }, [proof.totalQuestoes, proof.tipoPontuacao, userScore, estimatedCutoff, inscritos]);

    const rankingStats = useMemo(() => {
        if (simulatedScores.length === 0) return { userRank: 0, totalCandidates: 0, percentile: 0, aboveCutoff: 0 };
        
        const userRank = simulatedScores.indexOf(userScore) + 1;
        const totalCandidates = simulatedScores.length;
        const percentile = totalCandidates > 1 ? ((totalCandidates - userRank) / (totalCandidates - 1)) * 100 : 100;
        const aboveCutoff = simulatedScores.filter(score => score >= estimatedCutoff).length;

        return { userRank, totalCandidates, percentile, aboveCutoff };
    }, [simulatedScores, userScore, estimatedCutoff]);

    const handleSaveInscritos = async () => {
        setIsSaving(true);
        try {
            await api.updateProofDetails(proof.id, { inscritos: parseInt(inscritos) || null });
            toast.success('Número de inscritos salvo!');
        } catch (error) {
            toast.error('Falha ao salvar o número de inscritos.');
        } finally {
            setIsSaving(false);
        }
    };

    if (!proof.results || proof.results.length === 0) {
        return (
            <div className="p-6 text-center text-gray-500 dark:text-gray-400">
                <h3 className="text-lg font-semibold">Ranking Indisponível</h3>
                <p className="mt-2">É necessário corrigir a prova na aba "Resultado Final" antes de gerar a simulação de ranking.</p>
            </div>
        )
    }

    return (
        <div className="p-6 space-y-6">
            <div>
                <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100">Ranking Simulado e Nota de Corte</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Ajuste os valores para obter uma estimativa da sua classificação.</p>
            </div>

            <div className="flex flex-wrap items-end gap-4 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                <div className="flex-grow min-w-[150px]">
                    <label htmlFor="inscritos" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Candidatos Inscritos:</label>
                    <input type="number" id="inscritos" placeholder="Ex: 50000" value={inscritos} onChange={(e) => setInscritos(e.target.value)}
                        className="mt-1 block w-full p-2 border bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 rounded-md shadow-sm"/>
                </div>
                <div className="flex-grow min-w-[150px]">
                    <label htmlFor="cutoff" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Sua estimativa de Nota de Corte:</label>
                    <input type="number" id="cutoff" value={estimatedCutoff} onChange={(e) => setEstimatedCutoff(Number(e.target.value))}
                        className="mt-1 block w-full p-2 border bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 rounded-md shadow-sm"/>
                </div>
                <button onClick={handleSaveInscritos} disabled={isSaving} className="bg-teal-500 text-white font-bold py-2 px-4 rounded-lg hover:bg-teal-600 transition-colors h-fit">
                    {isSaving ? 'Salvando...' : 'Salvar Inscritos'}
                </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-center">
                <div className="bg-blue-100 dark:bg-blue-900/50 p-4 rounded-lg">
                    <p className="text-sm font-bold text-blue-800 dark:text-blue-300">Sua Nota Final</p>
                    <p className="text-3xl font-extrabold text-blue-600 dark:text-blue-400">{userScore.toFixed(2).replace('.',',')}</p>
                </div>
                <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg">
                    <p className="text-sm font-bold text-gray-600 dark:text-gray-300">Sua Posição (Simulada)</p>
                    <p className="text-3xl font-extrabold text-gray-800 dark:text-gray-100">{rankingStats.userRank}º <span className="text-lg font-medium text-gray-500">de {rankingStats.totalCandidates}</span></p>
                </div>
                <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg">
                    <p className="text-sm font-bold text-gray-600 dark:text-gray-300">Percentil</p>
                    <p className="text-3xl font-extrabold text-gray-800 dark:text-gray-100">{rankingStats.percentile.toFixed(2).replace('.',',')}%</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Você está à frente de {rankingStats.percentile.toFixed(0)}% dos candidatos</p>
                </div>
                <div className="bg-green-100 dark:bg-green-900/50 p-4 rounded-lg">
                    <p className="text-sm font-bold text-green-800 dark:text-green-300">Aprovados (Simulado)</p>
                    <p className="text-3xl font-extrabold text-green-600 dark:text-green-400">{rankingStats.aboveCutoff}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">candidatos acima do corte</p>
                </div>
            </div>
        </div>
    );
};

export default RankingTab;