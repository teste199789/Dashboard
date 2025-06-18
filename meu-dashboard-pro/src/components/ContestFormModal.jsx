import React, { useState, useEffect } from 'react';
import Modal from './common/Modal';
import toast from 'react-hot-toast';
import { useProofs } from '../hooks/useProofs';
import * as api from '../api/apiService';

const BANCAS_PREDEFINIDAS = ["Cespe/Cebraspe", "FGV", "FCC", "Quadrix", "IBFC", "Outra"];
const RESULTADOS_POSSIVEIS = [null, "CLASSIFICADO", "ELIMINADO"];

const ContestFormModal = ({ isOpen, onClose, contestData }) => {
    const { handleAddProof, fetchProofs } = useProofs();
    const [isSaving, setIsSaving] = useState(false);

    const initialFormData = {
        titulo: '', banca: 'Cespe/Cebraspe', data: new Date().toISOString().split('T')[0],
        totalQuestoes: 120, tipoPontuacao: 'liquida', orgao: '', cargo: '', notaDiscursiva: '',
        resultadoObjetiva: null, resultadoDiscursiva: null, resultadoFinal: null
    };

    const [formData, setFormData] = useState(initialFormData);

    useEffect(() => {
        if (isOpen) {
            if (contestData) {
                setFormData({
                    titulo: contestData.titulo || '',
                    banca: contestData.banca || '',
                    data: contestData.data ? new Date(contestData.data).toISOString().split('T')[0] : '',
                    totalQuestoes: contestData.totalQuestoes || '',
                    tipoPontuacao: contestData.tipoPontuacao || 'liquida',
                    orgao: contestData.orgao || '',
                    cargo: contestData.cargo || '',
                    notaDiscursiva: contestData.notaDiscursiva || '',
                    resultadoObjetiva: contestData.resultadoObjetiva || null,
                    resultadoDiscursiva: contestData.resultadoDiscursiva || null,
                    resultadoFinal: contestData.resultadoFinal || null
                });
            } else {
                setFormData(initialFormData);
            }
        }
    }, [contestData, isOpen]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async () => {
        setIsSaving(true);
        try {
            const dataToSave = { ...formData, type: 'CONCURSO' };
            if (contestData?.id) {
                await api.updateProofDetails(contestData.id, dataToSave);
                toast.success("Concurso atualizado com sucesso!");
            } else {
                await handleAddProof(dataToSave);
                toast.success("Concurso criado com sucesso!");
            }
            await fetchProofs();
            onClose();
        } catch (error) {
            toast.error("Falha ao salvar o concurso.");
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={contestData ? "Editar Concurso" : "Novo Concurso"}>
            <div className="space-y-4 p-2">
                <input type="text" name="titulo" placeholder="Título da Prova (Ex: Analista de Sistemas)" value={formData.titulo || ''} onChange={handleChange} className="w-full p-2 border bg-white dark:bg-gray-700 rounded-md"/>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium">Órgão</label>
                        <input type="text" name="orgao" placeholder="Ex: TRT-10" value={formData.orgao || ''} onChange={handleChange} className="mt-1 w-full p-2 border bg-white dark:bg-gray-700 rounded-md"/>
                    </div>
                    <div>
                        <label className="block text-sm font-medium">Banca</label>
                        <select name="banca" value={formData.banca || ''} onChange={handleChange} className="mt-1 w-full p-2 border bg-white dark:bg-gray-700 rounded-md">
                            {BANCAS_PREDEFINIDAS.map(b => <option key={b} value={b}>{b}</option>)}
                        </select>
                    </div>
                </div>
                <div>
                    <label className="block text-sm font-medium">Cargo</label>
                    <input type="text" name="cargo" placeholder="Ex: Analista Judiciário - TI" value={formData.cargo || ''} onChange={handleChange} className="mt-1 w-full p-2 border bg-white dark:bg-gray-700 rounded-md"/>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium">Data</label>
                        <input type="date" name="data" value={formData.data || ''} onChange={handleChange} className="mt-1 w-full p-2 border bg-white dark:bg-gray-700 rounded-md"/>
                    </div>
                    <div>
                        <label className="block text-sm font-medium">Nº Questões Obj.</label>
                        <input type="number" name="totalQuestoes" value={formData.totalQuestoes || ''} onChange={handleChange} className="mt-1 w-full p-2 border bg-white dark:bg-gray-700 rounded-md"/>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium">Nota Discursiva</label>
                        <input type="number" step="0.01" name="notaDiscursiva" value={formData.notaDiscursiva || ''} onChange={handleChange} className="mt-1 w-full p-2 border bg-white dark:bg-gray-700 rounded-md"/>
                    </div>
                    <div>
                        <label className="block text-sm font-medium">Pontuação Obj.</label>
                        <select name="tipoPontuacao" value={formData.tipoPontuacao || 'liquida'} onChange={handleChange} className="mt-1 w-full p-2 border bg-white dark:bg-gray-700 rounded-md">
                            <option value="liquida">Líquida (Cespe)</option>
                            <option value="bruta">Bruta (M. Escolha)</option>
                        </select>
                    </div>
                </div>

                {/* NOVOS CAMPOS DE RESULTADO NO FORMULÁRIO */}
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium">Resultado Objetiva</label>
                        <select name="resultadoObjetiva" value={formData.resultadoObjetiva || ''} onChange={handleChange} className="mt-1 w-full p-2 border bg-white dark:bg-gray-700 rounded-md">
                            <option value={null}>- Selecione -</option>
                            {RESULTADOS_POSSIVEIS.filter(res => res !== null).map(res => (
                                <option key={res} value={res}>{res}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium">Resultado Discursiva</label>
                        <select name="resultadoDiscursiva" value={formData.resultadoDiscursiva || ''} onChange={handleChange} className="mt-1 w-full p-2 border bg-white dark:bg-gray-700 rounded-md">
                            <option value={null}>- Selecione -</option>
                            {RESULTADOS_POSSIVEIS.filter(res => res !== null).map(res => (
                                <option key={res} value={res}>{res}</option>
                            ))}
                        </select>
                    </div>
                </div>
                <div>
                    <label className="block text-sm font-medium">Resultado Final (Opcional)</label>
                    <select name="resultadoFinal" value={formData.resultadoFinal || ''} onChange={handleChange} className="mt-1 w-full p-2 border bg-white dark:bg-gray-700 rounded-md">
                        <option value={null}>- Selecione -</option>
                        {RESULTADOS_POSSIVEIS.filter(res => res !== null).map(res => (
                            <option key={res} value={res}>{res}</option>
                        ))}
                    </select>
                </div>

                <div className="flex justify-end gap-2 pt-4 border-t dark:border-gray-600">
                    <button type="button" onClick={onClose} className="py-2 px-4 bg-gray-200 dark:bg-gray-600 rounded-md font-semibold">Cancelar</button>
                    <button type="button" onClick={handleSubmit} disabled={isSaving} className="py-2 px-4 bg-teal-600 text-white rounded-md font-semibold disabled:opacity-50">
                        {isSaving ? 'Salvando...' : 'Salvar'}
                    </button>
                </div>
            </div>
        </Modal>
    );
};

export default ContestFormModal;