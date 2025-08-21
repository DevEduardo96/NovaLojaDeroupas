// 🛡️ SISTEMA DE TRATAMENTO DE ERROS CENTRALIZADO

export interface AppError {
  type: 'network' | 'validation' | 'database' | 'payment' | 'auth' | 'unknown';
  message: string;
  originalError?: Error;
  code?: string;
  retryable?: boolean;
}

export class ErrorHandler {
  /**
   * Analisa e categoriza erros para melhor tratamento
   */
  static categorizeError(error: any): AppError {
    if (!error) {
      return {
        type: 'unknown',
        message: 'Erro desconhecido'
      };
    }

    // Erro de rede
    if (error.name === 'NetworkError' || 
        error.message?.includes('fetch') ||
        error.message?.includes('CORS') ||
        error.message?.includes('timeout')) {
      return {
        type: 'network',
        message: 'Erro de conexão. Verifique sua internet e tente novamente.',
        originalError: error,
        retryable: true
      };
    }

    // Erro do Supabase
    if (error.code) {
      switch (error.code) {
        case '42501':
          return {
            type: 'auth',
            message: 'Erro de permissão. Faça login e tente novamente.',
            originalError: error,
            code: error.code
          };
        case 'PGRST301':
          return {
            type: 'database',
            message: 'Erro no banco de dados. Tente novamente.',
            originalError: error,
            code: error.code,
            retryable: true
          };
        default:
          return {
            type: 'database',
            message: error.message || 'Erro no banco de dados',
            originalError: error,
            code: error.code
          };
      }
    }

    // Erro de validação
    if (error.message?.includes('obrigatório') ||
        error.message?.includes('inválido') ||
        error.message?.includes('formato')) {
      return {
        type: 'validation',
        message: error.message,
        originalError: error
      };
    }

    // Erro de pagamento
    if (error.message?.includes('pagamento') ||
        error.message?.includes('QR Code') ||
        error.message?.includes('PIX')) {
      return {
        type: 'payment',
        message: error.message || 'Erro no processamento do pagamento',
        originalError: error,
        retryable: true
      };
    }

    // Erro genérico
    return {
      type: 'unknown',
      message: error.message || 'Ocorreu um erro inesperado',
      originalError: error
    };
  }

  /**
   * Obtém mensagem amigável para exibir ao usuário
   */
  static getUserFriendlyMessage(error: any): string {
    const categorized = this.categorizeError(error);
    
    switch (categorized.type) {
      case 'network':
        return '🌐 Problema de conexão. Verifique sua internet e tente novamente.';
      case 'validation':
        return `📝 ${categorized.message}`;
      case 'database':
        return '💾 Problema temporário no servidor. Tente novamente em alguns segundos.';
      case 'payment':
        return `💳 ${categorized.message}`;
      case 'auth':
        return '🔐 Problema de autenticação. Faça login novamente.';
      default:
        return '❌ Ocorreu um erro inesperado. Tente novamente.';
    }
  }

  /**
   * Determina se o erro pode ser tentado novamente
   */
  static isRetryable(error: any): boolean {
    const categorized = this.categorizeError(error);
    return categorized.retryable || false;
  }

  /**
   * Log detalhado do erro para desenvolvimento
   */
  static logError(error: any, context?: string): void {
    const categorized = this.categorizeError(error);
    
    console.group(`🔥 ${categorized.type.toUpperCase()} ERROR ${context ? `(${context})` : ''}`);
    console.error('Message:', categorized.message);
    console.error('Type:', categorized.type);
    if (categorized.code) console.error('Code:', categorized.code);
    if (categorized.retryable) console.error('Retryable:', categorized.retryable);
    if (categorized.originalError) console.error('Original:', categorized.originalError);
    console.groupEnd();
  }
}

// Hook para usar o error handler em componentes
export const useErrorHandler = () => {
  const handleError = (error: any, context?: string) => {
    ErrorHandler.logError(error, context);
    return ErrorHandler.getUserFriendlyMessage(error);
  };

  const isRetryable = (error: any) => ErrorHandler.isRetryable(error);

  return { handleError, isRetryable };
};
