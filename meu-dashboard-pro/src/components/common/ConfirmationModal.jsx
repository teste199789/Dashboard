import React from 'react';

const ConfirmationModal = ({ isOpen, onCancel, onConfirm, title, message }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center" aria-modal="true" role="dialog">
            <div className="bg-white rounded-lg shadow-xl p-6 m-4 max-w-sm w-full">
                <h3 className="text-lg font-bold text-gray-800">{title}</h3>
                <p className="text-sm text-gray-600 mt-2 mb-4">{message}</p>
                <div className="flex justify-end space-x-4">
                    <button onClick={onCancel} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors">
                        Cancelar
                    </button>
                    <button onClick={onConfirm} className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">
                        Confirmar
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ConfirmationModal;