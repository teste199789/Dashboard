import { useReactTable, getCoreRowModel, getFilteredRowModel, getSortedRowModel, getPaginationRowModel, flexRender } from '@tanstack/react-table';
import React, { useState, useMemo, useCallback } from 'react';
import { useProofs } from '../hooks/useProofs';
import { useNavigate } from 'react-router-dom';
import StatsRow from '../components/common/StatsRow';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ContestActions from '../components/common/ContestActions';
import StatusBadge from '../components/common/StatusBadge';
import ProgressBar from '../components/common/ProgressBar';
import ProofForm from '../components/ProofForm';

const SortIcon = ({ isSorted }) => {
    if (!isSorted) return <span className="w-4 h-4 ml-1"></span>; // Placeholder for alignment
    if (isSorted === 'asc') {
        return <svg className="w-4 h-4 ml-1 text-gray-600 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 15l7-7 7 7"></path></svg>;
    }
    return <svg className="w-4 h-4 ml-1 text-gray-600 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>;
};

const getDisplayStatus = (proof) => {
    const hasUserAnswers = proof.userAnswers && proof.userAnswers.length > 0;
    const hasOfficialKey = (proof.gabaritoDefinitivo && proof.gabaritoDefinitivo.length > 0) || (proof.gabaritoPreliminar && proof.gabaritoPreliminar.length > 0);
    const isGraded = typeof proof.aproveitamento === 'number';
    const hasFinalStatus = proof.resultadoFinal?.status;

    // Se já existe um status final (Aprovado, Reprovado), ele tem prioridade.
    if (hasFinalStatus) {
        return hasFinalStatus;
    }
    
    // Se a prova foi corrigida (tem aproveitamento), mas não tem status final,
    // o fluxo de trabalho dela está "Finalizado".
    if (isGraded) {
        return 'Finalizado';
    }

    // A partir daqui, são status de fluxo de trabalho pendentes.
    if (!hasUserAnswers) {
        return 'Pendente Meu Gabarito';
    }

    if (!hasOfficialKey) {
        return 'Pendente Gabarito Oficial';
    }

    // Se tem ambos os gabaritos mas ainda não foi corrigida.
    if (hasUserAnswers && hasOfficialKey && !isGraded) {
        return 'Pronto para Corrigir';
    }

    // Fallback para outros casos.
    return 'Pendente';
};

const Dashboard = () => {
    const navigate = useNavigate();
    const { 
        proofs, 
        consolidatedData, 
        isLoading, 
        dashboardFilter, 
        setDashboardFilter,
        openDeleteModal,
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
        setSelectedProof(JSON.parse(JSON.stringify(proof)));
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
            header: () => <div className="text-center">Título</div>,
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
            header: () => <div className="text-center">Data</div>,
            cell: ({ getValue }) => {
                const date = new Date(getValue());
                return (
                    <div className="text-center text-gray-700 dark:text-gray-300 font-bold">
                        {date.toLocaleDateString('pt-BR')}
                    </div>
                );
            },
        },
        {
            accessorKey: 'banca',
            header: () => <div className="text-center">Banca</div>,
            cell: ({ getValue }) => (
                <div className="text-center text-gray-700 dark:text-gray-300 font-bold">
                    {getValue()}
                </div>
            ),
        },
        {
            accessorKey: 'orgao',
            header: () => <div className="text-center">Órgão</div>,
            cell: ({ getValue }) => (
                <div className="text-center text-gray-700 dark:text-gray-300 font-bold">
                    {getValue() || '-'}
                </div>
            ),
        },
        {
            id: 'resultadoObjetiva',
            header: () => <div className="text-center">Objetiva</div>,
            cell: ({ row }) => {
                const status = row.original.resultadoObjetiva?.status;
                return <div className="text-center">{status ? <StatusBadge status={status} /> : <span className="text-gray-400">-</span>}</div>;
            }
        },
        {
            id: 'resultadoDiscursiva',
            header: () => <div className="text-center">Discursiva</div>,
            cell: ({ row }) => {
                const status = row.original.resultadoDiscursiva?.status;
                return <div className="text-center">{status ? <StatusBadge status={status} /> : <span className="text-gray-400">-</span>}</div>;
            }
        },
        {
            id: 'resultadoFinalStatus',
            header: () => <div className="text-center">Final</div>,
            cell: ({ row }) => {
                const status = row.original.resultadoFinal?.status;
                return <div className="text-center">{status ? <StatusBadge status={status} /> : <span className="text-gray-400">-</span>}</div>;
            }
        },
        {
            accessorKey: 'aproveitamento',
            header: () => <div className="text-center">% Nota</div>,
            cell: ({ getValue }) => {
                const percentage = getValue();
                if (percentage == null) return <div className="text-center"><span className="text-gray-400">-</span></div>;
                return <div className="flex justify-center"><ProgressBar value={percentage} /></div>;
            },
        },
        {
            id: 'status',
            header: () => <div className="text-center">Status</div>,
            cell: ({ row }) => {
                const status = getDisplayStatus(row.original);
                return <div className="text-center"><StatusBadge status={status} /></div>;
            }
        },
        {
            id: 'actions',
            header: () => <div className="text-center">Ações</div>,
            cell: ({ row }) => (
                <div className="flex justify-center">
                    <ContestActions 
                        proof={row.original} 
                        onEdit={handleOpenModal}
                        onGrade={onGrade}
                        onDelete={(proof) => openDeleteModal(proof)}
                        isGrading={isGrading}
                    />
                </div>
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
                        <div className="grid grid-cols-9 text-center items-center py-3 bg-teal-200 dark:bg-teal-800 text-gray-800 dark:text-gray-100">
                            <div className="font-semibold text-sm">Disciplinas</div>
                            <div className="font-semibold text-sm">Acertos</div>
                            <div className="font-semibold text-sm">Erros</div>
                            <div className="font-semibold text-sm">Brancos</div>
                            <div className="font-semibold text-sm">Anuladas</div>
                            <div className="font-semibold text-sm">Questões</div>
                            <div className="font-semibold text-sm">Líquidos</div>
                            <div className="font-semibold text-sm">% Bruta</div>
                            <div className="font-semibold text-sm">% Líquidos</div>
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
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 sm:p-6">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">Controle de Concursos</h2>
                    <div className="flex items-center space-x-2">
                        <input
                            type="text"
                            value={globalFilter}
                            onChange={e => setGlobalFilter(e.target.value)}
                            placeholder="Buscar em todos os campos..."
                            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-sm"
                        />
                        <select
                            value={table.getColumn('banca')?.getFilterValue() || 'Todas'}
                            onChange={e => {
                                const value = e.target.value;
                                table.getColumn('banca')?.setFilterValue(value === 'Todas' ? null : value);
                            }}
                            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-sm"
                        >
                            {filterableBancas.map(banca => (
                                <option key={banca} value={banca}>{banca}</option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="min-w-full">
                        <thead className="bg-teal-200 dark:bg-teal-700">
                            {table.getHeaderGroups().map(headerGroup => (
                                <tr key={headerGroup.id}>
                                    {headerGroup.headers.map(header => (
                                        <th
                                            key={header.id}
                                            className="px-6 py-3 text-left text-sm font-semibold text-gray-800 dark:text-gray-100"
                                            onClick={header.column.getToggleSortingHandler()}
                                            style={{ cursor: header.column.getCanSort() ? 'pointer' : 'default' }}
                                        >
                                            <div className="flex items-center">
                                                {header.isPlaceholder
                                                    ? null
                                                    : flexRender(header.column.columnDef.header, header.getContext())
                                                }
                                                {header.column.getCanSort() && (
                                                    <SortIcon isSorted={header.column.getIsSorted()} />
                                                )}
                                            </div>
                                        </th>
                                    ))}
                                </tr>
                            ))}
                        </thead>
                        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700 text-gray-700 dark:text-gray-300">
                            {table.getRowModel().rows.map(row => (
                                <tr key={row.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                                    {row.getVisibleCells().map(cell => (
                                        <td key={cell.id} className="px-6 py-4">
                                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                        </td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                
                {/* Controles da tabela: filtros e paginação */}
                <div className="mt-4 flex flex-col sm:flex-row justify-between items-center space-y-2 sm:space-y-0">
                    <div className="flex items-center space-x-2">
                        {/* Seletor de filtro por banca */}
                    </div>
                    <span className="text-sm text-gray-700 dark:text-gray-300">
                        Página {table.getState().pagination.pageIndex + 1} de {table.getPageCount()}
                    </span>
                    <div className="flex items-center space-x-2">
                        <button
                            onClick={() => table.previousPage()}
                            disabled={!table.getCanPreviousPage()}
                            className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800/50 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Anterior
                        </button>
                        <button
                            onClick={() => table.nextPage()}
                            disabled={!table.getCanNextPage()}
                            className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800/50 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Próximo
                        </button>
                    </div>
                </div>
            </div>

            <ProofForm 
                isOpen={isModalOpen}
                onClose={() => {
                    setIsModalOpen(false);
                }}
                proofData={selectedProof}
                type={selectedProof?.type || 'CONCURSO'}
                initialStep={initialStep}
            />
        </div>
    );
};

export default Dashboard;