
import React, { useState, useCallback, useEffect } from 'react';
import { useProductVariations } from '../hooks/useProductVariations';
import type { ProductVariation } from '../types';

interface ProductVariationSelectorProps {
  productId: number;
  basePrice: number;
  onVariationChange?: (selectedVariations: {
    size?: ProductVariation;
    color?: ProductVariation;
    totalPrice: number;
    inStock: boolean;
  }) => void;
}

const ProductVariationSelector: React.FC<ProductVariationSelectorProps> = ({
  productId,
  basePrice,
  onVariationChange,
}) => {
  const {
    sizes,
    colors,
    loading,
    error,
    calculateVariationPrice,
    checkStock,
  } = useProductVariations(productId);

  const [selectedSize, setSelectedSize] = useState<ProductVariation | undefined>();
  const [selectedColor, setSelectedColor] = useState<ProductVariation | undefined>();
  const [inStock, setInStock] = useState(true);
  const [checkingStock, setCheckingStock] = useState(false);

  const calculateTotalPrice = useCallback(() => {
    let price = basePrice;
    
    if (selectedSize?.price_modifier) {
      price += selectedSize.price_modifier;
    }
    
    if (selectedColor?.price_modifier) {
      price += selectedColor.price_modifier;
    }
    
    return price;
  }, [basePrice, selectedSize, selectedColor]);

  const checkAvailability = useCallback(async () => {
    if (!selectedSize && !selectedColor) {
      setInStock(true);
      return;
    }

    setCheckingStock(true);
    try {
      const available = await checkStock(
        productId,
        selectedSize?.name,
        selectedColor?.name
      );
      setInStock(available);
    } catch (error) {
      console.error('Error checking stock:', error);
      setInStock(false);
    } finally {
      setCheckingStock(false);
    }
  }, [productId, selectedSize, selectedColor, checkStock]);

  useEffect(() => {
    checkAvailability();
  }, [checkAvailability]);

  useEffect(() => {
    const totalPrice = calculateTotalPrice();
    
    if (onVariationChange) {
      onVariationChange({
        size: selectedSize,
        color: selectedColor,
        totalPrice,
        inStock,
      });
    }
  }, [selectedSize, selectedColor, inStock, calculateTotalPrice, onVariationChange]);

  if (loading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-4 bg-gray-200 rounded w-1/4"></div>
        <div className="grid grid-cols-3 gap-2">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-10 bg-gray-200 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-red-500 text-sm p-4 bg-red-50 rounded-lg">
        Erro ao carregar variações: {error}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Seleção de Tamanhos */}
      {sizes.length > 0 && (
        <div>
          <h3 className="text-sm font-medium text-gray-900 mb-3">
            Tamanho
            {selectedSize && selectedSize.price_modifier !== 0 && (
              <span className="ml-2 text-sm text-gray-500">
                ({selectedSize.price_modifier > 0 ? '+' : ''}
                R$ {selectedSize.price_modifier.toFixed(2)})
              </span>
            )}
          </h3>
          <div className="grid grid-cols-4 gap-2">
            {sizes.map((size) => (
              <button
                key={size.id}
                onClick={() => setSelectedSize(selectedSize?.id === size.id ? undefined : size)}
                disabled={!size.is_available || size.stock_quantity === 0}
                className={`
                  relative p-3 text-sm font-medium rounded-md border transition-colors
                  ${selectedSize?.id === size.id
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-300 bg-white text-gray-900 hover:bg-gray-50'
                  }
                  ${!size.is_available || size.stock_quantity === 0
                    ? 'opacity-50 cursor-not-allowed'
                    : 'cursor-pointer'
                  }
                `}
              >
                {size.name}
                {size.stock_quantity <= 5 && size.stock_quantity > 0 && (
                  <span className="absolute -top-1 -right-1 bg-orange-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                    !
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Seleção de Cores */}
      {colors.length > 0 && (
        <div>
          <h3 className="text-sm font-medium text-gray-900 mb-3">
            Cor
            {selectedColor && selectedColor.price_modifier !== 0 && (
              <span className="ml-2 text-sm text-gray-500">
                ({selectedColor.price_modifier > 0 ? '+' : ''}
                R$ {selectedColor.price_modifier.toFixed(2)})
              </span>
            )}
          </h3>
          <div className="grid grid-cols-4 gap-2">
            {colors.map((color) => (
              <button
                key={color.id}
                onClick={() => setSelectedColor(selectedColor?.id === color.id ? undefined : color)}
                disabled={!color.is_available || color.stock_quantity === 0}
                className={`
                  relative p-3 text-sm font-medium rounded-md border transition-colors flex items-center space-x-2
                  ${selectedColor?.id === color.id
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-300 bg-white text-gray-900 hover:bg-gray-50'
                  }
                  ${!color.is_available || color.stock_quantity === 0
                    ? 'opacity-50 cursor-not-allowed'
                    : 'cursor-pointer'
                  }
                `}
              >
                <div
                  className="w-4 h-4 rounded-full border border-gray-300"
                  style={{ backgroundColor: color.value }}
                />
                <span>{color.name}</span>
                {color.stock_quantity <= 5 && color.stock_quantity > 0 && (
                  <span className="absolute -top-1 -right-1 bg-orange-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                    !
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Status de Estoque */}
      {(selectedSize || selectedColor) && (
        <div className="flex items-center space-x-2">
          {checkingStock ? (
            <div className="flex items-center text-gray-500">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-500"></div>
              <span className="ml-2">Verificando estoque...</span>
            </div>
          ) : inStock ? (
            <div className="flex items-center text-green-600">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              <span className="ml-2">Disponível em estoque</span>
            </div>
          ) : (
            <div className="flex items-center text-red-600">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
              <span className="ml-2">Fora de estoque</span>
            </div>
          )}
        </div>
      )}

      {/* Preço Final */}
      <div className="text-lg font-semibold text-gray-900">
        Preço: R$ {calculateTotalPrice().toFixed(2)}
      </div>
    </div>
  );
};

export default ProductVariationSelector;
