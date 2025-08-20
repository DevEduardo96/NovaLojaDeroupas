
import React, { useState, useEffect } from "react";
import { ArrowLeft, ShoppingCart, Heart, Star, Loader2, Plus, Minus, Download } from "lucide-react";
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

export default function SupabaseProductDetail({
  productId,
  onBack,
  onAddToCart,
}: SupabaseProductDetailProps) {
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedColor, setSelectedColor] = useState<string>("");
  const [selectedSize, setSelectedSize] = useState<string>("");
  const [quantity, setQuantity] = useState(1);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [activeTab, setActiveTab] = useState("description");
  
  const { user } = useAuth();
  const { toggleFavorite, isFavorite } = useFavorites();

  // Mock data for colors and sizes - you can make this dynamic later
  const availableColors = ["Azul", "Vermelho", "Preto", "Branco"];
  const availableSizes = ["P", "M", "G", "GG"];

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        setError(null);
        const productData = await productService.getProduct(productId);
        
        if (productData) {
          setProduct(productData);
          // Set default selections
          if (availableColors.length > 0) {
            setSelectedColor(availableColors[0]);
          }
          if (availableSizes.length > 0) {
            setSelectedSize(availableSizes[0]);
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

    if (productId) {
      fetchProduct();
    }
  }, [productId]);

  const handleAddToCart = async () => {
    if (!product) return;

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
      console.error("Error adding to cart:", error);
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

  const incrementQuantity = () => {
    setQuantity(prev => prev + 1);
  };

  const decrementQuantity = () => {
    setQuantity(prev => Math.max(1, prev - 1));
  };

  const renderStars = (rating: number = 4.8) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-5 h-5 ${
          i < Math.floor(rating)
            ? "text-yellow-400 fill-current"
            : "text-gray-300"
        }`}
      />
    ));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex items-center space-x-3">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          <span className="text-lg text-gray-600">Carregando produto...</span>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="mb-4">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <X className="w-8 h-8 text-red-600" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Produto não encontrado</h2>
            <p className="text-gray-600">{error || "O produto solicitado não existe ou foi removido."}</p>
          </div>
          <Button onClick={onBack} variant="outline">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar aos produtos
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
          className="inline-flex items-center text-blue-600 hover:text-blue-500 mb-8 transition-colors"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          <span className="font-medium">Voltar aos produtos</span>
        </button>

        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">
            {/* Product Images */}
            <div className="relative">
              <div className="aspect-square bg-gradient-to-br from-gray-100 to-gray-200 overflow-hidden">
                <img
                  src={product.image_url || "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=600&h=600&fit=crop"}
                  alt={product.name}
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=600&h=600&fit=crop";
                  }}
                />
              </div>
              
              {/* Category Badge */}
              {product.category && (
                <div className="absolute top-6 left-6">
                  <span className="bg-white/90 backdrop-blur-sm text-gray-800 px-4 py-2 rounded-full text-sm font-medium shadow-lg">
                    {product.category}
                  </span>
                </div>
              )}

              {/* Favorite Button */}
              <button
                onClick={handleFavoriteToggle}
                className={`absolute top-6 right-6 p-3 rounded-full transition-all shadow-lg ${
                  isFavorite(product.id)
                    ? "bg-red-500 text-white"
                    : "bg-white/90 backdrop-blur-sm text-gray-600 hover:text-red-500"
                }`}
              >
                <Heart className="w-5 h-5" fill={isFavorite(product.id) ? "currentColor" : "none"} />
              </button>
            </div>

            {/* Product Details */}
            <div className="p-8 lg:p-12">
              <div className="space-y-6">
                {/* Title and Rating */}
                <div>
                  <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
                    {product.name}
                  </h1>
                  
                  <div className="flex items-center space-x-4 mb-6">
                    <div className="flex items-center">
                      {renderStars(4.8)}
                      <span className="ml-2 text-sm text-gray-600">
                        (4.8) • 127 avaliações
                      </span>
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <Download className="w-4 h-4 mr-1" />
                      1,234 downloads
                    </div>
                  </div>
                </div>

                {/* Price */}
                <div className="space-y-2">
                  <div className="text-4xl font-bold text-blue-600">
                    {formatPrice(product.price)}
                  </div>
                  {product.original_price && product.original_price > product.price && (
                    <div className="flex items-center space-x-2">
                      <span className="text-lg text-gray-500 line-through">
                        {formatPrice(product.original_price)}
                      </span>
                      <span className="bg-green-100 text-green-800 text-sm font-medium px-2 py-1 rounded">
                        {Math.round(((product.original_price - product.price) / product.original_price) * 100)}% OFF
                      </span>
                    </div>
                  )}
                </div>

                {/* Colors Section */}
                <div className="space-y-3">
                  <h3 className="text-lg font-semibold text-gray-900">Escolha a Cor</h3>
                  <div className="flex flex-wrap gap-3">
                    {availableColors.map((color) => (
                      <button
                        key={color}
                        onClick={() => setSelectedColor(color)}
                        className={`px-4 py-2 rounded-lg border-2 transition-all font-medium ${
                          selectedColor === color
                            ? "border-blue-500 bg-blue-50 text-blue-700"
                            : "border-gray-300 text-gray-700 hover:border-gray-400 hover:bg-gray-50"
                        }`}
                      >
                        {color}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Sizes Section */}
                <div className="space-y-3">
                  <h3 className="text-lg font-semibold text-gray-900">Escolha o Tamanho</h3>
                  <div className="flex flex-wrap gap-3">
                    {availableSizes.map((size) => (
                      <button
                        key={size}
                        onClick={() => setSelectedSize(size)}
                        className={`px-4 py-2 rounded-lg border-2 transition-all font-medium min-w-[3rem] ${
                          selectedSize === size
                            ? "border-blue-500 bg-blue-50 text-blue-700"
                            : "border-gray-300 text-gray-700 hover:border-gray-400 hover:bg-gray-50"
                        }`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Quantity Section */}
                <div className="space-y-3">
                  <h3 className="text-lg font-semibold text-gray-900">Quantidade</h3>
                  <div className="flex items-center space-x-4">
                    <button
                      onClick={decrementQuantity}
                      className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="text-xl font-semibold w-12 text-center">{quantity}</span>
                    <button
                      onClick={incrementQuantity}
                      className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Add to Cart Button */}
                <div className="space-y-4 pt-4">
                  <Button
                    onClick={handleAddToCart}
                    disabled={isAddingToCart}
                    className="w-full py-4 text-lg font-semibold bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg"
                  >
                    {isAddingToCart ? (
                      <>
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                        Adicionando...
                      </>
                    ) : (
                      <>
                        <ShoppingCart className="w-5 h-5 mr-2" />
                        Adicionar ao Carrinho
                      </>
                    )}
                  </Button>

                  {/* Features */}
                  <div className="grid grid-cols-2 gap-4 text-sm text-gray-600 pt-4">
                    <div className="flex items-center">
                      <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                      Compra protegida
                    </div>
                    <div className="flex items-center">
                      <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                      Download imediato
                    </div>
                    <div className="flex items-center">
                      <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                      Suporte técnico
                    </div>
                    <div className="flex items-center">
                      <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                      Acesso vitalício
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Product Details Tabs */}
          <div className="border-t border-gray-200">
            <div className="flex border-b border-gray-200">
              {["description", "specifications", "reviews"].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-6 py-4 text-sm font-medium transition-colors ${
                    activeTab === tab
                      ? "text-blue-600 border-b-2 border-blue-600"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  {tab === "description" && "Descrição"}
                  {tab === "specifications" && "Especificações"}
                  {tab === "reviews" && "Avaliações"}
                </button>
              ))}
            </div>

            <div className="p-8">
              {activeTab === "description" && (
                <div className="prose max-w-none">
                  <p className="text-gray-700 leading-relaxed text-lg">
                    {product.description || "Este é um produto incrível que vai transformar sua experiência. Com qualidade premium e design moderno, oferece tudo que você precisa para alcançar seus objetivos."}
                  </p>
                </div>
              )}

              {activeTab === "specifications" && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <dt className="font-medium text-gray-900">Categoria</dt>
                      <dd className="text-gray-700">{product.category}</dd>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <dt className="font-medium text-gray-900">Formato</dt>
                      <dd className="text-gray-700">Digital</dd>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <dt className="font-medium text-gray-900">Cores Disponíveis</dt>
                      <dd className="text-gray-700">{availableColors.join(", ")}</dd>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <dt className="font-medium text-gray-900">Tamanhos</dt>
                      <dd className="text-gray-700">{availableSizes.join(", ")}</dd>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "reviews" && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold">Avaliações dos clientes</h3>
                    <div className="flex items-center">
                      {renderStars(4.8)}
                      <span className="ml-2 text-sm text-gray-600">4.8 de 5.0</span>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    {[1, 2, 3].map((review) => (
                      <div key={review} className="border-b border-gray-200 pb-4">
                        <div className="flex items-center mb-2">
                          <div className="flex items-center">
                            {renderStars(5)}
                          </div>
                          <span className="ml-2 text-sm font-medium">Cliente #{review}</span>
                        </div>
                        <p className="text-gray-700">
                          Produto excelente! Superou minhas expectativas. Recomendo para todos.
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export { SupabaseProductDetail };
