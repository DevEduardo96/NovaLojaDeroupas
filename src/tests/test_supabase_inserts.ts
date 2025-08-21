// 🧪 TESTE SIMPLES PARA VALIDAR INSERTS NO SUPABASE
// Execute este arquivo no console do navegador para testar

import { supabase } from '../lib/supabase';

export const testSupabaseInserts = async () => {
  console.log('🧪 INICIANDO TESTES DE INSERT NO SUPABASE');
  console.log('='.repeat(50));

  try {
    // ===================================
    // 1. TESTE DE CONEXÃO
    // ===================================
    console.log('1️⃣ Testando conexão...');
    
    const { data: connectionTest, error: connectionError } = await supabase
      .from('pedidos')
      .select('id')
      .limit(1);

    if (connectionError) {
      console.error('❌ Erro de conexão:', connectionError);
      return false;
    }
    
    console.log('✅ Conexão OK');

    // ===================================
    // 2. TESTE DE INSERT PEDIDO
    // ===================================
    console.log('2️⃣ Testando insert na tabela pedidos...');
    
    const testOrderData = {
      email_cliente: 'teste@teste.com',
      nome_cliente: 'Cliente Teste',
      telefone: '11999999999',
      cep: '01234-567',
      rua: 'Rua Teste',
      numero: '123',
      bairro: 'Bairro Teste',
      cidade: 'São Paulo',
      estado: 'SP',
      subtotal: 100.00,
      desconto: 0.00,
      taxa_entrega: 0.00,
      total: 100.00,
      status: 'teste',
      metodo_pagamento: 'teste'
    };

    const { data: testOrder, error: orderError } = await supabase
      .from('pedidos')
      .insert(testOrderData)
      .select()
      .single();

    if (orderError) {
      console.error('❌ Erro ao inserir pedido:', {
        code: orderError.code,
        message: orderError.message,
        details: orderError.details,
        hint: orderError.hint
      });
      
      if (orderError.code === '42501') {
        console.log('🚨 PROBLEMA: Row Level Security está bloqueando o insert!');
        console.log('📝 SOLUÇÃO: Execute o arquivo sql/policies_rls_pedidos.sql no Supabase');
      }
      
      return false;
    }

    console.log('✅ Pedido inserido com sucesso:', testOrder);

    // ===================================
    // 3. TESTE DE INSERT PEDIDO_ITENS
    // ===================================
    console.log('3️⃣ Testando insert na tabela pedido_itens...');
    
    const testItemData = {
      pedido_id: testOrder.id,
      produto_id: 1, // Assume que existe um produto com ID 1
      nome_produto: 'Produto Teste',
      preco_unitario: 100.00,
      quantidade: 1,
      tamanho: 'M',
      cor: 'Azul',
      subtotal: 100.00
    };

    const { data: testItem, error: itemError } = await supabase
      .from('pedido_itens')
      .insert(testItemData)
      .select();

    if (itemError) {
      console.error('❌ Erro ao inserir item:', {
        code: itemError.code,
        message: itemError.message,
        details: itemError.details,
        hint: itemError.hint
      });

      // Fazer rollback do pedido de teste
      await supabase.from('pedidos').delete().eq('id', testOrder.id);
      console.log('🔄 Rollback: Pedido de teste removido');
      
      return false;
    }

    console.log('✅ Item inserido com sucesso:', testItem);

    // ===================================
    // 4. LIMPEZA - REMOVER DADOS DE TESTE
    // ===================================
    console.log('4️⃣ Removendo dados de teste...');
    
    await supabase.from('pedido_itens').delete().eq('pedido_id', testOrder.id);
    await supabase.from('pedidos').delete().eq('id', testOrder.id);
    
    console.log('🧹 Dados de teste removidos');

    // ===================================
    // 5. RESULTADO FINAL
    // ===================================
    console.log('='.repeat(50));
    console.log('🎉 TODOS OS TESTES PASSARAM!');
    console.log('✅ A integração com Supabase está funcionando');
    console.log('✅ As policies RLS estão configuradas corretamente');
    
    return true;

  } catch (error) {
    console.error('💥 Erro crítico no teste:', error);
    return false;
  }
};

// Para executar o teste no console do navegador:
// import { testSupabaseInserts } from './src/tests/test_supabase_inserts';
// testSupabaseInserts();

// OU execute direto:
// (async () => { await testSupabaseInserts(); })();
