import { useState, useEffect, useRef } from 'react';

export function useDebouncedState(initialValue, delay) {
  const [value, setValue] = useState(initialValue);
  const [debouncedValue, setDebouncedValue] = useState(initialValue);
  const timeoutRef = useRef(null);

  useEffect(() => {
    // Limpa o timeout anterior em cada mudança de valor
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    // Configura um novo timeout
    timeoutRef.current = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // Limpa o timeout quando o componente é desmontado
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [value, delay]);

  return [value, setValue, debouncedValue];
} 