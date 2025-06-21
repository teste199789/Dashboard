import React from 'react';
import { render, screen, act } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { ProofsProvider, useProofs } from './ProofsContext';
import * as api from '../api/apiService';
import toast from 'react-hot-toast';

// Mocking the apiService and react-hot-toast
vi.mock('../api/apiService');
vi.mock('react-hot-toast');

const mockProofs = [
    { id: 1, titulo: 'Concurso A', subjects: [], results: [] },
    { id: 2, titulo: 'Concurso B', subjects: [], results: [] },
];

// A simple test component to consume the context
const TestConsumer = () => {
    const { proofs, openDeleteModal, handleDeleteProof, modalState } = useProofs();
    return (
        <div>
            <h1>Provas</h1>
            <ul>
                {proofs.map(p => <li key={p.id}>{p.titulo}</li>)}
            </ul>
            <button onClick={() => openDeleteModal({ id: 1 })}>Abrir Modal para Prova 1</button>
            <button onClick={() => handleDeleteProof()}>Confirmar Exclusão</button>
            <span data-testid="modal-status">{modalState.isOpen ? 'aberto' : 'fechado'}</span>
            <span data-testid="modal-proof-id">{modalState.proofId}</span>
        </div>
    );
};

// Wrapper component to provide the context
const renderWithProvider = (component) => {
    return render(
        <ProofsProvider>
            {component}
        </ProofsProvider>
    );
};

describe('ProofsContext', () => {
    beforeEach(() => {
        // Reset mocks before each test
        vi.clearAllMocks();

        // Mock window.location for redirection tests
        const location = new URL("http://localhost/dashboard");
        delete window.location;
        window.location = {
            ...location,
            href: vi.fn(),
            pathname: '/dashboard'
        };

        // Default mock for getProofs
        api.getProofs.mockResolvedValue(mockProofs);
    });

    describe('handleDeleteProof', () => {
        it('deve chamar a api de exclusão com o ID correto e recarregar as provas em caso de sucesso', async () => {
            api.deleteProof.mockResolvedValue(true);
            
            renderWithProvider(<TestConsumer />);
            
            // Wait for initial proofs to load
            await screen.findByText('Concurso A');

            // 1. User opens the modal
            const openModalButton = screen.getByText('Abrir Modal para Prova 1');
            act(() => {
                openModalButton.click();
            });

            // Check if modal state is updated
            expect(screen.getByTestId('modal-status').textContent).toBe('aberto');
            expect(screen.getByTestId('modal-proof-id').textContent).toBe('1');

            // 2. User confirms deletion
            const confirmButton = screen.getByText('Confirmar Exclusão');
            
            // We need to refetch proofs after deletion
            api.getProofs.mockResolvedValue([mockProofs[1]]); // Return only the remaining proof

            await act(async () => {
                confirmButton.click();
            });

            // Assertions
            expect(api.deleteProof).toHaveBeenCalledTimes(1);
            expect(api.deleteProof).toHaveBeenCalledWith(1);
            
            expect(toast.success).toHaveBeenCalledWith("Item deletado com sucesso!");
            
            // fetchProofs should be called again after deletion
            expect(api.getProofs).toHaveBeenCalledTimes(2); // 1 initial, 1 after delete
            
            // Check if the UI updated
            expect(screen.queryByText('Concurso A')).not.toBeInTheDocument();
            expect(screen.getByText('Concurso B')).toBeInTheDocument();
            
            // Check if modal is closed
            expect(screen.getByTestId('modal-status').textContent).toBe('fechado');
        });

        it('deve exibir uma notificação de erro se a API falhar', async () => {
            const error = new Error('Falha na API');
            api.deleteProof.mockRejectedValue(error);

            renderWithProvider(<TestConsumer />);
            await screen.findByText('Concurso A');

            // 1. Open modal
            act(() => {
                screen.getByText('Abrir Modal para Prova 1').click();
            });

            // 2. Confirm deletion
            await act(async () => {
                screen.getByText('Confirmar Exclusão').click();
            });

            // Assertions
            expect(api.deleteProof).toHaveBeenCalledTimes(1);
            expect(api.deleteProof).toHaveBeenCalledWith(1);

            expect(toast.error).toHaveBeenCalledWith("Falha ao deletar o item.");
            
            // The list of proofs should not change
            expect(screen.getByText('Concurso A')).toBeInTheDocument();
            expect(screen.getByText('Concurso B')).toBeInTheDocument();

            // Modal should be closed even on failure
            expect(screen.getByTestId('modal-status').textContent).toBe('fechado');
        });

        it('deve redirecionar se o usuário estiver na página do item excluído', async () => {
            api.deleteProof.mockResolvedValue(true);
            window.location.pathname = '/minhas-provas/1'; // Simulate being on the deleted proof's page

            renderWithProvider(<TestConsumer />);
            await screen.findByText('Concurso A');

            act(() => {
                screen.getByText('Abrir Modal para Prova 1').click();
            });

            await act(async () => {
                screen.getByText('Confirmar Exclusão').click();
            });

            expect(api.deleteProof).toHaveBeenCalledWith(1);
            expect(window.location.href).toBe('/dashboard');
            // fetchProofs should NOT be called when redirecting
            expect(api.getProofs).toHaveBeenCalledTimes(1); 
        });
    });
}); 