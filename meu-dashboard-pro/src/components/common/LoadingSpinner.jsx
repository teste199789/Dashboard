import React from 'react';

const LoadingSpinner = ({ message = 'Carregando...' }) => (
  <div className="flex flex-col justify-center items-center py-20 text-center">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-500"></div>
    <p className="mt-4 text-lg font-semibold text-gray-600 dark:text-gray-300">{message}</p>
  </div>
);

export default LoadingSpinner;