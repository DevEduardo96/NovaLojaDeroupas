// src/services/api.ts
// ARQUIVO COMPLETO - SUBSTITUA TODO O CONTEÚDO DO SEU api.ts POR ESTE CÓDIGO

import {
  Product,
  PaymentData,
  PaymentStatus,
  DownloadResponse,
  CreatePaymentRequest,
  ProductFilters,
} from "../types";

// ===== CONFIGURAÇÃO DA URL BASE =====
const BACKEND_URL = import.meta.env.VITE_API_BASE_URL || "https://backend-nectix.onrender.com/api";

// Log para debug
console.log("🔧 [API] Backend URL configurada:", BACKEND_URL);
console.log("🔧 [API] Variável de ambiente VITE_API_BASE_URL:", import.meta.env.VITE_API_BASE_URL);

// ===== CLIENTE HTTP PERSONALIZADO =====
const makeRequest = async <T>(endpoint: string, options: RequestInit = {}): Promise<T> => {
  const url = `${BACKEND_URL}${endpoint}`;
  console.log(`🌐 [API] Fazendo requisição para: ${url}`);
  
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 segundos

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
    });

    clearTimeout(timeoutId);
    console.log(`📡 [API] Resposta recebida: ${response.status} ${response.statusText}`);

    if (!response.ok) {
      let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
      
      try {
        const contentType = response.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
          const errorData = await response.json();
          errorMessage = errorData.error || errorData.message || errorMessage;
        } else {
          const errorText = await response.text();
          errorMessage = errorText || errorMessage;
        }
      } catch (parseError) {
        console.warn("[API] Não foi possível parsear erro da resposta:", parseError);
      }
      
      throw new Error(errorMessage);
    }

    // Parse da resposta
    const text = await response.text();
    if (!text) {
      return null as T;
    }

    try {
      return JSON.parse(text);
    } catch (parseError) {
      console.error("[API] Erro ao parsear JSON:", parseError);
      throw new Error("Resposta inválida do servidor");
    }
  } catch (error) {
    clearTimeout(timeoutId);
    
    if (error instanceof Error) {
      if (error.name === "AbortError") {
        throw new Error("Timeout: Requisição demorou muito para responder");
      }
      console.error(`❌ [API] Erro na requisição para ${url}:`, error);
      throw error;
    }
    
    throw new Error("Erro desconhecido na requisição");
  }
};

// ===== API PRINCIPAL =====
export const api = {
  // ===== PRODUTOS =====
  async getProducts(filters?: ProductFilters): Promise<Product[]> {
    try {
      console.log("📦 [API] Buscando produtos...", filters);
      
      if (!filters || Object.keys(filters).length === 0) {
        return await makeRequest<Product[]>("/products");
      }

      const params = new URLSearchParams();
      if (filters.category) params.append("category", filters.category);
      if (filters.search) params.append("search", filters.search);
      if (filters.sortBy) params.append("sortBy", filters.sortBy);
      if (filters.minPrice) params.append("minPrice", filters.minPrice.toString());
      if (filters.maxPrice) params.append("maxPrice", filters.maxPrice.toString());

      return await makeRequest<Product[]>(`/products?${params.toString()}`);
    } catch (error) {
      console.error("❌ [API] Erro ao buscar produtos:", error);
      console.log("🔄 [API] Retornando produtos mock como fallback");
      return this.getMockProducts();
    }
  },

  async getProductById(id: number): Promise<Product | null> {
    try {
      console.log(`📦 [API] Buscando produto por ID: ${id}`);
      return await makeRequest<Product>(`/products/${id}`);
    } catch (error) {
      console.error(`❌ [API] Erro ao buscar produto ${id}:`, error);
      return null;
    }
  },

  async getProductsByCategory(category: string): Promise<Product[]> {
    try {
      console.log(`📦 [API] Buscando produtos da categoria: ${category}`);
      return await makeRequest<Product[]>(`/products/category/${category}`);
    } catch (error) {
      console.error(`❌ [API] Erro ao buscar produtos da categoria ${category}:`, error);
      return [];
    }
  },

  async searchProducts(query: string): Promise<Product[]> {
    try {
      console.log(`🔍 [API] Buscando produtos com query: "${query}"`);
      return await makeRequest<Product[]>(`/products/search?q=${encodeURIComponent(query)}`);
    } catch (error) {
      console.error(`❌ [API] Erro ao buscar produtos com query "${query}":`, error);
      return [];
    }
  },

  // ===== PAGAMENTOS =====
  async createPayment(data: CreatePaymentRequest): Promise<PaymentData> {
    console.log("💳 [API] Criando pagamento:", {
      cliente: data.nomeCliente,
      email: data.email,
      total: data.total,
      itens: data.carrinho.length
    });
    
    try {
      const response = await makeRequest<PaymentData>("/payments/criar-pagamento", {
        method: "POST",
        body: JSON.stringify(data),
      });
      
      console.log("✅ [API] Pagamento criado com sucesso:", {
        id: response.id,
        status: response.status
      });
      
      return response;
    } catch (error) {
      console.error("❌ [API] Erro ao criar pagamento:", error);
      
      // Fallback para modo de demonstração
      if (error instanceof Error && (
        error.message.includes('500') || 
        error.message.includes('Endpoint não encontrado') ||
        error.message.includes('503') ||
        error.message.includes('Timeout')
      )) {
        console.log("🔄 [API] Servidor offline/indisponível, usando modo demonstração...");
        return this.createMockPayment(data);
      }
      
      throw error;
    }
  },

  // ===== STATUS DE PAGAMENTO =====
  async getPaymentStatus(paymentId: string | number): Promise<PaymentStatus> {
    console.log("📊 [API] Consultando status do pagamento:", paymentId);

    if (!paymentId) {
      throw new Error("ID do pagamento é obrigatório");
    }

    const paymentIdStr = String(paymentId);

    // Se for pagamento mock, usar lógica mock
    if (paymentIdStr.startsWith('mock_')) {
      console.log("🎭 [API] Detectado pagamento mock, usando lógica de demonstração");
      return this.getMockPaymentStatus(paymentIdStr);
    }

    try {
      const response = await makeRequest<PaymentStatus>(`/payments/status/${paymentIdStr}`);
      console.log("✅ [API] Status obtido:", response);
      return response;
    } catch (error) {
      console.error("❌ [API] Erro ao consultar status do pagamento:", error);
      
      // Fallback para status pending se o endpoint não existir
      if (error instanceof Error && (
        error.message.includes('404') || 
        error.message.includes('Endpoint não encontrado') ||
        error.message.includes('Not Found')
      )) {
        console.log("🔄 [API] Endpoint não encontrado, retornando status pending...");
        return {
          id: paymentIdStr,
          status: "pending",
          paymentId: paymentIdStr,
        };
      }
      
      throw error;
    }
  },

  // ===== LINKS DE DOWNLOAD =====
  async getDownloadLinks(paymentId: string | number): Promise<DownloadResponse> {
    console.log("📥 [API] Buscando links de download para pagamento:", paymentId);

    if (!paymentId) {
      throw new Error("ID do pagamento é obrigatório");
    }

    const paymentIdStr = String(paymentId);

    // Se for pagamento mock, usar links mock
    if (paymentIdStr.startsWith('mock_')) {
      console.log("🎭 [API] Detectado pagamento mock, retornando links de demonstração");
      return this.getMockDownloadLinks(paymentIdStr);
    }

    try {
      const response = await makeRequest<PaymentStatus>(`/payments/status/${paymentIdStr}`);
      
      // Verificar se há links de download na resposta
      if (response && response.download_links && Array.isArray(response.download_links)) {
        console.log("✅ [API] Links de download encontrados:", response.download_links.length);
        
        return {
          links: response.download_links.map((link: any) => link.download_url || link),
          products: response.download_links.map((link: any, index: number) => ({
            id: link.produto_id || index + 1,
            name: link.nome || `Produto ${index + 1}`,
            description: `Download: ${link.nome || `Produto ${index + 1}`}`,
            price: 0,
            image_url: "https://images.pexels.com/photos/196644/pexels-photo-196644.jpeg?auto=compress&cs=tinysrgb&w=500",
            category: "Digital",
            download_url: link.download_url || link,
            quantity: link.quantidade || 1
          })),
          customerName: "Cliente",
          total: response.transaction_amount || 0,
          downloadedAt: new Date().toISOString(),
          expiresIn: "7 dias"
        };
      }
      
      // Se não há links, retornar estrutura vazia
      console.log("⚠️ [API] Nenhum link de download encontrado");
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
      
      // Fallback para links mock em caso de erro
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

  // ===== UTILITÁRIOS =====
  async wakeUpServer(): Promise<void> {
    try {
      console.log("⏰ [API] Acordando servidor...");
      const healthUrl = BACKEND_URL.replace('/api', '/health');
      console.log("🩺 [API] Testando health check:", healthUrl);
      
      const response = await fetch(healthUrl, {
        method: "GET",
        signal: AbortSignal.timeout(10000), // 10 segundos para wake up
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log("✅ [API] Servidor está ativo:", data);
      } else {
        console.warn("⚠️ [API] Servidor respondeu mas com erro:", response.status);
      }
    } catch (error) {
      console.warn("❌ [API] Falha ao acordar servidor:", error);
    }
  },

  // ===== FUNÇÕES MOCK (DEMONSTRAÇÃO) =====
  createMockPayment(data: CreatePaymentRequest): PaymentData {
    const timestamp = Date.now();
    const randomId = Math.random().toString(36).substr(2, 9);
    const mockPaymentId = `mock_${timestamp}_${randomId}`;
    
    console.log("🎭 [API] Criando pagamento mock:", mockPaymentId);
    
    // QR Code mock (imagem 1x1 pixel transparente)
    const mockQRCode = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==";
    
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
      produtos: data.carrinho.map((item, index) => ({
        id: typeof item.id === 'number' ? item.id : index + 1,
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

  getMockPaymentStatus(paymentId: string): PaymentStatus {
    console.log("🎭 [API] Obtendo status mock para:", paymentId);
    
    const parts = paymentId.split('_');
    
    if (parts.length >= 2) {
      const timestamp = parseInt(parts[1]);
      
      if (!isNaN(timestamp)) {
        const elapsed = Date.now() - timestamp;
        
        // Simula aprovação após 30 segundos
        if (elapsed > 30000) {
          console.log("✅ [API] Mock: Pagamento aprovado (passou dos 30s)");
          return {
            id: paymentId,
            status: "approved",
            paymentId: paymentId,
            transaction_amount: 99.99
          };
        } else {
          const remainingSeconds = Math.ceil((30000 - elapsed) / 1000);
          console.log(`⏳ [API] Mock: Aguardando aprovação (${remainingSeconds}s restantes)`);
          return {
            id: paymentId,
            status: "pending",
            paymentId: paymentId
          };
        }
      }
    }
    
    // Fallback
    return {
      id: paymentId,
      status: "pending",
      paymentId: paymentId
    };
  },

  getMockDownloadLinks(paymentId: string): DownloadResponse {
    console.log("🎭 [API] Gerando links de download mock para:", paymentId);
    
    return {
      links: [
        "https://www.learningcontainer.com/wp-content/uploads/2019/09/sample-pdf-file.pdf",
        "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
        "https://filesamples.com/samples/document/pdf/sample1.pdf"
      ],
      products: [
        {
          id: 1,
          name: "Produto Demo 1",
          description: "Primeiro produto digital de demonstração",
          price: 49.99,
          image_url: "https://images.pexels.com/photos/196644/pexels-photo-196644.jpeg?auto=compress&cs=tinysrgb&w=500",
          category: "Digital",
          download_url: "https://www.learningcontainer.com/wp-content/uploads/2019/09/sample-pdf-file.pdf",
          quantity: 1
        },
        {
          id: 2,
          name: "Produto Demo 2", 
          description: "Segundo produto digital de demonstração",
          price: 29.99,
          image_url: "https://images.pexels.com/photos/265087/pexels-photo-265087.jpeg?auto=compress&cs=tinysrgb&w=500",
          category: "Digital",
          download_url: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
          quantity: 1
        }
      ],
      customerName: "Cliente Demo",
      total: 79.98,
      downloadedAt: new Date().toISOString(),
      expiresIn: "7 dias"
    };
  },

  // ===== PRODUTOS MOCK =====
  getMockProducts(): Product[] {
    console.log("🎭 [API] Retornando produtos mock");
    
    return [
      {
        id: 1,
        name: "Curso Completo de React.js",
        price: 149.99,
        description: "Aprenda React.js do básico ao avançado com projetos práticos e reais",
        category: "Programação",
        image_url: "https://images.pexels.com/photos/11035380/pexels-photo-11035380.jpeg?auto=compress&cs=tinysrgb&w=500",
      },
      {
        id: 2,
        name: "E-book: Design System Completo",
        price: 79.90,
        description: "Guia completo para criar e manter design systems eficazes e escaláveis",
        category: "Design",
        image_url: "https://images.pexels.com/photos/196644/pexels-photo-196644.jpeg?auto=compress&cs=tinysrgb&w=500",
      },
      {
        id: 3,
        name: "Template Premium Dashboard",
        price: 89.90,
        description: "Template profissional para dashboards administrativos modernos",
        category: "Templates",
        image_url: "https://images.pexels.com/photos/265087/pexels-photo-265087.jpeg?auto=compress&cs=tinysrgb&w=500",
      },
      {
        id: 4,
        name: "Masterclass: Marketing Digital",
        price: 199.90,
        description: "Estratégias avançadas de marketing digital para 2024 e além",
        category: "Marketing",
        image_url: "https://images.pexels.com/photos/265087/pexels-photo-265087.jpeg?auto=compress&cs=tinysrgb&w=500",
      },
      {
        id: 5,
        name: "Pack de Ícones Premium",
        price: 39.90,
        description: "Coleção exclusiva com mais de 1000 ícones vetoriais premium",
        category: "Design",
        image_url: "https://images.pexels.com/photos/196644/pexels-photo-196644.jpeg?auto=compress&cs=tinysrgb&w=500",
      },
      {
        id: 6,
        name: "Curso Node.js Avançado",
        price: 179.90,
        description: "Desenvolvimento backend profissional com Node.js, Express e MongoDB",
        category: "Programação",
        image_url: "https://images.pexels.com/photos/11035380/pexels-photo-11035380.jpeg?auto=compress&cs=tinysrgb&w=500",
      },
    ];
  }
};