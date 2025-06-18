import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProofs } from '../hooks/useProofs';
import toast from 'react-hot-toast';

const BANCAS_PREDEFINIDAS = ["Cespe/Cebraspe", "FGV", "FCC", "Quadrix", "IBFC", "Outra"];

const AddSimulado = () => {
    const navigate = useNavigate();
    const { handleAddProof } = useProofs();
    const [isSaving, setIsSaving] = useState(false);
    
    // Estados do formulário
    const [titulo, setTitulo] = useState('');
    const [banca, setBanca] = useState('FGV'); // Deixa uma banca comum como padrão
    const [data, setData] = useState(new Date().toISOString().split('T')[0]); // Padrão para hoje
    const [totalQuestoes, setTotalQuestoes] = useState('');
    const [tipoPontuacao, setTipoPontuacao] = useState('bruta'); // Padrão para simulados

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSaving(true);
        
        // Monta o objeto de dados com o 'type' definido como 'SIMULADO'
        const newSimuladoData = { 
            titulo, 
            banca, 
            data, 
            totalQuestoes, 
            tipoPontuacao, 
            type: 'SIMULADO' 
        };
        
        try {
            const newProof = await handleAddProof(newSimuladoData);
            if (newProof && newProof.id) {
                toast.success('Simulado criado com sucesso!');
                // Após criar, redireciona para a página de gerenciamento
                navigate(`/minhas-provas/${newProof.id}`); 
            }
        } catch (error) {
            toast.error("Falha ao criar o simulado.");
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800/50 shadow-lg rounded-xl p-6 md:p-8 max-w-2xl mx-auto">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-6">Cadastrar Novo Simulado</h2>
            
            <div className="space-y-4">
                <div>
                    <label htmlFor="titulo" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Título do Simulado</label>
                    <input id="titulo" required type="text" value={titulo} onChange={e => setTitulo(e.target.value)} placeholder="Ex: Simulado Carreiras Policiais 01" className="mt-1 w-full p-2 border bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 rounded-md"/>
                </div>
                
                <div>
                    <label htmlFor="banca" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Banca / Fonte</label>
                    <select id="banca" required value={banca} onChange={e => setBanca(e.target.value)} className="mt-1 w-full p-2 border bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 rounded-md">
                        {BANCAS_PREDEFINIDAS.map(b => <option key={b} value={b}>{b}</option>)}
                    </select>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label htmlFor="data" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Data de Realização</label>
                        <input id="data" required type="date" value={data} onChange={e => setData(e.target.value)} className="mt-1 w-full p-2 border bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 rounded-md" />
                    </div>
                    <div>
                        <label htmlFor="totalQuestoes" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Nº Total de Questões</label>
                        <input id="totalQuestoes" required type="number" min="1" value={totalQuestoes} onChange={e => setTotalQuestoes(e.target.value)} className="mt-1 w-full p-2 border bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 rounded-md" />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Método de Pontuação</label>
                    <select value={tipoPontuacao} onChange={e => setTipoPontuacao(e.target.value)} className="mt-1 w-full p-2 border bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 rounded-md">
                        <option value="bruta">Apenas Acertos Contam (Múltipla Escolha)</option>
                        <option value="liquida">1 Errada Anula 1 Certa (Padrão Cespe)</option>
                    </select>
                </div>
            </div>
            
            <div className="flex justify-end mt-8">
                 <button type="button" onClick={() => navigate(-1)} className="font-semibold py-2 px-6 mr-4 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition">Cancelar</button>
                <button type="submit" disabled={isSaving} className="bg-teal-500 text-white font-bold py-2 px-6 rounded-lg hover:bg-teal-600 transition disabled:opacity-50">
                    {isSaving ? 'Salvando...' : 'Criar e Avançar'}
                </button>
            </div>
        </form>
    );
};

export default AddSimulado;