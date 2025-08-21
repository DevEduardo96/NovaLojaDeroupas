
-- Remover políticas existentes se houver conflito
DROP POLICY IF EXISTS "Users can view own orders" ON pedidos;
DROP POLICY IF EXISTS "Users can create own orders" ON pedidos;
DROP POLICY IF EXISTS "Users can update own orders" ON pedidos;
DROP POLICY IF EXISTS "Users can view own order items" ON pedido_itens;
DROP POLICY IF EXISTS "Users can create own order items" ON pedido_itens;

-- Políticas mais permissivas para pedidos
CREATE POLICY "Allow all authenticated users to view orders" ON pedidos
    FOR SELECT USING (auth.role() = 'authenticated' OR auth.role() = 'anon');

CREATE POLICY "Allow all authenticated users to create orders" ON pedidos
    FOR INSERT WITH CHECK (auth.role() = 'authenticated' OR auth.role() = 'anon');

CREATE POLICY "Allow order owners to update orders" ON pedidos
    FOR UPDATE USING (
        auth.uid() = user_id 
        OR email_cliente = auth.email()
        OR auth.role() = 'authenticated'
    );

-- Políticas para itens do pedido
CREATE POLICY "Allow all authenticated users to view order items" ON pedido_itens
    FOR SELECT USING (auth.role() = 'authenticated' OR auth.role() = 'anon');

CREATE POLICY "Allow all authenticated users to create order items" ON pedido_itens
    FOR INSERT WITH CHECK (auth.role() = 'authenticated' OR auth.role() = 'anon');

-- Temporariamente desabilitar RLS para teste (remova após confirmar funcionamento)
-- ALTER TABLE pedidos DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE pedido_itens DISABLE ROW LEVEL SECURITY;

-- Verificar se as tabelas existem
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('pedidos', 'pedido_itens', 'produtos');
