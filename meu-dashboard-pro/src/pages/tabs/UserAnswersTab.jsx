import React, { useState } from 'react';
import * as api from '../../api/apiService';
import AnswerGrid from '../../components/common/AnswerGrid';

// Funções auxiliares (pode até movê-las para um arquivo de utils no futuro)
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


const UserAnswersTab = ({ proof }) => {
    // O estado agora é um objeto
    const [userAnswersMap, setUserAnswersMap] = useState(() => stringToMap(proof.userAnswers));
    const [isSaving, setIsSaving] = useState(false);

    // Função de atualização rápida
    const handleAnswerChange = (qNumber, value) => {
        setUserAnswersMap(prev => {
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

    const handleSave = async () => {
        setIsSaving(true);
        try {
            // Converte para string apenas no momento de salvar
            await api.updateProofDetails(proof.id, { userAnswers: mapToString(userAnswersMap) });
            alert('Seu gabarito foi salvo com sucesso!');
        } catch (error) {
            alert('Falha ao salvar seu gabarito.');
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="p-6 space-y-6">
            <div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">Meu Gabarito</h3>
                <p className="text-sm text-gray-500 mb-4">Preencha com as respostas que você marcou na prova. Deixe em branco as questões não respondidas.</p>
                <AnswerGrid
                    totalQuestoes={proof.totalQuestoes}
                    answersMap={userAnswersMap}
                    onAnswerChange={handleAnswerChange}
                />
            </div>
            <div className="mt-6 border-t pt-4 flex justify-end">
                <button onClick={handleSave} disabled={isSaving} className="bg-teal-500 text-white font-bold py-2 px-6 rounded-lg hover:bg-teal-600 disabled:opacity-50">
                    {isSaving ? 'Salvando...' : 'Salvar Meu Gabarito'}
                </button>
            </div>
        </div>
    );
};

export default UserAnswersTab;