import React from 'react';
import { Outlet } from 'react-router-dom';
import { useProofs } from '../hooks/useProofs';
import ConfirmationModal from '../components/common/ConfirmationModal';
import Header from '../components/layout/Header';

const MainLayout = () => {
    const { modalState, closeDeleteModal, handleDeleteProof } = useProofs();

    return (
        <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-gray-900 font-sans text-gray-900 dark:text-gray-100">
            {/* Banner de Modo Desenvolvimento */}
            {import.meta.env.DEV && (
                <div className="fixed bottom-4 left-4 z-50 bg-yellow-400 text-black px-3 py-1 text-sm font-semibold rounded-lg shadow-lg">
                    Modo de Desenvolvimento
                </div>
            )}

            <ConfirmationModal
                isOpen={modalState.isOpen}
                onCancel={closeDeleteModal}
                onConfirm={handleDeleteProof}
                title="Confirmar Exclusão"
                message="Você tem certeza que deseja deletar este item? Esta ação não pode ser desfeita."
            />
            <div className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
                <Header />
                <main className="flex-grow">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default MainLayout;