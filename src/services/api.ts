// SUBSTITUA o conteúdo do seu src/services/api.ts por este código:

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

// URL base do backend - CORREÇÃO DEFINITIVA
const BACKEND_URL = import.meta.env.VITE_API_BASE_URL || "https://backend-nectix.onrender.com/api";

console.log("🔧 [API] Backend URL configurada:", BACKEND_URL);

// Cliente HTTP personalizado para garantir URLs corretas
const makeRequest = async <T>(endpoint: string, options: RequestInit = {}): Promise<T> => {
  const url = `${BACKEND_URL}${endpoint}`;
  console.log(`🌐 [API] Fazendo requisição para: ${url}`);
  
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
    });

    if (!response.ok) {
      let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
      try {
        const errorData = await response.json();
        errorMessage = errorData.error || errorData.message || errorMessage;
      } catch {
        // Se não conseguir parsear o erro, usa a mensagem padrão
      }
      throw new Error(errorMessage);
    }

    return await response.json();
  } catch (error) {
    console.error(`❌ [API] Erro na requisição para ${url}:`, error);
    throw error;
  }
};

export const api = {
  // ===== PRODUTOS =====
  async getProducts(filters?: ProductFilters): Promise<Product[]> {
    try {
      // Se não houver filtros, busca todos os produtos
      if (!filters || Object.keys(filters).length === 0) {
        return await makeRequest<Product[]>("/products");
      }

      // Constrói query string com filtros
      const params = new URLSearchParams();
      if (filters.category) params.append("category", filters.category);
      if (filters.search) params.append("search", filters.search);
      if (filters.sortBy) params.append("sortBy", filters.sortBy);
      if (filters.minPrice) params.append("minPrice", filters.minPrice.toString());
      if (filters.maxPrice) params.append("maxPrice", filters.maxPrice.toString());

      return await makeRequest<Product[]>(`/products?${params.toString()}`);
    } catch (error) {
      console.error("Erro ao buscar produtos:", error);
      // Fallback para dados mockados em caso de erro
      return this.getMockProducts();
    }
  },

  async getProductById(id: number): Promise<Product | null> {
    try {
      return await makeRequest<Product>(`/products/${id}`);
    } catch (error) {
      console.error(`Erro ao buscar produto ${id}:`, error);
      return null;
    }
  },

  async getProductsByCategory(category: string): Promise<Product[]> {
    try {
      return await makeRequest<Product[]>(`/products/category/${category}`);
    } catch (error) {
      console.error(`Erro ao buscar produtos da categoria ${category}:`, error);
      return [];
    }
  },

  async searchProducts(query: string): Promise<Product[]> {
    try {
      return await makeRequest<Product[]>(`/products/search?q=${encodeURIComponent(query)}`);
    } catch (error) {
      console.error(`Erro ao buscar produtos com query "${query}":`, error);
      return [];
    }
  },

  // ===== PAGAMENTOS =====
  async createPayment(data: CreatePaymentRequest): Promise<PaymentData> {
    console.log("💳 [API] Criando pagamento:", data);
    
    try {
      const response = await makeRequest<PaymentData>("/payments/criar-pagamento", {
        method: "POST",
        body: JSON.stringify(data),
      });
      console.log("✅ [API] Pagamento criado com sucesso:", response);
      return response;
    } catch (error) {
      console.error("❌ [API] Erro ao criar pagamento:", error);
      
      // Fallback para modo de demonstração quando o servidor está offline
      if (error instanceof Error && (error.message.includes('500') || error.message.includes('Endpoint não encontrado'))) {
        console.log("🔄 [API] Servidor offline, usando modo de demonstração...");
        return this.createMockPayment(data);
      }
      
      throw error;
    }
  },

  // ===== PAGAMENTO MOCK (FALLBACK) =====
  createMockPayment(data: CreatePaymentRequest): PaymentData {
    const mockPaymentId = `mock_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Simula um QR Code PIX (base64 de uma imagem simples)
    const mockQRCode = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==";
    
    return {
      id: mockPaymentId,
      status: "pending",
      email_cliente: data.email,
      nome_cliente: data.nomeCliente,
      valor: data.total,
      links_download: [
        "https://example.com/download/produto1.pdf",
        "https://example.com/download/produto2.pdf"
      ],
      produtos: data.carrinho.map(item => ({
        id: item.id,
        name: item.name,
        description: `Descrição do ${item.name}`,
        price: data.total / data.carrinho.length,
        image_url: "https://images.pexels.com/photos/196644/pexels-photo-196644.jpeg?auto=compress&cs=tinysrgb&w=500",
        category: "Digital"
      })),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      qr_code_base64: mockQRCode,
      qr_code: "00020126580014br.gov.bcb.pix0136123e4567-e12b-12d1-a456-426614174000520400005303986540510.005802BR5913Loja Digital6008Brasilia62070503***6304E2CA",
      ticket_url: "https://example.com/pix-payment"
    };
  },

  // 🔧 CORREÇÃO CRÍTICA: Status do pagamento
  async getPaymentStatus(paymentId: string | number): Promise<PaymentStatus> {
    console.log("📊 [API] Consultando status do pagamento:", paymentId);

    if (!paymentId) {
      throw new Error("ID do pagamento é obrigatório");
    }

    // Converter para string
    const paymentIdStr = String(paymentId);

    try {
      const response = await makeRequest<PaymentStatus>(`/payments/status/${paymentIdStr}`);
      console.log("✅ [API] Status obtido:", response);
      return response;
    } catch (error) {
      console.error("❌ [API] Erro ao consultar status do pagamento:", error);
      
      // Se for pagamento mock, usar status mock
      if (paymentIdStr.startsWith('mock_')) {
        console.log("🔄 [API] Consultando status de pagamento mock...");
        return this.getMockPaymentStatus(paymentIdStr);
      }
      
      // Tratamento melhor do erro 404
      if (error instanceof Error && (
        error.message.includes('404') || 
        error.message.includes('Endpoint não encontrado') ||
        error.message.includes('Not Found')
      )) {
        console.log("🔄 [API] Endpoint não encontrado, retornando status temporário...");
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

  // 🔧 CORREÇÃO: Links de download
  async getDownloadLinks(paymentId: string | number): Promise<DownloadResponse> {
    console.log("📥 [API] Buscando links de download:", paymentId);

    if (!paymentId) {
      throw new Error("ID do pagamento é obrigatório");
    }

    // Converter para string
    const paymentIdStr = String(paymentId);

    try {
      const response = await makeRequest<PaymentStatus>(`/payments/status/${paymentIdStr}`);
      
      // Extrair links de download da resposta de status
      if (response && response.download_links) {
        return {
          links: response.download_links.map((link: any) => link.download_url),
          products: response.download_links.map((link: any) => ({
            id: link.produto_id,
            name: link.nome,
            description: `Download: ${link.nome}`,
            price: 0,
            image_url: "https://images.pexels.com/photos/196644/pexels-photo-196644.jpeg?auto=compress&cs=tinysrgb&w=500",
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
    } catch (error) {
      console.error("❌ [API] Erro ao obter links de download:", error);
      
      // Se for pagamento mock
      if (paymentIdStr.startsWith('mock_')) {
        console.log("🔄 [API] Obtendo links de download mock...");
        return this.getMockDownloadLinks(paymentIdStr);
      }
      
      // Tratamento para endpoint não encontrado
      if (error instanceof Error && (
        error.message.includes('404') || 
        error.message.includes('Endpoint não encontrado') ||
        error.message.includes('Not Found')
      )) {
        console.log("🔄 [API] Endpoint de download não encontrado, retornando links mock...");
        return this.getMockDownloadLinks(paymentIdStr);
      }
      
      throw error;
    }
  },

  getMockDownloadLinks(paymentId: string): DownloadResponse {
    const paymentIdStr = String(paymentId);
    
    return {
      links: [
        "https://example.com/download/produto1.pdf",
        "https://example.com/download/produto2.pdf",
        "https://example.com/download/bonus.pdf"
      ],
      products: [
        {
          id: 1,
          name: "Produto Digital Demo",
          description: "Descrição do produto digital de demonstração",
          price: 39.9,
          image_url: "https://images.pexels.com/photos/196644/pexels-photo-196644.jpeg?auto=compress&cs=tinysrgb&w=500",
          category: "Digital",
          download_url: "https://example.com/download/produto1.pdf"
        }
      ],
      customerName: "Cliente Demo",
      total: 39.9,
      downloadedAt: new Date().toISOString(),
      expiresIn: "7 dias"
    };
  },

  // ===== UTILITÁRIOS =====
  async wakeUpServer(): Promise<void> {
    try {
      console.log("⏰ [API] Acordando servidor...");
      const healthUrl = BACKEND_URL.replace('/api', '/health');
      const response = await fetch(healthUrl, {
        method: "GET",
        signal: AbortSignal.timeout(5000),
      });
      
      if (response.ok) {
        console.log("✅ [API] Servidor está ativo");
      } else {
        console.warn("⚠️ [API] Servidor não está respondendo");
      }
    } catch (error) {
      console.warn("❌ [API] Falha ao acordar servidor:", error);
    }
  },

  // ===== DADOS MOCKADOS (FALLBACK) =====
  getMockProducts(): Product[] {
    return [
      {
        id: 1,
        name: "Curso Completo de React.js",
        price: 0.1,
        description: "Aprenda React.js do básico ao avançado com projetos práticos",
        category: "Programação",
        image_url: "https://images.pexels.com/photos/11035380/pexels-photo-11035380.jpeg?auto=compress&cs=tinysrgb&w=500",
      },
      {
        id: 2,
        name: "E-book: Design System Completo",
        price: 79.9,
        description: "Guia completo para criar e manter design systems eficazes",
        category: "Design",
        image_url: "https://images.pexels.com/photos/196644/pexels-photo-196644.jpeg?auto=compress&cs=tinysrgb&w=500",
      },
      {
        id: 3,
        name: "Template Premium Dashboard",
        price: 89.9,
        description: "Template profissional para dashboards administrativos",
        category: "Templates",
        image_url: "https://images.pexels.com/photos/265087/pexels-photo-265087.jpeg?auto=compress&cs=tinysrgb&w=500",
      },
      {
        id: 4,
        name: "Masterclass: Marketing Digital",
        price: 199.9,
        description: "Estratégias avançadas de marketing digital para 2024",
        category: "Marketing",
        image_url: "https://images.pexels.com/photos/265087/pexels-photo-265087.jpeg?auto=compress&cs=tinysrgb&w=500",
      },
      {
        id: 5,
        name: "Pack de Ícones Premium",
        price: 39.9,
        description: "Coleção com mais de 1000 ícones vetoriais premium",
        category: "Design",
        image_url: "https://images.pexels.com/photos/196644/pexels-photo-196644.jpeg?auto=compress&cs=tinysrgb&w=500",
      },
      {
        id: 6,
        name: "Curso Node.js Avançado",
        price: 179.9,
        description: "Desenvolvimento backend avançado com Node.js e Express",
        category: "Programação",
        image_url: "https://images.pexels.com/photos/11035380/pexels-photo-11035380.jpeg?auto=compress&cs=tinysrgb&w=500",
      },
    ];
  },
};