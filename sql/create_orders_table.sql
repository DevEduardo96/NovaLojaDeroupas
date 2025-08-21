
-- Criar tabela de pedidos
CREATE TABLE IF NOT EXISTS pedidos (
  id BIGSERIAL PRIMARY KEY,
  payment_id VARCHAR(255) UNIQUE NOT NULL,
  nome_cliente VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  telefone VARCHAR(50),
  cpf VARCHAR(14),
  cep VARCHAR(10),
  rua VARCHAR(255),
  numero VARCHAR(20),
  complemento VARCHAR(255),
  bairro VARCHAR(100),
  cidade VARCHAR(100),
  estado VARCHAR(50),
  valor_total DECIMAL(10,2) NOT NULL,
  status VARCHAR(50) DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Criar tabela de itens do carrinho
CREATE TABLE IF NOT EXISTS cart_items (
  id BIGSERIAL PRIMARY KEY,
  pedido_id BIGINT NOT NULL,
  produto_id BIGINT NOT NULL,
  nome_produto VARCHAR(255) NOT NULL,
  preco_unitario DECIMAL(10,2) NOT NULL,
  quantidade INTEGER NOT NULL DEFAULT 1,
  tamanho VARCHAR(50),
  cor VARCHAR(50),
  subtotal DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  
  -- Foreign key constraints
  CONSTRAINT fk_cart_items_pedido_id 
    FOREIGN KEY (pedido_id) 
    REFERENCES pedidos(id) 
    ON DELETE CASCADE,
    
  CONSTRAINT fk_cart_items_produto_id 
    FOREIGN KEY (produto_id) 
    REFERENCES produtos(id)
);

-- Verificar se a coluna payment_id existe, se não, adicionar
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='pedidos' AND column_name='payment_id') THEN
        ALTER TABLE pedidos ADD COLUMN payment_id VARCHAR(255) UNIQUE;
    END IF;
END $$;

-- Índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_pedidos_payment_id ON pedidos(payment_id);
CREATE INDEX IF NOT EXISTS idx_pedidos_email ON pedidos(email);
CREATE INDEX IF NOT EXISTS idx_cart_items_pedido_id ON cart_items(pedido_id);
CREATE INDEX IF NOT EXISTS idx_cart_items_produto_id ON cart_items(produto_id);
