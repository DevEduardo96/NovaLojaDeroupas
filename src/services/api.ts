// src/services/api.ts

import { apiClient } from "./apiClient";
import {
  Product,
  PaymentData,
  PaymentStatus,
  DownloadResponse,
  CreatePaymentRequest,
  ProductFilters,
} from "../types";

import { createClient } from "@supabase/supabase-js";

// Inicializa Supabase
const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

export const api = {
  // ===== PRODUTOS =====
  async getProducts(filters?: ProductFilters): Promise<Product[]> {
    try {
      if (!filters || Object.keys(filters).length === 0) {
        return await apiClient.get<Product[]>("/products");
      }

      const params = new URLSearchParams();
      if (filters.category) params.append("category", filters.category);
      if (filters.search) params.append("search", filters.search);
      if (filters.sortBy) params.append("sortBy", filters.sortBy);
      if (filters.minPrice) params.append("minPrice", filters.minPrice.toString());
      if (filters.maxPrice) params.append("maxPrice", filters.maxPrice.toString());

      return await apiClient.get<Product[]>(`/products?${params.toString()}`);
    } catch (error) {
      console.error("Erro ao buscar produtos:", error);
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
      const response = await apiClient.post<PaymentData>("api/payments/criar-pagamento", data);
      console.log("Pagamento criado com sucesso:", response);
      return response;
    } catch (error) {
      console.error("Erro ao criar pagamento:", error);
      if (error instanceof Error && error.message.includes('500')) {
        console.log("Servidor offline, usando modo de demonstração...");
        return this.createMockPayment(data);
      }
      throw error;
    }
  },

  async getPaymentStatus(paymentId: string | number): Promise<PaymentStatus> {
    console.log("Consultando status do pagamento:", paymentId);

    if (!paymentId) throw new Error("ID do pagamento é obrigatório");

    const paymentIdStr = String(paymentId);

    try {
      const response = await apiClient.get<PaymentStatus>(`api/payments/status/${paymentIdStr}`);
      console.log("Status obtido:", response);
      return response;
    } catch (error) {
      console.error("Erro ao consultar status do pagamento:", error);

      if (paymentIdStr.startsWith('mock_')) {
        console.log("Consultando status de pagamento mock...");
        return this.getMockPaymentStatus(paymentIdStr);
      }

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
    const parts = String(paymentId).split('_');
    if (parts.length >= 2) {
      const timestamp = parseInt(parts[1]);
      if (!isNaN(timestamp)) {
        const elapsed = Date.now() - timestamp;
        const status = elapsed > 30000 ? "approved" : "pending";
        return { id: String(paymentId), status, paymentId: String(paymentId) };
      }
    }
    return { id: String(paymentId), status: "pending", paymentId: String(paymentId) };
  },

  // ===== DOWNLOAD LINKS =====
  async getDownloadLinks(paymentId: string | number): Promise<DownloadResponse> {
    console.log("Buscando links de download:", paymentId);

    if (!paymentId) throw new Error("ID do pagamento é obrigatório");

    const paymentIdStr = String(paymentId);

    try {
      // Primeiro tenta pelo backend
      const response = await apiClient.get<any>(`api/payments/status/${paymentIdStr}`);

      if (response && response.download_links?.length) {
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

      // Caso não tenha vindo nada do backend → busca no Supabase
      console.log("Nenhum link no backend, buscando no Supabase...");
      const { data, error } = await supabase
        .from("produtos")
        .select("id, nome, image_url, download_url")
        .not("download_url", "is", null);

      if (error) {
        console.error("Erro Supabase:", error);
        return { links: [], products: [], customerName: "Cliente", total: 0, downloadedAt: new Date().toISOString(), expiresIn: "7 dias" };
      }

      return {
        links: data.map((p) => p.download_url),
        products: data.map((p) => ({
          id: p.id,
          name: p.nome,
          description: `Download: ${p.nome}`,
          price: 0,
          image_url: p.image_url,
          category: "Digital",
          download_url: p.download_url
        })),
        customerName: "Cliente",
        total: 0,
        downloadedAt: new Date().toISOString(),
        expiresIn: "7 dias"
      };

    } catch (error) {
      console.error("Erro ao obter links de download:", error);

      if (paymentIdStr.startsWith('mock_')) {
        console.log("Obtendo links de download mock...");
        return this.getMockDownloadLinks(paymentIdStr);
      }

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
