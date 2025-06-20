import React from 'react';

const ProgressBar = ({ value }) => {
    const percentage = value || 0;
    
    const getColor = (val) => {
        if (val >= 80) return 'bg-green-500';
        if (val >= 60) return 'bg-yellow-400';
        return 'bg-red-500';
    };

    return (
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-4 relative">
            <div
                className={`h-4 rounded-full ${getColor(percentage)}`}
                style={{ width: `${percentage}%` }}
            />
            <span className="absolute inset-0 flex items-center justify-center text-xs font-medium text-white mix-blend-lighten">
                {percentage.toFixed(1)}%
            </span>
        </div>
    );
};

export default ProgressBar; 