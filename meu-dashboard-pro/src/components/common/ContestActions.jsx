import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PencilIcon, TrashIcon, DotsVerticalIcon } from '../icons';

// Ações primárias com estilo de destaque
const PrimaryButton = ({ onClick, children, className = 'bg-teal-600 hover:bg-teal-700' }) => (
    <button
        onClick={onClick}
        className={`px-3 py-1.5 text-white text-xs font-bold rounded-md transition-colors ${className}`}
    >
        {children}
    </button>
);

// Ações secundárias, mais discretas
const IconButton = ({ onClick, children, title, className = '' }) => (
     <button onClick={onClick} className={`p-2 text-gray-500 hover:text-blue-600 ${className}`} title={title}>
        {children}
    </button>
);

const ActionMenu = ({ onEdit, onDelete }) => {
    const [isOpen, setIsOpen] = useState(false);
    const menuRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div className="relative" ref={menuRef}>
            <IconButton onClick={() => setIsOpen(!isOpen)} title="Mais opções">
                <DotsVerticalIcon className="w-5 h-5" />
            </IconButton>
            {isOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg z-10 border border-gray-200 dark:border-gray-700">
                    <button
                        onClick={() => { onEdit(); setIsOpen(false); }}
                        className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                        <PencilIcon className="w-4 h-4 mr-3" />
                        Editar
                    </button>
                    <button
                        onClick={() => { onDelete(); setIsOpen(false); }}
                        className="flex items-center w-full px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                        <TrashIcon className="w-4 h-4 mr-3" />
                        Deletar
                    </button>
                </div>
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
        // 4. Ação Padrão -> Editar
        return <PrimaryButton onClick={() => onEdit(proof, 1)} className="bg-blue-600 hover:bg-blue-700">Editar Detalhes</PrimaryButton>;
    };

    return (
        <div className="flex items-center gap-2">
            <div className="flex-shrink-0">
                {getPrimaryAction()}
            </div>
            <div className="border-l border-gray-200 dark:border-gray-600 ml-2 pl-2">
                <ActionMenu 
                    onEdit={() => onEdit(proof, 1)}
                    onDelete={() => onDelete(proof.id)}
                />
            </div>
        </div>
    );
};

export default ContestActions; 