// src/hooks/useProducts.ts
import { useEffect, useState } from "react";
import { productService } from "../lib/supabase";
import type { Product } from "../types";

export const useProducts = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await productService.getAllProducts();
        setProducts(data);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Erro ao carregar produtos";
        setError(errorMessage);
        console.error("Error in useProducts:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  return { products, loading, error };
};
