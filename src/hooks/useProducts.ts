// src/hooks/useProducts.ts
import { useEffect, useState, useCallback, useRef } from "react";
import { productService } from "../lib/supabase";
import type { Product } from "../types";

export const useProducts = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const lastFetchTime = useRef<number>(0);
  const searchTimeoutRef = useRef<NodeJS.Timeout>();

  const fetchProducts = useCallback(async () => {
    const now = Date.now();
    // Prevent excessive calls - minimum 1 second between calls
    if (now - lastFetchTime.current < 1000) {
      return;
    }
    lastFetchTime.current = now;

    try {
      setLoading(true);
      setError(null);
      const data = await productService.getAllProducts();
      setProducts(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Erro ao carregar produtos";
      setError(errorMessage);
      console.error("Error fetching products:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  const searchProducts = useCallback(async (query: string) => {
    // Clear previous search timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    // Debounce search requests
    searchTimeoutRef.current = setTimeout(async () => {
      if (!query.trim()) {
        await fetchProducts();
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const data = await productService.searchProducts(query);
        setProducts(data);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Erro ao buscar produtos";
        setError(errorMessage);
        console.error("Error searching products:", err);
      } finally {
        setLoading(false);
      }
    }, 300); // 300ms debounce
  }, [fetchProducts]);

  const getProductsByCategory = useCallback(async (category: string) => {
    try {
      setLoading(true);
      setError(null);
      const data = await productService.getProductsByCategory(category);
      setProducts(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Erro ao carregar produtos por categoria";
      setError(errorMessage);
      console.error("Error fetching products by category:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // Only fetch on mount
    let isMounted = true;

    const initializeProducts = async () => {
      if (isMounted) {
        await fetchProducts();
      }
    };

    initializeProducts();

    return () => {
      isMounted = false;
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, []); // Empty dependency array - only run on mount

  return {
    products,
    loading,
    error,
    fetchProducts,
    searchProducts,
    getProductsByCategory,
    refetch: fetchProducts,
  };
};