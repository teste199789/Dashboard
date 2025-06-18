import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ProofsProvider } from './contexts/ProofsContext';
import { Toaster } from 'react-hot-toast';

// Importação dos Layouts
import MainLayout from './layouts/MainLayout';
import FocusedLayout from './layouts/FocusedLayout';

// Importação das Páginas
import Dashboard from './pages/Dashboard';
import MeusConcursos from './pages/MeusConcursos';
import AddProof from './pages/AddProof';
import AddSimulado from './pages/AddSimulado';
import ProofDetail from './pages/ProofDetail';

// ÚNICA DEFINIÇÃO DA FUNÇÃO APP
function App() {
  return (
    <ProofsProvider>
      <Router>
        <Toaster
          position="top-right"
          toastOptions={{
            className: 'dark:bg-gray-700 dark:text-white',
            duration: 4000,
          }}
        />

        <Routes>
          {/* Rotas que usam o Layout Principal */}
          <Route element={<MainLayout />}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/meus-concursos" element={<MeusConcursos />} />
            <Route path="/cadastrar-prova" element={<AddProof />} />
            <Route path="/cadastrar-simulado" element={<AddSimulado />} />
          </Route>

          {/* Rotas que usam o Layout de Foco */}
          <Route element={<FocusedLayout />}>
            <Route path="/minhas-provas/:proofId" element={<ProofDetail />} />
          </Route>
          
          <Route path="*" element={<h2 className="text-center p-8">404: Página Não Encontrada</h2>} />
        </Routes>
      </Router>
    </ProofsProvider>
  );
}

export default App;