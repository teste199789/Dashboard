import React from 'react';
import Modal from './common/Modal';
import ProofFormContent from './ProofFormContent';

const ProofForm = ({ isOpen, onClose, proofData, type, initialStep }) => {
    const title = proofData
        ? `Editar ${type === 'CONCURSO' ? 'Concurso' : 'Simulado'}`
        : `Novo ${type === 'CONCURSO' ? 'Concurso' : 'Simulado'}`;

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={title}>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-lg">
                 <div className="p-4 border-b dark:border-gray-700">
                    <h2 className="text-xl font-bold">{title}</h2>
                </div>
                <ProofFormContent
                    proofData={proofData}
                    type={type}
                    onSave={onClose}
                    initialStep={initialStep}
                />
            </div>
        </Modal>
    );
};

export default ProofForm; 