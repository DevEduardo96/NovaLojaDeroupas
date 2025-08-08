import { useState, useCallback } from 'react';
import { api } from '../services/api';
import { Product, PaymentData, PaymentStatus, DownloadResponse, ProductFilters } from '../types';
import toast from 'react-hot-toast';

interface ApiState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

export const useApi = () => {
  const [products, setProducts] = useState<ApiState<Product[]>>({
    data: null,
    loading: false,
    error: null,
  });

  const [payment, setPayment] = useState<ApiState<PaymentData>>({
    data: null,
    loading: false,
    error: null,
  });

  const [paymentStatus, setPaymentStatus] = useState<ApiState<PaymentStatus>>({
    data: null,
    loading: false,
    error: null,
  });

  const [downloadLinks, setDownloadLinks] = useState<ApiState<DownloadResponse>>({
    data: null,
    loading: false,
    error: null,
  });

  // Função genérica para executar operações da API
  const executeApiCall = useCallback(async <T>(
    apiCall: () => Promise<T>,
    setState: React.Dispatch<React.SetStateAction<ApiState<T>>>,
    successMessage?: string,
    errorMessage?: string
  ): Promise<T | null> => {
    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const result = await apiCall();
      setState({ data: result, loading: false, error: null });
      
      if (successMessage) {
        toast.success(successMessage);
      }
      
      return result;
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Erro desconhecido';
      setState({ data: null, loading: false, error: errorMsg });
      
      const finalErrorMessage = errorMessage || errorMsg;
      toast.error(finalErrorMessage);
      
      return null;
    }
  }, []);

  // Produtos
  const fetchProducts = useCallback(async (filters?: ProductFilters) => {
    return executeApiCall(
      () => api.getProducts(filters),
      setProducts,
      undefined,
      'Erro ao carregar produtos'
    );
  }, [executeApiCall]);

  const fetchProductById = useCallback(async (id: number) => {
    return executeApiCall(
      () => api.getProductById(id),
      setProducts,
      undefined,
      'Erro ao carregar produto'
    );
  }, [executeApiCall]);

  const searchProducts = useCallback(async (query: string) => {
    return executeApiCall(
      () => api.searchProducts(query),
      setProducts,
      undefined,
      'Erro ao buscar produtos'
    );
  }, [executeApiCall]);

  // Pagamentos
  const createPayment = useCallback(async (data: any) => {
    return executeApiCall(
      () => api.createPayment(data),
      setPayment,
      'Pagamento criado com sucesso!',
      'Erro ao criar pagamento'
    );
  }, [executeApiCall]);

  const getPaymentStatus = useCallback(async (paymentId: string | number) => {
    return executeApiCall(
      () => api.getPaymentStatus(paymentId),
      setPaymentStatus,
      undefined,
      'Erro ao consultar status do pagamento'
    );
  }, [executeApiCall]);

  // 🔧 NOVA FUNÇÃO: Busca o produto diretamente do Supabase para obter o download_url
  const getDownloadLinks = useCallback(async (productId: number) => {
    return executeApiCall(
      async () => {
        // Busca o produto diretamente do Supabase pelo ID
        const product = await api.getProductById(productId);
        
        if (!product) {
          throw new Error('Produto não encontrado');
        }

        // Verifica se o produto tem download_url
        if (!product.download_url) {
          throw new Error('Link de download não disponível para este produto');
        }

        // Retorna o formato esperado pelo DownloadResponse
        return {
          download_url: product.download_url,
          file_format: product.file_format || 'zip',
          expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // 24h de validade
        };
      },
      setDownloadLinks,
      'Link de download carregado!',
      'Erro ao obter link de download'
    );
  }, [executeApiCall]);

  // 🔧 FUNÇÃO ALTERNATIVA: Se você quiser buscar por payment_id
  const getDownloadLinksByPaymentId = useCallback(async (paymentId: string | number) => {
    return executeApiCall(
      async () => {
        // Primeiro, busca o status do pagamento para obter o product_id
        const paymentStatus = await api.getPaymentStatus(paymentId);
        
        if (!paymentStatus || paymentStatus.status !== 'approved') {
          throw new Error('Pagamento não aprovado');
        }

        // Assumindo que paymentStatus tem um product_id
        if (!paymentStatus.product_id) {
          throw new Error('ID do produto não encontrado no pagamento');
        }

        // Busca o produto pelo ID
        const product = await api.getProductById(paymentStatus.product_id);
        
        if (!product || !product.download_url) {
          throw new Error('Link de download não disponível');
        }

        return {
          download_url: product.download_url,
          file_format: product.file_format || 'zip',
          expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
        };
      },
      setDownloadLinks,
      'Link de download carregado!',
      'Erro ao obter link de download'
    );
  }, [executeApiCall]);

  // Utilitários
  const wakeUpServer = useCallback(async () => {
    try {
      await api.wakeUpServer();
      toast.success('Servidor está ativo!');
    } catch (error) {
      toast.error('Servidor não está respondendo');
    }
  }, []);

  // Reset states
  const resetProducts = useCallback(() => {
    setProducts({ data: null, loading: false, error: null });
  }, []);

  const resetPayment = useCallback(() => {
    setPayment({ data: null, loading: false, error: null });
  }, []);

  const resetPaymentStatus = useCallback(() => {
    setPaymentStatus({ data: null, loading: false, error: null });
  }, []);

  const resetDownloadLinks = useCallback(() => {
    setDownloadLinks({ data: null, loading: false, error: null });
  }, []);

  return {
    // States
    products,
    payment,
    paymentStatus,
    downloadLinks,
    
    // Actions
    fetchProducts,
    fetchProductById,
    searchProducts,
    createPayment,
    getPaymentStatus,
    getDownloadLinks, // Agora busca diretamente do Supabase
    getDownloadLinksByPaymentId, // Função alternativa se precisar buscar por payment_id
    wakeUpServer,
    
    // Reset functions
    resetProducts,
    resetPayment,
    resetPaymentStatus,
    resetDownloadLinks,
  };
};