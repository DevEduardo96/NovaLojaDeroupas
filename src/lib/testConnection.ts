
import { supabase } from './supabase';

export const testSupabaseConnection = async () => {
  try {
    console.log('🔍 Testando conexão com Supabase...');
    
    // Teste 1: Verificar se consegue acessar a tabela pedidos
    const { data: pedidosTest, error: pedidosError } = await supabase
      .from('pedidos')
      .select('id')
      .limit(1);
    
    if (pedidosError) {
      console.error('❌ Erro ao acessar tabela pedidos:', pedidosError);
      return { success: false, error: pedidosError };
    }
    
    console.log('✅ Tabela pedidos acessível');
    
    // Teste 2: Verificar se consegue acessar a tabela produtos
    const { data: produtosTest, error: produtosError } = await supabase
      .from('produtos')
      .select('id')
      .limit(1);
    
    if (produtosError) {
      console.error('❌ Erro ao acessar tabela produtos:', produtosError);
      return { success: false, error: produtosError };
    }
    
    console.log('✅ Tabela produtos acessível');
    
    // Teste 3: Verificar autenticação
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError) {
      console.warn('⚠️ Erro ao obter usuário:', userError);
    } else {
      console.log('👤 Usuário atual:', user?.id || 'Não autenticado');
    }
    
    console.log('✅ Conexão com Supabase OK!');
    return { success: true, data: { pedidosTest, produtosTest, user } };
    
  } catch (error) {
    console.error('💥 Erro na conexão com Supabase:', error);
    return { success: false, error };
  }
};
