import { formatPercent, formatPercentAlreadyScaled } from './formatters';

describe('utils/formatters', () => {
  describe('formatPercent', () => {
    it('deve formatar um número decimal em uma string de porcentagem', () => {
      expect(formatPercent(0.8525)).toBe('85,25%');
    });

    it('deve formatar 1 como "100,00%"', () => {
      expect(formatPercent(1)).toBe('100,00%');
    });

    it('deve formatar 0 como "0,00%"', () => {
      expect(formatPercent(0)).toBe('0,00%');
    });

    it('deve retornar "-" para valores nulos ou indefinidos', () => {
      expect(formatPercent(null)).toBe('-');
      expect(formatPercent(undefined)).toBe('-');
    });
  });

  describe('formatPercentAlreadyScaled', () => {
    it('deve formatar um número na escala 0-100 em uma string de porcentagem', () => {
      expect(formatPercentAlreadyScaled(75.5)).toBe('75,50%');
    });

    it('deve formatar 100 como "100,00%"', () => {
      expect(formatPercentAlreadyScaled(100)).toBe('100,00%');
    });

    it('deve formatar 0 como "0,00%"', () => {
      expect(formatPercentAlreadyScaled(0)).toBe('0,00%');
    });

    it('deve retornar "-" para valores nulos ou indefinidos', () => {
      expect(formatPercentAlreadyScaled(null)).toBe('-');
      expect(formatPercentAlreadyScaled(undefined)).toBe('-');
    });
  });
}); 