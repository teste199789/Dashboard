import React from 'react';
import { Line } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    Filler
} from 'chart.js';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    Filler
);

const DesempenhoTab = ({ concursos }) => {
    // Ordenar os concursos por data
    const sortedConcursos = [...concursos].sort((a, b) => {
        const dateA = a.data ? new Date(a.data) : new Date(0);
        const dateB = b.data ? new Date(b.data) : new Date(0);
        return dateA - dateB;
    });

    const chartData = {
        labels: sortedConcursos.map(c => {
            const year = c.data ? new Date(c.data).getFullYear() : 'N/A';
            // Alterado para usar 'orgao' e 'ano', conforme solicitado.
            return [`${c.orgao || c.titulo}`, `${year}`];
        }),
        datasets: [
            {
                label: 'Aproveitamento (%)',
                data: sortedConcursos.map(c => c.aproveitamento),
                fill: true,
                // Cor de preenchimento ciano, como na imagem
                backgroundColor: 'rgba(56, 189, 248, 0.15)', 
                // Cor da linha ciano
                borderColor: 'rgba(56, 189, 248, 1)', 
                tension: 0.4,
                pointRadius: 5,
                pointBackgroundColor: 'rgba(56, 189, 248, 1)',
                pointBorderColor: '#fff',
                pointBorderWidth: 2,
                pointHoverRadius: 7,
            }
        ]
    };

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                display: false,
            },
            title: {
                display: true,
                text: 'Desempenho nos concursos',
                padding: {
                    bottom: 20
                },
                font: {
                    size: 16,
                    weight: 'bold'
                },
                // Cor do título mais neutra
                color: '#0ea5e9' 
            },
            tooltip: {
                callbacks: {
                    title: function(context) {
                        return context[0].label.replace(',', ' ');
                    },
                    label: function(context) {
                        let label = context.dataset.label || '';
                        if (label) {
                            label += ': ';
                        }
                        if (context.parsed.y !== null) {
                            label += `${context.parsed.y.toFixed(2)}%`;
                        }
                        return label;
                    }
                }
            }
        },
        scales: {
            y: {
                beginAtZero: true,
                max: 100,
                title: {
                    display: true,
                    text: '% aproveitamento'
                },
                grid: {
                    // Linhas do grid mais sutis
                    color: 'rgba(200, 200, 200, 0.1)',
                }
            },
            x: {
                grid: {
                    display: false
                }
            }
        }
    };

    return (
        <div className="bg-white dark:bg-gray-800/50 p-4 sm:p-6 rounded-2xl shadow-sm">
            {/* Título principal movido para cá, seguindo a imagem */}
            <div className="text-center mb-1">
                <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 dark:text-gray-100">
                    {concursos.length} {concursos.length === 1 ? 'concurso' : 'concursos'}
                </h2>
            </div>
            {/* O título do gráfico agora funciona como subtítulo */}
            <div className="relative h-[300px] sm:h-[400px]">
                <Line data={chartData} options={chartOptions} />
            </div>
        </div>
    );
};

export default DesempenhoTab; 