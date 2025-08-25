import React from "react";
import { X, Plus, Minus, ShoppingBag } from "lucide-react";
import { CartItem } from "../types";
import { useAuth } from "../contexts/AuthContext";

interface CartProps {
  items: CartItem[];
  isOpen: boolean;
  onClose: () => void;
  onUpdateQuantity: (productId: number, quantity: number, selectedSize?: string, selectedColor?: string) => void;
  onRemoveItem: (productId: number, selectedSize?: string, selectedColor?: string) => void;
  onCheckout: () => void;
  total: number;
}

export const Cart: React.FC<CartProps> = ({
  items,
  isOpen,
  onClose,
  onUpdateQuantity,
  onRemoveItem,
  onCheckout,
  total,
}) => {
  const { user } = useAuth();

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(price);
  };

  const handleCheckout = () => {
    if (items.length === 0) {
      alert('Adicione produtos ao carrinho antes de finalizar a compra');
      return;
    }

    if (!user) {
      // Salvar que o usuário estava tentando fazer checkout
      localStorage.setItem('pendingCheckout', 'true');

      // Fechar o carrinho primeiro
      onClose();

      // Redirecionar para checkout (que terá o CheckoutGuard)
      onCheckout();
      return;
    }

    // Se estiver logado, continuar para checkout
    onCheckout();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div
        className="absolute inset-0 bg-black bg-opacity-50"
        onClick={onClose}
      />

      <div className="absolute right-0 top-0 h-full w-full max-w-md bg-white shadow-xl">
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b">
            <div className="flex items-center space-x-2">
              <ShoppingBag className="w-6 h-6 text-indigo-600" />
              <h2 className="text-xl font-bold text-gray-900">Carrinho</h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Items */}
          <div className="flex-1 overflow-y-auto p-6">
            {items.length === 0 ? (
              <div className="text-center py-12">
                <ShoppingBag className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">Seu carrinho está vazio</p>
              </div>
            ) : (
              <div className="space-y-4">
                {items.map((item) => (
                  <div
                    key={`${item.product.id}-${item.selectedSize || ''}-${item.selectedColor || ''}`}
                    className="flex items-center space-x-4 bg-gray-50 p-4 rounded-lg"
                  >
                    <img
                      src={item.product.image_url}
                      alt={item.product.name}
                      className="w-16 h-16 object-cover rounded-lg"
                    />

                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-medium text-gray-900 truncate">
                        {item.product.name}
                      </h3>
                      <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                        {item.product.description}
                      </p>
                      <p className="text-sm font-medium text-purple-600 mt-1">
                        {formatPrice(item.product.price)}
                      </p>
                      {(item.selectedSize || item.selectedColor) && (
                        <div className="flex space-x-4 mt-2 text-xs text-gray-600">
                          {item.selectedSize && (
                            <span className="bg-gray-100 px-2 py-1 rounded">
                              Tamanho: {item.selectedSize}
                            </span>
                          )}
                          {item.selectedColor && (
                            <span className="bg-gray-100 px-2 py-1 rounded">
                              Cor: {item.selectedColor}
                            </span>
                          )}
                        </div>
                      )}
                    </div>


                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() =>
                          onUpdateQuantity(item.product.id, item.quantity - 1, item.selectedSize, item.selectedColor)
                        }
                        className="p-1 hover:bg-gray-200 rounded-full transition-colors"
                      >
                        <Minus className="w-4 h-4" />
                      </button>

                      <span className="w-8 text-center font-semibold">
                        {item.quantity}
                      </span>

                      <button
                        onClick={() =>
                          onUpdateQuantity(item.product.id, item.quantity + 1, item.selectedSize, item.selectedColor)
                        }
                        className="p-1 hover:bg-gray-200 rounded-full transition-colors"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>

                    <button
                      onClick={() => onRemoveItem(item.product.id, item.selectedSize, item.selectedColor)}
                      className="p-2 hover:bg-red-100 text-red-500 rounded-full transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          {items.length > 0 && (
            <div className="border-t p-6">
              <div className="flex items-center justify-between mb-4">
                <span className="text-lg font-semibold text-gray-900">
                  Total:
                </span>
                <span className="text-2xl font-bold text-indigo-600">
                  {formatPrice(total)}
                </span>
              </div>

              <button
                onClick={handleCheckout} // Usar a função handleCheckout
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors duration-200"
              >
                Finalizar Compra
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Cart;