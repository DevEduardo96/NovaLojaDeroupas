// src/hooks/useCart.ts
import { useState, useCallback, useEffect } from "react";
import { Product, CartItem } from "../types";

const CART_STORAGE_KEY = "digitalstore_cart";

export const useCart = () => {
  const [items, setItems] = useState<CartItem[]>(() => {
    try {
      const stored = localStorage.getItem(CART_STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  const addToCart = useCallback((product: Product & { selectedSize?: string; selectedColor?: string; variationInfo?: any }) => {
    setItems(prevItems => {
      // Create a unique key for products with variations
      const variationKey = `${product.id}-${product.selectedSize || ''}-${product.selectedColor || ''}`;

      const existingItem = prevItems.find(item => {
        const itemVariationKey = `${item.product.id}-${item.selectedSize || ''}-${item.selectedColor || ''}`;
        return itemVariationKey === variationKey;
      });

      if (existingItem) {
        return prevItems.map(item => {
          const itemVariationKey = `${item.product.id}-${item.selectedSize || ''}-${item.selectedColor || ''}`;
          return itemVariationKey === variationKey
            ? { ...item, quantity: item.quantity + 1 }
            : item;
        });
      }

      return [...prevItems, { 
        product: product,
        quantity: 1,
        selectedSize: product.selectedSize,
        selectedColor: product.selectedColor,
        variationInfo: product.variationInfo
      }];
    });
  }, []);

  const removeFromCart = useCallback((productId: number, selectedSize?: string, selectedColor?: string) => {
    const variationKeyToRemove = `${productId}-${selectedSize || ''}-${selectedColor || ''}`;
    setItems((prev) => prev.filter((item) => {
      const itemVariationKey = `${item.product.id}-${item.selectedSize || ''}-${item.selectedColor || ''}`;
      return itemVariationKey !== variationKeyToRemove;
    }));
  }, []);

  const updateQuantity = useCallback(
    (productId: number, quantity: number, selectedSize?: string, selectedColor?: string) => {
      if (quantity <= 0) {
        removeFromCart(productId, selectedSize, selectedColor);
        return;
      }

      const variationKeyToUpdate = `${productId}-${selectedSize || ''}-${selectedColor || ''}`;
      setItems((prev) =>
        prev.map((item) => {
          const itemVariationKey = `${item.product.id}-${item.selectedSize || ''}-${item.selectedColor || ''}`;
          return itemVariationKey === variationKeyToUpdate ? { ...item, quantity } : item;
        })
      );
    },
    [removeFromCart]
  );

  const clearCart = useCallback(() => {
    setItems([]);
  }, []);

  const getTotal = useCallback(() => {
    return items.reduce(
      (total, item) => {
        // Safety check to ensure item.product exists and has a price
        if (item.product && typeof item.product.price === 'number') {
          return total + item.product.price * item.quantity;
        }
        return total;
      },
      0
    );
  }, [items]);

  const getItemCount = useCallback(() => {
    return items.reduce((count, item) => count + item.quantity, 0);
  }, [items]);

  return {
    items,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    getTotal,
    getItemCount,
  };
};