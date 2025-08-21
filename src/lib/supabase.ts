import { createClient } from "@supabase/supabase-js";
import type { Product } from "../types";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Missing Supabase environment variables");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    storageKey: "supabase.auth.token",
    flowType: "pkce",
    debug: false,
  },
  global: {
    headers: {
      "Content-Type": "application/json",
    },
  },
  db: {
    schema: "public",
  },
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
});

// Types para as variações
export interface ProductVariation {
  id: number;
  product_id: number;
  type: "size" | "color";
  name: string;
  value: string;
  stock_quantity: number;
  price_modifier: number;
  is_available: boolean;
  created_at: string;
  updated_at: string;
}

export interface ProductWithVariations extends Product {
  variations: ProductVariation[];
  sizes: ProductVariation[];
  colors: ProductVariation[];
}

// Cache simples para produtos
const productCache = new Map<string, { data: any; timestamp: number }>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutos

// Função helper para cache
const getCachedData = (key: string) => {
  const cached = productCache.get(key);
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.data;
  }
  return null;
};

const setCachedData = (key: string, data: any) => {
  productCache.set(key, { data, timestamp: Date.now() });
};

// Serviço de produtos
export const productService = {
  // Buscar todos os produtos
  async getAllProducts(): Promise<Product[]> {
    const cacheKey = 'all-products';
    const cached = getCachedData(cacheKey);
    if (cached) {
      return cached;
    }

    try {
      const { data, error } = await supabase
        .from("produtos")
        .select("*")
        .order("id", { ascending: true });

      if (error) {
        console.error("Error fetching products:", error);
        throw new Error(`Erro ao buscar produtos: ${error.message}`);
      }
      
      const products = data || [];
      setCachedData(cacheKey, products);
      return products;
    } catch (error) {
      console.error("Error in getAllProducts:", error);
      throw error instanceof Error ? error : new Error("Erro desconhecido ao buscar produtos");
    }
  },

  // Buscar produtos por categoria
  async getProductsByCategory(category: string): Promise<Product[]> {
    try {
      const { data, error } = await supabase
        .from("produtos")
        .select("*")
        .eq("category", category)
        .order("id", { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error("Error in getProductsByCategory:", error);
      throw error;
    }
  },

  // Buscar produtos pelo nome ou descrição
  async searchProducts(query: string): Promise<Product[]> {
    const normalizedQuery = query.trim().toLowerCase();
    if (!normalizedQuery) {
      return this.getAllProducts();
    }

    const cacheKey = `search-${normalizedQuery}`;
    const cached = getCachedData(cacheKey);
    if (cached) {
      return cached;
    }

    try {
      const { data, error } = await supabase
        .from("produtos")
        .select("*")
        .or(`name.ilike.%${normalizedQuery}%,description.ilike.%${normalizedQuery}%,category.ilike.%${normalizedQuery}%`)
        .order("id", { ascending: true })
        .limit(50); // Limitar resultados para melhor performance

      if (error) {
        throw new Error(`Erro na busca: ${error.message}`);
      }
      
      const products = data || [];
      setCachedData(cacheKey, products);
      return products;
    } catch (error) {
      console.error("Error in searchProducts:", error);
      throw error instanceof Error ? error : new Error("Erro desconhecido na busca");
    }
  },

  // Buscar um único produto com variações
  async getProductById(id: number): Promise<ProductWithVariations | null> {
    try {
      const { data: product, error } = await supabase
        .from("produtos")
        .select("*")
        .eq("id", id)
        .single();

      if (error) {
        if (error.code === "PGRST116") return null; // nenhum produto
        throw error;
      }

      // Buscar variações relacionadas
      const variations = await this.getProductVariations(id);

      return {
        ...product,
        variations,
        sizes: variations.filter((v) => v.type === "size" && v.is_available),
        colors: variations.filter((v) => v.type === "color" && v.is_available),
      };
    } catch (error) {
      console.error("Error in getProductById:", error);
      throw error;
    }
  },

  // Buscar variações de um produto
  async getProductVariations(productId: number): Promise<ProductVariation[]> {
    try {
      const { data, error } = await supabase
        .from("product_variations")
        .select("*")
        .eq("product_id", productId)
        .eq("is_available", true)
        .order("type", { ascending: true })
        .order("name", { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error("Error in getProductVariations:", error);
      throw error;
    }
  },

  // Buscar categorias únicas
  async getCategories(): Promise<string[]> {
    const cacheKey = 'categories';
    const cached = getCachedData(cacheKey);
    if (cached) {
      return cached;
    }

    try {
      const { data, error } = await supabase
        .from("produtos")
        .select("category")
        .not("category", "is", null)
        .not("category", "eq", "");

      if (error) {
        throw new Error(`Erro ao buscar categorias: ${error.message}`);
      }
      
      const uniqueCategories = new Set(data?.map((item) => item.category) || []);
      const categories = Array.from(uniqueCategories).filter(Boolean).sort();
      
      setCachedData(cacheKey, categories);
      return categories;
    } catch (error) {
      console.error("Error in getCategories:", error);
      throw error instanceof Error ? error : new Error("Erro desconhecido ao buscar categorias");
    }
  },

  // Criar variação de produto
  async addProductVariation(
    variation: Omit<ProductVariation, "id" | "created_at" | "updated_at">
  ): Promise<ProductVariation> {
    try {
      const { data, error } = await supabase
        .from("product_variations")
        .insert(variation)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error("Error in addProductVariation:", error);
      throw error;
    }
  },

  // Atualizar variação de produto
  async updateProductVariation(
    id: number,
    updates: Partial<ProductVariation>
  ): Promise<ProductVariation> {
    try {
      const { data, error } = await supabase
        .from("product_variations")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error("Error in updateProductVariation:", error);
      throw error;
    }
  },

  // Deletar variação
  async deleteProductVariation(id: number): Promise<void> {
    try {
      const { error } = await supabase
        .from("product_variations")
        .delete()
        .eq("id", id);

      if (error) throw error;
      
      // Limpar cache relacionado
      this.clearCache();
    } catch (error) {
      console.error("Error in deleteProductVariation:", error);
      throw error;
    }
  },

  // Limpar cache
  clearCache(): void {
    productCache.clear();
  },

  // Limpar cache específico
  clearCacheByKey(pattern: string): void {
    for (const key of productCache.keys()) {
      if (key.includes(pattern)) {
        productCache.delete(key);
      }
    }
  },

  // Obter estatísticas do cache
  getCacheStats() {
    return {
      size: productCache.size,
      keys: Array.from(productCache.keys())
    };
  },

  // Corrigido: verificar estoque combinando tamanho + cor
  async checkVariationStock(
    productId: number,
    size?: string,
    color?: string
  ): Promise<boolean> {
    try {
      let sizeStock = Infinity;
      let colorStock = Infinity;

      // checa tamanho
      if (size) {
        const { data } = await supabase
          .from("product_variations")
          .select("stock_quantity")
          .eq("product_id", productId)
          .eq("type", "size")
          .eq("name", size)
          .eq("is_available", true)
          .maybeSingle();

        sizeStock = data?.stock_quantity ?? 0;
      }

      // checa cor
      if (color) {
        const { data } = await supabase
          .from("product_variations")
          .select("stock_quantity")
          .eq("product_id", productId)
          .eq("type", "color")
          .eq("name", color)
          .eq("is_available", true)
          .maybeSingle();

        colorStock = data?.stock_quantity ?? 0;
      }

      return Math.min(sizeStock, colorStock) > 0;
    } catch (error) {
      console.error("Error in checkVariationStock:", error);
      return false;
    }
  },
};


