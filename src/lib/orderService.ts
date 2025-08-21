
import { supabase } from './supabase';
import { CartItem } from '../types';

export interface OrderData {
  nomeCliente: string;
  email: string;
  telefone: string;
  cpf?: string;
  cep: string;
  rua: string;
  numero: string;
  complemento?: string;
  bairro: string;
  cidade: string;
  estado: string;
}

export interface Order {
  id: number;
  user_id?: string;
  email_cliente: string;
  nome_cliente: string;
  telefone: string;
  cpf?: string;
  cep: string;
  rua: string;
  numero: string;
  complemento?: string;
  bairro: string;
  cidade: string;
  estado: string;
  subtotal: number;
  desconto: number;
  taxa_entrega: number;
  total: number;
  status: string;
  metodo_pagamento: string;
  created_at: string;
  updated_at: string;
}

export interface OrderItem {
  id: number;
  pedido_id: number;
  produto_id: number;
  nome_produto: string;
  preco_unitario: number;
  quantidade: number;
  tamanho?: string;
  cor?: string;
  variacao_tamanho_id?: number;
  variacao_cor_id?: number;
  subtotal: number;
  created_at: string;
}

export interface OrderWithItems extends Order {
  itens: OrderItem[];
}

export const orderService = {
  // Criar um novo pedido completo
  async createOrder(
    orderData: OrderData,
    cartItems: CartItem[],
    userId?: string
  ): Promise<OrderWithItems> {
    try {
      // Calcular totais
      const subtotal = cartItems.reduce(
        (sum, item) => sum + (item.product.price * item.quantity),
        0
      );
      const desconto = 0;
      const taxa_entrega = 0;
      const total = subtotal - desconto + taxa_entrega;

      // Criar o pedido principal
      const { data: order, error: orderError } = await supabase
        .from('pedidos')
        .insert({
          user_id: userId,
          email_cliente: orderData.email,
          nome_cliente: orderData.nomeCliente,
          telefone: orderData.telefone,
          cpf: orderData.cpf,
          cep: orderData.cep,
          rua: orderData.rua,
          numero: orderData.numero,
          complemento: orderData.complemento,
          bairro: orderData.bairro,
          cidade: orderData.cidade,
          estado: orderData.estado,
          subtotal,
          desconto,
          taxa_entrega,
          total,
          status: 'pendente',
          metodo_pagamento: 'pix',
        })
        .select()
        .single();

      if (orderError) {
        console.error('Erro ao criar pedido:', orderError);
        throw new Error(`Erro ao criar pedido: ${orderError.message}`);
      }

      // Criar os itens do pedido
      const orderItems = cartItems.map(item => ({
        pedido_id: order.id,
        produto_id: item.product.id,
        nome_produto: item.product.name,
        preco_unitario: item.product.price,
        quantidade: item.quantity,
        tamanho: item.selectedSize,
        cor: item.selectedColor,
        subtotal: item.product.price * item.quantity,
      }));

      const { data: items, error: itemsError } = await supabase
        .from('pedido_itens')
        .insert(orderItems)
        .select();

      if (itemsError) {
        console.error('Erro ao criar itens do pedido:', itemsError);
        // Se falhar ao criar itens, cancelar o pedido
        await supabase.from('pedidos').delete().eq('id', order.id);
        throw new Error(`Erro ao criar itens do pedido: ${itemsError.message}`);
      }

      return {
        ...order,
        itens: items || [],
      };
    } catch (error) {
      console.error('Erro em createOrder:', error);
      throw error instanceof Error ? error : new Error('Erro desconhecido ao criar pedido');
    }
  },

  // Buscar pedidos do usuário
  async getUserOrders(userId?: string, email?: string): Promise<OrderWithItems[]> {
    try {
      let query = supabase
        .from('pedidos')
        .select(`
          *,
          itens:pedido_itens(*)
        `)
        .order('created_at', { ascending: false });

      if (userId) {
        query = query.eq('user_id', userId);
      } else if (email) {
        query = query.eq('email_cliente', email);
      } else {
        return [];
      }

      const { data, error } = await query;

      if (error) {
        console.error('Erro ao buscar pedidos:', error);
        throw new Error(`Erro ao buscar pedidos: ${error.message}`);
      }

      return data || [];
    } catch (error) {
      console.error('Erro em getUserOrders:', error);
      throw error instanceof Error ? error : new Error('Erro desconhecido ao buscar pedidos');
    }
  },

  // Buscar pedido por ID
  async getOrderById(orderId: number): Promise<OrderWithItems | null> {
    try {
      const { data, error } = await supabase
        .from('pedidos')
        .select(`
          *,
          itens:pedido_itens(*)
        `)
        .eq('id', orderId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') return null;
        throw new Error(`Erro ao buscar pedido: ${error.message}`);
      }

      return data;
    } catch (error) {
      console.error('Erro em getOrderById:', error);
      throw error instanceof Error ? error : new Error('Erro desconhecido ao buscar pedido');
    }
  },

  // Atualizar status do pedido
  async updateOrderStatus(orderId: number, status: string): Promise<Order> {
    try {
      const { data, error } = await supabase
        .from('pedidos')
        .update({ status })
        .eq('id', orderId)
        .select()
        .single();

      if (error) {
        throw new Error(`Erro ao atualizar status: ${error.message}`);
      }

      return data;
    } catch (error) {
      console.error('Erro em updateOrderStatus:', error);
      throw error instanceof Error ? error : new Error('Erro desconhecido ao atualizar status');
    }
  },

  // Cancelar pedido
  async cancelOrder(orderId: number): Promise<Order> {
    return this.updateOrderStatus(orderId, 'cancelado');
  },
};
