-- 🔒 POLICIES RLS PARA TABELAS DE PEDIDOS
-- Execute essas queries no Supabase SQL Editor

-- ===================================
-- 1. ATIVAR RLS NAS TABELAS
-- ===================================

-- Ativar RLS na tabela pedidos
ALTER TABLE public.pedidos ENABLE ROW LEVEL SECURITY;

-- Ativar RLS na tabela pedido_itens  
ALTER TABLE public.pedido_itens ENABLE ROW LEVEL SECURITY;

-- ===================================
-- 2. POLICIES PARA TABELA PEDIDOS
-- ===================================

-- 🟢 POLICY 1: Permitir que qualquer pessoa INSIRA pedidos (checkout sem login)
CREATE POLICY "Anyone can insert orders" ON public.pedidos
  FOR INSERT
  WITH CHECK (true);

-- 🟢 POLICY 2: Usuários autenticados podem ver SEUS pedidos
CREATE POLICY "Users can view own orders" ON public.pedidos
  FOR SELECT
  USING (auth.uid() = user_id);

-- 🟢 POLICY 3: Pedidos sem user_id podem ser vistos por email (checkout sem login)  
CREATE POLICY "View orders by email if no user_id" ON public.pedidos
  FOR SELECT
  USING (user_id IS NULL);

-- 🟢 POLICY 4: Usuários autenticados podem atualizar SEUS pedidos
CREATE POLICY "Users can update own orders" ON public.pedidos
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ===================================
-- 3. POLICIES PARA TABELA PEDIDO_ITENS
-- ===================================

-- 🟢 POLICY 5: Permitir que qualquer pessoa INSIRA itens de pedidos
CREATE POLICY "Anyone can insert order items" ON public.pedido_itens
  FOR INSERT
  WITH CHECK (true);

-- 🟢 POLICY 6: Usuários podem ver itens dos SEUS pedidos
CREATE POLICY "Users can view own order items" ON public.pedido_itens
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.pedidos 
      WHERE pedidos.id = pedido_itens.pedido_id 
      AND pedidos.user_id = auth.uid()
    )
  );

-- 🟢 POLICY 7: Itens de pedidos sem user_id podem ser vistos (checkout sem login)
CREATE POLICY "View order items if no user_id" ON public.pedido_itens
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.pedidos 
      WHERE pedidos.id = pedido_itens.pedido_id 
      AND pedidos.user_id IS NULL
    )
  );

-- ===================================
-- 4. POLICIES ALTERNATIVAS MAIS RESTRITIVAS (COMENTADAS)
-- ===================================

-- Se você quiser APENAS checkout com login, substitua as policies acima por estas:

/*
-- 🔴 APENAS USUÁRIOS AUTENTICADOS (descomente se quiser usar)

-- Para tabela pedidos - apenas usuários logados
CREATE POLICY "Authenticated users can insert orders" ON public.pedidos
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Authenticated users can view own orders" ON public.pedidos
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Para tabela pedido_itens - apenas usuários logados  
CREATE POLICY "Authenticated users can insert order items" ON public.pedido_itens
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.pedidos 
      WHERE pedidos.id = pedido_itens.pedido_id 
      AND pedidos.user_id = auth.uid()
    )
  );

CREATE POLICY "Authenticated users can view own order items" ON public.pedido_itens
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.pedidos 
      WHERE pedidos.id = pedido_itens.pedido_id 
      AND pedidos.user_id = auth.uid()
    )
  );
*/

-- ===================================
-- 5. VERIFICAR SE AS POLICIES FORAM CRIADAS
-- ===================================

-- Execute para verificar se as policies estão ativas:
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE schemaname = 'public' 
AND tablename IN ('pedidos', 'pedido_itens');
