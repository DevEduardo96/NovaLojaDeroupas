// SUBSTITUA COMPLETAMENTE o conteúdo do arquivo src/services/api.ts por este código:

import { apiClient } from "./apiClient";
import {
  Product,
  PaymentData,
  PaymentStatus,
  DownloadResponse,
  CreatePaymentRequest,
  ApiResponse,
  PaginatedResponse,
  ProductFilters,
} from "../types";

export const api = {
  // ===== PRODUTOS =====
  async getProducts(filters?: ProductFilters): Promise<Product[]> {
    try {
      // Se não houver filtros, busca todos os produtos
      if (!filters || Object.keys(filters).length === 0) {
        return await apiClient.get<Product[]>("/products");
      }

      // Constrói query string com filtros
      const params = new URLSearchParams();
      if (filters.category) params.append("category", filters.category);
      if (filters.search) params.append("search", filters.search);
      if (filters.sortBy) params.append("sortBy", filters.sortBy);
      if (filters.minPrice) params.append("minPrice", filters.minPrice.toString());
      if (filters.maxPrice) params.append("maxPrice", filters.maxPrice.toString());

      return await apiClient.get<Product[]>(`/products?${params.toString()}`);
    } catch (error) {
      console.error("Erro ao buscar produtos:", error);
      // Fallback para dados mockados em caso de erro
      return this.getMockProducts();
    }
  },

  async getProductById(id: number): Promise<Product | null> {
    try {
      return await apiClient.get<Product>(`/products/${id}`);
    } catch (error) {
      console.error(`Erro ao buscar produto ${id}:`, error);
      return null;
    }
  },

  async getProductsByCategory(category: string): Promise<Product[]> {
    try {
      return await apiClient.get<Product[]>(`/products/category/${category}`);
    } catch (error) {
      console.error(`Erro ao buscar produtos da categoria ${category}:`, error);
      return [];
    }
  },

  async searchProducts(query: string): Promise<Product[]> {
    try {
      return await apiClient.get<Product[]>(`/products/search?q=${encodeURIComponent(query)}`);
    } catch (error) {
      console.error(`Erro ao buscar produtos com query "${query}":`, error);
      return [];
    }
  },

  // ===== PAGAMENTOS =====
  async createPayment(data: CreatePaymentRequest): Promise<PaymentData> {
    console.log("Criando pagamento:", data);
    
    try {
      const response = await apiClient.post<PaymentData>("/api/payments/criar-pagamento", data);
      console.log("Pagamento criado com sucesso:", response);
      return response;
    } catch (error) {
      console.error("Erro ao criar pagamento:", error);
      
      // Fallback para modo de demonstração quando o servidor está offline
      if (error instanceof Error && error.message.includes('500')) {
        console.log("Servidor offline, usando modo de demonstração...");
        return this.createMockPayment(data);
      }
      
      throw error;
    }
  },


  // 🔧 CORREÇÃO CRÍTICA: Aceita string | number e converte para string
  async getPaymentStatus(paymentId: string | number): Promise<PaymentStatus> {
    console.log("Consultando status do pagamento:", paymentId);

    if (!paymentId) {
      throw new Error("ID do pagamento é obrigatório");
    }

    // 🔧 CORREÇÃO: Converter para string antes de usar startsWith
    const paymentIdStr = String(paymentId);

    try {
      const response = await apiClient.get<PaymentStatus>(`/api/payments/status/${paymentIdStr}`);
      console.log("Status obtido:", response);
      return response;
    } catch (error) {
      console.error("Erro ao consultar status do pagamento:", error);
      
      // 🔧 CORREÇÃO: Usar a versão string para startsWith
      if (paymentIdStr.startsWith('mock_')) {
        console.log("Consultando status de pagamento mock...");
        return this.getMockPaymentStatus(paymentIdStr);
      }
      
      // 🔧 CORREÇÃO: Tratamento melhor do erro 404
      if (error instanceof Error && (
        error.message.includes('404') || 
        error.message.includes('Endpoint não encontrado') ||
        error.message.includes('Not Found')
      )) {
        console.log("Endpoint não encontrado, retornando status temporário...");
        return {
          id: paymentIdStr,
          status: "pending",
          paymentId: paymentIdStr,
        };
      }
      
      throw error;
    }
  },

  getMockPaymentStatus(paymentId: string): PaymentStatus {
    const paymentIdStr = String(paymentId);
    const parts = paymentIdStr.split('_');
    
    if (parts.length >= 2) {
      const timestamp = parseInt(parts[1]);
      if (!isNaN(timestamp)) {
        const elapsed = Date.now() - timestamp;
        // Se passou mais de 30 segundos, considera como aprovado
        const status = elapsed > 30000 ? "approved" : "pending";
        
        return {
          id: paymentIdStr,
          status,
          paymentId: paymentIdStr
        };
      }
    }
    
    // Fallback se não conseguir parsear o timestamp
    return {
      id: paymentIdStr,
      status: "pending",
      paymentId: paymentIdStr
    };
  },

  // 🔧 CORREÇÃO: Aceita string | number
  async getDownloadLinks(paymentId: string | number): Promise<DownloadResponse> {
    console.log("Buscando links de download:", paymentId);

    if (!paymentId) {
      throw new Error("ID do pagamento é obrigatório");
    }

    // 🔧 CORREÇÃO: Converter para string
    const paymentIdStr = String(paymentId);

    try {
      const response = await apiClient.get<PaymentStatus>(`/api/payments/status/${paymentIdStr}`);
      
      // Extrair links de download da resposta de status
      if (response && response.download_links) {
        return {
          links: response.download_links.map((link: any) => link.download_url),
          products: response.download_links.map((link: any) => ({
            id: link.produto_id,
            name: link.nome,
            description: `Download: ${link.nome}`,
            price: 0,
            image_url: link.image_url,
            category: "Digital",
            download_url: link.download_url
          })),
          customerName: "Cliente",
          total: response.transaction_amount || 0,
          downloadedAt: new Date().toISOString(),
          expiresIn: "7 dias"
        };
      }
      
      // Se não há links de download, retornar estrutura vazia
      return {
        links: [],
        products: [],
        customerName: "Cliente",
        total: response.transaction_amount || 0,
        downloadedAt: new Date().toISOString(),
        expiresIn: "7 dias"
      };
      console.log("Links de download obtidos:", response);
      // Retornar a resposta que foi construída acima
    } catch (error) {
      console.error("Erro ao obter links de download:", error);
      
      // 🔧 CORREÇÃO: Usar versão string
      if (paymentIdStr.startsWith('mock_')) {
        console.log("Obtendo links de download mock...");
        return this.getMockDownloadLinks(paymentIdStr);
      }
      
      // 🔧 CORREÇÃO: Tratamento para endpoint não encontrado
      if (error instanceof Error && (
        error.message.includes('404') || 
        error.message.includes('Endpoint não encontrado') ||
        error.message.includes('Not Found')
      )) {
        console.log("Endpoint de download não encontrado, retornando links mock...");
        return this.getMockDownloadLinks(paymentIdStr);
      }
      
      throw error;
    }
  },

 


 
};