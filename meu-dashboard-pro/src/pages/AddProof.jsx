import React from 'react';
import ProofFormContent from '../components/ProofFormContent';
import { useNavigate } from 'react-router-dom';

const AddProof = () => {
    const navigate = useNavigate();

    return (
        <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-6">
                    Cadastrar Novo Concurso
                </h1>
                <ProofFormContent 
                    type="CONCURSO"
                    onSave={() => navigate('/meus-concursos')} 
                />
            </div>
            </div>
    );
};

export default AddProof;