import React, { useState } from 'react';
import toast from 'react-hot-toast'; // Importa a biblioteca de notificações
import * as api from '../../api/apiService';
import AnswerGrid from '../../components/common/AnswerGrid';
import Modal from '../../components/common/Modal'; // <-- Importa o novo componente Modal

// Funções auxiliares para converter os gabaritos
const stringToMap = (str) => {
    if (!str) return {};
    return str.split(',').reduce((acc, pair) => {
        const [q, a] = pair.split(':');
        if (q && a) acc[q] = a;
        return acc;
    }, {});
};

const mapToString = (map) => {
    return Object.entries(map)
        .sort((a, b) => parseInt(a[0]) - parseInt(b[0]))
        .map(entry => entry.join(':'))
        .join(',');
};

const OfficialKeysTab = ({ proof, refreshProof }) => {
    const [preliminarMap, setPreliminarMap] = useState(() => stringToMap(proof.gabaritoPreliminar));
    const [definitivoMap, setDefinitivoMap] = useState(() => stringToMap(proof.gabaritoDefinitivo));
    const [isSaving, setIsSaving] = useState(false);

    // NOVO ESTADO: controla qual modal está aberto ('preliminar', 'definitivo', ou null)
    const [editingKey, setEditingKey] = useState(null);

    const handleAnswerChange = (keyType, qNumber, value) => {
        const setter = keyType === 'preliminar' ? setPreliminarMap : setDefinitivoMap;
        setter(prev => {
            const newAnswers = { ...prev };
            const qStr = String(qNumber);
            if (value) {
                newAnswers[qStr] = value;
            } else {
                delete newAnswers[qStr];
            }
            return newAnswers;
        });
    };

    const handleSaveAndClose = async () => {
        setIsSaving(true);
        const loadingToast = toast.loading('Salvando gabaritos...');

        try {
            // Passo 1: Atualiza os detalhes da prova (gabaritos)
            await api.updateProofDetails(proof.id, {
                gabaritoPreliminar: mapToString(preliminarMap),
                gabaritoDefinitivo: mapToString(definitivoMap),
            });

            toast.success('Gabaritos salvos com sucesso!', { id: loadingToast });

            // Passo 2: Dispara a nova correção
            const correctionToast = toast.loading('Processando nova correção...');
            await api.gradeProof(proof.id);
            toast.success('Correção finalizada! Os resultados foram atualizados.', { id: correctionToast });
            
            // Passo 3: Atualiza os dados da prova dinamicamente, sem recarregar a página.
            await refreshProof();

        } catch (error) {
            toast.error('Falha ao salvar ou corrigir. Tente novamente.', { id: loadingToast });
        } finally {
            setIsSaving(false);
            setEditingKey(null); // Fecha o modal independentemente do resultado
        }
    };

    const openModal = (keyType) => {
        setEditingKey(keyType);
    };

    const closeModal = () => {
        setEditingKey(null);
    };

    // Determina o título e o conteúdo do modal com base no estado 'editingKey'
    const modalTitle = editingKey === 'preliminar' ? 'Gabarito Preliminar (Pré-Recursos)' : 'Gabarito Definitivo (Pós-Recursos)';
    const modalContent = (
        <div className="space-y-6">
            <AnswerGrid
                totalQuestoes={proof.totalQuestoes}
                answersMap={editingKey === 'preliminar' ? preliminarMap : definitivoMap}
                onAnswerChange={(q, v) => handleAnswerChange(editingKey, q, v)}
                comparisonMap={editingKey === 'definitivo' ? preliminarMap : {}}
            />
            <div className="mt-6 border-t pt-4 flex justify-end">
                <button onClick={handleSaveAndClose} disabled={isSaving} className="bg-teal-500 text-white font-bold py-2 px-6 rounded-lg hover:bg-teal-600 disabled:opacity-50">
                    {isSaving ? 'Salvando...' : 'Salvar e Fechar'}
                </button>
            </div>
        </div>
    );

    return (
        <div className="p-6 flex flex-col items-center justify-center min-h-[300px] space-y-4">
            <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-4">Gabaritos Oficiais da Banca</h3>
            
            {/* Botões que abrem os modais */}
            <button
                onClick={() => openModal('preliminar')}
                className="w-full max-w-sm bg-blue-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-blue-700 transition shadow-md"
            >
                PRÉ-RECURSOS (PRELIMINAR)
            </button>

            <button
                onClick={() => openModal('definitivo')}
                className="w-full max-w-sm bg-green-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-green-700 transition shadow-md"
            >
                PÓS-RECURSOS (DEFINITIVO)
            </button>

            {/* O Modal que será exibido */}
            <Modal isOpen={editingKey !== null} onClose={closeModal} title={modalTitle}>
                {modalContent}
            </Modal>
        </div>
    );
};

export default OfficialKeysTab;