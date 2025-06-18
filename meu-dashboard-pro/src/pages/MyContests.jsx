import React, { useState, useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useProofs } from '../hooks/useProofs';
import { formatDate } from '../utils/formatters';
import LoadingSpinner from '../components/common/LoadingSpinner';

const MyContests = () => {
    const { proofsList, isLoading } = useProofs();
    const [viewType, setViewType] = useState('CONCURSO');

    const chartData = useMemo(() => {
        const filteredProofs = proofsList
            .filter(p => (p.type || 'CONCURSO') === viewType)
            .filter(p => typeof p.aproveitamento === 'number');

        return filteredProofs
            .map(proof => {
                const shortTitle = proof.titulo.split(' ')[0];
                const formattedDate = formatDate(proof.data);
                return { 
                    id: proof.id,
                    name: `${shortTitle} (${formattedDate})`,
                    aproveitamento: parseFloat((proof.aproveitamento * 100).toFixed(2)),
                    full_name: proof.titulo,
                    date: new Date(proof.data),
                };
            })
            .sort((a,b) => a.date - b.date);
    }, [proofsList, viewType]);

    if (isLoading) {
        return <LoadingSpinner message="Carregando dados de evolução..." />;
    }
    
    return (
        <div className="bg-white dark:bg-gray-800/50 p-6 rounded-xl shadow-lg space-y-6">
            <div className="flex justify-center mb-4 p-1 bg-gray-200 dark:bg-gray-700 rounded-lg max-w-sm mx-auto">
                <button onClick={() => setViewType('CONCURSO')} className={`w-full py-2 px-4 rounded-md font-semibold transition-colors ${viewType === 'CONCURSO' ? 'bg-white dark:bg-gray-800 shadow' : 'text-gray-500 dark:text-gray-300'}`}>Concursos</button>
                <button onClick={() => setViewType('SIMULADO')} className={`w-full py-2 px-4 rounded-md font-semibold transition-colors ${viewType === 'SIMULADO' ? 'bg-white dark:bg-gray-800 shadow' : 'text-gray-500 dark:text-gray-300'}`}>Simulados</button>
            </div>
            <div className="text-center">
                <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-100">{chartData.length} {viewType === 'CONCURSO' ? 'Concurso(s)' : 'Simulado(s)'} Analisado(s)</h2>
                <p className="text-lg text-gray-500 dark:text-gray-400">Evolução do seu desempenho</p>
            </div>
            
            {chartData.length === 0 ? (
                <div className="text-center text-gray-500 py-20">
                    <p className="font-semibold">Nenhum item corrigido encontrado.</p>
                    <p className="text-sm mt-1">Corrija uma prova ou simulado para ver sua evolução aqui.</p>
                </div>
            ) : (
                <div className="w-full h-80">
                     <ResponsiveContainer>
                        <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                            <defs>
                                <linearGradient id="colorUv" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#14b8a6" stopOpacity={0.8}/>
                                    <stop offset="95%" stopColor="#14b8a6" stopOpacity={0}/>
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-700"/>
                            <XAxis dataKey="name" tick={{fontSize: 12, fill: 'currentColor'}} className="text-gray-600 dark:text-gray-400"/>
                            <YAxis domain={[0, 100]} tickFormatter={(value) => `${value}%`} tick={{fontSize: 12, fill: 'currentColor'}} className="text-gray-600 dark:text-gray-400"/>
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: 'rgba(255, 255, 255, 0.8)',
                                    backdropFilter: 'blur(4px)',
                                    border: '1px solid #cccccc', 
                                    borderRadius: '0.5rem',
                                    color: '#333'
                                }}
                                labelStyle={{fontWeight: 'bold'}}
                                formatter={(value, name, props) => [`${value.toFixed(2)}%`, `Aproveitamento em ${props.payload.full_name}`]}
                            />
                            <Area type="monotone" dataKey="aproveitamento" stroke="#0d9488" fillOpacity={1} fill="url(#colorUv)" strokeWidth={2} />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            )}
        </div>
    );
};

export default MyContests;