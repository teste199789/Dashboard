import React from 'react';

const StatCard = ({ label, value, colorClass = 'text-gray-800 dark:text-gray-100' }) => (
    <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg text-center">
        <p className="text-sm font-bold text-gray-600 dark:text-gray-400">{label}</p>
        <p className={`text-3xl font-extrabold ${colorClass}`}>{value}</p>
    </div>
);

export default StatCard;