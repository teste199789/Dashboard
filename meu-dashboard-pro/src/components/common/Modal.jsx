import React, { useEffect } from 'react';

const Modal = ({ isOpen, onClose, title, children }) => {
  // Efeito para impedir o scroll da página principal quando o modal está aberto
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    // Cleanup function para reverter o estilo quando o componente for desmontado
    return () => document.body.style.overflow = 'unset';
  }, [isOpen]);

  if (!isOpen) {
    return null;
  }

  return (
    // Fundo escurecido (overlay)
    <div 
      className="fixed inset-0 bg-black bg-opacity-60 z-40 flex justify-center items-center p-4"
      onClick={onClose} // Fecha o modal ao clicar fora da caixa branca
    >
      {/* Caixa de conteúdo do modal */}
      <div 
        className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col"
        onClick={e => e.stopPropagation()} // Impede que o clique dentro da caixa feche o modal
      >
        {/* Cabeçalho do Modal */}
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-xl font-bold text-gray-800">{title}</h2>
          <button 
            onClick={onClose} 
            className="text-gray-400 hover:text-gray-700 text-3xl leading-none"
            aria-label="Fechar"
          >
            &times;
          </button>
        </div>

        {/* Corpo do Modal (onde o conteúdo será inserido) */}
        <div className="p-6 overflow-y-auto">
          {children}
        </div>
      </div>
    </div>
  );
};

export default Modal;