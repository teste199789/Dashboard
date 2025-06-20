import React from 'react';

const StatCard = ({ title, value, colorClass = 'text-gray-900 dark:text-gray-100' }) => {
    return (
        <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg shadow-md text-center">
            <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">{title}</h4>
            <p className={`text-3xl font-bold mt-1 ${colorClass}`}>{value}</p>
        </div>
    );
};

export default StatCard;