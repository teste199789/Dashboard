import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProofs } from '../hooks/useProofs';

const BANCAS_PREDEFINIDAS = ["Cespe/Cebraspe", "FGV", "FCC", "Outra"];

const AddProof = () => {
    const navigate = useNavigate();
    const { handleAddProof } = useProofs(); // Usaremos a mesma função, mas ela fará algo novo
    const [isSaving, setIsSaving] = useState(false);
    
    const [titulo, setTitulo] = useState('');
    const [banca, setBanca] = useState('');
    const [data, setData] = useState('');
    const [totalQuestoes, setTotalQuestoes] = useState('');
    const [tipoPontuacao, setTipoPontuacao] = useState('liquida');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSaving(true);
        const newProofData = { titulo, banca, data, totalQuestoes, tipoPontuacao };
        
        // A função handleAddProof agora só cria a prova e retorna o ID
        const newProof = await handleAddProof(newProofData); 

        setIsSaving(false);
        if (newProof && newProof.id) {
            // Após criar, redireciona para a nova página de gerenciamento
            navigate(`/minhas-provas/${newProof.id}`); 
        }
    };

    return (
        <form onSubmit={handleSubmit} className="bg-white shadow-lg rounded-xl p-6 md:p-8 max-w-2xl mx-auto">
            <h2 className="text-2xl font-bold text-gray-700 mb-6">Cadastrar Novo Concurso</h2>
            
            <div className="space-y-4">
                <div>
                    <label htmlFor="titulo" className="block text-sm font-medium text-gray-700">Título do Concurso</label>
                    <input id="titulo" required type="text" value={titulo} onChange={e => setTitulo(e.target.value)} placeholder="Ex: Analista de TI - STJ" className="mt-1 w-full p-3 border border-gray-300 rounded-lg"/>
                </div>
                
                <div>
                    <label htmlFor="banca" className="block text-sm font-medium text-gray-700">Banca</label>
                    <select id="banca" required value={banca} onChange={e => setBanca(e.target.value)} className="mt-1 w-full p-3 border border-gray-300 rounded-lg bg-white">
                        <option value="" disabled>Selecione uma banca</option>
                        {BANCAS_PREDEFINIDAS.map(b => <option key={b} value={b}>{b}</option>)}
                    </select>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label htmlFor="data" className="block text-sm font-medium text-gray-700">Data da Prova</label>
                        <input id="data" required type="date" value={data} onChange={e => setData(e.target.value)} className="mt-1 w-full p-3 border border-gray-300 rounded-lg" />
                    </div>
                    <div>
                        <label htmlFor="totalQuestoes" className="block text-sm font-medium text-gray-700">Nº Total de Questões</label>
                        <input id="totalQuestoes" required type="number" min="1" value={totalQuestoes} onChange={e => setTotalQuestoes(e.target.value)} className="mt-1 w-full p-3 border border-gray-300 rounded-lg" />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700">Método de Pontuação</label>
                    <select value={tipoPontuacao} onChange={e => setTipoPontuacao(e.target.value)} className="mt-1 w-full p-3 border border-gray-300 rounded-lg bg-white">
                        <option value="liquida">1 Errada Anula 1 Certa (Padrão Cespe)</option>
                        <option value="bruta">Apenas Acertos Contam (Padrão Múltipla Escolha)</option>
                    </select>
                </div>
            </div>
            
            <div className="flex justify-end mt-8">
                 <button type="button" onClick={() => navigate(-1)} className="text-gray-600 font-bold py-3 px-6 mr-4 rounded-lg hover:bg-gray-200 transition">Cancelar</button>
                <button type="submit" disabled={isSaving} className="bg-teal-500 text-white font-bold py-3 px-6 rounded-lg hover:bg-teal-600">
                    {isSaving ? 'Salvando...' : 'Criar e Avançar'}
                </button>
            </div>
        </form>
    );
};

export default AddProof;