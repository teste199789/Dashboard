import React, { useState, useMemo, useEffect } from 'react';
import * as api from '../../api/apiService';
import toast from 'react-hot-toast';
import { calculatePercentile, calculatePosition, generateDistributionData } from '../../utils/simulation';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, Label } from 'recharts';
import StatCard from '../../components/common/StatCard';

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

    // Estado para os parâmetros da simulação, inicializados com dados da prova ou padrões
    const [inscritos, setInscritos] = useState(proof.inscritos || 1000);
    const [media, setMedia] = useState(proof.simulacaoMedia || (userScore * 0.9).toFixed(1));
    const [desvioPadrao, setDesvioPadrao] = useState(proof.simulacaoDesvioPadrao || 2.0);
    const [notaCorte, setNotaCorte] = useState(proof.simulacaoNotaDeCorte || (userScore * 0.95).toFixed(1));
    
    const [isSaving, setIsSaving] = useState(false);

    // Efeito para resetar os valores padrão quando a prova mudar
    useEffect(() => {
        setInscritos(proof.inscritos || 1000);
        setMedia(proof.simulacaoMedia || (userScore * 0.9).toFixed(1));
        setDesvioPadrao(proof.simulacaoDesvioPadrao || 2.0);
        setNotaCorte(proof.simulacaoNotaDeCorte || (userScore * 0.95).toFixed(1));
    }, [proof, userScore]);

    // Cálculos estatísticos em tempo real usando as funções do simulation.js
    const rankingStats = useMemo(() => {
        const mean = parseFloat(media);
        const stdDev = parseFloat(desvioPadrao);
        const cutoff = parseFloat(notaCorte);
        const totalCandidates = parseInt(inscritos, 10);

        if (isNaN(mean) || isNaN(stdDev) || stdDev <= 0 || isNaN(totalCandidates) || totalCandidates <= 0) {
            return { percentile: 0, position: 0, approvedCount: 0, distributionData: [] };
        }
        
        const userPercentile = calculatePercentile(userScore, mean, stdDev);
        const userPosition = calculatePosition(userPercentile, totalCandidates);

        const cutoffPercentile = calculatePercentile(cutoff, mean, stdDev);
        const approvedCount = Math.round((1 - cutoffPercentile) * totalCandidates);
        
        const distributionData = generateDistributionData(mean, stdDev);

        return {
            percentile: userPercentile * 100,
            position: userPosition,
            approvedCount,
            distributionData,
        };
    }, [userScore, media, desvioPadrao, notaCorte, inscritos]);

    // Função para salvar todos os parâmetros da simulação
    const handleSaveSimulation = async () => {
        setIsSaving(true);
        try {
            const params = {
                inscritos: parseInt(inscritos, 10),
                simulacaoMedia: parseFloat(media),
                simulacaoDesvioPadrao: parseFloat(desvioPadrao),
                simulacaoNotaDeCorte: parseFloat(notaCorte),
            };
            await api.updateProofDetails(proof.id, params);
            toast.success('Parâmetros da simulação salvos!');
            if (refreshProof) refreshProof();
        } catch (error) {
            toast.error('Falha ao salvar os parâmetros.');
            console.error(error);
        } finally {
            setIsSaving(false);
        }
    };

    // Mensagem exibida se a prova ainda não foi corrigida
    if (!proof.results || proof.results.length === 0) {
        return (
            <div className="p-6 text-center text-gray-500 dark:text-gray-400">
                <h3 className="text-lg font-semibold">Ranking Indisponível</h3>
                <p className="mt-2">É necessário corrigir a prova na aba "Resultado Final" antes de gerar a simulação.</p>
            </div>
        );
    }

    const renderCustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-white/80 dark:bg-black/80 backdrop-blur-sm p-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-lg">
                    <p className="font-bold">{`Nota: ${label}`}</p>
                    <p className="text-sm">{`Densidade de candidatos: ${(payload[0].value * 100).toFixed(2)}%`}</p>
                </div>
            );
        }
        return null;
    };

    const InputField = ({ label, value, onChange, min, max, step, placeholder }) => (
        <div className="flex-grow min-w-[150px]">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{label}</label>
            <input 
                type="number"
                value={value}
                onChange={e => onChange(e.target.value)}
                min={min}
                max={max}
                step={step}
                placeholder={placeholder}
                className="mt-1 block w-full p-2 border bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 rounded-md shadow-sm"
            />
            <input
                type="range"
                value={value}
                onChange={e => onChange(e.target.value)}
                min={min}
                max={max}
                step={step}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700 mt-2"
            />
        </div>
    );

    return (
        <div className="p-4 md:p-6 space-y-6">
            <div>
                <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100">Ranking Simulado e Nota de Corte</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Ajuste os valores para obter uma estimativa estatística da sua classificação.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                <InputField label="Candidatos Inscritos" value={inscritos} onChange={setInscritos} min="1" max="200000" step="100" placeholder="Ex: 50000" />
                <InputField label="Nota Média (Estimada)" value={media} onChange={setMedia} min="0" max={proof.totalQuestoes} step="0.1" placeholder="Ex: 65.5" />
                <InputField label="Desvio Padrão (1.5 a 3.0)" value={desvioPadrao} onChange={setDesvioPadrao} min="0.1" max="10" step="0.1" placeholder="Ex: 2.0" />
                <InputField label="Nota de Corte (Simulada)" value={notaCorte} onChange={setNotaCorte} min="0" max={proof.totalQuestoes} step="0.1" placeholder="Ex: 70.0" />
                </div>

            <div className="flex justify-end">
                <button onClick={handleSaveSimulation} disabled={isSaving} className="bg-teal-500 text-white font-bold py-2 px-4 rounded-lg hover:bg-teal-600 transition-colors disabled:bg-gray-400">
                    {isSaving ? 'Salvando...' : 'Salvar Parâmetros'}
                </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard title="Sua Nota Final" value={userScore.toFixed(2)} color="blue" />
                <StatCard title="Sua Posição (Simulada)" value={`${rankingStats.position}º`} subValue={`de ${inscritos}`} color="gray" />
                <StatCard title="Percentil" value={`${rankingStats.percentile.toFixed(2)}%`} description={`Você está à frente de ${rankingStats.percentile.toFixed(0)}% dos candidatos`} color="gray" />
                <StatCard title="Aprovados (Simulado)" value={rankingStats.approvedCount} description="candidatos acima do corte" color="green" />
                </div>

            <div className="bg-white dark:bg-gray-800/50 p-4 rounded-xl shadow-lg mt-6">
                <h4 className="text-lg font-bold mb-4 text-gray-800 dark:text-gray-100">Distribuição de Notas (Curva de Sino)</h4>
                <div style={{ width: '100%', height: 300 }}>
                    <ResponsiveContainer>
                        <AreaChart data={rankingStats.distributionData} margin={{ top: 20, right: 30, left: 0, bottom: 20 }}>
                            <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.2} />
                            <XAxis dataKey="x" type="number" domain={['dataMin', 'dataMax']} stroke="rgb(156 163 175)" name="Nota"/>
                            <YAxis tickFormatter={(tick) => `${(tick * 100).toFixed(1)}%`} stroke="rgb(156 163 175)" name="Densidade de Candidatos"/>
                            <Tooltip content={renderCustomTooltip} />
                            <Area type="monotone" dataKey="y" stroke="#14b8a6" fill="#14b8a6" fillOpacity={0.3} name="Densidade"/>
                            
                            <ReferenceLine x={userScore} stroke="#3b82f6" strokeWidth={2}>
                               <Label value="Sua Nota" position="top" fill="#3b82f6" fontSize={12} fontWeight="bold" />
                            </ReferenceLine>

                            <ReferenceLine x={parseFloat(notaCorte)} stroke="#22c55e" strokeWidth={2} strokeDasharray="3 3">
                               <Label value="Nota de Corte" position="top" fill="#22c55e" fontSize={12} fontWeight="bold" />
                            </ReferenceLine>
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
};

export default RankingTab;