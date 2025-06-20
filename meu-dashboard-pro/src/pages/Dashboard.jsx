import { useReactTable, getCoreRowModel, getFilteredRowModel, getSortedRowModel, getPaginationRowModel, flexRender } from '@tanstack/react-table';
import React, { useState, useMemo, useCallback } from 'react';
import { useProofs } from '../hooks/useProofs';
import { useNavigate } from 'react-router-dom';
import StatsRow from '../components/common/StatsRow';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ConfirmationModal from '../components/common/ConfirmationModal';
import ContestActions from '../components/common/ContestActions';
import StatusBadge, { getStatus } from '../components/common/StatusBadge';
import ProgressBar from '../components/common/ProgressBar';
import ProofForm from '../components/ProofForm';

const SortIcon = ({ isSorted }) => {
    if (!isSorted) return <span className="w-4 h-4 ml-1"></span>; // Placeholder for alignment
    if (isSorted === 'asc') {
        return <svg className="w-4 h-4 ml-1 text-gray-600 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 15l7-7 7 7"></path></svg>;
    }
    return <svg className="w-4 h-4 ml-1 text-gray-600 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>;
};

const Dashboard = () => {
    const navigate = useNavigate();
    const { 
        proofs, 
        consolidatedData, 
        isLoading, 
        dashboardFilter, 
        setDashboardFilter, 
        modalState, 
        openDeleteModal,
        closeDeleteModal, 
        handleDeleteProof, 
        handleGradeProof 
    } = useProofs();
    const [isGrading, setIsGrading] = useState(false);
    const [sorting, setSorting] = useState([]);
    const [globalFilter, setGlobalFilter] = useState('');
    const [columnFilters, setColumnFilters] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedProof, setSelectedProof] = useState(null);
    const [initialStep, setInitialStep] = useState(0);

    const handleOpenModal = useCallback((proof, step = 0) => {
        setSelectedProof(proof);
        setInitialStep(step);
        setIsModalOpen(true);
    }, []);

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedProof(null);
    };

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

    const columns = useMemo(() => [
        {
            accessorKey: 'titulo',
            header: 'Título',
            cell: ({ getValue, row }) => (
                <div 
                    className="font-bold text-gray-900 dark:text-gray-100 cursor-pointer hover:text-teal-600"
                    onClick={() => handleNavigateToProof(row.original.id)}
                >
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
            accessorKey: 'orgao',
            header: 'Órgão',
            cell: ({ getValue }) => (
                <div className="text-sm text-gray-600 dark:text-gray-400">
                    {getValue() || '-'}
                </div>
            ),
        },
        {
            accessorKey: 'aproveitamento',
            header: 'Aproveitamento',
            cell: ({ getValue }) => {
                const percentage = getValue();
                if (percentage == null) return <span className="text-gray-400">-</span>;
                return <ProgressBar value={percentage} />;
            },
        },
        {
            id: 'actions',
            header: 'Ações',
            cell: ({ row }) => (
                <ContestActions 
                    proof={row.original} 
                    onEdit={handleOpenModal}
                    onGrade={onGrade}
                    onDelete={openDeleteModal}
                    isGrading={isGrading}
                />
            ),
        },
    ], [handleNavigateToProof, onGrade, openDeleteModal, isGrading, handleOpenModal]);

    const table = useReactTable({
        data: proofs,
        columns,
        state: {
            sorting,
            globalFilter,
            columnFilters,
        },
        onSortingChange: setSorting,
        onGlobalFilterChange: setGlobalFilter,
        onColumnFiltersChange: setColumnFilters,
        getCoreRowModel: getCoreRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
    });

    const filterableBancas = useMemo(() => {
        const bancas = new Set(proofs.map(p => p.banca).filter(Boolean));
        return ['Todas', ...Array.from(bancas)];
    }, [proofs]);

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
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Controle de Concursos</h2>
                        <input
                            type="text"
                            value={globalFilter ?? ''}
                            onChange={e => setGlobalFilter(e.target.value)}
                            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-teal-500"
                            placeholder="Buscar em todos os campos..."
                        />
                    </div>
                    <div className="flex items-center space-x-4">
                        {/* Filtro por Banca */}
                        <select
                            value={table.getColumn('banca')?.getFilterValue() || 'Todas'}
                            onChange={e => table.getColumn('banca')?.setFilterValue(e.target.value === 'Todas' ? null : e.target.value)}
                            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-sm"
                        >
                            {filterableBancas.map(banca => <option key={banca} value={banca}>{banca}</option>)}
                        </select>
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-teal-200">
                            {table.getHeaderGroups().map(headerGroup => (
                                <tr key={headerGroup.id}>
                                    {headerGroup.headers.map(header => (
                                        <th
                                            key={header.id}
                                            className="px-6 py-3 text-left text-sm font-semibold text-gray-800"
                                            onClick={header.column.getToggleSortingHandler()}
                                            style={{ cursor: header.column.getCanSort() ? 'pointer' : 'default' }}
                                        >
                                            <div className="flex items-center">
                                                {header.isPlaceholder
                                                    ? null
                                                    : flexRender(header.column.columnDef.header, header.getContext())
                                                }
                                                <SortIcon isSorted={header.column.getIsSorted()} />
                                            </div>
                                        </th>
                                    ))}
                                </tr>
                            ))}
                        </thead>
                        <tbody className="bg-white dark:bg-gray-800">
                            {table.getRowModel().rows.map(row => (
                                <tr key={row.id} className="even:bg-gray-100 dark:even:bg-gray-900/50 hover:bg-teal-50 dark:hover:bg-teal-900/50">
                                    {row.getVisibleCells().map(cell => (
                                        <td
                                            key={cell.id}
                                            className="px-6 py-4 whitespace-nowrap text-sm text-gray-800 dark:text-gray-200"
                                        >
                                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                        </td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                {/* Pagination Controls */}
                <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                        Página{' '}
                        <strong>
                            {table.getState().pagination.pageIndex + 1} de {table.getPageCount()}
                        </strong>
                    </span>
                    <div className="flex items-center space-x-2">
                        <button
                            onClick={() => table.previousPage()}
                            disabled={!table.getCanPreviousPage()}
                            className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Anterior
                        </button>
                        <button
                            onClick={() => table.nextPage()}
                            disabled={!table.getCanNextPage()}
                            className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Próximo
                        </button>
                    </div>
                </div>
            </div>

            {isModalOpen && (
                <ProofForm
                    isOpen={isModalOpen}
                    onClose={handleCloseModal}
                    proofData={selectedProof}
                    type={selectedProof?.type}
                    initialStep={initialStep}
                />
            )}

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