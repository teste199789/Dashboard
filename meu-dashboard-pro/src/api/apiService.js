// A URL do seu backend.
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

// --- Funções para a API de Provas ---

export const getProofs = async () => {
    const response = await fetch(`${API_URL}/proofs`);
    if (!response.ok) {
        throw new Error(`Erro de HTTP! Status: ${response.status}`);
    }
    return response.json();
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

export const updateProofDetails = async (id, details) => {
    const response = await fetch(`${API_URL}/proofs/${id}/details`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(details),
    });
    if (!response.ok) {
        throw new Error(`Erro de HTTP! Status: ${response.status}`);
    }
    return response.json();
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