// A URL do seu backend.
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

// --- Funções para a API de Provas ---

export const getProofs = async () => {
    console.log(`[Frontend] Fazendo requisição para: ${API_URL}/proofs`);
    try {
        const response = await fetch(`${API_URL}/proofs`);
        console.log(`[Frontend] Response status: ${response.status}`);
        console.log(`[Frontend] Response ok: ${response.ok}`);
        
        if (!response.ok) {
            const errorText = await response.text();
            console.error(`[Frontend] Erro na resposta: ${errorText}`);
            throw new Error(`Erro de HTTP! Status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log(`[Frontend] Dados recebidos:`, data);
        return data;
    } catch (error) {
        console.error(`[Frontend] Erro na função getProofs:`, error);
        throw error;
    }
};

export const addProof = async (newProof) => {
    const response = await fetch(`${API_URL}/proofs`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newProof),
    });
    if (!response.ok) {
        throw new Error(`Erro de HTTP! Status: ${response.status}`);
    }
    return response.json();
};

export const deleteProof = async (id) => {
    const response = await fetch(`${API_URL}/proofs/${id}`, {
        method: 'DELETE',
    });
    if (!response.ok) {
        throw new Error(`Erro de HTTP! Status: ${response.status}`);
    }
    return response.ok; // Retorna true se a operação foi bem-sucedida
};

export const getProofById = async (id) => {
    const response = await fetch(`${API_URL}/proofs/${id}`);
    if (!response.ok) {
        throw new Error(`Erro de HTTP! Status: ${response.status}`);
    }
    return response.json();
};

export const updateProofDetails = async (proofId, details) => {
    try {
        const response = await fetch(`${API_URL}/proofs/${proofId}/details`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(details)
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || `Erro HTTP: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error('Erro ao atualizar detalhes da prova:', error);
        throw error;
    }
};

export const gradeProof = async (id) => {
    const response = await fetch(`${API_URL}/proofs/${id}/grade`, {
        method: 'POST',
    });
    if (!response.ok) {
        throw new Error(`Erro de HTTP! Status: ${response.status}`);
    }
    return response.json();
};

export const updateProof = async (id, proofData) => {
    const response = await fetch(`${API_URL}/proofs/${id}/details`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(proofData),
    });
    if (!response.ok) {
        const errorBody = await response.text();
        console.error("Erro ao atualizar prova:", errorBody);
        throw new Error('Falha ao atualizar prova.');
    }
    return await response.json();
};

// --- Função para a API da Gemini ---

export const getAIAnalysis = async (disciplinas, totais) => {
    const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
    if (!GEMINI_API_KEY) {
        return "Chave da API da Gemini não encontrada. Configure VITE_GEMINI_API_KEY no seu arquivo .env.local";
    }

    const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${GEMINI_API_KEY}`;
    
    const prompt = `Você é um mentor de estudos experiente e motivacional. Analise os seguintes dados de desempenho consolidados e forneça um feedback construtivo. Dados: ${JSON.stringify({ disciplinas, totais })}. Sua análise deve incluir: 1. Resumo geral. 2. Pontos fortes. 3. Pontos a melhorar (erros e brancos). 4. Duas sugestões práticas. 5. Mensagem de motivação. Formate usando HTML simples (ex: <b>, <ul>, <li>).`;

    try {
        const payload = { contents: [{ role: "user", parts: [{ text: prompt }] }] };
        const response = await fetch(GEMINI_API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
        });

        if (!response.ok) {
            throw new Error(`Erro na API da Gemini! Status: ${response.status}`);
        }

        const result = await response.json();
        // Acessa o texto da resposta de forma segura
        return result.candidates?.[0]?.content?.parts?.[0]?.text || 'Não foi possível obter uma análise. Tente novamente.';
    } catch (error) {
        console.error("Erro ao conectar com a IA:", error);
        return 'Ocorreu um erro ao conectar com o serviço de análise.';
    }
    
};

export const getBankConfigurations = async (bankName) => {
    try {
        const response = await fetch(`${API_URL}/bancas/${encodeURIComponent(bankName)}/configuracoes`);
        
        if (!response.ok) {
            throw new Error(`Erro HTTP: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error('Erro ao buscar configurações da banca:', error);
        throw error;
    }
};