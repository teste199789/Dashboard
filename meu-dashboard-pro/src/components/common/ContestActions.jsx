import React from 'react';
import { useNavigate } from 'react-router-dom';
import { PencilIcon, TrashIcon } from '../icons';

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
const IconButton = ({ onClick, children, title }) => (
     <button onClick={onClick} className="p-2 text-gray-500 hover:text-blue-600" title={title}>
        {children}
    </button>
);


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
            <div className="flex items-center border-l border-gray-200 dark:border-gray-600 ml-2 pl-2">
                 <IconButton onClick={() => onEdit(proof, 1)} title="Editar">
                    <PencilIcon className="w-5 h-5"/>
                </IconButton>
                <IconButton onClick={() => onDelete(proof.id)} title="Deletar">
                    <TrashIcon className="w-5 h-5 text-gray-500 hover:text-red-600"/>
                </IconButton>
            </div>
        </div>
    );
};

export default ContestActions; 