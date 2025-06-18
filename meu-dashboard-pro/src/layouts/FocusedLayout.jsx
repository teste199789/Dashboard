import React from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import ThemeToggle from '../components/common/ThemeToggle';
import ChartBarIcon from '../components/icons/ChartBarIcon';

// Ícone para o botão "Voltar"
const ArrowLeftIcon = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
    </svg>
);


const FocusedLayout = () => {
    const navigate = useNavigate();

    return (
        <div className="bg-gray-100 dark:bg-gray-900 min-h-screen font-sans text-gray-800 dark:text-gray-200">
            {/* Cabeçalho Simplificado */}
            <header className="bg-white dark:bg-gray-800 shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <div className="flex items-center gap-3">
                            <ChartBarIcon className="w-8 h-8 text-teal-500" />
                            <span className="font-bold text-xl text-gray-800 dark:text-gray-100">Gerenciamento de Prova</span>
                        </div>
                        <div className="flex items-center gap-4">
                            <button 
                                onClick={() => navigate(-1)} // Navega para a página anterior
                                className="flex items-center gap-2 font-semibold text-sm text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
                            >
                                <ArrowLeftIcon className="w-5 h-5" />
                                Voltar
                            </button>
                            <ThemeToggle />
                        </div>
                    </div>
                </div>
            </header>

            {/* Conteúdo da Página (Outlet) */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                <Outlet />
            </main>
        </div>
    );
};

export default FocusedLayout;