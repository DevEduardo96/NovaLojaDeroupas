// src/hooks/useProducts.ts
import { useEffect, useState, useCallback, useRef } from "react";
import { productService } from "../lib/supabase";
import type { Product } from "../types";

interface UseProductsState {
  products: Product[];
  loading: boolean;
  error: string | null;
  categories: string[];
}

export const useProducts = () => {
  const [state, setState] = useState<UseProductsState>({
    products: [],
    loading: true,
    error: null,
    categories: []
  });
  
  const lastFetchTime = useRef<number>(0);
  const searchTimeoutRef = useRef<NodeJS.Timeout>();
  const abortControllerRef = useRef<AbortController | null>(null);

  const fetchProducts = useCallback(async (forceRefresh = false) => {
    const now = Date.now();
    // Prevent excessive calls - minimum 1 second between calls
    if (!forceRefresh && now - lastFetchTime.current < 1000) {
      return;
    }
    lastFetchTime.current = now;

    // Cancel previous request if still running
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();

    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      
      const [productsData, categoriesData] = await Promise.all([
        productService.getAllProducts(),
        productService.getCategories()
      ]);
      
      setState(prev => ({
        ...prev,
        products: productsData,
        categories: categoriesData,
        loading: false,
        error: null
      }));
    } catch (err) {
      // Only update state if request wasn't aborted
      if (!abortControllerRef.current?.signal.aborted) {
        const errorMessage = err instanceof Error ? err.message : "Erro ao carregar produtos";
        setState(prev => ({
          ...prev,
          products: [],
          loading: false,
          error: errorMessage
        }));
        console.error("Error fetching products:", err);
      }
    }
  }, []);

  const searchProducts = useCallback(async (query: string) => {
    // Clear previous search timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    // Cancel previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Debounce search requests
    searchTimeoutRef.current = setTimeout(async () => {
      if (!query.trim()) {
        await fetchProducts(true);
        return;
      }

      abortControllerRef.current = new AbortController();

      try {
        setState(prev => ({ ...prev, loading: true, error: null }));
        const data = await productService.searchProducts(query);
        
        // Only update if request wasn't aborted
        if (!abortControllerRef.current?.signal.aborted) {
          setState(prev => ({
            ...prev,
            products: data,
            loading: false,
            error: null
          }));
        }
      } catch (err) {
        if (!abortControllerRef.current?.signal.aborted) {
          const errorMessage = err instanceof Error ? err.message : "Erro ao buscar produtos";
          setState(prev => ({
            ...prev,
            products: [],
            loading: false,
            error: errorMessage
          }));
          console.error("Error searching products:", err);
        }
      }
    }, 300); // 300ms debounce
  }, [fetchProducts]);

  const getProductsByCategory = useCallback(async (category: string) => {
    // Cancel previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();

    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      const data = await productService.getProductsByCategory(category);
      
      if (!abortControllerRef.current?.signal.aborted) {
        setState(prev => ({
          ...prev,
          products: data,
          loading: false,
          error: null
        }));
      }
    } catch (err) {
      if (!abortControllerRef.current?.signal.aborted) {
        const errorMessage = err instanceof Error ? err.message : "Erro ao carregar produtos por categoria";
        setState(prev => ({
          ...prev,
          products: [],
          loading: false,
          error: errorMessage
        }));
        console.error("Error fetching products by category:", err);
      }
    }
  }, []);

  useEffect(() => {
    let isMounted = true;

    const initializeProducts = async () => {
      if (isMounted) {
        await fetchProducts(true);
      }
    };

    initializeProducts();

    return () => {
      isMounted = false;
      // Cleanup
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []); // Empty dependency array - only run on mount

  return {
    ...state,
    fetchProducts,
    searchProducts,
    getProductsByCategory,
    refetch: () => fetchProducts(true),
  };
};