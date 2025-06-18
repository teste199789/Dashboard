import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import * as api from '../api/apiService';
import { formatDate } from '../utils/formatters';
import { useProofs } from '../hooks/useProofs';
import toast from 'react-hot-toast';

// Importação dos componentes de abas e ícones
import InfoTab from './tabs/InfoTab';
import OfficialKeysTab from './tabs/OfficialKeysTab';
import UserAnswersTab from './tabs/UserAnswersTab';
import ResultTab from './tabs/ResultTab';
import SimulateAnnulmentTab from './tabs/SimulateAnnulmentTab';
import RankingTab from './tabs/RankingTab';
import LoadingSpinner from '../components/common/LoadingSpinner';
import PencilIcon from '../components/icons/PencilIcon';

const BANCAS_PREDEFINIDAS = ["Cespe/Cebraspe", "FGV", "FCC", "Outra"];

const ProofDetail = () => {
    const { proofId } = useParams();
    const [proof, setProof] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('info');
    const [isEditingHeader, setIsEditingHeader] = useState(false);
    const [editedProof, setEditedProof] = useState(null);
    
    // --- CORREÇÃO AQUI: Pega a função do contexto ---
    const { fetchProofs, handleGradeProof } = useProofs();

    const fetchProof = useCallback(async () => {
        try {
            const data = await api.getProofById(proofId);
            setProof(data);
            setEditedProof(data);
        } catch (err) {
            console.error("Falha ao buscar detalhes da prova:", err);
            setProof(null);
        } finally {
            setIsLoading(false);
        }
    }, [proofId]);

    useEffect(() => {
        fetchProof();
    }, [fetchProof]);

    const handleEditChange = (e) => {
        const { name, value } = e.target;
        setEditedProof(prev => ({ ...prev, [name]: value }));
    };

    const handleSaveChanges = async () => {
        try {
            await api.updateProofDetails(proof.id, {
                titulo: editedProof.titulo,
                banca: editedProof.banca,
                data: editedProof.data,
            });
            await fetchProofs();
            await fetchProof();
            setIsEditingHeader(false);
            toast.success('Prova atualizada com sucesso!');
        } catch (error) {
            toast.error('Falha ao salvar as alterações.');
        }
    };

    const handleCancelEdit = () => {
        setEditedProof(proof);
        setIsEditingHeader(false);
    };

    if (isLoading) return <LoadingSpinner message="Carregando detalhes da prova..." />;
    if (!proof) return <div className="text-center p-10 font-bold text-red-500">Prova não encontrada.</div>;

    const TabButton = ({ tabName, label }) => (
        <button
            onClick={() => setActiveTab(tabName)}
            className={`px-4 py-3 font-semibold border-b-4 transition-colors text-sm md:text-base whitespace-nowrap ${activeTab === tabName ? 'border-teal-500 text-teal-600 dark:text-teal-400' : 'border-transparent text-gray-500 dark:text-gray-400 hover:border-gray-300 dark:hover:border-gray-500'}`}
        >
            {label}
        </button>
    );

    return (
        <div className="space-y-6">
            <div className="bg-white dark:bg-gray-800/50 rounded-xl shadow-lg p-6 w-full">
                {isEditingHeader ? (
                    <div className="space-y-4">
                        <input type="text" name="titulo" value={editedProof.titulo} onChange={handleEditChange} className="w-full text-2xl font-bold p-2 border bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 rounded-md"/>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                             <select name="banca" value={editedProof.banca} onChange={handleEditChange} className="w-full p-2 border bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 rounded-md">
                                {BANCAS_PREDEFINIDAS.map(b => <option key={b} value={b}>{b}</option>)}
                            </select>
                            <input type="date" name="data" value={editedProof.data.substring(0, 10)} onChange={handleEditChange} className="w-full p-2 border bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 rounded-md"/>
                        </div>
                        <div className="flex justify-end space-x-2 pt-2">
                            <button onClick={handleCancelEdit} className="py-2 px-4 bg-gray-200 dark:bg-gray-600 rounded-md font-semibold hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors">Cancelar</button>
                            <button onClick={handleSaveChanges} className="py-2 px-4 bg-green-600 text-white rounded-md font-semibold hover:bg-green-700 transition-colors">Salvar</button>
                        </div>
                    </div>
                ) : (
                    <div className="flex justify-between items-start gap-4">
                        <div>
                            <p className="font-bold text-blue-600 dark:text-blue-400">
                                {formatDate(proof.data)} • {proof.banca.toUpperCase()}
                            </p>
                            <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mt-1">{proof.titulo}</h2>
                        </div>
                        <button onClick={() => setIsEditingHeader(true)} className="flex-shrink-0 flex items-center gap-2 py-2 px-4 bg-white dark:bg-gray-700 border dark:border-gray-600 rounded-md shadow-sm hover:bg-gray-100 dark:hover:bg-gray-600 font-semibold text-sm transition-colors">
                            <PencilIcon className="w-4 h-4" />
                            Editar
                        </button>
                    </div>
                )}
            </div>

            <div className="bg-white dark:bg-gray-800/50 shadow-lg rounded-xl overflow-hidden">
                <nav className="flex border-b dark:border-gray-700 overflow-x-auto">
                    <TabButton tabName="info" label="Informações"/>
                    <TabButton tabName="gabaritos" label="Gabaritos da Banca"/>
                    <TabButton tabName="meuGabarito" label="Meu Gabarito"/>
                    <TabButton tabName="resultado" label="Resultado Final"/>
                    <TabButton tabName="simulacao" label="Simular Anulações"/>
                    <TabButton tabName="ranking" label="Ranking Simulado"/>
                </nav>

                <div className="min-h-[300px]">
                    {activeTab === 'info' && <InfoTab proof={proof} refreshProof={fetchProof} />}
                    {activeTab === 'gabaritos' && <OfficialKeysTab proof={proof} refreshProof={fetchProof} />}
                    {activeTab === 'meuGabarito' && <UserAnswersTab proof={proof} refreshProof={fetchProof} />}
                    {/* --- CORREÇÃO AQUI: Passa a função 'handleGradeProof' para a aba de resultado --- */}
                    {activeTab === 'resultado' && <ResultTab proof={proof} refreshProof={fetchProof} handleGradeProof={handleGradeProof} />}
                    {activeTab === 'simulacao' && <SimulateAnnulmentTab proof={proof} />}
                    {activeTab === 'ranking' && <RankingTab proof={proof} />}
                </div>
            </div>
        </div>
    );
};

export default ProofDetail;