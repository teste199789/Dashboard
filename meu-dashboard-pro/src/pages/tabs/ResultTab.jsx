import React, { useState, useMemo } from 'react';
import StatsRow from '../../components/common/StatsRow';
import { useProofs } from '../../hooks/useProofs';
import ScoreCard from '../../components/common/ScoreCard';
import * as api from '../../api/apiService';
import toast from 'react-hot-toast';

const normalizeText = (text = '') => 
    text.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

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
        } catch (err) {
            setError("Falha ao corrigir a prova. Verifique se todos os gabaritos e matérias foram preenchidos corretamente.");
            toast.error("Falha ao corrigir a prova.");
            console.error("ERRO DETALHADO NO FRONTEND:", err);
        } finally {
            setIsGrading(false);
        }
    };

    const displayData = useMemo(() => {
        if (!proof || !proof.results || proof.results.length === 0) {
            return null;
        }

        // --- LÓGICA DE CÁLCULO FINAL E CORRETA ---

        // 1. Cria um mapa para fácil acesso ao total de questões original de cada matéria
        const subjectQuestionMap = new Map(proof.subjects.map(s => [s.nome, s.questoes]));

        // 2. Calcula os dados detalhados para cada linha da tabela
        const detailedResults = proof.results.map(item => {
            // Pega o total de questões original do mapa
            const totalQuestoesNaMateria = subjectQuestionMap.get(item.disciplina) || 0;
            const acertosReais = item.acertos - item.anuladas;
            const pontuacaoLiquida = acertosReais - item.erros + item.anuladas;
            
            const universoBruto = acertosReais + item.erros;
            const percentualBruta = universoBruto > 0 ? acertosReais / universoBruto : 0;
            
            const percentualLiquidos = totalQuestoesNaMateria > 0 ? Math.max(0, pontuacaoLiquida / totalQuestoesNaMateria) : 0;
            
            return { ...item, totalQuestoes: totalQuestoesNaMateria, acertosLiquidos: pontuacaoLiquida, percentualBruta, percentualLiquidos };
        });

        // 3. Calcula a linha de "Total" a partir dos resultados detalhados
        const totaisGerais = detailedResults.reduce((acc, current) => {
            acc.acertos += current.acertos;
            acc.erros += current.erros;
            acc.brancos += current.brancos;
            acc.anuladas += current.anuladas;
            acc.acertosLiquidos += current.acertosLiquidos;
            return acc;
        }, { disciplina: 'Total', acertos: 0, erros: 0, brancos: 0, anuladas: 0, acertosLiquidos: 0 });

        totaisGerais.totalQuestoes = proof.totalQuestoes;
        const acertosReaisGerais = totaisGerais.acertos - totaisGerais.anuladas;
        const universoBrutoGeral = acertosReaisGerais + totaisGerais.erros;

        totaisGerais.percentualBruta = universoBrutoGeral > 0 ? acertosReaisGerais / universoBrutoGeral : 0;
        totaisGerais.percentualLiquidos = proof.aproveitamento;

        return { detailedResults, totals: totaisGerais };

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
            
            {!displayData ? (
                <div className="text-center text-gray-500 py-10 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <p>Nenhum resultado calculado ainda.</p>
                </div>
            ) : (
                <div>
                    <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-4">Desempenho Detalhado por Matéria</h3>
                    <div className="text-sm text-gray-800 dark:text-gray-200 border dark:border-gray-700 rounded-lg overflow-hidden">
                        <div className="hidden md:grid grid-cols-9 text-center font-semibold bg-gray-200 dark:bg-gray-700 py-3 border-b-2 dark:border-gray-600">
                            <p className="text-left pl-4">Matéria</p>
                            <p>Acertos</p><p>Erros</p><p>Brancos</p><p>Anuladas</p>
                            <p>Questões</p><p>Líquidos</p><p>% Bruta</p><p>% Líquidos</p>
                        </div>
                        <div className="divide-y dark:divide-gray-700">
                            {displayData.detailedResults.map((item, index) => <StatsRow key={index} item={item} />)}
                        </div>
                        <StatsRow item={displayData.totals} isFooter={true} />
                    </div>
                </div>
            )}
        </div>
    );
};

export default ResultTab;