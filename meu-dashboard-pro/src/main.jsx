import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App'; // Importa o componente App principal
import './index.css';
import { ThemeProvider } from './contexts/ThemeContext'; // Importa o Provedor de Tema

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ThemeProvider> {/* 1. O Provedor de Tema envolve tudo */}
      <App />
    </ThemeProvider>
  </React.StrictMode>,
);