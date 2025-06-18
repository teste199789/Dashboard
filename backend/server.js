const express = require('express');
const cors = require('cors');
const { PrismaClient } = require('@prisma/client');
const { corrigirProva, calculateOverallPerformance } = require('./utils/correcao');

const app = express();
const prisma = new PrismaClient();

app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3001;

// --- ROTAS DE PROVAS ---

// POST /api/proofs (Cria um novo concurso ou simulado)
app.post('/api/proofs', async (req, res) => {
    try {
        const {
            titulo, banca, data, totalQuestoes, tipoPontuacao, type, orgao, cargo, notaDiscursiva,
            // NOVOS CAMPOS
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
                // NOVOS CAMPOS
                resultadoObjetiva,
                resultadoDiscursiva,
                resultadoFinal
            },
        });
        res.status(201).json(newProof);
    } catch (error) {
        console.error("ERRO AO CRIAR PROVA:", error);
        res.status(500).json({ error: "Não foi possível criar a prova." });
    }
});

// GET /api/proofs (Busca todas as provas e simulados)
app.get('/api/proofs', async (req, res) => {
    try {
        const proofs = await prisma.proof.findMany({
            include: { results: true, subjects: true },
            orderBy: { data: 'desc' },
        });
        res.json(proofs);
    } catch (error) {
        res.status(500).json({ error: "Não foi possível buscar as provas." });
    }
});

// GET /api/proofs/:id (Busca uma prova ou simulado específico)
app.get('/api/proofs/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const proof = await prisma.proof.findUnique({
            where: { id: parseInt(id) },
            include: { results: { orderBy: { id: 'asc' } }, subjects: { orderBy: { id: 'asc' } } },
        });
        if (!proof) {
            return res.status(404).json({ error: "Prova não encontrada." });
        }
        res.json(proof);
    } catch (error) {
        console.error(`[Backend] Erro ao buscar prova com ID ${id}:`, error);
        res.status(500).json({ error: "Não foi possível buscar a prova." });
    }
});

// DELETE /api/proofs/:id (Deleta uma prova ou simulado)
app.delete('/api/proofs/:id', async (req, res) => {
    try {
        const { id } = req.params;
        await prisma.proof.delete({ where: { id: parseInt(id) } });
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ error: "Não foi possível deletar a prova." });
    }
});

// PUT /api/proofs/:id/details (Atualiza detalhes como gabaritos, matérias, etc.)
app.put('/api/proofs/:id/details', async (req, res) => {
    try {
        const { id } = req.params;
        const {
            gabaritoPreliminar, gabaritoDefinitivo, userAnswers,
            subjects, totalQuestoes, titulo, banca, data, inscritos, simulacaoAnuladas, orgao, cargo, notaDiscursiva,
            // NOVOS CAMPOS
            resultadoObjetiva, resultadoDiscursiva, resultadoFinal
        } = req.body;

        const dataToUpdate = {};

        if (titulo !== undefined) dataToUpdate.titulo = titulo;
        if (banca !== undefined) dataToUpdate.banca = banca;
        if (data !== undefined) dataToUpdate.data = new Date(data);
        if (gabaritoPreliminar !== undefined) dataToUpdate.gabaritoPreliminar = gabaritoPreliminar;
        if (gabaritoDefinitivo !== undefined) dataToUpdate.gabaritoDefinitivo = gabaritoDefinitivo;
        if (userAnswers !== undefined) dataToUpdate.userAnswers = userAnswers;
        if (totalQuestoes !== undefined) dataToUpdate.totalQuestoes = parseInt(totalQuestoes);
        if (inscritos !== undefined) dataToUpdate.inscritos = parseInt(inscritos);
        if (simulacaoAnuladas !== undefined) dataToUpdate.simulacaoAnuladas = simulacaoAnuladas;
        if (orgao !== undefined) dataToUpdate.orgao = orgao;
        if (cargo !== undefined) dataToUpdate.cargo = cargo;
        if (notaDiscursiva !== undefined) dataToUpdate.notaDiscursiva = notaDiscursiva ? parseFloat(notaDiscursiva) : null;
        // NOVOS CAMPOS
        if (resultadoObjetiva !== undefined) dataToUpdate.resultadoObjetiva = resultadoObjetiva;
        if (resultadoDiscursiva !== undefined) dataToUpdate.resultadoDiscursiva = resultadoDiscursiva;
        if (resultadoFinal !== undefined) dataToUpdate.resultadoFinal = resultadoFinal;


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

        const updatedProof = await prisma.proof.update({ where: { id: parseInt(id) }, data: dataToUpdate });
        res.json(updatedProof);
    } catch (error) {
        console.error("ERRO AO SALVAR DETALHES:", error);
        res.status(500).json({ error: "Não foi possível salvar os detalhes da prova." });
    }
});


// --- ROTA DE CORREÇÃO (COM VERIFICAÇÃO DE SEGURANÇA) ---
app.post('/api/proofs/:id/grade', async (req, res) => {
    try {
        const { id } = req.params;
        const proofId = parseInt(id);

        const proofData = await prisma.proof.findUnique({
            where: { id: proofId },
            include: { subjects: true },
        });

        if (!proofData || !proofData.userAnswers || (!proofData.gabaritoDefinitivo && !proofData.gabaritoPreliminar)) {
            return res.status(400).json({ error: "Para corrigir, preencha seu gabarito e pelo menos um dos gabaritos da banca." });
        }
        if (!proofData.subjects || proofData.subjects.length === 0) {
            return res.status(400).json({ error: "As matérias do concurso não foram definidas." });
        }

        // Chama a correção e pega os resultados
        const correctionData = corrigirProva(proofData);

        // VERIFICAÇÃO DE SEGURANÇA
        if (!correctionData || !correctionData.resultados) {
            throw new Error("A função de correção não retornou um resultado válido.");
        }

        const { resultados: resultadosPorMateria } = correctionData;
        const performanceGeral = calculateOverallPerformance(proofData, resultadosPorMateria);

        await prisma.proof.update({
            where: { id: proofId },
            data: { aproveitamento: performanceGeral.percentage }
        });

        const dataToCreate = resultadosPorMateria.map(r => ({ ...r, proofId }));

        await prisma.$transaction([
            prisma.result.deleteMany({ where: { proofId: proofId } }),
            prisma.result.createMany({ data: dataToCreate }),
        ]);

        res.status(200).json({ message: "Prova corrigida com sucesso!" });

    } catch (error) {
        console.error("ERRO AO CORRIGIR PROVA:", error);
        res.status(500).json({ error: "Falha no processo de correção." });
    }
});

// Inicia o servidor
app.listen(PORT, () => {
    console.log(`🚀 Servidor backend rodando na porta ${PORT}`);
});