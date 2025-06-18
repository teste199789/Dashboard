import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProofs } from '../../hooks/useProofs';
import StatCard from './StatCard';
import { formatDate, formatPercent } from '../../utils/formatters';
import PencilIcon from '../icons/PencilIcon';
import TrashIcon from '../icons/TrashIcon';
import ProofLogo from './ProofLogo';

const ProofDetailCard = ({ proof }) => {
    const navigate = useNavigate();
    const { openDeleteModal } = useProofs();

    const handleActionClick = (e, action) => {
        e.stopPropagation();
        if (action === 'edit') {
            navigate(`/minhas-provas/${proof.id}`);
        } else if (action === 'delete') {
            openDeleteModal(proof.id);
        }
    };

    const hasResults = proof.results && proof.results.length > 0;

    const totals = useMemo(() => {
        if (!hasResults) return { acertos: 0, erros: 0 };
        return proof.results.reduce((acc, r) => {
            acc.acertos += r.acertos;
            acc.erros += r.erros;
            return acc;
        }, { acertos: 0, erros: 0 });
    }, [proof.results, hasResults]);

    const pontuacaoLiquida = useMemo(() => {
        if (!hasResults) return 0;
        return proof.tipoPontuacao === 'liquida' ? (totals.acertos - totals.erros) : totals.acertos;
    }, [proof.tipoPontuacao, totals, hasResults]);


    return (
        <div 
            className="bg-white dark:bg-gray-800/50 rounded-xl shadow-lg w-full transition-all duration-300 hover:shadow-2xl"
        >
            <div 
                className="p-6 border-b dark:border-gray-700 cursor-pointer"
                onClick={() => navigate(`/minhas-provas/${proof.id}`)}
            >
                <div className="grid grid-cols-12 gap-5 items-center">
                    <div className="col-span-3 sm:col-span-2 flex justify-center">
                        <ProofLogo titulo={proof.titulo} />
                    </div>
                    <div className="col-span-9 sm:col-span-10">
                         {/* --- CORREÇÃO DE ALINHAMENTO AQUI: items-start foi trocado por items-center --- */}
                         <div className="flex justify-between items-center gap-4">
                            <div>
                                <p className="font-semibold text-blue-600 dark:text-blue-400">
                                    {formatDate(proof.data)} • {proof.banca.toUpperCase()}
                                </p>
                                <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100 mt-1">
                                    {proof.titulo}
                                </h3>
                            </div>
                            <div className="flex-shrink-0 flex items-center gap-2">
                                <button onClick={(e) => handleActionClick(e, 'edit')} className="p-2 text-gray-500 hover:text-blue-600 rounded-full" title="Gerenciar Prova">
                                    <PencilIcon className="w-5 h-5"/>
                                </button>
                                <button onClick={(e) => handleActionClick(e, 'delete')} className="p-2 text-gray-500 hover:text-red-600 rounded-full" title="Deletar Prova">
                                    <TrashIcon className="w-5 h-5"/>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {hasResults ? (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-6">
                    <StatCard label="Pontos Líquidos" value={pontuacaoLiquida.toFixed(2).replace('.',',')} colorClass="text-blue-600 dark:text-blue-400"/>
                    <StatCard label="Aproveitamento" value={formatPercent(proof.aproveitamento)} colorClass="text-green-600 dark:text-green-400"/>
                    <StatCard label="Acertos" value={totals.acertos} />
                    <StatCard label="Erros" value={totals.erros} />
                </div>
            ) : (
                <div 
                    className="text-center py-8 px-6 cursor-pointer"
                    onClick={() => navigate(`/minhas-provas/${proof.id}`)}
                >
                    <p className="font-semibold text-gray-500 dark:text-gray-400">Prova ainda não corrigida</p>
                    <p className="text-sm text-teal-600 hover:underline dark:text-teal-400 mt-2">
                        Clique para gerenciar e corrigir
                    </p>
                </div>
            )}
        </div>
    );
};

export default ProofDetailCard;