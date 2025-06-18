import React, { useState, useEffect } from 'react';
import * as api from '../../api/apiService';
import { useProofs } from '../../hooks/useProofs';
import TrashIcon from '../../components/icons/TrashIcon';
import toast from 'react-hot-toast';

const InfoTab = ({ proof, refreshProof }) => {
    // Estado para controlar as matérias sendo editadas
    const [subjects, setSubjects] = useState([]);
    const [isSaving, setIsSaving] = useState(false);

    // Inicializa o estado 'subjects' com os dados da prova quando o componente carrega
    useEffect(() => {
        if (proof && proof.subjects) {
            // Se não houver matérias, começa com uma linha em branco
            setSubjects(proof.subjects.length > 0 ? proof.subjects : [{ nome: '', questoes: '' }]);
        }
    }, [proof]);

    // Função para atualizar o estado quando o usuário digita
    const handleSubjectChange = (index, field, value) => {
        const updatedSubjects = [...subjects];
        updatedSubjects[index][field] = value;
        setSubjects(updatedSubjects);
    };

    const handleAddSubject = () => {
        setSubjects([...subjects, { nome: '', questoes: '' }]);
    };

    const handleRemoveSubject = (index) => {
        const updatedSubjects = subjects.filter((_, i) => i !== index);
        setSubjects(updatedSubjects);
    };

    const handleSaveChanges = async () => {
        setIsSaving(true);
        // Filtra para salvar apenas matérias que têm nome e questões preenchidos
        const subjectsToSave = subjects
            .filter(s => s.nome.trim() && String(s.questoes).trim())
            .map(s => ({
                nome: s.nome,
                questoes: parseInt(s.questoes, 10) || 0
            }));

        // Recalcula o total de questões da prova com base nas matérias salvas
        const newTotalQuestoes = subjectsToSave.reduce((sum, s) => sum + s.questoes, 0);

        try {
            await api.updateProofDetails(proof.id, { 
                subjects: subjectsToSave,
                totalQuestoes: newTotalQuestoes 
            });
            toast.success('Matérias salvas com sucesso!');
            // Atualiza os dados da prova na tela após salvar
            await refreshProof();
        } catch (error) {
            toast.error('Falha ao salvar as alterações.');
            console.error("Erro ao salvar matérias:", error);
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="p-6">
            <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100">Matérias do Concurso</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">Defina as matérias e a quantidade de questões de cada uma. O total de questões da prova será atualizado automaticamente.</p>
            
            <div className="space-y-3">
                {subjects.map((subject, index) => (
                    <div key={index} className="flex items-center gap-2">
                        {/* Input para o nome da matéria */}
                        <input 
                            type="text" 
                            placeholder="Nome da Matéria" 
                            value={subject.nome} 
                            onChange={e => handleSubjectChange(index, 'nome', e.target.value)}
                            className="flex-grow p-2 border bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 rounded-md"
                        />
                        {/* Input para o número de questões */}
                        <input 
                            type="number" 
                            placeholder="Nº Questões" 
                            value={subject.questoes} 
                            onChange={e => handleSubjectChange(index, 'questoes', e.target.value)}
                            className="w-40 p-2 border bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 rounded-md"
                        />
                        {/* Botão de remover */}
                        <button onClick={() => handleRemoveSubject(index)} className="p-2 text-red-500 hover:bg-red-100 dark:hover:bg-red-900/50 rounded-full transition-colors">
                            <TrashIcon className="w-5 h-5"/>
                        </button>
                    </div>
                ))}
            </div>

            <button onClick={handleAddSubject} className="mt-4 text-teal-600 dark:text-teal-400 font-semibold hover:text-teal-500 transition-colors">
                + Adicionar Matéria
            </button>
            
            <div className="flex justify-end mt-8 border-t dark:border-gray-700 pt-6">
                <button onClick={handleSaveChanges} disabled={isSaving} className="bg-teal-500 text-white font-bold py-2 px-6 rounded-lg hover:bg-teal-600 disabled:opacity-50 transition-colors">
                    {isSaving ? 'Salvando...' : 'Salvar Matérias'}
                </button>
            </div>
        </div>
    );
};

export default InfoTab;