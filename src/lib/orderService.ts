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
  async createOrder(
    orderData: OrderData,
    cartItems: CartItem[],
    paymentMethod: string = 'pix',
    discount: number = 0,
    deliveryFee: number = 0
  ): Promise<OrderWithItems> {
    try {
      console.log('🛒 Iniciando criação do pedido...');
      console.log('Dados do pedido:', orderData);
      console.log('Itens do carrinho:', cartItems);

      // Calcular totais
      const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      const total = subtotal - discount + deliveryFee;

      console.log('💰 Totais calculados:', { subtotal, discount, deliveryFee, total });

      // Obter usuário atual
      const { data: { user }, error: userError } = await supabase.auth.getUser();

      if (userError) {
        console.warn('⚠️ Erro ao obter usuário:', userError);
      }

      console.log('👤 Usuário atual:', user?.id || 'Não autenticado');

      // Criar pedido principal
      const orderInsert = {
        user_id: user?.id || null,
        email_cliente: orderData.email,
        nome_cliente: orderData.nomeCliente,
        telefone: orderData.telefone,
        cpf: orderData.cpf || null,
        cep: orderData.cep,
        rua: orderData.rua,
        numero: orderData.numero,
        complemento: orderData.complemento || null,
        bairro: orderData.bairro,
        cidade: orderData.cidade,
        estado: orderData.estado,
        subtotal,
        desconto: discount,
        taxa_entrega: deliveryFee,
        total,
        status: 'pendente',
        metodo_pagamento: paymentMethod,
      };

      console.log('📝 Inserindo pedido na tabela pedidos:', orderInsert);

      const { data: order, error: orderError } = await supabase
        .from('pedidos')
        .insert(orderInsert)
        .select()
        .single();

      if (orderError) {
        console.error('❌ Erro ao criar pedido:', orderError);
        console.error('Detalhes do erro:', {
          code: orderError.code,
          message: orderError.message,
          details: orderError.details,
          hint: orderError.hint
        });
        throw new Error(`Falha ao criar pedido: ${orderError.message}`);
      }

      console.log('✅ Pedido criado com sucesso:', order);

      // Criar itens do pedido
      const orderItems: Omit<OrderItem, 'id' | 'created_at'>[] = cartItems.map(item => ({
        pedido_id: order.id,
        produto_id: item.id,
        nome_produto: item.name,
        preco_unitario: item.price,
        quantidade: item.quantity,
        tamanho: item.selectedSize || null,
        cor: item.selectedColor || null,
        variacao_tamanho_id: item.sizeVariationId || null,
        variacao_cor_id: item.colorVariationId || null,
        subtotal: item.price * item.quantity,
      }));

      console.log('📦 Inserindo itens do pedido na tabela pedido_itens:', orderItems);

      const { data: items, error: itemsError } = await supabase
        .from('pedido_itens')
        .insert(orderItems)
        .select();

      if (itemsError) {
        console.error('❌ Erro ao criar itens do pedido:', itemsError);
        console.error('Detalhes do erro:', {
          code: itemsError.code,
          message: itemsError.message,
          details: itemsError.details,
          hint: itemsError.hint
        });
        throw new Error(`Falha ao criar itens do pedido: ${itemsError.message}`);
      }

      console.log('✅ Itens do pedido criados com sucesso:', items);

      const result = {
        ...order,
        itens: items || [],
      };

      console.log('🎉 Pedido completo criado:', result);

      return result;
    } catch (error) {
      console.error('💥 Erro crítico em createOrder:', error);
      if (error instanceof Error) {
        console.error('Stack trace:', error.stack);
      }
      throw error;
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