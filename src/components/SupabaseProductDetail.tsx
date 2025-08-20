import React, { useState, useEffect } from "react";
import {
  ArrowLeft,
  Star,
  ShoppingCart,
  Heart,
  Share2,
  Loader2,
  CheckCircle,
  Shield,
  Clock,
  Users,
  FileText,
  Truck,
  RotateCcw,
  Ruler,
  Package,
  Award,
  Zap,
  Plus,
  Minus,
} from "lucide-react";
import { productService } from "../lib/supabase";
import type { Product } from "../types";
import { formatPrice, shareContent } from "../lib/utils";
import { usePayments } from "../hooks/usePayments";
import { Button } from "./ui/Button";

interface SupabaseProductDetailProps {
  productId: number | null;
  onBack: () => void;
  onAddToCart?: (product: Product) => void;
}

export const SupabaseProductDetail: React.FC<SupabaseProductDetailProps> = ({
  productId,
  onBack,
  onAddToCart,
}) => {
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [addedToCart, setAddedToCart] = useState(false);
  const [selectedSize, setSelectedSize] = useState("");
  const [selectedColor, setSelectedColor] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState("description");
  const [imageError, setImageError] = useState(false);
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  const { hasUserPurchasedProduct } = usePayments();

  // Dados de exemplo para tamanhos e cores (podem vir do produto)
  const sizes = ["XS", "S", "M", "L", "XL", "XXL"];
  const colors = [
    { name: "Preto", code: "#000000" },
    { name: "Branco", code: "#FFFFFF" },
    { name: "Azul Marinho", code: "#1e3a8a" },
    { name: "Vermelho", code: "#dc2626" },
    { name: "Verde", code: "#059669" },
  ];

  // URLs de exemplo para galeria de imagens
  const getProductImages = (baseUrl: string) => [
    baseUrl,
    baseUrl.replace('400', '500'),
    baseUrl.replace('400', '600'),
    baseUrl.replace('400', '700'),
  ];

  useEffect(() => {
    if (productId) {
      loadProduct(productId);
    }
  }, [productId]);

  const loadProduct = async (id: number) => {
    try {
      setLoading(true);
      setError(null);
      const productData = await productService.getProductById(id);

      if (!productData) {
        setError("Produto não encontrado");
        return;
      }

      setProduct(productData);
      // Definir cor e tamanho padrão
      if (colors.length > 0) setSelectedColor(colors[0].name);
      if (sizes.length > 0) setSelectedSize(sizes[2]); // M como padrão
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao carregar produto");
      console.error("Error loading product:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = () => {
    if (product && onAddToCart && selectedSize && selectedColor) {
      // Criar produto com variações selecionadas
      const productWithVariations = {
        ...product,
        selectedSize,
        selectedColor,
        quantity
      };
      onAddToCart(productWithVariations);
      setAddedToCart(true);
      setTimeout(() => setAddedToCart(false), 2000);
    }
  };

  const handleShare = async () => {
    if (product) {
      const success = await shareContent({
        title: product.name,
        text: product.description,
        url: window.location.href,
      });
      
      if (!success) {
        try {
          await navigator.clipboard.writeText(window.location.href);
        } catch (err) {
          console.error("Error copying to clipboard:", err);
        }
      }
    }
  };

  const handleImageError = () => {
    setImageError(true);
  };

  const renderStars = (rating: number = 4.8) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${
          i < Math.floor(rating)
            ? "text-yellow-400 fill-current"
            : "text-gray-300"
        }`}
      />
    ));
  };

  const getCategoryColor = (category?: string) => {
    const colors = {
      Roupas: "bg-purple-100 text-purple-800 border-purple-200",
      Acessórios: "bg-pink-100 text-pink-800 border-pink-200",
      Calçados: "bg-blue-100 text-blue-800 border-blue-200",
      Bolsas: "bg-orange-100 text-orange-800 border-orange-200",
    };
    return (
      colors[category as keyof typeof colors] || "bg-gray-100 text-gray-800 border-gray-200"
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Button variant="ghost" onClick={onBack} className="mb-6 hover:bg-white/50">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <Loader2 className="h-12 w-12 animate-spin text-purple-600 mx-auto mb-4" />
              <p className="text-gray-600 text-lg">Carregando produto...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Button variant="ghost" onClick={onBack} className="mb-6 hover:bg-white/50">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
          <div className="text-center py-20">
            <div className="bg-white rounded-2xl p-12 shadow-lg max-w-md mx-auto">
              <div className="text-red-600 mb-6">
                <Package className="h-16 w-16 mx-auto mb-4 opacity-50" />
                <p className="text-xl font-semibold mb-2">Produto não encontrado</p>
                <p className="text-sm text-gray-600">{error}</p>
              </div>
              <Button onClick={onBack} className="w-full">
                Voltar aos produtos
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const productImages = getProductImages(imageError 
    ? "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=600&h=600&fit=crop"
    : product.image_url
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header with breadcrumb */}
      <div className="bg-white/80 backdrop-blur-sm shadow-sm border-b sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Button variant="ghost" onClick={onBack} className="hover:bg-gray-100">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar aos produtos
            </Button>
            <div className="hidden sm:flex items-center space-x-2 text-sm text-gray-600">
              <span>Produtos</span>
              <span>/</span>
              <span>{product.category}</span>
              <span>/</span>
              <span className="text-gray-900 font-medium truncate max-w-[200px]">
                {product.name}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Product Images Section */}
          <div className="space-y-6">
            {/* Main Image */}
            <div className="relative bg-white rounded-2xl overflow-hidden shadow-xl">
              <img
                src={productImages[activeImageIndex]}
                alt={product.name || "Produto"}
                className="w-full h-96 sm:h-[500px] object-cover"
                onError={handleImageError}
              />
              
              {/* Badges */}
              <div className="absolute top-4 left-4 flex flex-wrap gap-2">
                {product.category && (
                  <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getCategoryColor(product.category)}`}>
                    {product.category}
                  </span>
                )}
                {product.original_price && (
                  <span className="bg-red-500 text-white text-sm px-3 py-1 rounded-full font-medium">
                    -{Math.round((1 - product.price / product.original_price) * 100)}% OFF
                  </span>
                )}
              </div>

              {/* Wishlist and Share */}
              <div className="absolute top-4 right-4 flex flex-col space-y-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsWishlisted(!isWishlisted)}
                  className="p-2 bg-white/90 hover:bg-white"
                >
                  <Heart
                    className={`w-4 h-4 ${
                      isWishlisted ? "fill-current text-red-500" : "text-gray-400"
                    }`}
                  />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleShare}
                  className="p-2 bg-white/90 hover:bg-white"
                >
                  <Share2 className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Image Thumbnails */}
            <div className="grid grid-cols-4 gap-3">
              {productImages.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setActiveImageIndex(index)}
                  className={`relative rounded-lg overflow-hidden aspect-square ${
                    activeImageIndex === index 
                      ? 'ring-2 ring-purple-500' 
                      : 'ring-1 ring-gray-200 hover:ring-gray-300'
                  }`}
                >
                  <img
                    src={image}
                    alt={`${product.name} - Imagem ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>

            {/* Trust Indicators */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[
                { icon: Shield, text: "Compra Segura", color: "text-green-500" },
                { icon: Truck, text: "Frete Grátis", color: "text-blue-500" },
                { icon: RotateCcw, text: "7 Dias para Trocar", color: "text-purple-500" },
                { icon: Award, text: "Qualidade Premium", color: "text-orange-500" },
              ].map(({ icon: Icon, text, color }, index) => (
                <div key={index} className="flex items-center space-x-2 text-sm text-gray-600 bg-white rounded-lg p-3 shadow-sm">
                  <Icon className={`w-4 h-4 ${color} flex-shrink-0`} />
                  <span className="font-medium">{text}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Product Information */}
          <div className="space-y-6">
            {/* Header */}
            <div className="bg-white rounded-2xl p-6 shadow-xl">
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 leading-tight mb-4">
                {product.name}
              </h1>

              {/* Rating and Stats */}
              <div className="flex flex-wrap items-center gap-4 mb-6">
                <div className="flex items-center space-x-1">
                  {renderStars(4.8)}
                  <span className="text-sm font-medium text-gray-700 ml-2">4.8</span>
                </div>
                <span className="text-gray-500 text-sm">89 avaliações</span>
                <div className="flex items-center text-gray-500 text-sm">
                  <Users className="w-4 h-4 mr-1" />
                  256 vendidos
                </div>
              </div>

              {/* Price */}
              <div className="border-t border-gray-200 pt-6">
                <div className="flex items-baseline space-x-3 mb-2">
                  <span className="text-3xl sm:text-4xl font-bold text-purple-600">
                    {formatPrice(product.price)}
                  </span>
                  {product.original_price && (
                    <span className="text-lg text-gray-400 line-through">
                      {formatPrice(product.original_price)}
                    </span>
                  )}
                </div>
                <p className="text-gray-600 text-sm flex items-center">
                  <Zap className="w-4 h-4 mr-1 text-yellow-500" />
                  Frete grátis para compras acima de R$ 200
                </p>
              </div>
            </div>

            {/* Product Options */}
            <div className="bg-white rounded-2xl p-6 shadow-xl space-y-6">
              {/* Color Selection */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  Cor: <span className="font-normal">{selectedColor}</span>
                </h3>
                <div className="flex flex-wrap gap-3">
                  {colors.map(({ name, code }) => (
                    <button
                      key={name}
                      onClick={() => setSelectedColor(name)}
                      className={`w-10 h-10 rounded-full border-2 transition-all ${
                        selectedColor === name
                          ? 'border-purple-500 ring-2 ring-purple-200'
                          : 'border-gray-300 hover:border-gray-400'
                      }`}
                      style={{ backgroundColor: code }}
                      title={name}
                    >
                      {code === '#FFFFFF' && (
                        <div className="w-full h-full rounded-full border border-gray-200"></div>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Size Selection */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Tamanho: <span className="font-normal">{selectedSize}</span>
                  </h3>
                  <button className="text-sm text-purple-600 hover:text-purple-700 flex items-center">
                    <Ruler className="w-4 h-4 mr-1" />
                    Guia de tamanhos
                  </button>
                </div>
                <div className="grid grid-cols-6 gap-3">
                  {sizes.map((size) => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`py-2 px-3 rounded-lg border text-sm font-medium transition-colors ${
                        selectedSize === size
                          ? 'border-purple-500 bg-purple-50 text-purple-700'
                          : 'border-gray-300 hover:border-gray-400'
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>

              {/* Quantity */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Quantidade</h3>
                <div className="flex items-center space-x-3">
                  <div className="flex items-center border border-gray-300 rounded-lg">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="p-2 hover:bg-gray-100 rounded-l-lg"
                      disabled={quantity <= 1}
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="px-4 py-2 font-medium">{quantity}</span>
                    <button
                      onClick={() => setQuantity(quantity + 1)}
                      className="p-2 hover:bg-gray-100 rounded-r-lg"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                  <span className="text-gray-600 text-sm">
                    {quantity > 1 && `Total: ${formatPrice(product.price * quantity)}`}
                  </span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="bg-white rounded-2xl p-6 shadow-xl">
              <Button
                onClick={handleAddToCart}
                disabled={addedToCart || !selectedSize || !selectedColor}
                className="w-full h-14 text-lg font-semibold bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 transform hover:scale-105 transition-all duration-200"
              >
                {addedToCart ? (
                  <>
                    <CheckCircle className="w-5 h-5 mr-2" />
                    Adicionado ao Carrinho!
                  </>
                ) : (
                  <>
                    <ShoppingCart className="w-5 h-5 mr-2" />
                    Adicionar ao Carrinho
                  </>
                )}
              </Button>
              
              {(!selectedSize || !selectedColor) && (
                <p className="mt-2 text-sm text-red-600 text-center">
                  Selecione cor e tamanho antes de adicionar ao carrinho
                </p>
              )}
              
              <div className="mt-4 text-center">
                <p className="text-sm text-gray-500 flex items-center justify-center space-x-4">
                  <span className="flex items-center">
                    <Shield className="w-4 h-4 mr-1 text-green-500" />
                    Compra protegida
                  </span>
                  <span>•</span>
                  <span className="flex items-center">
                    <Clock className="w-4 h-4 mr-1 text-blue-500" />
                    Entrega em 5-7 dias
                  </span>
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Detailed Information Tabs */}
        <div className="mt-12">
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
            {/* Tab Navigation */}
            <div className="border-b border-gray-200">
              <div className="overflow-x-auto">
                <nav className="flex space-x-8 px-6">
                  {[
                    { id: "description", label: "Descrição", icon: FileText },
                    { id: "details", label: "Detalhes do Produto", icon: Package },
                    { id: "sizing", label: "Tamanhos e Medidas", icon: Ruler },
                    { id: "reviews", label: "Avaliações", icon: Star },
                  ].map(({ id, label, icon: Icon }) => (
                    <button
                      key={id}
                      onClick={() => setActiveTab(id)}
                      className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap transition-colors ${
                        activeTab === id
                          ? "border-purple-500 text-purple-600"
                          : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span>{label}</span>
                    </button>
                  ))}
                </nav>
              </div>
            </div>

            {/* Tab Content */}
            <div className="p-6">
              {activeTab === "description" && (
                <div className="prose max-w-none">
                  <div className="text-gray-700 leading-relaxed space-y-4">
                    <p className="text-lg">
                      {product.description || 
                        "Peça versátil e elegante, perfeita para diversas ocasiões. Confeccionada com materiais de alta qualidade, oferece conforto e estilo únicos. Design moderno que se adapta ao seu guarda-roupa."
                      }
                    </p>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h4 className="font-semibold text-gray-900 mb-2">Características principais:</h4>
                      <ul className="text-gray-700 space-y-1">
                        <li>• Material premium e durável</li>
                        <li>• Design contemporâneo e versátil</li>
                        <li>• Conforto excepcional</li>
                        <li>• Fácil manutenção e cuidado</li>
                      </ul>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "details" && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <h3 className="text-xl font-semibold text-gray-900">Especificações</h3>
                      <div className="space-y-3">
                        <div className="flex justify-between py-2 border-b border-gray-100">
                          <span className="text-gray-600">Material:</span>
                          <span className="font-medium">100% Algodão</span>
                        </div>
                        <div className="flex justify-between py-2 border-b border-gray-100">
                          <span className="text-gray-600">Origem:</span>
                          <span className="font-medium">Nacional</span>
                        </div>
                        <div className="flex justify-between py-2 border-b border-gray-100">
                          <span className="text-gray-600">Cuidados:</span>
                          <span className="font-medium">Máquina 30°C</span>
                        </div>
                        <div className="flex justify-between py-2 border-b border-gray-100">
                          <span className="text-gray-600">Modelo:</span>
                          <span className="font-medium">Regular Fit</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <h3 className="text-xl font-semibold text-gray-900">Informações de Entrega</h3>
                      <div className="space-y-3">
                        <div className="flex items-center space-x-3">
                          <Truck className="w-5 h-5 text-blue-500" />
                          <span>Frete grátis para compras acima de R$ 200</span>
                        </div>
                        <div className="flex items-center space-x-3">
                          <Clock className="w-5 h-5 text-green-500" />
                          <span>Entrega em 5-7 dias úteis</span>
                        </div>
                        <div className="flex items-center space-x-3">
                          <RotateCcw className="w-5 h-5 text-purple-500" />
                          <span>7 dias para trocas e devoluções</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "sizing" && (
                <div className="space-y-6">
                  <h3 className="text-xl font-semibold text-gray-900">Guia de Tamanhos</h3>
                  
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse border border-gray-300">
                      <thead>
                        <tr className="bg-gray-50">
                          <th className="border border-gray-300 px-4 py-2 text-left">Tamanho</th>
                          <th className="border border-gray-300 px-4 py-2 text-left">Busto (cm)</th>
                          <th className="border border-gray-300 px-4 py-2 text-left">Cintura (cm)</th>
                          <th className="border border-gray-300 px-4 py-2 text-left">Quadril (cm)</th>
                        </tr>
                      </thead>
                      <tbody>
                        {[
                          { size: "XS", bust: "80-84", waist: "60-64", hip: "86-90" },
                          { size: "S", bust: "84-88", waist: "64-68", hip: "90-94" },
                          { size: "M", bust: "88-92", waist: "68-72", hip: "94-98" },
                          { size: "L", bust: "92-96", waist: "72-76", hip: "98-102" },
                          { size: "XL", bust: "96-100", waist: "76-80", hip: "102-106" },
                          { size: "XXL", bust: "100-104", waist: "80-84", hip: "106-110" },
                        ].map((row) => (
                          <tr key={row.size} className="hover:bg-gray-50">
                            <td className="border border-gray-300 px-4 py-2 font-medium">{row.size}</td>
                            <td className="border border-gray-300 px-4 py-2">{row.bust}</td>
                            <td className="border border-gray-300 px-4 py-2">{row.waist}</td>
                            <td className="border border-gray-300 px-4 py-2">{row.hip}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  
                  <div className="bg-blue-50 rounded-lg p-4">
                    <h4 className="font-semibold text-blue-900 mb-2 flex items-center">
                      <Ruler className="w-5 h-5 mr-2" />
                      Como medir
                    </h4>
                    <ul className="text-blue-800 text-sm space-y-1">
                      <li><strong>Busto:</strong> Meça na parte mais larga do busto</li>
                      <li><strong>Cintura:</strong> Meça na parte mais fina da cintura</li>
                      <li><strong>Quadril:</strong> Meça na parte mais larga do quadril</li>
                    </ul>
                  </div>
                </div>
              )}

              {activeTab === "reviews" && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xl font-semibold text-gray-900">
                      Avaliações dos Clientes
                    </h3>
                    <div className="flex items-center space-x-2">
                      {renderStars(4.8)}
                      <span className="text-lg font-semibold">4.8</span>
                      <span className="text-gray-600">(89 avaliações)</span>
                    </div>
                  </div>
                  
                  <div className="text-center py-8">
                    <Star className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">
                      As avaliações dos clientes serão exibidas aqui em breve.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
   </div>
  );
};

export default SupabaseProductDetail;