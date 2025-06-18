import React, { useState, useMemo, useEffect } from 'react';
import * as api from '../../api/apiService';

// Função para calcular o desempenho original a partir dos resultados já corrigidos
const calculateOriginalPerformance = (proof) => {
    if (!proof || !proof.results || proof.results.length === 0) {
        return { score: 0, acertos: 0, erros: 0 };
    }
    
    // Soma os totais de acertos e erros que vieram do backend
    const totals = proof.results.reduce((acc, r) => {
        acc.acertos += r.acertos;
        acc.erros += r.erros;
        return acc;
    }, { acertos: 0, erros: 0 });

    let score = 0;
    // A pontuação líquida já considera os pontos das anuladas no total de acertos
    if (proof.tipoPontuacao === 'liquida') {
        score = totals.acertos - totals.erros;
    } else {
        score = totals.acertos;
    }
    
    return { 
        score, 
        acertos: totals.acertos, 
        erros: totals.erros 
    };
};

const SimulateAnnulmentTab = ({ proof }) => {
    // Carrega a simulação salva do banco de dados na primeira vez
    const initialSimulatedSet = useMemo(() => new Set(proof.simulacaoAnuladas?.split(',').filter(Boolean) || []), [proof.simulacaoAnuladas]);
    const [selectedAnnulments, setSelectedAnnulments] = useState(initialSimulatedSet);
    const [isSaving, setIsSaving] = useState(false);

    // Garante que o estado seja atualizado se a prova for recarregada
    useEffect(() => {
        setSelectedAnnulments(new Set(proof.simulacaoAnuladas?.split(',').filter(Boolean) || []));
    }, [proof.simulacaoAnuladas]);

    // Lógica de cálculo unificada e corrigida
    const performanceData = useMemo(() => {
        const original = calculateOriginalPerformance(proof);
        
        // Gabarito a ser usado: definitivo tem prioridade, senão o preliminar.
        const officialAnswers = proof.gabaritoDefinitivo || proof.gabaritoPreliminar;

        if (!proof.userAnswers || !officialAnswers) {
             return { original, simulated: original, difference: 0 };
        }

        const userMap = new Map(proof.userAnswers.split(',').map(p => p.split(':')));
        const officialMap = new Map(officialAnswers.split(',').map(p => p.split(':')));

        let simulatedAcertos = original.acertos;
        let simulatedErros = original.erros;

        selectedAnnulments.forEach(qStr => {
            const userAnswer = userMap.get(qStr);
            const officialAnswer = officialMap.get(qStr);

            // A questão é considerada anulada para o simulador.
            // O ponto só é adicionado se o usuário não tinha acertado originalmente.
            if (userAnswer !== officialAnswer) {
                // Se o usuário tinha errado (deu uma resposta), o erro é removido.
                // Isso é crucial para a pontuação líquida.
                if (userAnswer && userAnswer !== '') { // Verifica se houve uma resposta (não foi em branco)
                    simulatedErros--;
                }
                // Em ambos os casos (erro ou branco), ele ganha o ponto do acerto.
                simulatedAcertos++;
            }
        });

        let simulatedScore = simulatedAcertos;
        if (proof.tipoPontuacao === 'liquida') {
            simulatedScore = simulatedAcertos - simulatedErros;
        }

        return {
            original,
            simulated: { score: simulatedScore, acertos: simulatedAcertos, erros: simulatedErros },
            difference: simulatedScore - original.score,
        };
    }, [proof, selectedAnnulments]);


    const handleToggleAnnulment = (qNumber) => {
        setSelectedAnnulments(prev => {
            const newSet = new Set(prev);
            const qStr = String(qNumber);
            newSet.has(qStr) ? newSet.delete(qStr) : newSet.add(qStr);
            return newSet;
        });
    };

    const handleSaveSimulation = async () => {
        setIsSaving(true);
        try {
            const simulacaoString = Array.from(selectedAnnulments).join(',');
            await api.updateProofDetails(proof.id, { simulacaoAnuladas: simulacaoString });
            alert('Simulação salva com sucesso!');
        } catch (error) {
            alert('Falha ao salvar a simulação.');
        } finally {
            setIsSaving(false);
        }
    };
    
    const clearSelection = () => {
        setSelectedAnnulments(new Set());
    };
    
    const userAnswersMap = useMemo(() => new Map(proof.userAnswers?.split(',').map(p => p.split(':'))), [proof.userAnswers]);
    const officialAnswersForDisplay = proof.gabaritoDefinitivo || proof.gabaritoPreliminar;
    const officialAnswersMap = useMemo(() => new Map(officialAnswersForDisplay?.split(',').map(p => p.split(':'))), [officialAnswersForDisplay]);
    const questions = Array.from({ length: proof.totalQuestoes || 0 }, (_, i) => i + 1);

    return (
        <div className="p-6">
            <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
                <div>
                    <h3 className="text-xl font-bold text-gray-800">Simulador de Anulações</h3>
                    <p className="text-sm text-gray-500">Selecione questões para ver o impacto na sua nota. Cada questão anulada é contada como um acerto.</p>
                </div>
                <div className="flex items-center gap-2">
                    <button onClick={handleSaveSimulation} disabled={isSaving} className="font-semibold bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition disabled:opacity-50">
                        {isSaving ? 'Salvando...' : 'Salvar Simulação'}
                    </button>
                    <button onClick={clearSelection} className="font-semibold bg-gray-200 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-300 transition">Limpar Seleção</button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {/* Painel de Resultados */}
                <div className="md:col-span-1 lg:col-span-1 space-y-4">
                    <div className="p-4 bg-gray-100 rounded-lg text-center">
                        <p className="font-bold text-gray-700">Pontuação Original</p>
                        <p className="text-4xl font-light text-gray-800">{performanceData.original.score.toFixed(2).replace('.',',')}</p>
                        <p className="text-sm text-gray-600 mt-1">
                            {performanceData.original.acertos} acertos, {performanceData.original.erros} erros
                        </p>
                    </div>
                    <div className="p-4 bg-blue-100 rounded-lg border border-blue-300 text-center">
                        <p className="font-bold text-blue-800">Pontuação Simulada</p>
                        <p className="text-4xl font-bold text-blue-600">{performanceData.simulated.score.toFixed(2).replace('.',',')}</p>
                        <p className="text-sm text-blue-600 mt-1">{performanceData.simulated.acertos} acertos, {performanceData.simulated.erros} erros</p>
                        <p className={`font-bold text-lg mt-1 ${performanceData.difference > 0 ? 'text-green-600' : (performanceData.difference < 0 ? 'text-red-600' : 'text-gray-600')}`}>
                            {performanceData.difference > 0 ? '+' : ''}{performanceData.difference.toFixed(2).replace('.',',')} pontos
                        </p>
                    </div>
                </div>

                {/* --- SELETOR DE QUESTÕES (CÓDIGO RESTAURADO) --- */}
                <div className="md:col-span-2 lg:col-span-3 p-4 border rounded-lg">
                    <div className="flex justify-between items-center mb-4">
                        <p className="font-bold">Selecione as questões:</p>
                        <span className="text-sm font-medium text-gray-600 bg-gray-200 px-3 py-1 rounded-full">
                            {selectedAnnulments.size} selecionada(s)
                        </span>
                    </div>
                    <div className="grid grid-cols-5 sm:grid-cols-10 gap-2">
                        {questions.map(qNumber => {
                            const qStr = String(qNumber);
                            const userAnswer = userAnswersMap.get(qStr);
                            const officialAnswer = officialAnswersMap.get(qStr);
                            let questionColor = 'bg-gray-100 border-gray-300 text-gray-600';

                            if (userAnswer && officialAnswer && officialAnswer !== 'N') {
                                if (userAnswer === officialAnswer) {
                                    questionColor = 'bg-green-200 border-green-400 text-green-800';
                                } else {
                                    questionColor = 'bg-red-200 border-red-400 text-red-800';
                                }
                            }
                            
                            const isSelectedForAnnulment = selectedAnnulments.has(qStr);
                            const labelClass = `flex items-center justify-center p-2 border-2 rounded-md cursor-pointer transition font-semibold ${isSelectedForAnnulment ? 'ring-4 ring-blue-400 ring-offset-0 bg-blue-500 border-blue-600 text-white' : questionColor}`;

                            return (
                                <div key={qNumber}>
                                    <label className={labelClass}>
                                        <input
                                            type="checkbox"
                                            className="hidden"
                                            checked={isSelectedForAnnulment}
                                            onChange={() => handleToggleAnnulment(qNumber)}
                                        />
                                        {qNumber}
                                    </label>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SimulateAnnulmentTab;