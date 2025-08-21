
// 🧪 TESTE DIRETO DE INSERÇÃO NA TABELA PEDIDOS
import { supabase } from '../lib/supabase';

export const testDirectInsert = async () => {
  console.log('🧪 TESTE DIRETO DE INSERÇÃO NA TABELA PEDIDOS');
  console.log('==============================================');

  try {
    // 1. Verificar se conseguimos acessar a tabela
    console.log('1️⃣ Testando acesso à tabela pedidos...');
    const { data: tableTest, error: tableError } = await supabase
      .from('pedidos')
      .select('id')
      .limit(1);

    if (tableError) {
      console.error('❌ Erro ao acessar tabela:', tableError);
      return false;
    }

    console.log('✅ Tabela acessível, registros existentes:', tableTest?.length || 0);

    // 2. Obter usuário atual
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    console.log('👤 Usuário atual:', user ? `${user.email} (${user.id})` : 'Não autenticado');

    // 3. Tentar inserção simples
    const testData = {
      user_id: user?.id || null,
      email_cliente: 'teste-direto@exemplo.com',
      nome_cliente: 'Teste Direto CheckoutPage',
      telefone: '11999999999',
      subtotal: 10.00,
      total: 10.00,
      status: 'pendente',
      metodo_pagamento: 'pix'
    };

    console.log('2️⃣ Tentando inserir dados:', testData);

    const { data: insertResult, error: insertError } = await supabase
      .from('pedidos')
      .insert(testData)
      .select()
      .single();

    if (insertError) {
      console.error('❌ ERRO NA INSERÇÃO:', {
        code: insertError.code,
        message: insertError.message,
        details: insertError.details,
        hint: insertError.hint
      });

      if (insertError.code === '42501') {
        console.log('🚨 PROBLEMA RLS: Execute sql/policies_rls_pedidos.sql');
      }

      return false;
    }

    console.log('✅ INSERÇÃO FUNCIONOU! Pedido criado:', insertResult);

    // 4. Limpeza
    await supabase.from('pedidos').delete().eq('id', insertResult.id);
    console.log('🧹 Teste removido');

    return true;

  } catch (error) {
    console.error('💥 ERRO GERAL:', error);
    return false;
  }
};

// Para executar no console do navegador:
// import('./src/tests/test_direct_insert.ts').then(m => m.testDirectInsert());
