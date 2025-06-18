import React, { createContext, useState, useEffect, useMemo, useCallback, useContext } from 'react'; // <-- useContext adicionado aqui
import * as api from '../api/apiService';
import toast from 'react-hot-toast';

export const ProofsContext = createContext();

export const useProofs = () => {
    // Agora o useContext está definido e esta função funcionará
    return useContext(ProofsContext);
};

export const ProofsProvider = ({ children }) => {
    const [proofsList, setProofsList] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [modalState, setModalState] = useState({ isOpen: false, proofId: null });
    const [dashboardFilter, setDashboardFilter] = useState('TODOS');

    const fetchProofs = useCallback(async () => {
        setError(null);
        try {
            const data = await api.getProofs();
            setProofsList(data);
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
        try {
            const newProof = await api.addProof(newProofData);
            await fetchProofs();
            return newProof;
        } catch (error) {
            setError("Falha ao criar prova/simulado.");
            throw error;
        }
    };

    const handleGradeProof = async (proofId) => {
        try {
            await api.gradeProof(proofId);
            const updatedProof = await api.getProofById(proofId);
            setProofsList(currentList => 
                currentList.map(p => 
                    p.id === proofId ? updatedProof : p
                )
            );
            return true;
        } catch(err) {
            throw err;
        }
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
        } catch (error) {
            toast.error("Falha ao deletar o item.");
            setError("Falha ao deletar o item.");
            closeDeleteModal();
        }
    };

    const consolidatedData = useMemo(() => {
        const filteredProofs = proofsList.filter(proof => {
            if (dashboardFilter === 'TODOS') return true;
            return (proof.type || 'CONCURSO') === dashboardFilter;
        });
        const disciplineTotals = {};
        filteredProofs.forEach(proof => {
            if (proof.results && proof.results.length > 0 && proof.subjects && proof.subjects.length > 0) {
                const subjectQuestionMap = new Map(proof.subjects.map(s => [s.nome, s.questoes]));
                proof.results.forEach(result => {
                    const { disciplina, acertos, erros, brancos, anuladas } = result;
                    if (!disciplineTotals[disciplina]) {
                        disciplineTotals[disciplina] = { acertos: 0, erros: 0, brancos: 0, anuladas: 0, totalQuestoes: 0 };
                    }
                    disciplineTotals[disciplina].acertos += acertos;
                    disciplineTotals[disciplina].erros += erros;
                    disciplineTotals[disciplina].brancos += brancos;
                    disciplineTotals[disciplina].anuladas += anuladas;
                    disciplineTotals[disciplina].totalQuestoes += subjectQuestionMap.get(disciplina) || 0;
                });
            }
        });
        const processedDisciplinas = Object.entries(disciplineTotals).map(([nome, totais], index) => {
            const acertosReais = totais.acertos - totais.anuladas;
            const pontuacaoLiquida = acertosReais - totais.erros;
            const universoBruto = acertosReais + totais.erros;
            return {
                id: index, disciplina: nome, ...totais, acertosLiquidos: pontuacaoLiquida,
                percentualBruta: universoBruto > 0 ? acertosReais / universoBruto : 0,
                percentualLiquidos: totais.totalQuestoes > 0 ? Math.max(0, pontuacaoLiquida / totais.totalQuestoes) : 0,
            };
        });
        const totaisGerais = processedDisciplinas.reduce((acc, current) => {
            acc.acertos += current.acertos;
            acc.erros += current.erros;
            acc.brancos += current.brancos;
            acc.anuladas += current.anuladas;
            acc.totalQuestoes += current.totalQuestoes;
            return acc;
        }, { disciplina: 'Total', acertos: 0, erros: 0, brancos: 0, anuladas: 0, totalQuestoes: 0 });
        const acertosReaisGerais = totaisGerais.acertos - totaisGerais.anuladas;
        const pontuacaoLiquidaGeral = acertosReaisGerais - totaisGerais.erros;
        const universoBrutoGeral = acertosReaisGerais + totaisGerais.erros;
        totaisGerais.acertosLiquidos = pontuacaoLiquidaGeral;
        totaisGerais.percentualBruta = universoBrutoGeral > 0 ? acertosReaisGerais / universoBrutoGeral : 0;
        totaisGerais.percentualLiquidos = totaisGerais.totalQuestoes > 0 ? Math.max(0, pontuacaoLiquidaGeral / totaisGerais.totalQuestoes) : 0;
        return { disciplinas: processedDisciplinas, totais: totaisGerais };
    }, [proofsList, dashboardFilter]);

    
    const value = {
        proofsList,
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