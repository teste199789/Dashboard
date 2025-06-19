const express = require('express');
const cors = require('cors');
const { PrismaClient } = require('@prisma/client');
const { corrigirProva, calculateOverallPerformance } = require('./utils/correcao');

const app = express();
const prisma = new PrismaClient();

// Funções utilitárias para parse de números
const parseFlexibleFloat = (value) => {
    if (value === null || value === undefined || value === '') return null;
    const cleanStr = String(value).replace(/\./g, '').replace(',', '.');
    const num = parseFloat(cleanStr);
    return isNaN(num) ? null : num;
};

const parseFlexibleInt = (value) => {
    if (value === null || value === undefined || value === '') return null;
    const cleanStr = String(value).replace(/\./g, '').split(',')[0];
    const num = parseInt(cleanStr, 10);
    return isNaN(num) ? null : num;
};

// Configuração do CORS
app.use(cors({
    origin: ['http://localhost:5173', 'http://localhost:3000', 'http://127.0.0.1:5173'],
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true
}));

app.use(express.json());

const PORT = process.env.PORT || 3001;

// --- ROTAS DE PROVAS ---

// POST /api/proofs - Cria um novo concurso ou simulado
app.post('/api/proofs', async (req, res) => {
    try {
        const {
            titulo, banca, data, totalQuestoes, tipoPontuacao, type, orgao, cargo, notaDiscursiva,
            resultadoObjetiva, resultadoDiscursiva, resultadoFinal
        } = req.body;

        const newProof = await prisma.proof.create({
            data: {
                titulo,
                banca,
                data: new Date(data),
                totalQuestoes: parseInt(totalQuestoes),
                tipoPontuacao,
                type,
                orgao,
                cargo,
                notaDiscursiva: notaDiscursiva ? parseFloat(notaDiscursiva) : null,
                resultadoObjetiva,
                resultadoDiscursiva,
                resultadoFinal
            },
        });
        res.status(201).json(newProof);
    } catch (error) {
        console.error("Erro ao criar prova:", error);
        res.status(500).json({ error: "Não foi possível criar a prova." });
    }
});

// GET /api/proofs - Busca todas as provas e simulados
app.get('/api/proofs', async (req, res) => {
    try {
        const proofs = await prisma.proof.findMany({
            include: { results: true, subjects: true },
            orderBy: { data: 'desc' },
        });
        res.json(proofs);
    } catch (error) {
        console.error('Erro ao buscar provas:', error);
        res.status(500).json({ error: "Não foi possível buscar as provas." });
    }
});

// GET /api/proofs/:id - Busca uma prova específica
app.get('/api/proofs/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const proof = await prisma.proof.findUnique({
            where: { id: parseInt(id) },
            include: { 
                results: { orderBy: { id: 'asc' } }, 
                subjects: { orderBy: { id: 'asc' } } 
            },
        });
        
        if (!proof) {
            return res.status(404).json({ error: "Prova não encontrada." });
        }
        
        res.json(proof);
    } catch (error) {
        console.error(`Erro ao buscar prova com ID ${id}:`, error);
        res.status(500).json({ error: "Não foi possível buscar a prova." });
    }
});

// DELETE /api/proofs/:id - Deleta uma prova
app.delete('/api/proofs/:id', async (req, res) => {
    try {
        const { id } = req.params;
        await prisma.proof.delete({ where: { id: parseInt(id) } });
        res.status(204).send();
    } catch (error) {
        console.error("Erro ao deletar prova:", error);
        res.status(500).json({ error: "Não foi possível deletar a prova." });
    }
});

// PUT /api/proofs/:id/details - Atualiza detalhes da prova
app.put('/api/proofs/:id/details', async (req, res) => {
    try {
        const { id } = req.params;
        const {
            gabaritoPreliminar, gabaritoDefinitivo, userAnswers,
            subjects, totalQuestoes, titulo, banca, data, inscritos, simulacaoAnuladas, 
            orgao, cargo, notaDiscursiva,
            simulacaoNotaDeCorte, simulacaoMedia, simulacaoDesvioPadrao,
            resultadoObjetiva, resultadoDiscursiva, resultadoFinal
        } = req.body;

        const dataToUpdate = {};

        // Campos básicos
        if (titulo !== undefined) dataToUpdate.titulo = titulo;
        if (banca !== undefined) dataToUpdate.banca = banca;
        if (data !== undefined) dataToUpdate.data = new Date(data);
        if (orgao !== undefined) dataToUpdate.orgao = orgao;
        if (cargo !== undefined) dataToUpdate.cargo = cargo;
        
        // Gabaritos
        if (gabaritoPreliminar !== undefined) dataToUpdate.gabaritoPreliminar = gabaritoPreliminar;
        if (gabaritoDefinitivo !== undefined) dataToUpdate.gabaritoDefinitivo = gabaritoDefinitivo;
        if (userAnswers !== undefined) dataToUpdate.userAnswers = userAnswers;
        if (simulacaoAnuladas !== undefined) dataToUpdate.simulacaoAnuladas = simulacaoAnuladas;
        
        // Campos numéricos
        if (totalQuestoes !== undefined) dataToUpdate.totalQuestoes = parseFlexibleInt(totalQuestoes);
        if (inscritos !== undefined) dataToUpdate.inscritos = parseFlexibleInt(inscritos);
        if (notaDiscursiva !== undefined) dataToUpdate.notaDiscursiva = parseFlexibleFloat(notaDiscursiva);
        
        // Simulação de ranking
        if (simulacaoNotaDeCorte !== undefined) dataToUpdate.simulacaoNotaDeCorte = parseFlexibleFloat(simulacaoNotaDeCorte);
        if (simulacaoMedia !== undefined) dataToUpdate.simulacaoMedia = parseFlexibleFloat(simulacaoMedia);
        if (simulacaoDesvioPadrao !== undefined) dataToUpdate.simulacaoDesvioPadrao = parseFlexibleFloat(simulacaoDesvioPadrao);

        // Resultados
        if (resultadoObjetiva !== undefined) dataToUpdate.resultadoObjetiva = resultadoObjetiva;
        if (resultadoDiscursiva !== undefined) dataToUpdate.resultadoDiscursiva = resultadoDiscursiva;
        if (resultadoFinal !== undefined) dataToUpdate.resultadoFinal = resultadoFinal;

        // Atualizar matérias se fornecidas
        if (subjects) {
            let currentQuestion = 1;
            const subjectsWithRanges = subjects.map(s => {
                const start = currentQuestion;
                const end = currentQuestion + (parseInt(s.questoes) || 0) - 1;
                currentQuestion = end + 1;
                return {
                    nome: s.nome,
                    questoes: parseInt(s.questoes) || 0,
                    questaoInicio: start,
                    questaoFim: end
                };
            });
            
            await prisma.subject.deleteMany({ where: { proofId: parseInt(id) } });
            dataToUpdate.subjects = { create: subjectsWithRanges };
        }

        const updatedProof = await prisma.proof.update({ 
            where: { id: parseInt(id) }, 
            data: dataToUpdate 
        });
        
        res.json(updatedProof);
    } catch (error) {
        console.error("Erro ao salvar detalhes:", error);
        res.status(500).json({ error: "Não foi possível salvar os detalhes da prova." });
    }
});

// POST /api/proofs/:id/grade - Corrige uma prova
app.post('/api/proofs/:id/grade', async (req, res) => {
    const { id } = req.params;
    const proofId = parseInt(id);

    try {
        // Busca os dados da prova
        const proofData = await prisma.proof.findUnique({
            where: { id: proofId },
            include: { subjects: true },
        });

        if (!proofData) {
            return res.status(404).json({ error: 'Prova não encontrada.' });
        }

        // Executa a correção
        const { resultados } = corrigirProva(proofData);
        const { percentage } = calculateOverallPerformance(proofData, resultados);

        // Prepara os dados para inserção
        const dataToCreate = resultados.map(r => ({
            ...r,
            proofId: proofId,
        }));

        // Executa a transação
        await prisma.$transaction([
            prisma.result.deleteMany({ where: { proofId: proofId } }),
            prisma.result.createMany({ data: dataToCreate }),
        ]);

        // Atualiza o aproveitamento
        await prisma.proof.update({
            where: { id: proofId },
            data: { aproveitamento: percentage },
        });

        res.status(200).json({ message: "Prova corrigida com sucesso!" });

    } catch (error) {
        console.error(`Erro ao corrigir prova ${proofId}:`, error);
        res.status(500).json({ error: "Falha no processo de correção." });
    }
});

// Inicia o servidor
app.listen(PORT, () => {
    console.log(`🚀 Servidor backend rodando na porta ${PORT}`);
});

// Tratamento de erros não capturados
process.on('unhandledRejection', (err) => {
    console.error('Erro não tratado:', err);
});

process.on('uncaughtException', (err) => {
    console.error('Exceção não capturada:', err);
    process.exit(1);
});