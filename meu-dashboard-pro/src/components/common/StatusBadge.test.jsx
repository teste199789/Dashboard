import React from 'react';
import { render, screen } from '@testing-library/react';
import StatusBadge, { getStatus } from './StatusBadge';

describe('components/common/StatusBadge', () => {
  // --- Testes unitários para a lógica da função getStatus ---
  describe('getStatus logic', () => {
    const baseProof = { userAnswers: '', gabaritoDefinitivo: '', aproveitamento: null, resultadoFinal: null };

    it('deve retornar "Finalizado" se a prova tiver resultadoFinal', () => {
      const proof = { ...baseProof, resultadoFinal: { status: 'Aprovado' } };
      const status = getStatus(proof);
      expect(status.text).toBe('Finalizado');
      expect(status.color).toContain('bg-green-100');
    });

    it('deve retornar "Lançar Resultado" se a prova tiver aproveitamento', () => {
      const proof = { ...baseProof, aproveitamento: 80 };
      const status = getStatus(proof);
      expect(status.text).toBe('Lançar Resultado');
      expect(status.color).toContain('bg-purple-100');
    });

    it('deve retornar "Pronto para Corrigir" se tiver gabaritos do usuário e oficial', () => {
      const proof = { ...baseProof, userAnswers: '1:A', gabaritoDefinitivo: '1:A' };
      const status = getStatus(proof);
      expect(status.text).toBe('Pronto para Corrigir');
      expect(status.color).toContain('bg-blue-100');
    });

    it('deve retornar "Pendente Gabarito Oficial" se faltar o gabarito oficial', () => {
        const proof = { ...baseProof, userAnswers: '1:A' };
        const status = getStatus(proof);
        expect(status.text).toBe('Pendente Gabarito Oficial');
        expect(status.color).toContain('bg-yellow-100');
    });

    it('deve retornar "Pendente Meu Gabarito" se faltar o gabarito do usuário', () => {
      const proof = { ...baseProof, gabaritoDefinitivo: '1:A' };
      const status = getStatus(proof);
      expect(status.text).toBe('Pendente Meu Gabarito');
      expect(status.color).toContain('bg-orange-100');
    });

    it('deve retornar "Pendente" como fallback', () => {
        const proof = { ...baseProof };
        const status = getStatus(proof);
        expect(status.text).toBe('Pendente');
        expect(status.color).toContain('bg-gray-100');
    });
  });

  // --- Teste de renderização para o componente StatusBadge ---
  describe('StatusBadge component rendering', () => {
    it('deve renderizar o badge com o texto e a cor corretos', () => {
      // Usamos um mock de prova que resultará em "Pronto para Corrigir"
      const proofMock = {
        userAnswers: '1:A,2:B',
        gabaritoDefinitivo: '1:A,2:C',
        aproveitamento: null,
        resultadoFinal: null,
      };

      render(<StatusBadge proof={proofMock} />);

      // Verifica se o texto está na tela
      const badgeElement = screen.getByText('Pronto para Corrigir');
      expect(badgeElement).toBeInTheDocument();

      // Verifica se a classe de cor está aplicada
      expect(badgeElement).toHaveClass('bg-blue-100');
      expect(badgeElement).toHaveClass('text-blue-800');
    });
  });
}); 