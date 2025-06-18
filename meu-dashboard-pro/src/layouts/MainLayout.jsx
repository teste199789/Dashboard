import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { useProofs } from '../hooks/useProofs';
import ConfirmationModal from '../components/common/ConfirmationModal';
import ChartBarIcon from '../components/icons/ChartBarIcon';
import NavButton from '../components/common/NavButton';
import ThemeToggle from '../components/common/ThemeToggle';
import MenuIcon from '../components/icons/MenuIcon';
import XIcon from '../components/icons/XIcon';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Função para fechar o menu ao clicar em um link (melhora a experiência no mobile)
  const closeMenu = () => setIsMenuOpen(false);

  return (
    <>
      <header className="mb-6">
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <ChartBarIcon className="w-8 h-8 md:w-10 md:h-10 mr-3 text-teal-500" />
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-gray-100">Dashboard de Provas</h1>
              <p className="text-gray-500 dark:text-gray-400 text-sm md:text-base">Sua central de análise de desempenho.</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <ThemeToggle />
            <div className="md:hidden">
              <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="p-2 rounded-md text-gray-600 dark:text-gray-300">
                {isMenuOpen ? <XIcon className="w-6 h-6" /> : <MenuIcon className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Navegação de Desktop */}
      <nav className="hidden md:flex space-x-2 mb-8 bg-white dark:bg-gray-800 p-2 rounded-lg shadow-sm">
        <NavButton to="/">Dashboard</NavButton>
        <NavButton to="/controle-concursos">Controle</NavButton>
        <NavButton to="/meus-concursos">Evolução</NavButton>
        <NavButton to="/minhas-provas">Histórico</NavButton>
        <NavButton to="/cadastrar-prova">Cadastrar Prova</NavButton>
        <NavButton to="/cadastrar-simulado">Cadastrar Simulado</NavButton>
      </nav>

      {/* Navegação Mobile */}
      {isMenuOpen && (
        <nav onClick={closeMenu} className="flex flex-col space-y-2 md:hidden mb-8 bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm">
          <NavButton to="/">Dashboard</NavButton>
          <NavButton to="/controle-concursos">Controle</NavButton>
          <NavButton to="/meus-concursos">Evolução</NavButton>
          <NavButton to="/minhas-provas">Histórico</NavButton>
          <NavButton to="/cadastrar-prova">Cadastrar Prova</NavButton>
          <NavButton to="/cadastrar-simulado">Cadastrar Simulado</NavButton>
        </nav>
      )}
    </>
  );
};

const MainLayout = () => {
    const { modalState, closeDeleteModal, handleDeleteProof } = useProofs();

    return (
        <div className="bg-gray-100 dark:bg-gray-900 min-h-screen font-sans text-gray-800 dark:text-gray-200">
            <ConfirmationModal
                isOpen={modalState.isOpen}
                onCancel={closeDeleteModal}
                onConfirm={handleDeleteProof}
                title="Confirmar Exclusão"
                message="Você tem certeza que deseja deletar este item? Esta ação não pode ser desfeita."
            />
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                <Header />
                <main>
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default MainLayout;