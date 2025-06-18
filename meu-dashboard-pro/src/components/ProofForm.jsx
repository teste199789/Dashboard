import React, { useState, useEffect } from 'react';
import Modal from './common/Modal';
import toast from 'react-hot-toast';
import { useProofs } from '../hooks/useProofs';
import * as api from '../api/apiService';

const BANCAS_PREDEFINIDAS = ["Cespe/Cebraspe", "FGV", "FCC", "Quadrix", "IBFC", "Outra"];

const ProofForm = ({ isOpen, onClose, proofData, type = 'CONCURSO' }) => {
    const { handleAddProof, fetchProofs } = useProofs();
    const [isSaving, setIsSaving] = useState(false);
    const [currentStep, setCurrentStep] = useState(1);

    const getInitialFormData = () => ({
        titulo: '',
        banca: 'Cespe/Cebraspe',
        data: new Date().toISOString().split('T')[0],
        totalQuestoes: type === 'CONCURSO' ? 120 : 50,
        tipoPontuacao: 'liquida',
        orgao: '',
        cargo: ''
    });

    const [formData, setFormData] = useState(getInitialFormData());

    useEffect(() => {
        if (isOpen) {
            setCurrentStep(1); // Reset to first step when modal opens
            if (proofData) {
                setFormData({
                    titulo: proofData.titulo || '',
                    banca: proofData.banca || 'Cespe/Cebraspe',
                    data: proofData.data ? new Date(proofData.data).toISOString().split('T')[0] : '',
                    totalQuestoes: proofData.totalQuestoes || (type === 'CONCURSO' ? 120 : 50),
                    tipoPontuacao: proofData.tipoPontuacao || 'liquida',
                    orgao: proofData.orgao || '',
                    cargo: proofData.cargo || '',
                });
            } else {
                setFormData(getInitialFormData());
            }
        }
    }, [proofData, isOpen, type]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async () => {
        setIsSaving(true);
        const toastId = toast.loading('Salvando...');
        try {
            const dataToSave = { ...formData, type };
            if (proofData?.id) {
                await api.updateProofDetails(proofData.id, dataToSave);
                toast.success("Dados atualizados com sucesso!", { id: toastId });
            } else {
                await handleAddProof(dataToSave);
                toast.success(`${type === 'CONCURSO' ? 'Concurso' : 'Simulado'} criado com sucesso!`, { id: toastId });
            }
            await fetchProofs();
            onClose();
        } catch (error) {
            toast.error(`Falha ao salvar ${type === 'CONCURSO' ? 'concurso' : 'simulado'}.`, { id: toastId });
        } finally {
            setIsSaving(false);
        }
    };
    
    const title = proofData ? `Editar ${type === 'CONCURSO' ? 'Concurso' : 'Simulado'}` : `Novo ${type === 'CONCURSO' ? 'Concurso' : 'Simulado'}`;
    const totalSteps = 2;

    const nextStep = () => setCurrentStep(prev => Math.min(prev + 1, totalSteps));
    const prevStep = () => setCurrentStep(prev => Math.max(prev - 1, 1));

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={title}>
            <div className="p-4">
                {/* Progress Bar */}
                <div className="mb-6">
                    <div className="relative pt-1">
                        <div className="overflow-hidden h-2 mb-2 text-xs flex rounded bg-teal-200">
                            <div style={{ width: `${(currentStep / totalSteps) * 100}%` }} className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-teal-500 transition-all duration-500"></div>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Passo {currentStep} de {totalSteps}</p>
                    </div>
                </div>
                
                <div className="space-y-4">
                    {currentStep === 1 && (
                        <>
                            <h3 className="text-lg font-semibold">Informações Gerais</h3>
                            <input type="text" name="titulo" placeholder={`Título (Ex: ${type === 'CONCURSO' ? 'Analista de Sistemas - STJ' : 'Simulado Semanal #1'})`} value={formData.titulo || ''} onChange={handleChange} className="w-full p-2 border bg-white dark:bg-gray-700 rounded-md"/>
                             {type === 'CONCURSO' && (
                                <>
                                    <input type="text" name="orgao" placeholder="Órgão (Ex: TRT-10)" value={formData.orgao || ''} onChange={handleChange} className="w-full p-2 border bg-white dark:bg-gray-700 rounded-md"/>
                                    <input type="text" name="cargo" placeholder="Cargo (Ex: Analista Judiciário)" value={formData.cargo || ''} onChange={handleChange} className="w-full p-2 border bg-white dark:bg-gray-700 rounded-md"/>
                                </>
                            )}
                            <input type="date" name="data" value={formData.data || ''} onChange={handleChange} className="w-full p-2 border bg-white dark:bg-gray-700 rounded-md"/>
                        </>
                    )}

                    {currentStep === 2 && (
                        <>
                            <h3 className="text-lg font-semibold">Detalhes da Prova</h3>
                             <select name="banca" value={formData.banca || ''} onChange={handleChange} className="w-full p-2 border bg-white dark:bg-gray-700 rounded-md">
                                {BANCAS_PREDEFINIDAS.map(b => <option key={b} value={b}>{b}</option>)}
                            </select>
                            <input type="number" name="totalQuestoes" placeholder="Nº de Questões" value={formData.totalQuestoes || ''} onChange={handleChange} className="w-full p-2 border bg-white dark:bg-gray-700 rounded-md"/>
                            <select name="tipoPontuacao" value={formData.tipoPontuacao || 'liquida'} onChange={handleChange} className="w-full p-2 border bg-white dark:bg-gray-700 rounded-md">
                                <option value="liquida">Líquida (Certo/Errado)</option>
                                <option value="bruta">Bruta (Múltipla Escolha)</option>
                            </select>
                        </>
                    )}
                </div>

                {/* Navigation */}
                <div className="flex justify-between gap-3 pt-6">
                    {currentStep > 1 ? (
                        <button onClick={prevStep} className="py-2 px-4 rounded-md text-gray-700 dark:text-gray-200 bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500">Voltar</button>
                    ) : <div></div> /* Placeholder to keep "Avançar" on the right */}

                    {currentStep < totalSteps ? (
                        <button onClick={nextStep} className="py-2 px-4 rounded-md text-white bg-teal-600 hover:bg-teal-700">Avançar</button>
                    ) : (
                        <button onClick={handleSubmit} disabled={isSaving} className="py-2 px-4 rounded-md text-white bg-teal-600 hover:bg-teal-700 disabled:bg-teal-400 disabled:cursor-not-allowed">
                            {isSaving ? 'Salvando...' : 'Salvar'}
                        </button>
                    )}
                </div>
            </div>
        </Modal>
    );
};

export default ProofForm; 