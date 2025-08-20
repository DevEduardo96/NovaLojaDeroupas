
-- Criar tabela para variações de produtos (tamanhos, cores, etc.)
CREATE TABLE IF NOT EXISTS product_variations (
  id BIGSERIAL PRIMARY KEY,
  product_id BIGINT NOT NULL,
  type VARCHAR(20) NOT NULL CHECK (type IN ('size', 'color')),
  name VARCHAR(100) NOT NULL, -- Nome da variação (ex: "Grande", "Azul")
  value VARCHAR(100) NOT NULL, -- Valor da variação (ex: "L", "#0000FF")
  stock_quantity INTEGER DEFAULT 0,
  price_modifier DECIMAL(10,2) DEFAULT 0.00, -- Modificador de preço (+/- valor)
  is_available BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  
  -- Foreign key constraint
  CONSTRAINT fk_product_variations_product_id 
    FOREIGN KEY (product_id) 
    REFERENCES produtos (id) 
    ON DELETE CASCADE,
    
  -- Unique constraint para evitar duplicatas
  UNIQUE(product_id, type, name)
);

-- Criar índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_product_variations_product_id ON product_variations(product_id);
CREATE INDEX IF NOT EXISTS idx_product_variations_type ON product_variations(type);
CREATE INDEX IF NOT EXISTS idx_product_variations_available ON product_variations(is_available);

-- Criar trigger para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc'::text, NOW());
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_product_variations_updated_at 
    BEFORE UPDATE ON product_variations 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Inserir alguns dados de exemplo
INSERT INTO product_variations (product_id, type, name, value, stock_quantity, price_modifier, is_available) VALUES
-- Tamanhos para produto ID 1 (substitua pelo ID real do seu produto)
(1, 'size', 'Pequeno', 'P', 10, -5.00, true),
(1, 'size', 'Médio', 'M', 15, 0.00, true),
(1, 'size', 'Grande', 'G', 8, 5.00, true),
(1, 'size', 'Extra Grande', 'GG', 5, 10.00, true),

-- Cores para produto ID 1
(1, 'color', 'Preto', '#000000', 20, 0.00, true),
(1, 'color', 'Branco', '#FFFFFF', 18, 0.00, true),
(1, 'color', 'Azul', '#0066CC', 12, 0.00, true),
(1, 'color', 'Vermelho', '#CC0000', 8, 2.00, true);

-- Habilitar RLS (Row Level Security) se necessário
ALTER TABLE product_variations ENABLE ROW LEVEL SECURITY;

-- Política para permitir leitura pública das variações
CREATE POLICY "Allow public read access to product variations" ON product_variations
    FOR SELECT USING (true);

-- Política para permitir inserção/atualização apenas para usuários autenticados (opcional)
CREATE POLICY "Allow authenticated users to manage variations" ON product_variations
    FOR ALL USING (auth.role() = 'authenticated');
