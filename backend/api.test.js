// Define a URL do banco de dados de teste ANTES de qualquer importação
process.env.DATABASE_URL = 'file:./test.db';

const request = require('supertest');
const app = require('./server');
const { PrismaClient } = require('@prisma/client');
const { execSync } = require('child_process');

const prisma = new PrismaClient();

beforeAll(() => {
  try {
    // Executa as migrações no banco de dados de teste
    console.log('Running migrations on test database...');
    execSync('DATABASE_URL="file:./test.db" npx prisma migrate deploy', { stdio: 'inherit' });
    console.log('Migrations finished.');
  } catch (error) {
    console.error('Failed to run migrations:', error);
    process.exit(1);
  }
});

beforeEach(async () => {
  // Limpa o banco de dados antes de cada teste
  await prisma.result.deleteMany({});
  await prisma.subject.deleteMany({});
  await prisma.proof.deleteMany({});
});

afterAll(async () => {
  // Desconecta do prisma
  await prisma.$disconnect();
});

describe('Endpoints de Provas (Proofs)', () => {
  describe('POST /api/proofs', () => {
    it('deve criar uma nova prova e retornar 201', async () => {
      const novaProva = {
        titulo: 'Concurso Teste',
        banca: 'Banca Teste',
        data: '2025-01-01T00:00:00.000Z',
        totalQuestoes: 50,
        tipoPontuacao: 'bruta',
        type: 'oficial',
      };

      const response = await request(app)
        .post('/api/proofs')
        .send(novaProva);

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('id');
      expect(response.body.titulo).toBe(novaProva.titulo);

      const provaDoDb = await prisma.proof.findUnique({ where: { id: response.body.id } });
      expect(provaDoDb).not.toBeNull();
    });
  });

  describe('GET /api/proofs', () => {
    it('deve retornar uma lista de provas', async () => {
      await prisma.proof.create({
        data: {
          titulo: 'Concurso Existente',
          banca: 'Banca Existente',
          data: new Date(),
          totalQuestoes: 10,
          tipoPontuacao: 'bruta',
          type: 'oficial',
        },
      });

      const response = await request(app).get('/api/proofs');

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBe(1);
      expect(response.body[0].titulo).toBe('Concurso Existente');
    });
  });

  describe('GET /api/proofs/:id', () => {
    it('deve retornar uma prova específica', async () => {
      const prova = await prisma.proof.create({
        data: {
          titulo: 'Prova Específica',
          banca: 'Banca Específica',
          data: new Date(),
          totalQuestoes: 20,
          tipoPontuacao: 'liquida',
          type: 'simulado',
        },
      });

      const response = await request(app).get(`/api/proofs/${prova.id}`);

      expect(response.status).toBe(200);
      expect(response.body.id).toBe(prova.id);
      expect(response.body.titulo).toBe('Prova Específica');
    });

    it('deve retornar 404 para uma prova inexistente', async () => {
      const response = await request(app).get('/api/proofs/999');
      expect(response.status).toBe(404);
    });
  });

  describe('DELETE /api/proofs/:id', () => {
    it('deve deletar uma prova e retornar 204', async () => {
      const prova = await prisma.proof.create({
        data: {
          titulo: 'Prova a Deletar',
          banca: 'Banca a Deletar',
          data: new Date(),
          totalQuestoes: 5,
          tipoPontuacao: 'bruta',
          type: 'oficial',
        },
      });

      const response = await request(app).delete(`/api/proofs/${prova.id}`);
      expect(response.status).toBe(204);

      const provaDoDb = await prisma.proof.findUnique({ where: { id: prova.id } });
      expect(provaDoDb).toBeNull();
    });
  });
});

describe('Endpoints Complexos de Provas', () => {
    let provaDeTeste;
  
    beforeEach(async () => {
      // Cria uma prova base para os testes deste bloco
      provaDeTeste = await prisma.proof.create({
        data: {
          titulo: 'Prova Base',
          banca: 'Banca Base',
          data: new Date(),
          totalQuestoes: 10,
          tipoPontuacao: 'bruta',
          type: 'oficial',
          userAnswers: '1:A,2:B,3:C,4:D,5:E,6:A,7:B,8:C,9:D,10:E',
          gabaritoDefinitivo: '1:A,2:B,3:C,4:D,5:A,6:B,7:C,8:D,9:E,10:A',
          subjects: {
            create: [
              { nome: 'Materia Antiga 1', questoes: 5, questaoInicio: 1, questaoFim: 5 },
              { nome: 'Materia Antiga 2', questoes: 5, questaoInicio: 6, questaoFim: 10 },
            ],
          },
        },
      });
    });

    describe('PUT /api/proofs/:id/details', () => {
        it('deve atualizar os detalhes básicos de uma prova', async () => {
          const updates = {
            titulo: 'Título Atualizado',
            banca: 'Banca Atualizada',
          };
    
          const response = await request(app)
            .put(`/api/proofs/${provaDeTeste.id}/details`)
            .send(updates);
    
          expect(response.status).toBe(200);
          expect(response.body.titulo).toBe('Título Atualizado');
    
          const provaDoDb = await prisma.proof.findUnique({ where: { id: provaDeTeste.id } });
          expect(provaDoDb.banca).toBe('Banca Atualizada');
        });
    
        it('deve substituir as matérias existentes ao fornecer um novo array de matérias', async () => {
          const updates = {
            subjects: [
              { nome: 'Nova Materia 1', questoes: 6 },
              { nome: 'Nova Materia 2', questoes: 4 },
            ],
          };
    
          await request(app)
            .put(`/api/proofs/${provaDeTeste.id}/details`)
            .send(updates);
    
          const materiasDoDb = await prisma.subject.findMany({ where: { proofId: provaDeTeste.id } });
          expect(materiasDoDb.length).toBe(2);
          expect(materiasDoDb.map(s => s.nome)).toContain('Nova Materia 1');
          expect(materiasDoDb.map(s => s.nome)).not.toContain('Materia Antiga 1');
        });
      });

    describe('POST /api/proofs/:id/grade', () => {
        it('deve corrigir a prova, salvar os resultados e o aproveitamento', async () => {
            const response = await request(app)
              .post(`/api/proofs/${provaDeTeste.id}/grade`)
              .send();
      
            expect(response.status).toBe(200);
            expect(response.body.message).toBe('Prova corrigida com sucesso!');
      
            const provaDoDb = await prisma.proof.findUnique({ where: { id: provaDeTeste.id } });
            // 4 acertos de 10 questões = 40%
            expect(provaDoDb.aproveitamento).toBeCloseTo(40);
      
            const resultadosDoDb = await prisma.result.findMany({ where: { proofId: provaDeTeste.id } });
            expect(resultadosDoDb.length).toBe(2);
            
            const resultadoMateria1 = resultadosDoDb.find(r => r.disciplina === 'Materia Antiga 1');
            expect(resultadoMateria1.acertos).toBe(4); // 1-A, 2-B, 3-C, 4-D
            expect(resultadoMateria1.erros).toBe(1); // 5-E vs 5-A
        });

        it('deve retornar 404 se a prova não existir', async () => {
            const response = await request(app)
              .post('/api/proofs/999/grade')
              .send();
            
            expect(response.status).toBe(404);
        });
    });
}); 