const express = require('express');
const cors = require('cors');
const { PrismaClient } = require('@prisma/client');
const { corrigirProva, calculateOverallPerformance } = require('./utils/correcao');

const app = express();
const prisma = new PrismaClient();

// Funções utilitárias para parse de números
const parseFlexibleFloat = (value) => {
    if (value === null || value === undefined || value === '') return null;
    
    const str = String(value).trim();
    
    // Se já está em formato padrão (ponto como decimal), usa diretamente
    if (/^\d+(\.\d+)?$/.test(str)) {
        const num = parseFloat(str);
        return isNaN(num) ? null : num;
    }
    
    // Se está em formato brasileiro (vírgula como decimal)
    if (/^\d+,\d+$/.test(str)) {
        const num = parseFloat(str.replace(',', '.'));
        return isNaN(num) ? null : num;
    }
    
    // Se tem pontos como separadores de milhares e vírgula como decimal (ex: 1.000,50)
    if (/^\d{1,3}(\.\d{3})*,\d+$/.test(str)) {
        const cleanStr = str.replace(/\./g, '').replace(',', '.');
        const num = parseFloat(cleanStr);
        return isNaN(num) ? null : num;
    }
    
    // Caso padrão: tentar parse direto
    const num = parseFloat(str);
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

        // Buscar informações atuais da prova para validação
        const currentProof = await prisma.proof.findUnique({
            where: { id: parseInt(id) }
        });

        if (!currentProof) {
            return res.status(404).json({ error: "Prova não encontrada." });
        }

        const maxQuestoes = totalQuestoes || currentProof.totalQuestoes;

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
        
        // Simulação de ranking com validação
        if (simulacaoNotaDeCorte !== undefined) {
            const corteValue = parseFlexibleFloat(simulacaoNotaDeCorte);
            if (corteValue !== null && corteValue > maxQuestoes) {
                return res.status(400).json({ 
                    error: `Nota de corte (${corteValue}) não pode ser maior que o total de questões (${maxQuestoes})` 
                });
            }
            dataToUpdate.simulacaoNotaDeCorte = corteValue;
        }
        
        if (simulacaoMedia !== undefined) {
            const mediaValue = parseFlexibleFloat(simulacaoMedia);
            if (mediaValue !== null && mediaValue > maxQuestoes) {
                return res.status(400).json({ 
                    error: `Nota média (${mediaValue}) não pode ser maior que o total de questões (${maxQuestoes})` 
                });
            }
            dataToUpdate.simulacaoMedia = mediaValue;
        }
        
        if (simulacaoDesvioPadrao !== undefined) {
            const desvioValue = parseFlexibleFloat(simulacaoDesvioPadrao);
            if (desvioValue !== null && desvioValue > maxQuestoes) {
                return res.status(400).json({ 
                    error: `Desvio padrão (${desvioValue}) não pode ser maior que o total de questões (${maxQuestoes})` 
                });
            }
            dataToUpdate.simulacaoDesvioPadrao = desvioValue;
        }

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
        
        console.log(`[BACKEND] Prova ${id} atualizada com sucesso:`, {
            simulacaoMedia: updatedProof.simulacaoMedia,
            simulacaoNotaDeCorte: updatedProof.simulacaoNotaDeCorte,
            simulacaoDesvioPadrao: updatedProof.simulacaoDesvioPadrao
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