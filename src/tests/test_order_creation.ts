
// 🧪 TESTE DE CRIAÇÃO DE PEDIDOS
// Execute este arquivo para testar se os pedidos estão sendo criados corretamente

import { supabase } from '../lib/supabase';
import { orderService } from '../services/orderService';

export const testOrderCreation = async () => {
  console.log('🧪 INICIANDO TESTE DE CRIAÇÃO DE PEDIDOS');
  console.log('==========================================');

  try {
    // 1. Testar conexão
    console.log('1️⃣ Testando conexão...');
    const isConnected = await orderService.testConnection();
    if (!isConnected) {
      throw new Error('Falha na conexão com Supabase');
    }

    // 2. Verificar usuário atual
    console.log('2️⃣ Verificando usuário atual...');
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    console.log('👤 Usuário:', user ? `${user.email} (${user.id})` : 'Não autenticado');

    // 3. Testar insert direto na tabela pedidos
    console.log('3️⃣ Testando insert direto...');
    const testOrderData = {
      user_id: user?.id || null,
      email_cliente: 'teste@exemplo.com',
      nome_cliente: 'Teste OrderService',
      telefone: '11999999999',
      subtotal: 10.00,
      total: 10.00,
      status: 'pendente',
      metodo_pagamento: 'pix'
    };

    const { data: directInsert, error: directError } = await supabase
      .from('pedidos')
      .insert(testOrderData)
      .select()
      .single();

    if (directError) {
      console.error('❌ Erro no insert direto:', directError);
      
      if (directError.code === '42501') {
        console.log('🚨 PROBLEMA RLS: As políticas estão bloqueando o insert');
        console.log('📝 SOLUÇÃO: Execute o arquivo sql/policies_rls_pedidos.sql');
      }
      
      throw directError;
    }

    console.log('✅ Insert direto funcionou:', directInsert);

    // 4. Testar via orderService
    console.log('4️⃣ Testando via orderService...');
    const mockCartItems = [
      {
        product: {
          id: 1,
          name: 'Produto Teste',
          price: 10.00
        },
        quantity: 1,
        selectedSize: null,
        selectedColor: null
      }
    ];

    const mockOrderData = {
      nomeCliente: 'Teste OrderService Via Service',
      email: 'teste2@exemplo.com',
      telefone: '11888888888'
    };

    const orderResult = await orderService.createOrder(
      mockOrderData,
      mockCartItems,
      'pix',
      0,
      0
    );

    console.log('✅ OrderService funcionou:', orderResult);

    // 5. Limpeza - remover pedidos de teste
    console.log('5️⃣ Limpando dados de teste...');
    await supabase.from('pedidos').delete().eq('id', directInsert.id);
    await supabase.from('pedidos').delete().eq('id', orderResult.id);
    console.log('🧹 Limpeza concluída');

    console.log('🎉 TODOS OS TESTES PASSARAM!');
    return true;

  } catch (error) {
    console.error('💥 ERRO NOS TESTES:', error);
    return false;
  }
};

// Para executar o teste, chame esta função no console do navegador:
// import { testOrderCreation } from './src/tests/test_order_creation.ts';
// testOrderCreation();
