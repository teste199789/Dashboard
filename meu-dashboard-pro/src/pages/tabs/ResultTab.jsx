import React, { useState, useMemo } from 'react';
import { useProofs } from '../../hooks/useProofs';
import toast from 'react-hot-toast';
import ResultGrid from '../../components/common/ResultGrid';
import { formatPercentAlreadyScaled } from '../../utils/formatters';
import PerformanceSummaryCard from '../../components/common/PerformanceSummaryCard';

const ResultTab = ({ proof, refreshProof }) => {
    const [isGrading, setIsGrading] = useState(false);
    const [error, setError] = useState(null);
    const { handleGradeProof } = useProofs();

    const onGradeClick = async () => {
        setIsGrading(true);
        setError(null);
        try {
            await handleGradeProof(proof.id);
            await refreshProof();
        } catch {
            setError("Falha ao corrigir a prova. Verifique se todos os gabaritos e matérias foram preenchidos corretamente.");
            toast.error("Falha ao corrigir a prova.");
        } finally {
            setIsGrading(false);
        }
    };

    const { performanceData, summaryStats } = useMemo(() => {
        if (!proof || !proof.results || proof.results.length === 0) {
            return { performanceData: null, summaryStats: null };
        }

        const subjectQuestionMap = new Map(proof.subjects.map(s => [s.disciplina || s.nome, s.questoes]));

        const detailedResults = proof.results.map(item => {
            const totalQuestoesNaMateria = subjectQuestionMap.get(item.disciplina) || 0;
            const pontuacaoLiquida = item.acertos - item.erros;
            
            const percentualBruta = totalQuestoesNaMateria > 0 ? (item.acertos / totalQuestoesNaMateria) * 100 : 0;
            const percentualLiquidos = totalQuestoesNaMateria > 0 ? Math.max(0, pontuacaoLiquida / totalQuestoesNaMateria) * 100 : 0;
            
            return { 
                ...item, 
                questoes: totalQuestoesNaMateria, 
                liquidos: pontuacaoLiquida, 
                percentualBruta, 
                percentualLiquidos 
            };
        });

        const totals = detailedResults.reduce((acc, current) => {
            acc.acertos += current.acertos;
            acc.erros += current.erros;
            acc.brancos += current.brancos;
            acc.anuladas += current.anuladas;
            acc.questoes += current.questoes;
            acc.liquidos += current.liquidos;
            return acc;
        }, { disciplina: 'Total', acertos: 0, erros: 0, brancos: 0, anuladas: 0, questoes: 0, liquidos: 0 });
        
        totals.percentualBruta = totals.questoes > 0 ? (totals.acertos / totals.questoes) * 100 : 0;
        totals.percentualLiquidos = totals.questoes > 0 ? Math.max(0, totals.liquidos / totals.questoes) * 100 : 0;
        
        const createStatObject = (item) => ({
            acertos: item ? item.acertos : 0,
            erros: item ? item.erros : 0,
            brancos: item ? item.brancos : 0,
            questoes: item ? item.questoes : 0,
            aproveitamento: item ? item.percentualLiquidos : 0,
        });
        
        const basicKnowledge = detailedResults.find(r => r.disciplina.toLowerCase().includes('básico'));
        const specificKnowledge = detailedResults.find(r => r.disciplina.toLowerCase().includes('específico'));

        const calculatedSummaryStats = {
            total: createStatObject(totals),
            basic: createStatObject(basicKnowledge),
            specific: createStatObject(specificKnowledge),
        };

        return { 
            performanceData: { detailedResults, totals }, 
            summaryStats: calculatedSummaryStats 
        };

    }, [proof]);


    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Resultado e Análise</h2>
                <button onClick={onGradeClick} disabled={isGrading} className="bg-green-600 text-white font-bold py-2 px-6 rounded-lg hover:bg-green-700 disabled:opacity-50">
                    {isGrading ? 'Corrigindo...' : 'Corrigir e Atualizar Análise'}
                </button>
            </div>

            {error && <div className="my-4 p-3 bg-red-100 text-red-700 rounded-lg">{error}</div>}
            
            {!performanceData ? (
                <div className="text-center text-gray-500 py-10 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <p>Nenhum resultado calculado ainda. Clique em "Corrigir" para ver a análise.</p>
                </div>
            ) : (
                <div className="space-y-8">
                    {/* Summary Stats Section */}
                    {summaryStats && (
                        <PerformanceSummaryCard summary={summaryStats} />
                    )}

                    {/* Tabela de Desempenho */}
                    <div>
                        <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-4">Desempenho Detalhado por Matéria</h3>
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                <thead className="bg-gray-50 dark:bg-gray-800">
                                    <tr>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">
                                            Disciplinas
                                        </th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">
                                            Acertos
                                        </th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">
                                            Erros
                                        </th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">
                                            Brancos
                                        </th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">
                                            Anuladas
                                        </th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">
                                            Questões
                                        </th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">
                                            Líquidos
                                        </th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">
                                            % Bruta
                                        </th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">
                                            % Líquidos
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                                    {performanceData.detailedResults.map((item, index) => (
                                        <tr key={index} className={item.disciplina === 'Total' ? 'font-bold bg-gray-50 dark:bg-gray-800' : ''}>
                                            <th scope="row" className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">{item.disciplina}</th>
                                            <td className="px-6 py-4 text-center">{item.acertos}</td>
                                            <td className="px-6 py-4 text-center">{item.erros}</td>
                                            <td className="px-6 py-4 text-center">{item.brancos}</td>
                                            <td className="px-6 py-4 text-center">{item.anuladas}</td>
                                            <td className="px-6 py-4 text-center">{item.questoes}</td>
                                            <td className="px-6 py-4 text-center font-bold">{item.liquidos}</td>
                                            <td className="px-6 py-4 text-center">{formatPercentAlreadyScaled(item.percentualBruta)}</td>
                                            <td className="px-6 py-4 text-center">{formatPercentAlreadyScaled(item.percentualLiquidos)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                                <tfoot className="font-bold bg-teal-50 dark:bg-teal-900/50 text-gray-800 dark:text-gray-100">
                                    <tr className="border-t-2 border-teal-200 dark:border-teal-700">
                                        <th scope="row" className="px-6 py-3 text-base">Total</th>
                                        <td className="px-6 py-3 text-center">{performanceData.totals.acertos}</td>
                                        <td className="px-6 py-3 text-center">{performanceData.totals.erros}</td>
                                        <td className="px-6 py-3 text-center">{performanceData.totals.brancos}</td>
                                        <td className="px-6 py-3 text-center">{performanceData.totals.anuladas}</td>
                                        <td className="px-6 py-3 text-center">{performanceData.totals.questoes}</td>
                                        <td className="px-6 py-3 text-center text-lg">{performanceData.totals.liquidos}</td>
                                        <td className="px-6 py-3 text-center">{formatPercentAlreadyScaled(performanceData.totals.percentualBruta)}</td>
                                        <td className="px-6 py-3 text-center">{formatPercentAlreadyScaled(performanceData.totals.percentualLiquidos)}</td>
                                    </tr>
                                </tfoot>
                            </table>
                        </div>
                    </div>

                    {/* Grade de Respostas */}
                    <ResultGrid proof={proof} />

                </div>
            )}
        </div>
    );
};

export default ResultTab;