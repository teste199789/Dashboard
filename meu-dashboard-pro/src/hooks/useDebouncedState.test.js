import { renderHook, act } from '@testing-library/react';
import { useDebouncedState } from './useDebouncedState';

describe('hooks/useDebouncedState', () => {
  beforeEach(() => {
    // Usa timers falsos para controlar o setTimeout
    vi.useFakeTimers();
  });

  afterEach(() => {
    // Restaura os timers reais após cada teste
    vi.useRealTimers();
  });

  it('deve retornar o valor inicial imediatamente', () => {
    const { result } = renderHook(() => useDebouncedState('initial', 500));
    const [value, , debouncedValue] = result.current;

    expect(value).toBe('initial');
    expect(debouncedValue).toBe('initial');
  });

  it('não deve atualizar o valor debounced imediatamente após a mudança', () => {
    const { result } = renderHook(() => useDebouncedState('initial', 500));

    act(() => {
      const [, setValue] = result.current;
      setValue('new value');
    });

    const [value, , debouncedValue] = result.current;
    expect(value).toBe('new value');
    expect(debouncedValue).toBe('initial'); // Ainda deve ser o valor antigo
  });

  it('deve atualizar o valor debounced após o delay especificado', () => {
    const { result } = renderHook(() => useDebouncedState('initial', 500));

    act(() => {
      const [, setValue] = result.current;
      setValue('new value');
    });

    // Avança o tempo do timer
    act(() => {
      vi.advanceTimersByTime(500);
    });

    const [, , debouncedValue] = result.current;
    expect(debouncedValue).toBe('new value');
  });

  it('deve atualizar o valor debounced apenas uma vez após múltiplas chamadas rápidas', () => {
    const { result } = renderHook(() => useDebouncedState('initial', 500));

    // Simula múltiplas atualizações rápidas
    act(() => {
      const [, setValue] = result.current;
      setValue('update 1');
      vi.advanceTimersByTime(100); // Avança menos que o delay
      setValue('update 2');
      vi.advanceTimersByTime(100);
      setValue('final update');
    });

    // Verifica que o valor não mudou ainda
    expect(result.current[2]).toBe('initial');

    // Avança o tempo para além do delay final
    act(() => {
      vi.advanceTimersByTime(500);
    });

    // O valor debounced deve ser o último valor definido
    expect(result.current[2]).toBe('final update');
  });
}); 