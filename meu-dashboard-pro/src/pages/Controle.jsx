import React, { useMemo, useState } from 'react';
import { useReactTable, getCoreRowModel, flexRender } from '@tanstack/react-table';
import { useProofs } from '../hooks/useProofs';
import { formatDate, formatPercent } from '../utils/formatters';
import PencilIcon from '../components/icons/PencilIcon';
import TrashIcon from '../components/icons/TrashIcon';
import ContestFormModal from '../components/ContestFormModal';
import LoadingSpinner from '../components/common/LoadingSpinner';

const Controle = () => {
    const { proofsList, openDeleteModal, isLoading } = useProofs();

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingContest, setEditingContest] = useState(null);

    const openModal = (contest = null) => {
        setEditingContest(contest);
        setIsModalOpen(true);
    };

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

    const data = useMemo(() => proofsList.filter(p => (p.type || 'CONCURSO') === 'CONCURSO'), [proofsList]);

    const table = useReactTable({ data, columns, getCoreRowModel: getCoreRowModel() });

    if (isLoading) return <LoadingSpinner message="Carregando concursos..." />;

    return (
        <div className="bg-white dark:bg-gray-800/50 shadow-lg rounded-xl overflow-hidden p-4">
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
            <ContestFormModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                contestData={editingContest}
            />
        </div>
    );
};

export default Controle;