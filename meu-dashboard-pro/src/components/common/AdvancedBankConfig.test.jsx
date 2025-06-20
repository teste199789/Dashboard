import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import AdvancedBankConfig from './AdvancedBankConfig';
import * as api from '../../api/apiService';

// Simula (mock) todo o módulo da API
vi.mock('../../api/apiService');

describe('components/common/AdvancedBankConfig', () => {
  const mockProof = {
    banca: 'Cespe',
    regraAnulacao: 'PADRAO',
    valorAnulacao: 1.0,
    tipoNotaCorte: 'DECIMAL',
    precisaoDecimal: 1,
  };

  const mockSuggestions = [
    { nome: 'Cespe Padrão', descricao: 'Anulada vale ponto, certo anula errado.', regraAnulacao: 'CESPE_INTEGRAL', valorAnulacao: 1.0 },
    { nome: 'Cespe Meio Ponto', descricao: 'Anulada vale 0.5 ponto.', regraAnulacao: 'CESPE_MEIO', valorAnulacao: 0.5 },
  ];

  beforeEach(() => {
    // Reseta os mocks antes de cada teste
    vi.clearAllMocks();
  });

  it('deve renderizar no modo fechado inicialmente', () => {
    render(<AdvancedBankConfig proof={mockProof} />);
    expect(screen.getByText('Configurações da Banca')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /configurar/i })).toBeInTheDocument();
    expect(screen.queryByText('Configurações Avançadas - Cespe')).not.toBeInTheDocument();
  });

  it('deve expandir, buscar e exibir sugestões ao clicar em "Configurar"', async () => {
    // Configura o mock da API para este teste
    api.getBankConfigurations.mockResolvedValue({ sugestoes: mockSuggestions });
    
    render(<AdvancedBankConfig proof={mockProof} />);
    
    // Clica no botão para expandir
    await userEvent.click(screen.getByRole('button', { name: /configurar/i }));

    // Verifica se a API foi chamada
    expect(api.getBankConfigurations).toHaveBeenCalledWith('Cespe');

    // Espera a UI atualizar e verifica se as sugestões apareceram
    await waitFor(() => {
        expect(screen.getByText('Configurações Sugeridas para Cespe:')).toBeInTheDocument();
        expect(screen.getByText('Cespe Padrão')).toBeInTheDocument();
        expect(screen.getByText('Cespe Meio Ponto')).toBeInTheDocument();
    });
  });

  it('deve chamar onConfigChange ao aplicar uma sugestão', async () => {
    api.getBankConfigurations.mockResolvedValue({ sugestoes: mockSuggestions });
    const handleChange = vi.fn(); // Mock da função de callback

    render(<AdvancedBankConfig proof={mockProof} onConfigChange={handleChange} />);
    
    // Expande o componente
    await userEvent.click(screen.getByRole('button', { name: /configurar/i }));
    
    // Encontra o botão "Aplicar" para a segunda sugestão e clica nele
    const applyButtons = await screen.findAllByRole('button', { name: /aplicar/i });
    await userEvent.click(applyButtons[1]);

    // Verifica se a função de callback foi chamada com os dados corretos
    expect(handleChange).toHaveBeenCalledTimes(1);
    expect(handleChange).toHaveBeenCalledWith({
      regraAnulacao: 'CESPE_MEIO', // da segunda sugestão
      valorAnulacao: 0.5,
      formulaAnulacao: '',
      tipoNotaCorte: 'DECIMAL',
      precisaoDecimal: 1,
    });
  });
}); 