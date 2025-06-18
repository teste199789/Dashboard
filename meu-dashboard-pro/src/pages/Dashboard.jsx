import React, { useMemo, useState } from 'react';
import { useReactTable, getCoreRowModel, flexRender } from '@tanstack/react-table';
import { useProofs } from '../hooks/useProofs';
import { formatDate, formatPercent } from '../utils/formatters';
import StatsRow from '../components/common/StatsRow.jsx';
import LoadingSpinner from '../components/common/LoadingSpinner.jsx';
import ContestFormModal from '../components/ContestFormModal';
import PencilIcon from '../components/icons/PencilIcon';
import TrashIcon from '../components/icons/TrashIcon';

const Dashboard = () => {
    const { proofs, consolidatedData, isLoading, dashboardFilter, setDashboardFilter, openDeleteModal } = useProofs();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingContest, setEditingContest] = useState(null);

    const columns = useMemo(() => [
        { accessorKey: 'titulo', header: 'Nome', cell: info => <span className="font-bold text-gray-800 dark:text-gray-100">{info.getValue()}</span> },
        { accessorFn: row => formatDate(row.data), header: 'Data' },
        { accessorKey: 'orgao', header: 'Órgão' },
        { accessorKey: 'banca', header: 'Banca' },
        { accessorKey: 'cargo', header: 'Cargo' },
        { accessorKey: 'aproveitamento', header: 'Objetiva (%)', cell: info => typeof info.getValue() === 'number' ? <span className={`font-bold ${info.getValue() >= 50 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>{formatPercent(info.getValue())}</span> : <span className="text-xs text-gray-500">PENDENTE</span> },
        { accessorKey: 'resultadoObjetiva', header: 'Resultado Objetiva',
            cell: ({ row }) => {
                const resultado = row.original.resultadoObjetiva;
                if (resultado === 'CLASSIFICADO') return <span className="font-semibold text-green-600 dark:text-green-400">{resultado}</span>;
                if (resultado === 'ELIMINADO') return <span className="font-semibold text-red-600 dark:text-red-400">{resultado}</span>;
                return '-';
            }
        },
        { accessorKey: 'notaDiscursiva', header: 'Discursiva', cell: info => typeof info.getValue() === 'number' ? <span className="font-bold">{info.getValue().toFixed(2).replace('.', ',')}</span> : '-' },
        { accessorKey: 'resultadoDiscursiva', header: 'Resultado Discursiva',
            cell: ({ row }) => {
                const resultado = row.original.resultadoDiscursiva;
                if (resultado === 'CLASSIFICADO') return <span className="font-semibold text-green-600 dark:text-green-400">{resultado}</span>;
                if (resultado === 'ELIMINADO') return <span className="font-semibold text-red-600 dark:text-red-400">{resultado}</span>;
                return '-';
            }
        },
        {
            id: 'actions',
            header: 'Ações',
            cell: ({ row }) => (
                <div className="flex items-center gap-2">
                    <button onClick={() => openModal(row.original)} className="p-2 text-gray-500 hover:text-blue-600" title="Editar"><PencilIcon className="w-5 h-5"/></button>
                    <button onClick={() => openDeleteModal(row.original.id)} className="p-2 text-gray-500 hover:text-red-600" title="Deletar"><TrashIcon className="w-5 h-5"/></button>
                </div>
            )
        }
    ], [openDeleteModal]);

    const tableData = useMemo(() => proofs.filter(p => (p.type || 'CONCURSO') === 'CONCURSO'), [proofs]);
    const table = useReactTable({ data: tableData, columns, getCoreRowModel: getCoreRowModel() });

    if (isLoading) return <LoadingSpinner message="Carregando dados consolidados..." />;

    const { disciplinas, totais } = consolidatedData;

    const openModal = (contest = null) => {
        setEditingContest(contest);
        setIsModalOpen(true);
    };

    const FilterButton = ({ filterValue, label }) => (
        <button 
            onClick={() => setDashboardFilter(filterValue)}
            className={`flex-1 py-2 px-4 rounded-lg font-semibold transition-all duration-300 text-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-100 dark:focus:ring-offset-gray-900 focus:ring-teal-500 ${
                dashboardFilter === filterValue 
                ? 'bg-white dark:bg-gray-700 shadow-md text-teal-600 dark:text-teal-400' 
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
        >
            {label}
        </button>
    );

    return (
        <div className="space-y-6">
            <div className="flex justify-center p-1 bg-gray-200/70 dark:bg-gray-800/50 rounded-xl max-w-sm mx-auto">
                <FilterButton filterValue="TODOS" label="Total" />
                <FilterButton filterValue="CONCURSO" label="Concursos" />
                <FilterButton filterValue="SIMULADO" label="Simulados" />
            </div>

            <div className="bg-white dark:bg-gray-800/50 shadow-lg rounded-xl overflow-hidden">
                <div className="bg-orange-400 dark:bg-orange-600 text-white flex justify-between items-center py-4 px-6">
                    <h2 className="text-xl font-bold tracking-wider uppercase">Dados Consolidados</h2>
                </div>
                {disciplinas && disciplinas.length > 0 ? (
                    <div className="text-sm text-gray-800 dark:text-gray-200">
                        <div className="hidden md:grid grid-cols-9 text-center font-semibold bg-teal-200 dark:bg-teal-800/50 py-3 border-b-2 border-teal-300 dark:border-teal-700">
                            <p className="text-left pl-4">Disciplinas</p>
                            <p>Acertos</p><p>Erros</p><p>Brancos</p><p>Anuladas</p>
                            <p>Questões</p><p>Líquidos</p><p>% Bruta</p><p>% Líquidos</p>
                        </div>
                        <div className="divide-y divide-gray-200 dark:divide-gray-700">
                            {disciplinas.map(item => <StatsRow key={item.id} item={item} />)}
                        </div>
                        <StatsRow item={totais} isFooter={true} />
                    </div>
                ) : (
                    <div className="text-center py-16 text-gray-500 dark:text-gray-400">
                        <p className="font-semibold">Nenhum dado encontrado para a categoria "{dashboardFilter.toLowerCase()}".</p>
                    </div>
                )}
            </div>

            {/* Tabela de Controle de Concursos */}
            <div className="bg-white dark:bg-gray-800/50 shadow-lg rounded-xl overflow-hidden p-4 mt-8">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100">Controle de Concursos</h2>
                    <button onClick={() => openModal(null)} className="bg-teal-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-teal-700 transition-colors">
                        + Novo Concurso
                    </button>
                </div>
                <div className="overflow-x-auto">
                    <table className="min-w-full text-sm text-left text-gray-500 dark:text-gray-400">
                        <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                            {table.getHeaderGroups().map(headerGroup => (
                                <tr key={headerGroup.id}>
                                    {headerGroup.headers.map(header => (
                                        <th key={header.id} scope="col" className="px-6 py-3">{flexRender(header.column.columnDef.header, header.getContext())}</th>
                                    ))}
                                </tr>
                            ))}
                        </thead>
                        <tbody>
                            {table.getRowModel().rows.map(row => (
                                <tr key={row.id} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
                                    {row.getVisibleCells().map(cell => (
                                        <td key={cell.id} className="px-6 py-4">{flexRender(cell.column.columnDef.cell, cell.getContext())}</td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <ContestFormModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                contestData={editingContest}
            />
        </div>
    );
};

export default Dashboard;