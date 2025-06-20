const { parseGabarito, corrigirProva, calculateOverallPerformance } = require('./correcao');

describe('correcao.js', () => {
  describe('parseGabarito', () => {
    it('deve converter uma string de gabarito válida para um Map', () => {
      const gabaritoString = '1:A,2:B,3:C';
      const expectedMap = new Map([
        ['1', 'A'],
        ['2', 'B'],
        ['3', 'C'],
      ]);
      expect(parseGabarito(gabaritoString)).toEqual(expectedMap);
    });

    it('deve retornar um Map vazio para uma string vazia', () => {
      expect(parseGabarito('')).toEqual(new Map());
    });

    it('deve retornar um Map vazio para um valor nulo', () => {
      expect(parseGabarito(null)).toEqual(new Map());
    });

    it('deve ignorar entradas malformadas', () => {
      const gabaritoString = '1:A,2B,3:C,4:,:D';
      const expectedMap = new Map([
        ['1', 'A'],
        ['3', 'C'],
      ]);
      expect(parseGabarito(gabaritoString)).toEqual(expectedMap);
    });
  });

  describe('corrigirProva', () => {
    const baseProof = {
      totalQuestoes: 5,
      subjects: [
        { nome: 'Materia 1', questaoInicio: 1, questaoFim: 3 },
        { nome: 'Materia 2', questaoInicio: 4, questaoFim: 5 },
      ],
      userAnswers: '1:A,2:B,3:D,4:E,5:A',
    };

    it('deve corrigir uma prova de pontuação bruta corretamente', () => {
      const proof = {
        ...baseProof,
        gabaritoDefinitivo: '1:A,2:B,3:C,4:D,5:A',
        tipoPontuacao: 'bruta',
      };

      const { resultados } = corrigirProva(proof);
      // Materia 1: 2 acertos, 1 erro
      // Materia 2: 1 acerto, 1 erro
      expect(resultados).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ disciplina: 'Materia 1', acertos: 2, erros: 1, brancos: 0, anuladas: 0 }),
          expect.objectContaining({ disciplina: 'Materia 2', acertos: 1, erros: 1, brancos: 0, anuladas: 0 }),
        ])
      );
    });

    it('deve tratar questões em branco corretamente', () => {
        const proof = {
          ...baseProof,
          userAnswers: '1:A,3:C,5:A', // Questões 2 e 4 em branco
          gabaritoDefinitivo: '1:A,2:B,3:C,4:D,5:A',
          tipoPontuacao: 'bruta',
        };
  
        const { resultados } = corrigirProva(proof);
        // Materia 1: 2 acertos, 1 em branco
        // Materia 2: 1 acerto, 1 em branco
        expect(resultados).toEqual(
          expect.arrayContaining([
            expect.objectContaining({ disciplina: 'Materia 1', acertos: 2, erros: 0, brancos: 1, anuladas: 0 }),
            expect.objectContaining({ disciplina: 'Materia 2', acertos: 1, erros: 0, brancos: 1, anuladas: 0 }),
          ])
        );
      });

    it('deve tratar questões anuladas como acertos (X, N, ANULADA)', () => {
      const proof = {
        ...baseProof,
        userAnswers: '1:A,2:D,3:E,4:B,5:C', // Errou todas as anuladas
        gabaritoDefinitivo: '1:X,2:N,3:ANULADA,4:D,5:A',
        tipoPontuacao: 'bruta',
      };

      const { resultados } = corrigirProva(proof);
      // Materia 1: 3 anuladas (contam como acerto)
      // Materia 2: 0 acertos, 2 erros
      expect(resultados).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ disciplina: 'Materia 1', acertos: 3, erros: 0, brancos: 0, anuladas: 3 }),
          expect.objectContaining({ disciplina: 'Materia 2', acertos: 0, erros: 2, brancos: 0, anuladas: 0 }),
        ])
      );
    });
    
    it('deve usar o gabarito preliminar se o definitivo não estiver disponível', () => {
        const proof = {
          ...baseProof,
          gabaritoPreliminar: '1:A,2:B,3:C,4:D,5:A',
          gabaritoDefinitivo: null,
          tipoPontuacao: 'bruta',
        };
  
        const { resultados } = corrigirProva(proof);
        expect(resultados).toEqual(
            expect.arrayContaining([
              expect.objectContaining({ disciplina: 'Materia 1', acertos: 2, erros: 1, brancos: 0, anuladas: 0 }),
              expect.objectContaining({ disciplina: 'Materia 2', acertos: 1, erros: 1, brancos: 0, anuladas: 0 }),
            ])
          );
      });
  });

  describe('calculateOverallPerformance', () => {
    const calculatedResults = [
      { disciplina: 'Materia 1', acertos: 15, erros: 5, brancos: 0, anuladas: 0 },
      { disciplina: 'Materia 2', acertos: 30, erros: 5, brancos: 0, anuladas: 0 },
    ];

    it('deve calcular o aproveitamento para pontuação bruta', () => {
      const proof = { totalQuestoes: 55, tipoPontuacao: 'bruta' };
      // Total de acertos = 45. Total de questões = 55. (45/55) * 100 = 81.81...
      const { percentage } = calculateOverallPerformance(proof, calculatedResults);
      expect(percentage).toBeCloseTo(81.82);
    });

    it('deve calcular o aproveitamento para pontuação líquida', () => {
      const proof = { totalQuestoes: 55, tipoPontuacao: 'liquida' };
      // Pontuação líquida = 45 (acertos) - 10 (erros) = 35. (35/55) * 100 = 63.63...
      const { percentage } = calculateOverallPerformance(proof, calculatedResults);
      expect(percentage).toBeCloseTo(63.64);
    });

    it('deve retornar 0 se a pontuação líquida for negativa', () => {
        const resultsWithNegativeScore = [
            { disciplina: 'Materia 1', acertos: 5, erros: 10, brancos: 0, anuladas: 0 },
        ];
        const proof = { totalQuestoes: 15, tipoPontuacao: 'liquida' };
        // Pontuação líquida = 5 - 10 = -5. Deve ser 0.
        const { percentage } = calculateOverallPerformance(proof, resultsWithNegativeScore);
        expect(percentage).toBe(0);
      });
  });
}); 