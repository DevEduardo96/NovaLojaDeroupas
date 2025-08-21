
import { useState, useEffect, useCallback } from 'react';
import { productService } from '../lib/supabase';
import type { ProductVariation } from '../lib/supabase';

export const useProductVariations = (productId?: number) => {
  const [variations, setVariations] = useState<ProductVariation[]>([]);
  const [sizes, setSizes] = useState<ProductVariation[]>([]);
  const [colors, setColors] = useState<ProductVariation[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchVariations = useCallback(async (id: number) => {
    try {
      setLoading(true);
      setError(null);
      
      const data = await productService.getProductVariations(id);
      setVariations(data);
      
      // Separar por tipo
      const sizeVariations = data.filter(v => v.type === 'size' && v.is_available);
      const colorVariations = data.filter(v => v.type === 'color' && v.is_available);
      
      setSizes(sizeVariations);
      setColors(colorVariations);
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao carregar variações';
      setError(errorMessage);
      console.error('Error fetching variations:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const getSizesByProduct = useCallback(async (id: number) => {
    try {
      const data = await productService.getProductVariations(id);
      return data.filter(v => v.type === 'size' && v.is_available);
    } catch (err) {
      console.error('Error fetching sizes:', err);
      return [];
    }
  }, []);

  const getColorsByProduct = useCallback(async (id: number) => {
    try {
      const data = await productService.getProductVariations(id);
      return data.filter(v => v.type === 'color' && v.is_available);
    } catch (err) {
      console.error('Error fetching colors:', err);
      return [];
    }
  }, []);

  const createVariation = useCallback(async (variation: Omit<ProductVariation, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const newVariation = await productService.addProductVariation(variation);
      setVariations(prev => [...prev, newVariation]);
      
      // Atualizar listas específicas
      if (newVariation.type === 'size' && newVariation.is_available) {
        setSizes(prev => [...prev, newVariation]);
      } else if (newVariation.type === 'color' && newVariation.is_available) {
        setColors(prev => [...prev, newVariation]);
      }
      
      return newVariation;
    } catch (err) {
      console.error('Error creating variation:', err);
      throw err;
    }
  }, []);

  const updateVariation = useCallback(async (id: number, updates: Partial<ProductVariation>) => {
    try {
      const updatedVariation = await productService.updateProductVariation(id, updates);
      
      setVariations(prev => prev.map(v => v.id === id ? updatedVariation : v));
      
      // Atualizar listas específicas
      if (updatedVariation.type === 'size') {
        setSizes(prev => prev.map(v => v.id === id ? updatedVariation : v).filter(v => v.is_available));
      } else if (updatedVariation.type === 'color') {
        setColors(prev => prev.map(v => v.id === id ? updatedVariation : v).filter(v => v.is_available));
      }
      
      return updatedVariation;
    } catch (err) {
      console.error('Error updating variation:', err);
      throw err;
    }
  }, []);

  const deleteVariation = useCallback(async (id: number) => {
    try {
      await productService.deleteProductVariation(id);
      
      setVariations(prev => prev.filter(v => v.id !== id));
      setSizes(prev => prev.filter(v => v.id !== id));
      setColors(prev => prev.filter(v => v.id !== id));
    } catch (err) {
      console.error('Error deleting variation:', err);
      throw err;
    }
  }, []);

  const calculateVariationPrice = useCallback((basePrice: number, variation?: ProductVariation) => {
    if (!variation || !variation.price_modifier) {
      return basePrice;
    }
    return basePrice + variation.price_modifier;
  }, []);

  const checkStock = useCallback(async (productId: number, size?: string, color?: string) => {
    try {
      return await productService.checkVariationStock(productId, size, color);
    } catch (err) {
      console.error('Error checking stock:', err);
      return false;
    }
  }, []);

  useEffect(() => {
    if (productId) {
      fetchVariations(productId);
    }
  }, [productId, fetchVariations]);

  return {
    variations,
    sizes,
    colors,
    loading,
    error,
    fetchVariations,
    getSizesByProduct,
    getColorsByProduct,
    createVariation,
    updateVariation,
    deleteVariation,
    calculateVariationPrice,
    checkStock,
    refetch: () => productId ? fetchVariations(productId) : Promise.resolve(),
  };
};
