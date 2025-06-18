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
            return [`${c.titulo}`, `${year}`];
        }),
        datasets: [
            {
                label: 'Aproveitamento (%)',
                data: sortedConcursos.map(c => c.aproveitamento),
                fill: true,
                backgroundColor: 'rgba(0, 191, 255, 0.2)',
                borderColor: 'rgb(0, 191, 255)',
                tension: 0.4,
                pointRadius: 6,
                pointBackgroundColor: 'rgb(0, 191, 255)',
                pointBorderColor: '#fff',
                pointBorderWidth: 2,
                pointHoverRadius: 8,
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
                    bottom: 30
                },
                font: {
                    size: 18,
                    weight: 'normal'
                },
                color: '#007bff'
            },
            tooltip: {
                callbacks: {
                    title: function(context) {
                        return context[0].label.replace(',', ' ');
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
                    color: 'rgba(0, 0, 0, 0.1)',
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
        <div className="p-4 md:p-6 lg:p-8">
             <div className="text-center mb-2">
                <h2 className="text-3xl font-bold">{concursos.length} concursos</h2>
            </div>
            <div className="relative h-[350px]">
                <Line data={chartData} options={chartOptions} />
            </div>
        </div>
    );
};

export default DesempenhoTab; 