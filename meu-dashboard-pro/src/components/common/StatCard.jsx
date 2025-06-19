import React from 'react';

const StatCard = ({ 
    label, 
    value, 
    colorClass = 'text-gray-800 dark:text-gray-100',
    description,
    subValue 
}) => (
    <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg text-center group relative">
        <p className="text-sm font-bold text-gray-600 dark:text-gray-400">{label}</p>
        <p className={`text-3xl font-extrabold ${colorClass}`}>{value}</p>
        {subValue && (
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{subValue}</p>
        )}
        {description && (
            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 hidden group-hover:block bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 text-xs rounded-lg px-3 py-2 whitespace-nowrap z-10 shadow-lg">
                {description}
                <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-900 dark:border-t-gray-100"></div>
            </div>
        )}
    </div>
);

export default StatCard;