import React, { createContext, useState, useEffect, useMemo, useCallback, useContext } from 'react';
import * as api from '../api/apiService';
import toast from 'react-hot-toast';

export const ProofsContext = createContext();

// eslint-disable-next-line react-refresh/only-export-components
export const useProofs = () => {
    return useContext(ProofsContext);
};

export const ProofsProvider = ({ children }) => {
    const [proofs, setProofs] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [modalState, setModalState] = useState({ isOpen: false, proofId: null });
    const [dashboardFilter, setDashboardFilter] = useState('TODOS');

    const fetchProofs = useCallback(async () => {
        setError(null);
        try {
            const data = await api.getProofs();
            setProofs(data);
        } catch (e) {
            console.error("Erro ao buscar dados:", e);
            setError("Não foi possível carregar os dados.");
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        setIsLoading(true);
        fetchProofs();
    }, [fetchProofs]);

    const handleAddProof = async (newProofData) => {
        const newProof = await api.addProof(newProofData);
        await fetchProofs();
        return newProof;
    };

    const handleGradeProof = async (proofId) => {
        await api.gradeProof(proofId);
        const updatedProof = await api.getProofById(proofId);
        setProofs(currentList => 
            currentList.map(p => 
                p.id === proofId ? updatedProof : p
            )
        );
        return true;
    };

    const openDeleteModal = (id) => setModalState({ isOpen: true, proofId: id });
    const closeDeleteModal = () => setModalState({ isOpen: false, proofId: null });

    const handleDeleteProof = async () => {
        const id = modalState.proofId;
        if (!id) return;
        try {
            await api.deleteProof(id);
            toast.success("Item deletado com sucesso!");
            closeDeleteModal();
            fetchProofs();
        } catch {
            toast.error("Falha ao deletar o item.");
            setError("Falha ao deletar o item.");
            closeDeleteModal();
        }
    };

    const consolidatedData = useMemo(() => {
        const filteredProofs = proofs.filter(proof => {
            if (dashboardFilter === 'TODOS') return true;
            return (proof.type || 'CONCURSO') === dashboardFilter;
        });

        const disciplineTotals = {};

        // Passo 1: Agregue os resultados brutos do backend
        filteredProofs.forEach(proof => {
            if (proof.results && proof.results.length > 0) {
                proof.results.forEach(result => {
                    const { disciplina, acertos, erros, brancos, anuladas } = result;
                    if (!disciplineTotals[disciplina]) {
                        disciplineTotals[disciplina] = { disciplina, acertos: 0, erros: 0, brancos: 0, anuladas: 0, totalQuestoes: 0 };
                    }
                    disciplineTotals[disciplina].acertos += acertos;
                    disciplineTotals[disciplina].erros += erros;
                    disciplineTotals[disciplina].brancos += brancos;
                    disciplineTotals[disciplina].anuladas += anuladas;
                    
                    // Encontra a matéria correspondente para somar o total de questões
                    const subjectInfo = proof.subjects.find(s => s.nome === disciplina);
                    if (subjectInfo) {
                        disciplineTotals[disciplina].totalQuestoes += subjectInfo.questoes;
                    }
                });
            }
        });

        // Passo 2: Calcule os percentuais e pontos líquidos para cada disciplina
        const processedDisciplinas = Object.values(disciplineTotals).map((totais, index) => {
            const liquidos = totais.acertos - totais.erros;
            const percentualBruta = totais.totalQuestoes > 0 ? (totais.acertos / totais.totalQuestoes) : 0;
            const percentualLiquidos = totais.totalQuestoes > 0 ? Math.max(0, liquidos / totais.totalQuestoes) : 0;
            return {
                id: index,
                ...totais,
                questoes: totais.totalQuestoes, // Renomeia para consistência
                liquidos,
                percentualBruta,
                percentualLiquidos,
            };
        });

        // Passo 3: Calcule os totais gerais a partir dos dados já processados
        const totaisGerais = processedDisciplinas.reduce((acc, current) => {
            acc.acertos += current.acertos;
            acc.erros += current.erros;
            acc.brancos += current.brancos;
            acc.anuladas += current.anuladas;
            acc.questoes += current.questoes;
            return acc;
        }, { disciplina: 'Total', acertos: 0, erros: 0, brancos: 0, anuladas: 0, questoes: 0 });

        totaisGerais.liquidos = totaisGerais.acertos - totaisGerais.erros;
        totaisGerais.percentualBruta = totaisGerais.questoes > 0 ? (totaisGerais.acertos / totaisGerais.questoes) : 0;
        totaisGerais.percentualLiquidos = totaisGerais.questoes > 0 ? Math.max(0, totaisGerais.liquidos / totaisGerais.questoes) : 0;
        
        return { disciplinas: processedDisciplinas, totais: totaisGerais };
    }, [proofs, dashboardFilter]);

    
    const value = {
        proofs,
        consolidatedData,
        isLoading,
        error,
        modalState,
        dashboardFilter,
        setDashboardFilter,
        fetchProofs,
        handleAddProof,
        openDeleteModal,
        closeDeleteModal,
        handleDeleteProof,
        handleGradeProof,
    };

    return <ProofsContext.Provider value={value}>{children}</ProofsContext.Provider>;
};