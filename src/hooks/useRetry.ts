// 🔄 HOOK PARA RETRY AUTOMÁTICO

import { useState, useCallback } from 'react';
import { ErrorHandler } from '../utils/errorHandler';

interface RetryOptions {
  maxAttempts?: number;
  baseDelay?: number;
  maxDelay?: number;
  backoffFactor?: number;
}

interface RetryState {
  isRetrying: boolean;
  attempt: number;
  lastError: any;
}

export const useRetry = (options: RetryOptions = {}) => {
  const {
    maxAttempts = 3,
    baseDelay = 1000,
    maxDelay = 10000,
    backoffFactor = 2
  } = options;

  const [retryState, setRetryState] = useState<RetryState>({
    isRetrying: false,
    attempt: 0,
    lastError: null
  });

  const calculateDelay = useCallback((attempt: number): number => {
    const delay = baseDelay * Math.pow(backoffFactor, attempt - 1);
    return Math.min(delay, maxDelay);
  }, [baseDelay, backoffFactor, maxDelay]);

  const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

  const executeWithRetry = useCallback(async <T>(
    operation: () => Promise<T>,
    context?: string
  ): Promise<T> => {
    let lastError: any;

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        setRetryState({
          isRetrying: attempt > 1,
          attempt,
          lastError: null
        });

        const result = await operation();

        // Sucesso - resetar estado
        setRetryState({
          isRetrying: false,
          attempt: 0,
          lastError: null
        });

        return result;
      } catch (error) {
        lastError = error;
        
        setRetryState({
          isRetrying: true,
          attempt,
          lastError: error
        });

        // Log do erro para debug
        ErrorHandler.logError(error, `${context} - Tentativa ${attempt}/${maxAttempts}`);

        // Se não é retryable ou é a última tentativa, falhar
        if (!ErrorHandler.isRetryable(error) || attempt >= maxAttempts) {
          setRetryState({
            isRetrying: false,
            attempt: 0,
            lastError: error
          });
          throw error;
        }

        // Aguardar antes da próxima tentativa
        if (attempt < maxAttempts) {
          const delay = calculateDelay(attempt);
          console.log(`🔄 Tentando novamente em ${delay}ms... (Tentativa ${attempt + 1}/${maxAttempts})`);
          await sleep(delay);
        }
      }
    }

    // Nunca deveria chegar aqui, mas por segurança
    throw lastError;
  }, [maxAttempts, calculateDelay]);

  const reset = useCallback(() => {
    setRetryState({
      isRetrying: false,
      attempt: 0,
      lastError: null
    });
  }, []);

  return {
    executeWithRetry,
    reset,
    ...retryState
  };
};

// Hook especializado para operações do Supabase
export const useSupabaseRetry = () => {
  return useRetry({
    maxAttempts: 3,
    baseDelay: 1000,
    maxDelay: 5000,
    backoffFactor: 2
  });
};

// Hook especializado para operações de API externa
export const useApiRetry = () => {
  return useRetry({
    maxAttempts: 5,
    baseDelay: 2000,
    maxDelay: 30000,
    backoffFactor: 1.5
  });
};
