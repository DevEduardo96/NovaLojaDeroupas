import { supabase } from "./supabase";
import type { Product } from "../types";

export interface Payment {
  id: string;
  status: string;
  email_cliente: string;
  nome_cliente: string;
  valor: number;
  links_download: string[];
  produtos: Product[];
  created_at: string;
  updated_at: string;
}

export interface CreatePaymentData {
  id: string;
  status: string;
  email_cliente: string;
  nome_cliente: string;
  valor: number;
  links_download: string[];
  produtos: Product[];
}

export const paymentService = {
  // Criar um novo pagamento
  async createPayment(paymentData: CreatePaymentData): Promise<Payment> {
    try {
      const { data, error } = await supabase
        .from("pagamentos")
        .insert(paymentData)
        .select()
        .single();

      if (error) {
        console.error("Error creating payment:", error);
        throw new Error(`Failed to create payment: ${error.message}`);
      }

      return data;
    } catch (error) {
      console.error("Error in createPayment:", error);
      throw error;
    }
  },

  // Buscar pagamento por ID
  async getPaymentById(id: string): Promise<Payment | null> {
    try {
      const { data, error } = await supabase
        .from("pagamentos")
        .select("*")
        .eq("id", id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // No rows returned
          return null;
        }
        console.error("Error fetching payment:", error);
        throw new Error(`Failed to fetch payment: ${error.message}`);
      }

      return data;
    } catch (error) {
      console.error("Error in getPaymentById:", error);
      throw error;
    }
  },

  // Buscar pagamentos por email do cliente
  async getPaymentsByEmail(email: string): Promise<Payment[]> {
    try {
      const { data, error } = await supabase
        .from("pagamentos")
        .select("*")
        .eq("email_cliente", email)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching payments by email:", error);
        throw new Error(`Failed to fetch payments: ${error.message}`);
      }

      return data || [];
    } catch (error) {
      console.error("Error in getPaymentsByEmail:", error);
      throw error;
    }
  },

  // Atualizar status do pagamento
  async updatePaymentStatus(id: string, status: string): Promise<Payment> {
    try {
      const { data, error } = await supabase
        .from("pagamentos")
        .update({ status, updated_at: new Date().toISOString() })
        .eq("id", id)
        .select()
        .single();

      if (error) {
        console.error("Error updating payment status:", error);
        throw new Error(`Failed to update payment status: ${error.message}`);
      }

      return data;
    } catch (error) {
      console.error("Error in updatePaymentStatus:", error);
      throw error;
    }
  },

  // Buscar pagamentos do usuário atual
  async getUserPayments(): Promise<Payment[]> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error("User not authenticated");
      }

      const { data, error } = await supabase
        .from("pagamentos")
        .select("*")
        .eq("email_cliente", user.email)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching user payments:", error);
        throw new Error(`Failed to fetch user payments: ${error.message}`);
      }

      return data || [];
    } catch (error) {
      console.error("Error in getUserPayments:", error);
      throw error;
    }
  },

  // Verificar se um produto foi comprado pelo usuário
  async hasUserPurchasedProduct(productId: number): Promise<boolean> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        return false;
      }

      const { data, error } = await supabase
        .from("pagamentos")
        .select("produtos")
        .eq("email_cliente", user.email)
        .eq("status", "approved");

      if (error) {
        console.error("Error checking product purchase:", error);
        return false;
      }

      // Verificar se o produto está na lista de produtos comprados
      return data?.some(payment => 
        payment.produtos?.some((product: any) => product.id === productId)
      ) || false;
    } catch (error) {
      console.error("Error in hasUserPurchasedProduct:", error);
      return false;
    }
  },

  // Buscar links de download para um produto específico
  async getProductDownloadLinks(productId: number): Promise<string[]> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error("User not authenticated");
      }

      const { data, error } = await supabase
        .from("pagamentos")
        .select("links_download, produtos")
        .eq("email_cliente", user.email)
        .eq("status", "approved");

      if (error) {
        console.error("Error fetching download links:", error);
        throw new Error(`Failed to fetch download links: ${error.message}`);
      }

      // Encontrar o pagamento que contém o produto
      const payment = data?.find(payment => 
        payment.produtos?.some((product: any) => product.id === productId)
      );

      return payment?.links_download || [];
    } catch (error) {
      console.error("Error in getProductDownloadLinks:", error);
      throw error;
    }
  }
}; 