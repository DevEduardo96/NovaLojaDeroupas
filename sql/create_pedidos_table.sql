
-- Criar tabela de pedidos
CREATE TABLE IF NOT EXISTS pedidos (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  email_cliente VARCHAR(255) NOT NULL,
  nome_cliente VARCHAR(255) NOT NULL,
  telefone VARCHAR(50),
  cpf VARCHAR(20),
  
  -- Endereço de entrega
  cep VARCHAR(10),
  rua VARCHAR(255),
  numero VARCHAR(20),
  complemento VARCHAR(255),
  bairro VARCHAR(100),
  cidade VARCHAR(100),
  estado VARCHAR(50),
  
  -- Valores do pedido
  subtotal DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  desconto DECIMAL(10,2) DEFAULT 0.00,
  taxa_entrega DECIMAL(10,2) DEFAULT 0.00,
  total DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  
  -- Status e controle
  status VARCHAR(50) DEFAULT 'pendente' CHECK (status IN (
    'pendente', 'confirmado', 'processando', 'enviado', 
    'entregue', 'cancelado', 'devolvido'
  )),
  metodo_pagamento VARCHAR(50) DEFAULT 'pix',
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Criar tabela de itens do pedido
CREATE TABLE IF NOT EXISTS pedido_itens (
  id BIGSERIAL PRIMARY KEY,
  pedido_id BIGINT NOT NULL REFERENCES pedidos(id) ON DELETE CASCADE,
  produto_id BIGINT NOT NULL REFERENCES produtos(id) ON DELETE RESTRICT,
  
  -- Dados do produto no momento da compra
  nome_produto VARCHAR(255) NOT NULL,
  preco_unitario DECIMAL(10,2) NOT NULL,
  quantidade INTEGER NOT NULL DEFAULT 1,
  
  -- Variações selecionadas
  tamanho VARCHAR(50),
  cor VARCHAR(50),
  variacao_tamanho_id BIGINT REFERENCES product_variations(id),
  variacao_cor_id BIGINT REFERENCES product_variations(id),
  
  -- Subtotal do item
  subtotal DECIMAL(10,2) NOT NULL,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Criar índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_pedidos_user_id ON pedidos(user_id);
CREATE INDEX IF NOT EXISTS idx_pedidos_email ON pedidos(email_cliente);
CREATE INDEX IF NOT EXISTS idx_pedidos_status ON pedidos(status);
CREATE INDEX IF NOT EXISTS idx_pedidos_created_at ON pedidos(created_at);
CREATE INDEX IF NOT EXISTS idx_pedido_itens_pedido_id ON pedido_itens(pedido_id);
CREATE INDEX IF NOT EXISTS idx_pedido_itens_produto_id ON pedido_itens(produto_id);

-- Trigger para atualizar updated_at
CREATE TRIGGER update_pedidos_updated_at 
    BEFORE UPDATE ON pedidos 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Inserir produtos de exemplo se a tabela estiver vazia
INSERT INTO produtos (name, description, price, category, image_url, download_url, file_format, is_available) 
SELECT * FROM (VALUES
  ('Template Site Moderno', 'Template responsivo para sites modernos', 199.90, 'templates', '/logo02.webp', 'https://example.com/download1', 'zip', true),
  ('Landing Page Premium', 'Landing page otimizada para conversão', 149.90, 'landing-pages', '/logo02.webp', 'https://example.com/download2', 'zip', true),
  ('E-commerce Template', 'Template completo para loja virtual', 299.90, 'e-commerce', '/logo02.webp', 'https://example.com/download3', 'zip', true),
  ('Dashboard Admin', 'Dashboard administrativo profissional', 249.90, 'dashboards', '/logo02.webp', 'https://example.com/download4', 'zip', true),
  ('Portfolio Criativo', 'Template para portfolio de designers', 179.90, 'portfolios', '/logo02.webp', 'https://example.com/download5', 'zip', true)
) AS t(name, description, price, category, image_url, download_url, file_format, is_available)
WHERE NOT EXISTS (SELECT 1 FROM produtos LIMIT 1);

-- Habilitar RLS
ALTER TABLE pedidos ENABLE ROW LEVEL SECURITY;
ALTER TABLE pedido_itens ENABLE ROW LEVEL SECURITY;

-- Políticas de segurança
CREATE POLICY "Users can view own orders" ON pedidos
    FOR SELECT USING (auth.uid() = user_id OR email_cliente = auth.email());

CREATE POLICY "Users can create own orders" ON pedidos
    FOR INSERT WITH CHECK (auth.uid() = user_id OR auth.email() = email_cliente);

CREATE POLICY "Users can update own orders" ON pedidos
    FOR UPDATE USING (auth.uid() = user_id OR email_cliente = auth.email());

-- Políticas para itens do pedido
CREATE POLICY "Users can view own order items" ON pedido_itens
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM pedidos p 
            WHERE p.id = pedido_id 
            AND (p.user_id = auth.uid() OR p.email_cliente = auth.email())
        )
    );

CREATE POLICY "Users can create own order items" ON pedido_itens
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM pedidos p 
            WHERE p.id = pedido_id 
            AND (p.user_id = auth.uid() OR p.email_cliente = auth.email())
        )
    );
