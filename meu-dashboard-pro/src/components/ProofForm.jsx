import React from 'react';
import Modal from './common/Modal';
import ProofFormContent from './ProofFormContent';

const ProofForm = ({ isOpen, onClose, proofData, type = 'CONCURSO' }) => {
    const title = proofData
        ? `Editar ${type === 'CONCURSO' ? 'Concurso' : 'Simulado'}`
        : `Novo ${type === 'CONCURSO' ? 'Concurso' : 'Simulado'}`;

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={title}>
            <ProofFormContent
                proofData={proofData}
                type={type}
                onSave={onClose} // Fecha o modal após salvar
            />
        </Modal>
    );
};

export default ProofForm; 