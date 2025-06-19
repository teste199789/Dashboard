import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useLocation } from 'react-router-dom';
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
import LockIcon from '../components/icons/LockIcon';
import ProofForm from '../components/ProofForm';

const BANCAS_PREDEFINIDAS = ["Cespe/Cebraspe", "FGV", "FCC", "Outra"];

const getSmartTab = (proof) => {
    const hasSubjects = proof.subjects && proof.subjects.length > 0;
    if (!hasSubjects) return 'info';
    
    const hasUserAnswers = proof.userAnswers && proof.userAnswers.length > 0;
    const hasOfficialKey = (proof.gabaritoDefinitivo && proof.gabaritoDefinitivo.length > 0) || (proof.gabaritoPreliminar && proof.gabaritoPreliminar.length > 0);
    const isGraded = proof.results && proof.results.length > 0;

    if (!hasUserAnswers) return 'meuGabarito';
    if (!hasOfficialKey) return 'gabaritos';
    if (!isGraded) return 'resultado'; // A aba de resultado tem o botão de corrigir
    return 'resultado'; // Padrão para a aba de resultados se tudo estiver preenchido
};

const ProofDetail = () => {
    const { proofId } = useParams();
    const location = useLocation();
    const [proof, setProof] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('info');
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    
    const { fetchProofs, handleGradeProof } = useProofs();

    const fetchProof = useCallback(async () => {
        try {
            const data = await api.getProofById(proofId);
            setProof(data);
            
            const hasSubjects = data.subjects && data.subjects.length > 0;

            // Lógica de aba inteligente
            const queryParams = new URLSearchParams(location.search);
            const urlTab = queryParams.get('tab');

            if (urlTab && (urlTab === 'info' || hasSubjects)) {
                setActiveTab(urlTab);
            } else {
                const smartTab = getSmartTab(data);
                setActiveTab(smartTab);
            }

        } catch (err) {
            console.error("Falha ao buscar detalhes da prova:", err);
            setProof(null);
        } finally {
            setIsLoading(false);
        }
    }, [proofId, location.search]);

    useEffect(() => {
        fetchProof();
    }, [fetchProof]);

    if (isLoading) return <LoadingSpinner message="Carregando detalhes da prova..." />;
    if (!proof) return <div className="text-center p-10 font-bold text-red-500">Prova não encontrada.</div>;

    const hasSubjects = proof.subjects && proof.subjects.length > 0;
    const disabledTooltip = "Primeiro, cadastre as matérias na aba 'Informações e Matérias'.";

    const TabButton = ({ tabName, label, disabled = false }) => (
        <button
            onClick={() => !disabled && setActiveTab(tabName)}
            disabled={disabled}
            title={disabled ? disabledTooltip : undefined}
            className={`flex items-center gap-2 px-4 py-3 font-semibold border-b-4 transition-colors text-sm md:text-base whitespace-nowrap ${
                activeTab === tabName 
                    ? 'border-teal-500 text-teal-600 dark:text-teal-400' 
                    : 'border-transparent text-gray-500 dark:text-gray-400'
            } ${
                disabled 
                    ? 'cursor-not-allowed opacity-50' 
                    : 'hover:border-gray-300 dark:hover:border-gray-500'
            }`}
        >
            {disabled && <LockIcon className="w-4 h-4" />}
            {label}
        </button>
    );

    return (
        <div className="space-y-6">
            <div className="bg-white dark:bg-gray-800/50 rounded-xl shadow-lg p-6 w-full">
                <div className="flex justify-between items-start gap-4">
                    <div>
                        <p className="font-bold text-blue-600 dark:text-blue-400">
                            {formatDate(proof.data)} • {proof.banca.toUpperCase()}
                        </p>
                        <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mt-1">{proof.titulo}</h2>
                        {proof.orgao && proof.cargo && (
                             <p className="text-gray-500 dark:text-gray-400">{proof.orgao} • {proof.cargo}</p>
                        )}
                    </div>
                    <button onClick={() => setIsEditModalOpen(true)} className="flex-shrink-0 flex items-center gap-2 py-2 px-4 bg-white dark:bg-gray-700 border dark:border-gray-600 rounded-md shadow-sm hover:bg-gray-100 dark:hover:bg-gray-600 font-semibold text-sm transition-colors">
                        <PencilIcon className="w-4 h-4" />
                        Editar Dados Gerais
                    </button>
                </div>
            </div>

            <div className="bg-white dark:bg-gray-800/50 shadow-lg rounded-xl overflow-hidden">
                <nav className="flex border-b dark:border-gray-700 overflow-x-auto">
                    <TabButton tabName="info" label="Informações e Matérias"/>
                    <TabButton tabName="gabaritos" label="Gabaritos da Banca" disabled={!hasSubjects} />
                    <TabButton tabName="meuGabarito" label="Meu Gabarito" disabled={!hasSubjects} />
                    <TabButton tabName="resultado" label="Resultado Final" disabled={!hasSubjects} />
                    <TabButton tabName="simulacao" label="Simular Anulações" disabled={!hasSubjects} />
                    <TabButton tabName="ranking" label="Ranking Simulado" disabled={!hasSubjects} />
                </nav>

                <div className="min-h-[300px]">
                    {activeTab === 'info' && <InfoTab proof={proof} refreshProof={fetchProof} />}
                    {activeTab === 'gabaritos' && <OfficialKeysTab proof={proof} refreshProof={fetchProof} />}
                    {activeTab === 'meuGabarito' && <UserAnswersTab proof={proof} refreshProof={fetchProof} />}
                    {activeTab === 'resultado' && <ResultTab proof={proof} refreshProof={fetchProof} handleGradeProof={handleGradeProof} />}
                    {activeTab === 'simulacao' && <SimulateAnnulmentTab proof={proof} refreshProof={fetchProof} />}
                    {activeTab === 'ranking' && <RankingTab proof={proof} refreshProof={fetchProof} />}
                </div>
            </div>
            
            <ProofForm 
                isOpen={isEditModalOpen}
                onClose={() => {
                    setIsEditModalOpen(false);
                    fetchProof();
                }}
                proofData={proof}
                type={proof.type}
            />
        </div>
    );
};

export default ProofDetail;