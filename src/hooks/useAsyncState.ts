
import { useState, useCallback, useRef } from 'react';

interface AsyncState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

interface UseAsyncStateOptions {
  initialData?: any;
  onSuccess?: (data: any) => void;
  onError?: (error: Error) => void;
}

export const useAsyncState = <T>(options: UseAsyncStateOptions = {}) => {
  const [state, setState] = useState<AsyncState<T>>({
    data: options.initialData || null,
    loading: false,
    error: null,
  });

  const abortControllerRef = useRef<AbortController | null>(null);

  const execute = useCallback(async (asyncFunction: () => Promise<T>) => {
    // Cancel previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();

    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const result = await asyncFunction();
      
      if (!abortControllerRef.current?.signal.aborted) {
        setState({
          data: result,
          loading: false,
          error: null,
        });
        
        if (options.onSuccess) {
          options.onSuccess(result);
        }
      }
      
      return result;
    } catch (error) {
      if (!abortControllerRef.current?.signal.aborted) {
        const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
        setState({
          data: null,
          loading: false,
          error: errorMessage,
        });
        
        if (options.onError && error instanceof Error) {
          options.onError(error);
        }
      }
      throw error;
    }
  }, [options]);

  const reset = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    setState({
      data: options.initialData || null,
      loading: false,
      error: null,
    });
  }, [options.initialData]);

  const cancel = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    setState(prev => ({ ...prev, loading: false }));
  }, []);

  return {
    ...state,
    execute,
    reset,
    cancel,
    isAborted: abortControllerRef.current?.signal.aborted || false,
  };
};
