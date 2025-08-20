
import React, { useState, useEffect } from "react";
import { ArrowLeft, ShoppingCart, Heart, Star, Loader2, Plus, Minus } from "lucide-react";
import { productService } from "../lib/supabase";
import { formatPrice } from "../lib/utils";
import { useAuth } from "../contexts/AuthContext";
import { useFavorites } from "../contexts/FavoritesContext";
import type { Product, CartItem } from "../types";
import { Button } from "./ui/Button";
import toast from "react-hot-toast";

interface SupabaseProductDetailProps {
  productId: number;
  onBack: () => void;
  onAddToCart: (item: CartItem) => void;
}

export const SupabaseProductDetail: React.FC<SupabaseProductDetailProps> = ({
  productId,
  onBack,
  onAddToCart,
}) => {
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedColor, setSelectedColor] = useState<string>("");
  const [selectedSize, setSelectedSize] = useState<string>("");
  const [quantity, setQuantity] = useState(1);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  
  const { user } = useAuth();
  const { toggleFavorite, isFavorite } = useFavorites();

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const productData = await productService.getProduct(productId);
        if (productData) {
          setProduct(productData);
          // Set default selections
          if (productData.colors && productData.colors.length > 0) {
            setSelectedColor(productData.colors[0]);
          }
          if (productData.sizes && productData.sizes.length > 0) {
            setSelectedSize(productData.sizes[0]);
          }
        } else {
          setError("Produto não encontrado");
        }
      } catch (err) {
        setError("Erro ao carregar produto");
        console.error("Error fetching product:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [productId]);

  const handleAddToCart = async () => {
    if (!product) return;

    // Validate required selections
    if (product.colors && product.colors.length > 0 && !selectedColor) {
      toast.error("Selecione uma cor");
      return;
    }

    if (product.sizes && product.sizes.length > 0 && !selectedSize) {
      toast.error("Selecione um tamanho");
      return;
    }

    setIsAddingToCart(true);
    try {
      const cartItem: CartItem = {
        product,
        quantity,
        selectedColor: selectedColor || undefined,
        selectedSize: selectedSize || undefined,
      };

      onAddToCart(cartItem);
      toast.success("Produto adicionado ao carrinho!");
    } catch (error) {
      toast.error("Erro ao adicionar produto ao carrinho");
    } finally {
      setIsAddingToCart(false);
    }
  };

  const handleFavoriteToggle = async () => {
    if (!user) {
      toast.error("Faça login para favoritar produtos");
      return;
    }
    
    if (product) {
      await toggleFavorite(product.id);
    }
  };

  const canAddToCart = () => {
    if (!product) return false;
    
    // Check if color is required and selected
    if (product.colors && product.colors.length > 0 && !selectedColor) {
      return false;
    }
    
    // Check if size is required and selected
    if (product.sizes && product.sizes.length > 0 && !selectedSize) {
      return false;
    }
    
    return true;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex items-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          <span className="ml-2 text-gray-600">Carregando produto...</span>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">{error || "Produto não encontrado"}</p>
          <Button onClick={onBack} variant="outline">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <button
          onClick={onBack}
          className="inline-flex items-center text-blue-600 hover:text-blue-500 mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar aos produtos
        </button>

        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Product Images */}
            <div className="p-6">
              <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden mb-4">
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              </div>
              
              {/* Thumbnail images if available */}
              {product.images && product.images.length > 1 && (
                <div className="grid grid-cols-4 gap-2">
                  {product.images.slice(0, 4).map((image, index) => (
                    <div key={index} className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                      <img
                        src={image}
                        alt={`${product.name} ${index + 1}`}
                        className="w-full h-full object-cover cursor-pointer hover:opacity-75"
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Product Details */}
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <h1 className="text-3xl font-bold text-gray-900">{product.name}</h1>
                <button
                  onClick={handleFavoriteToggle}
                  className={`p-2 rounded-full transition-colors ${
                    isFavorite(product.id)
                      ? "text-red-500 bg-red-50"
                      : "text-gray-400 hover:text-red-500 hover:bg-red-50"
                  }`}
                >
                  <Heart className="h-6 w-6" fill={isFavorite(product.id) ? "currentColor" : "none"} />
                </button>
              </div>

              {/* Rating */}
              <div className="flex items-center mb-4">
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`h-5 w-5 ${
                        i < Math.floor(product.rating || 0)
                          ? "text-yellow-400 fill-current"
                          : "text-gray-300"
                      }`}
                    />
                  ))}
                </div>
                <span className="ml-2 text-gray-600">
                  {product.rating?.toFixed(1)} ({product.reviews || 0} avaliações)
                </span>
              </div>

              {/* Price */}
              <div className="mb-6">
                <span className="text-3xl font-bold text-gray-900">
                  {formatPrice(product.price)}
                </span>
                {product.originalPrice && product.originalPrice > product.price && (
                  <span className="ml-2 text-lg text-gray-500 line-through">
                    {formatPrice(product.originalPrice)}
                  </span>
                )}
              </div>

              {/* Description */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Descrição</h3>
                <p className="text-gray-600 leading-relaxed">{product.description}</p>
              </div>

              {/* Colors Section */}
              {product.colors && product.colors.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Escolha a Cor</h3>
                  <div className="flex flex-wrap gap-2">
                    {product.colors.map((color) => (
                      <button
                        key={color}
                        onClick={() => setSelectedColor(color)}
                        className={`px-4 py-2 rounded-lg border-2 transition-all ${
                          selectedColor === color
                            ? "border-blue-500 bg-blue-50 text-blue-700"
                            : "border-gray-300 text-gray-700 hover:border-gray-400"
                        }`}
                      >
                        {color}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Sizes Section */}
              {product.sizes && product.sizes.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Escolha o Tamanho</h3>
                  <div className="flex flex-wrap gap-2">
                    {product.sizes.map((size) => (
                      <button
                        key={size}
                        onClick={() => setSelectedSize(size)}
                        className={`px-4 py-2 rounded-lg border-2 transition-all ${
                          selectedSize === size
                            ? "border-blue-500 bg-blue-50 text-blue-700"
                            : "border-gray-300 text-gray-700 hover:border-gray-400"
                        }`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Quantity */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Quantidade</h3>
                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50"
                  >
                    <Minus className="h-4 w-4" />
                  </button>
                  <span className="text-xl font-semibold w-12 text-center">{quantity}</span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Add to Cart Button */}
              <Button
                onClick={handleAddToCart}
                disabled={!canAddToCart() || isAddingToCart}
                className={`w-full py-3 text-lg font-semibold ${
                  canAddToCart() && !isAddingToCart
                    ? "bg-blue-600 hover:bg-blue-700 text-white"
                    : "bg-gray-300 text-gray-500 cursor-not-allowed"
                }`}
              >
                {isAddingToCart ? (
                  <>
                    <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                    Adicionando...
                  </>
                ) : (
                  <>
                    <ShoppingCart className="h-5 w-5 mr-2" />
                    Adicionar ao Carrinho
                  </>
                )}
              </Button>

              {/* Selection requirement message */}
              {!canAddToCart() && (
                <p className="text-sm text-red-600 mt-2 text-center">
                  Selecione cor e tamanho antes de adicionar ao carrinho
                </p>
              )}

              {/* Features */}
              <div className="mt-8 grid grid-cols-2 gap-4 text-sm text-gray-600">
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                  Compra protegida
                </div>
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                  Entrega em 5-7 dias
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
