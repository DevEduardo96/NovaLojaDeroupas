import { supabase } from '../lib/supabase';
import { CartItem } from '../types';

export interface OrderData {
  nomeCliente: string;
  email: string;
  telefone?: string;
  cpf?: string;
  cep?: string;
  rua?: string;
  numero?: string;
  complemento?: string;
  bairro?: string;
  cidade?: string;
  estado?: string;
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
  // 🔧 TESTE DE CONEXÃO
  async testConnection(): Promise<boolean> {
    try {
      console.log('🧪 Testando conexão com Supabase...');
      
      const { error } = await supabase
        .from('pedidos')
        .select('id')
        .limit(1);

      if (error) {
        console.error('❌ Erro na conexão:', error);
        return false;
      }

      console.log('✅ Conexão OK');
      return true;
    } catch (error) {
      console.error('💥 Erro crítico na conexão:', error);
      return false;
    }
  },

  // 🔧 VALIDAÇÃO DE PERMISSÕES RLS
  async checkRLSPermissions(): Promise<void> {
    try {
      console.log('🔒 Testando permissões RLS...');
      
      // Teste básico de inserção
      const testOrder = {
        user_id: null, // Permite checkout sem autenticação
        email_cliente: 'teste@teste.com',
        nome_cliente: 'Teste RLS',
        telefone: '11999999999',
        subtotal: 10.00,
        total: 10.00,
        status: 'pendente',
        metodo_pagamento: 'pix'
      };

      const { data, error } = await supabase
        .from('pedidos')
        .insert(testOrder)
        .select()
        .single();

      if (error) {
        console.error('❌ Erro de RLS na inserção:', error);
        throw new Error(`RLS Error: ${error.message}`);
      }

      console.log('✅ RLS OK - Teste inserido:', data.id);

      // Limpar teste
      await supabase.from('pedidos').delete().eq('id', data.id);
      console.log('🧹 Teste removido');

    } catch (error) {
      console.error('💥 Erro no teste de RLS:', error);
      throw error;
    }
  },

  async createOrder(
    orderData: OrderData,
    cartItems: CartItem[],
    paymentMethod: string = 'pix',
    discount: number = 0,
    deliveryFee: number = 0
  ): Promise<OrderWithItems> {
    try {
      console.log('🛒 Iniciando criação do pedido...');
      console.log('📋 Dados recebidos:', { orderData, cartItems, paymentMethod });

      // 🔧 VALIDAÇÕES MELHORADAS
      if (!orderData?.nomeCliente?.trim()) {
        throw new Error('Nome do cliente é obrigatório');
      }

      if (!orderData?.email?.trim() || !/\S+@\S+\.\S+/.test(orderData.email)) {
        throw new Error('Email válido é obrigatório');
      }

      if (!cartItems || !Array.isArray(cartItems) || cartItems.length === 0) {
        throw new Error('Carrinho não pode estar vazio');
      }

      // 🔧 TESTE DE CONEXÃO ANTES DE PROSSEGUIR
      const isConnected = await this.testConnection();
      if (!isConnected) {
        throw new Error('Não foi possível conectar ao banco de dados');
      }

      // 🔧 MAPEAR ITENS DO CARRINHO CORRETAMENTE
      const validCartItems = cartItems.map((item, index) => {
        if (!item) {
          throw new Error(`Item ${index} é nulo ou undefined`);
        }

        // CartItem sempre tem a estrutura { product: Product, quantity: number, ... }
        if (!item.product) {
          throw new Error(`Item ${index} não tem propriedade product: ${JSON.stringify(item)}`);
        }

        const productData = item.product;
        if (!productData.id || !productData.name || typeof productData.price !== 'number') {
          throw new Error(`Dados do produto ${index} são inválidos: ${JSON.stringify(productData)}`);
        }

        const quantity = item.quantity || 1;
        if (quantity <= 0) {
          throw new Error(`Quantidade do item ${index} deve ser maior que zero`);
        }

        return {
          id: productData.id,
          name: productData.name,
          price: productData.price,
          quantity: quantity,
          selectedSize: item.selectedSize || null,
          selectedColor: item.selectedColor || null,
          sizeVariationId: (item as any).sizeVariationId || null,
          colorVariationId: (item as any).colorVariationId || null
        };
      });

      console.log('✅ Itens validados:', validCartItems);

      // 🔧 CALCULAR TOTAIS COM PRECISÃO
      const subtotal = Number(
        validCartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0).toFixed(2)
      );
      const total = Number((subtotal - discount + deliveryFee).toFixed(2));

      console.log('💰 Totais calculados:', { subtotal, discount, deliveryFee, total });

      // 🔧 OBTER USUÁRIO ATUAL (SEM FALHAR SE NÃO ESTIVER LOGADO)
      let userId = null;
      try {
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        if (!userError && user) {
          userId = user.id;
          console.log('👤 Usuário autenticado:', userId);
        } else {
          console.log('👤 Checkout sem autenticação');
        }
      } catch (userError) {
        console.warn('⚠️ Erro ao obter usuário (não crítico):', userError);
      }

      // 🔧 PREPARAR DADOS CONFORME SCHEMA DA TABELA PEDIDOS
      const orderInsert = {
        user_id: userId,
        email_cliente: orderData.email.trim(),
        nome_cliente: orderData.nomeCliente.trim(),
        telefone: orderData.telefone?.trim() || null,
        cpf: orderData.cpf?.trim() || null,
        cep: orderData.cep?.trim() || null,
        rua: orderData.rua?.trim() || null,
        numero: orderData.numero?.trim() || null,
        complemento: orderData.complemento?.trim() || null,
        bairro: orderData.bairro?.trim() || null,
        cidade: orderData.cidade?.trim() || null,
        estado: orderData.estado?.trim() || null,
        subtotal: Number(subtotal.toFixed(2)),
        desconto: Number(discount.toFixed(2)),
        taxa_entrega: Number(deliveryFee.toFixed(2)),
        total: Number(total.toFixed(2)),
        status: 'pendente',
        metodo_pagamento: paymentMethod
      };

      console.log('📋 Dados formatados para tabela pedidos:', {
        ...orderInsert,
        user_id: orderInsert.user_id ? 'PRESENTE' : 'NULL',
        totais: {
          subtotal: orderInsert.subtotal,
          desconto: orderInsert.desconto,
          taxa_entrega: orderInsert.taxa_entrega,
          total: orderInsert.total
        }
      });

      console.log('📝 Inserindo pedido:', orderInsert);

      // 🔧 INSERIR PEDIDO COM TRATAMENTO DE ERRO DETALHADO
      const { data: order, error: orderError } = await supabase
        .from('pedidos')
        .insert(orderInsert)
        .select()
        .single();

      if (orderError) {
        console.error('❌ Erro detalhado ao criar pedido:', {
          error: orderError,
          code: orderError.code,
          message: orderError.message,
          details: orderError.details,
          hint: orderError.hint
        });

        // Tratar erros específicos
        if (orderError.code === '42501') {
          throw new Error('Erro de permissão. Verifique as políticas RLS da tabela pedidos.');
        } else if (orderError.code === 'PGRST301') {
          throw new Error('Não foi possível inserir o pedido. Verifique se a tabela existe.');
        } else {
          throw new Error(`Falha ao criar pedido: ${orderError.message}`);
        }
      }

      if (!order) {
        throw new Error('Pedido criado mas não retornado pelo banco');
      }

      console.log('✅ Pedido criado com sucesso:', order);

      // 🔧 CRIAR ITENS DO PEDIDO
      const orderItems = validCartItems.map(item => ({
        pedido_id: order.id,
        produto_id: item.id,
        nome_produto: item.name,
        preco_unitario: Number(item.price.toFixed(2)),
        quantidade: item.quantity,
        tamanho: item.selectedSize,
        cor: item.selectedColor,
        variacao_tamanho_id: item.sizeVariationId,
        variacao_cor_id: item.colorVariationId,
        subtotal: Number((item.price * item.quantity).toFixed(2))
      }));

      console.log('📦 Inserindo itens do pedido:', orderItems);

      const { data: items, error: itemsError } = await supabase
        .from('pedido_itens')
        .insert(orderItems)
        .select();

      if (itemsError) {
        console.error('❌ Erro detalhado ao criar itens:', {
          error: itemsError,
          code: itemsError.code,
          message: itemsError.message,
          details: itemsError.details,
          hint: itemsError.hint
        });

        // 🔧 ROLLBACK - REMOVER PEDIDO SE ITENS FALHARAM
        try {
          await supabase.from('pedidos').delete().eq('id', order.id);
          console.log('🔄 Rollback: Pedido removido devido ao erro nos itens');
        } catch (rollbackError) {
          console.error('💥 Erro crítico no rollback:', rollbackError);
        }

        if (itemsError.code === '42501') {
          throw new Error('Erro de permissão nos itens. Verifique as políticas RLS da tabela pedido_itens.');
        } else {
          throw new Error(`Falha ao criar itens do pedido: ${itemsError.message}`);
        }
      }

      if (!items || items.length === 0) {
        throw new Error('Itens não foram inseridos corretamente');
      }

      console.log('✅ Itens criados com sucesso:', items);

      const result: OrderWithItems = {
        ...order,
        itens: items,
      };

      console.log('🎉 Pedido completo criado com sucesso:', result.id);
      return result;

    } catch (error) {
      console.error('💥 Erro crítico em createOrder:', error);
      
      if (error instanceof Error) {
        console.error('Stack trace:', error.stack);
      }
      
      // Re-throw com contexto adicional
      if (error instanceof Error) {
        throw new Error(`OrderService.createOrder: ${error.message}`);
      } else {
        throw new Error(`OrderService.createOrder: Erro desconhecido - ${JSON.stringify(error)}`);
      }
    }
  },

  // 🔧 BUSCAR PEDIDOS COM MELHORES FILTROS
  async getUserOrders(userId?: string, email?: string): Promise<OrderWithItems[]> {
    try {
      if (!userId && !email) {
        console.warn('⚠️ getUserOrders: Nenhum filtro fornecido');
        return [];
      }

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
      }

      const { data, error } = await query;

      if (error) {
        console.error('❌ Erro ao buscar pedidos:', error);
        throw new Error(`Erro ao buscar pedidos: ${error.message}`);
      }

      return data || [];
    } catch (error) {
      console.error('💥 Erro em getUserOrders:', error);
      throw error instanceof Error ? error : new Error('Erro desconhecido ao buscar pedidos');
    }
  },

  // 🔧 BUSCAR PEDIDO POR ID COM VALIDAÇÃO
  async getOrderById(orderId: number): Promise<OrderWithItems | null> {
    try {
      if (!orderId || isNaN(orderId)) {
        throw new Error('ID do pedido é inválido');
      }

      const { data, error } = await supabase
        .from('pedidos')
        .select(`
          *,
          itens:pedido_itens(*)
        `)
        .eq('id', orderId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return null; // Pedido não encontrado
        }
        throw new Error(`Erro ao buscar pedido: ${error.message}`);
      }

      return data;
    } catch (error) {
      console.error('💥 Erro em getOrderById:', error);
      throw error instanceof Error ? error : new Error('Erro desconhecido ao buscar pedido');
    }
  },

  // 🔧 ATUALIZAR STATUS COM VALIDAÇÃO
  async updateOrderStatus(orderId: number, status: string): Promise<Order> {
    try {
      if (!orderId || isNaN(orderId)) {
        throw new Error('ID do pedido é inválido');
      }

      const validStatuses = ['pendente', 'confirmado', 'processando', 'enviado', 'entregue', 'cancelado', 'devolvido'];
      if (!validStatuses.includes(status)) {
        throw new Error(`Status inválido: ${status}`);
      }

      const { data, error } = await supabase
        .from('pedidos')
        .update({ 
          status,
          updated_at: new Date().toISOString()
        })
        .eq('id', orderId)
        .select()
        .single();

      if (error) {
        throw new Error(`Erro ao atualizar status: ${error.message}`);
      }

      return data;
    } catch (error) {
      console.error('💥 Erro em updateOrderStatus:', error);
      throw error instanceof Error ? error : new Error('Erro desconhecido ao atualizar status');
    }
  },

  // 🔧 CANCELAR PEDIDO
  async cancelOrder(orderId: number): Promise<Order> {
    return this.updateOrderStatus(orderId, 'cancelado');
  },
};