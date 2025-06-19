import { useReactTable, getCoreRowModel, flexRender } from '@tanstack/react-table';
import React, { useState, useMemo, useCallback } from 'react';
import { useProofs } from '../hooks/useProofs';
import { useNavigate } from 'react-router-dom';
import StatsRow from '../components/common/StatsRow';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ConfirmationModal from '../components/common/ConfirmationModal';
import ContestActions from '../components/common/ContestActions';

const Dashboard = () => {
    const navigate = useNavigate();
    const { proofs, consolidatedData, isLoading, dashboardFilter, setDashboardFilter, modalState, closeDeleteModal, handleDeleteProof, handleGradeProof } = useProofs();
    const [isGrading, setIsGrading] = useState(false);

    const handleNavigateToProof = useCallback((proofId, initialTab = '') => {
        const path = `/minhas-provas/${proofId}${initialTab ? `?tab=${initialTab}` : ''}`;
        navigate(path);
    }, [navigate]);

    const onGrade = useCallback(async (proofId) => {
        setIsGrading(true);
        try {
            await handleGradeProof(proofId);
        } finally {
            setIsGrading(false);
        }
    }, [handleGradeProof]);

    const openDeleteModal = useCallback((id) => {
        // Esta função será definida via context se necessário
        console.log('Delete modal for:', id);
    }, []);

    const columns = useMemo(() => [
        {
            accessorKey: 'titulo',
            header: 'Título',
            cell: ({ getValue }) => (
                <div className="font-medium text-gray-900 dark:text-gray-100">
                    {getValue()}
                </div>
            ),
        },
        {
            accessorKey: 'data',
            header: 'Data',
            cell: ({ getValue }) => {
                const date = new Date(getValue());
                return (
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                        {date.toLocaleDateString('pt-BR')}
                    </div>
                );
            },
        },
        {
            accessorKey: 'banca',
            header: 'Banca',
            cell: ({ getValue }) => (
                <div className="text-sm text-gray-600 dark:text-gray-400">
                    {getValue()}
                </div>
            ),
        },
        {
            accessorKey: 'aproveitamento',
            header: 'Aproveitamento',
            cell: ({ getValue }) => {
                const percentage = getValue();
                if (percentage == null) return <span className="text-gray-400">-</span>;
                return (
                    <div className="text-sm font-medium">
                        {percentage.toFixed(1)}%
                    </div>
                );
            },
        },
        {
            accessorKey: 'resultadoFinal',
            header: 'Status',
            cell: ({ getValue }) => {
                const resultado = getValue();
                if (!resultado) return <span className="text-gray-400">Pendente</span>;
                
                const getStatusColor = (status) => {
                    if (!status) return 'bg-gray-100 text-gray-800';
                    switch (status.toLowerCase()) {
                        case 'aprovado':
                        case 'classificado':
                            return 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-200';
                        case 'reprovado':
                        case 'eliminado':
                            return 'bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-200';
                        default:
                            return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
                    }
                };
                
                return (
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(resultado)}`}>
                        {resultado}
                    </span>
                );
            },
        },
        {
            id: 'actions',
            header: 'Ações',
            cell: ({ row }) => (
                <ContestActions 
                    proof={row.original} 
                    onNavigateToProof={handleNavigateToProof}
                    onGrade={onGrade}
                    onDelete={openDeleteModal}
                    isGrading={isGrading}
                />
            ),
        },
    ], [handleNavigateToProof, onGrade, openDeleteModal, isGrading]);

    const table = useReactTable({
        data: proofs,
        columns,
        getCoreRowModel: getCoreRowModel(),
    });

    if (isLoading) {
        return <LoadingSpinner />;
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Dashboard</h1>
                <select 
                    value={dashboardFilter} 
                    onChange={(e) => setDashboardFilter(e.target.value)}
                    className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                >
                    <option value="TODOS">Todos</option>
                    <option value="CONCURSO">Concursos</option>
                    <option value="SIMULADO">Simulados</option>
                </select>
            </div>

            {/* Stats Section */}
            <div className="rounded-lg shadow overflow-hidden">
                {/* Header Title */}
                <div className="bg-orange-400 px-6 py-4">
                    <h2 className="text-xl font-bold text-white uppercase tracking-wide">Dados Consolidados</h2>
                </div>
                
                <div className="overflow-x-auto">
                    <div className="min-w-full">
                        {/* Column Headers */}
                        <div className="grid grid-cols-9 text-center items-center py-3 bg-teal-200 text-gray-800">
                            <p className="col-span-1 text-left pl-4 font-semibold">Disciplinas</p>
                            <p className="col-span-1 font-semibold">Acertos</p>
                            <p className="col-span-1 font-semibold">Erros</p>
                            <p className="col-span-1 font-semibold">Brancos</p>
                            <p className="col-span-1 font-semibold">Anuladas</p>
                            <p className="col-span-1 font-semibold">Questões</p>
                            <p className="col-span-1 font-semibold">Líquidos</p>
                            <p className="col-span-1 font-semibold">% Bruta</p>
                            <p className="col-span-1 font-semibold">% Líquidos</p>
                        </div>
                        {/* Rows */}
                        <div>
                            {consolidatedData.disciplinas.map((disciplina, index) => (
                                <StatsRow key={disciplina.id} disciplina={disciplina} index={index} />
                            ))}
                            {consolidatedData.disciplinas.length > 0 && (
                                <StatsRow disciplina={consolidatedData.totais} isTotal={true} />
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Table Section */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
                <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Controle de Concursos</h2>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 dark:bg-gray-700">
                            {table.getHeaderGroups().map(headerGroup => (
                                <tr key={headerGroup.id}>
                                    {headerGroup.headers.map(header => (
                                        <th
                                            key={header.id}
                                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                                        >
                                            {header.isPlaceholder
                                                ? null
                                                : flexRender(header.column.columnDef.header, header.getContext())
                                            }
                                        </th>
                                    ))}
                                </tr>
                            ))}
                        </thead>
                        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                            {table.getRowModel().rows.map(row => (
                                <tr key={row.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                                    {row.getVisibleCells().map(cell => (
                                        <td
                                            key={cell.id}
                                            className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100"
                                        >
                                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                        </td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Confirmation Modal */}
            <ConfirmationModal
                isOpen={modalState.isOpen}
                onClose={closeDeleteModal}
                onConfirm={handleDeleteProof}
                title="Deletar Concurso"
                message="Tem certeza de que deseja deletar este concurso? Esta ação não pode ser desfeita."
            />
        </div>
    );
};

export default Dashboard;