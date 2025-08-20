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

  const addToCart = useCallback((product: Product | any, customQuantity?: number) => {
    setItems((prev) => {
      // Para produtos com variações, criar um ID único baseado no produto + variações
      const productKey = product.selectedColor || product.selectedSize 
        ? `${product.id}-${product.selectedColor || ''}-${product.selectedSize || ''}`
        : product.id;
      
      const existingItem = prev.find((item) => {
        const itemKey = item.product.selectedColor || item.product.selectedSize
          ? `${item.product.id}-${item.product.selectedColor || ''}-${item.product.selectedSize || ''}`
          : item.product.id;
        return itemKey === productKey;
      });
      
      if (existingItem) {
        return prev.map((item) => {
          const itemKey = item.product.selectedColor || item.product.selectedSize
            ? `${item.product.id}-${item.product.selectedColor || ''}-${item.product.selectedSize || ''}`
            : item.product.id;
          return itemKey === productKey
            ? { ...item, quantity: item.quantity + (customQuantity || product.quantity || 1) }
            : item;
        });
      }
      
      return [...prev, { 
        product: {
          ...product,
          // Garantir que o ID seja único para variações
          id: productKey
        }, 
        quantity: customQuantity || product.quantity || 1 
      }];
    });
  }, []);

  const removeFromCart = useCallback((productId: number) => {
    setItems((prev) => prev.filter((item) => item.product.id !== productId));
  }, []);

  const updateQuantity = useCallback(
    (productId: number, quantity: number) => {
      if (quantity <= 0) {
        removeFromCart(productId);
        return;
      }

      setItems((prev) =>
        prev.map((item) =>
          item.product.id === productId ? { ...item, quantity } : item
        )
      );
    },
    [removeFromCart]
  );

  const clearCart = useCallback(() => {
    setItems([]);
  }, []);

  const getTotal = useCallback(() => {
    return items.reduce(
      (total, item) => total + item.product.price * item.quantity,
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
