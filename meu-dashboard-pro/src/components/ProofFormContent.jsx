import React, { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import { useProofs } from '../hooks/useProofs';
import * as api from '../api/apiService';
import SmartBankSelector from './common/SmartBankSelector';

const BANCAS_PREDEFINIDAS = ["Cespe/Cebraspe", "FGV", "FCC", "Quadrix", "IBFC", "Outra"];
const RESULTADOS_POSSIVEIS = ["Aprovado", "Classificado", "Reprovado", "Eliminado"];

const ProofFormContent = ({ proofData, type = 'CONCURSO', onSave, initialStep = 1 }) => {
    const { handleAddProof, handleUpdateProof } = useProofs();
    const [isSaving, setIsSaving] = useState(false);
    const [currentStep, setCurrentStep] = useState(initialStep);

    const getInitialFormData = useCallback(() => ({
        titulo: '',
        banca: 'Cespe/Cebraspe',
        data: new Date().toISOString().split('T')[0],
        totalQuestoes: type === 'CONCURSO' ? 120 : 50,
        tipoPontuacao: 'liquida',
        orgao: '',
        notaDiscursiva: null,
        resultadoObjetiva: null,
        resultadoDiscursiva: null,
        resultadoFinal: null,
        regraAnulacao: null,
        valorAnulacao: null,
        tipoNotaCorte: null,
        precisaoDecimal: null
    }), [type]);

    const [formData, setFormData] = useState(getInitialFormData());

    useEffect(() => {
        setCurrentStep(initialStep || 1);
        if (proofData) {
            setFormData({
                titulo: proofData.titulo || '',
                banca: proofData.banca || 'Cespe/Cebraspe',
                data: proofData.data ? new Date(proofData.data).toISOString().split('T')[0] : '',
                totalQuestoes: proofData.totalQuestoes || (type === 'CONCURSO' ? 120 : 50),
                tipoPontuacao: proofData.tipoPontuacao || 'liquida',
                orgao: proofData.orgao || '',
                notaDiscursiva: proofData.notaDiscursiva,
                resultadoObjetiva: proofData.resultadoObjetiva,
                resultadoDiscursiva: proofData.resultadoDiscursiva,
                resultadoFinal: proofData.resultadoFinal,
                regraAnulacao: proofData.regraAnulacao,
                valorAnulacao: proofData.valorAnulacao,
                tipoNotaCorte: proofData.tipoNotaCorte,
                precisaoDecimal: proofData.precisaoDecimal
            });
        } else {
            setFormData(getInitialFormData());
        }
    }, [proofData, type, getInitialFormData, initialStep]);

    const handleChange = (e) => {
        const { name, value } = e.target;

        if (name === 'resultadoObjetiva' || name === 'resultadoDiscursiva' || name === 'resultadoFinal') {
            setFormData(prev => ({ ...prev, [name]: value ? { status: value } : null }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value === "" ? null : value }));
        }
    };

    const handleSubmit = async () => {
        setIsSaving(true);
        const toastId = toast.loading('Salvando...');
        try {
            const dataToSave = { 
                ...formData,
                notaDiscursiva: formData.notaDiscursiva ? parseFloat(formData.notaDiscursiva) : null,
                type 
            };
            
            let savedProof;
            if (proofData?.id) {
                savedProof = await handleUpdateProof(proofData.id, dataToSave);
                toast.success("Dados atualizados com sucesso!", { id: toastId });
            } else {
                savedProof = await handleAddProof(dataToSave);
                toast.success(`${type === 'CONCURSO' ? 'Concurso' : 'Simulado'} criado com sucesso!`, { id: toastId });
            }

            if (onSave) {
                onSave(savedProof);
            }
        } catch(e) {
            console.error(e);
            toast.error(`Falha ao salvar ${type === 'CONCURSO' ? 'concurso' : 'simulado'}.`, { id: toastId });
        } finally {
            setIsSaving(false);
        }
    };
    
    const totalSteps = type === 'CONCURSO' ? 3 : 2;
    const nextStep = () => setCurrentStep(prev => Math.min(prev + 1, totalSteps));
    const prevStep = () => setCurrentStep(prev => Math.max(prev - 1, 1));

    return (
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
                            </>
                        )}
                        <input type="date" name="data" value={formData.data || ''} onChange={handleChange} className="w-full p-2 border bg-white dark:bg-gray-700 rounded-md"/>
                    </>
                )}

                {currentStep === 2 && (
                    <>
                        <h3 className="text-lg font-semibold">Detalhes da Prova</h3>
                        
                        <SmartBankSelector
                            selectedBank={formData.organizadora}
                            selectedTipoPontuacao={formData.tipoPontuacao}
                            onBankChange={(banca) => setFormData(prev => ({ ...prev, organizadora: banca }))}
                            onTipoPontuacaoChange={(tipo) => setFormData(prev => ({ ...prev, tipoPontuacao: tipo }))}
                            onConfigChange={(config) => {
                                setFormData(prev => ({
                                    ...prev,
                                    regraAnulacao: config.regraAnulacao,
                                    valorAnulacao: config.valorAnulacao,
                                    tipoNotaCorte: config.tipoNotaCorte,
                                    precisaoDecimal: config.precisaoDecimal,
                                    tipoPontuacao: config.tipoPontuacao
                                }));
                            }}
                            currentRegraAnulacao={formData.regraAnulacao}
                            currentValorAnulacao={formData.valorAnulacao}
                        />
                        
                        <input type="number" name="totalQuestoes" placeholder="Nº de Questões" value={formData.totalQuestoes || ''} onChange={handleChange} className="w-full p-2 border bg-white dark:bg-gray-700 rounded-md"/>
                    </>
                )}

                {currentStep === 3 && type === 'CONCURSO' && (
                    <>
                        <h3 className="text-lg font-semibold">Resultados</h3>
                        <input type="number" step="0.01" name="notaDiscursiva" placeholder="Nota da Discursiva (opcional)" value={formData.notaDiscursiva || ''} onChange={handleChange} className="w-full p-2 border bg-white dark:bg-gray-700 rounded-md"/>
                        
                        <select name="resultadoObjetiva" value={formData.resultadoObjetiva?.status || ''} onChange={handleChange} className="w-full p-2 border bg-white dark:bg-gray-700 rounded-md">
                            <option value="">-- Resultado da Objetiva --</option>
                            {RESULTADOS_POSSIVEIS.map(r => <option key={r} value={r}>{r}</option>)}
                        </select>

                        <select name="resultadoDiscursiva" value={formData.resultadoDiscursiva?.status || ''} onChange={handleChange} className="w-full p-2 border bg-white dark:bg-gray-700 rounded-md">
                             <option value="">-- Resultado da Discursiva --</option>
                            {RESULTADOS_POSSIVEIS.map(r => <option key={r} value={r}>{r}</option>)}
                        </select>
                        
                        <select name="resultadoFinal" value={formData.resultadoFinal?.status || ''} onChange={handleChange} className="w-full p-2 border bg-white dark:bg-gray-700 rounded-md">
                             <option value="">-- Resultado Final --</option>
                            {RESULTADOS_POSSIVEIS.map(r => <option key={r} value={r}>{r}</option>)}
                        </select>
                    </>
                )}
            </div>

            {/* Navigation */}
            <div className="flex justify-between gap-3 pt-6">
                {currentStep > 1 ? (
                    <button onClick={prevStep} className="py-2 px-4 rounded-md text-gray-700 dark:text-gray-200 bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500">Voltar</button>
                ) : <div></div>}

                {currentStep < totalSteps ? (
                    <button onClick={nextStep} className="py-2 px-4 rounded-md text-white bg-teal-600 hover:bg-teal-700">Avançar</button>
                ) : (
                    <button onClick={handleSubmit} disabled={isSaving} className="py-2 px-4 rounded-md text-white bg-teal-600 hover:bg-teal-700 disabled:bg-teal-400 disabled:cursor-not-allowed">
                        {isSaving ? 'Salvando...' : 'Salvar'}
                    </button>
                )}
            </div>
        </div>
    );
};

export default ProofFormContent; 