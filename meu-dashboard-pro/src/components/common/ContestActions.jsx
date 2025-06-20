import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { PencilIcon, TrashIcon, DotsVerticalIcon } from '../icons';

// Ações primárias com estilo de destaque
const PrimaryButton = ({ onClick, children, className = 'bg-teal-600 hover:bg-teal-700 px-3 py-1.5 text-xs' }) => (
    <button
        onClick={onClick}
        className={`text-white font-bold rounded-md transition-colors ${className}`}
    >
        {children}
    </button>
);

// Ações secundárias, mais discretas
const IconButton = React.forwardRef(({ onClick, children, title, className = '' }, ref) => (
    <button ref={ref} onClick={onClick} className={`p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors ${className}`} title={title}>
        {children}
    </button>
));
IconButton.displayName = 'IconButton'; // Ajuda na depuração

const ActionMenu = ({ onEdit, onDelete }) => {
    const [isOpen, setIsOpen] = useState(false);
    const menuRef = useRef(null);
    const buttonRef = useRef(null);
    const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0 });

    const toggleMenu = () => {
        if (!isOpen && buttonRef.current) {
            const rect = buttonRef.current.getBoundingClientRect();
            // Alinha a borda direita do menu com a borda direita do botão
            setMenuPosition({
                top: rect.bottom + 5,
                left: rect.right - 160, // 160px é a largura do menu (w-40)
            });
        }
        setIsOpen(!isOpen);
    };

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target) &&
                buttonRef.current && !buttonRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div className="relative">
            <IconButton onClick={toggleMenu} ref={buttonRef} title="Mais opções">
                <DotsVerticalIcon className="w-4 h-4" />
            </IconButton>
            {isOpen && createPortal(
                <div
                    ref={menuRef}
                    style={{ top: `${menuPosition.top}px`, left: `${menuPosition.left}px` }}
                    className="fixed w-40 bg-white dark:bg-gray-800 rounded-md shadow-lg z-50 border border-gray-200 dark:border-gray-700 p-1"
                >
                    <button
                        onClick={() => { onEdit(); setIsOpen(false); }}
                        className="flex items-center w-full px-2 py-1.5 text-xs text-gray-700 dark:text-gray-200 hover:bg-blue-100 dark:hover:bg-blue-900/50 hover:text-blue-700 dark:hover:text-blue-300 rounded-md transition-colors duration-150"
                    >
                        <PencilIcon className="w-3 h-3 mr-2" />
                        Editar
                    </button>
                    <button
                        onClick={() => { onDelete(); setIsOpen(false); }}
                        className="flex items-center w-full px-2 py-1.5 text-xs text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/50 hover:text-red-700 dark:hover:text-red-300 rounded-md transition-colors duration-150"
                    >
                        <TrashIcon className="w-3 h-3 mr-2" />
                        Excluir
                    </button>
                </div>,
                document.body
            )}
        </div>
    );
};

const ContestActions = ({ proof, onEdit, onDelete, onGrade }) => {
    const navigate = useNavigate();
    
    const hasUserAnswers = proof.userAnswers && proof.userAnswers.length > 0;
    const hasOfficialKey = (proof.gabaritoDefinitivo && proof.gabaritoDefinitivo.length > 0) || (proof.gabaritoPreliminar && proof.gabaritoPreliminar.length > 0);
    const isGraded = typeof proof.aproveitamento === 'number';
    const hasResults = proof.resultadoObjetiva;

    const getPrimaryAction = () => {
        // 1. Não tem respostas do usuário -> Preencher Gabarito
        if (!hasUserAnswers) {
            return <PrimaryButton onClick={() => navigate(`/proofs/${proof.id}?tab=meuGabarito`)} className="bg-orange-500 hover:bg-orange-600">Preencher Gabarito</PrimaryButton>;
        }
        // 2. Se tem gabaritos mas não foi corrigida -> Corrigir
        if (hasUserAnswers && hasOfficialKey && !isGraded) {
            return <PrimaryButton onClick={() => onGrade(proof.id)}>Corrigir Prova</PrimaryButton>;
        }
        // 3. Se foi corrigida mas não tem resultado final -> Lançar Resultado
        if (isGraded && !hasResults) {
             return <PrimaryButton onClick={() => onEdit(proof, 3)}>Lançar Resultado</PrimaryButton>;
        }
        // 4. Ação Padrão -> Sem botão primário
        return null;
    };

    return (
        <div className="flex items-center justify-center">
            <ActionMenu 
                onEdit={() => onEdit(proof, 1)}
                onDelete={() => onDelete(proof)}
            />
        </div>
    );
};

export default ContestActions; 