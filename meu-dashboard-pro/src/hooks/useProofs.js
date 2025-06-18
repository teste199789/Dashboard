import { useContext } from 'react';
import { ProofsContext } from '../contexts/ProofsContext';

export const useProofs = () => {
    const context = useContext(ProofsContext);
    if (context === undefined) {
        throw new Error('useProofs deve ser usado dentro de um ProofsProvider');
    }
    return context;
};