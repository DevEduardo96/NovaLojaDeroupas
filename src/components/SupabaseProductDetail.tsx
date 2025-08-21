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
  AlertCircle,
} from "lucide-react";
import { productService, type ProductWithVariations, type ProductVariation } from "../lib/supabase";
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
  const [product, setProduct] = useState<ProductWithVariations | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [addedToCart, setAddedToCart] = useState(false);
  const [selectedSize, setSelectedSize] = useState("");
  const [selectedColor, setSelectedColor] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState("description");
  const [, setImageError] = useState(false);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [stockCheck, setStockCheck] = useState<boolean>(true);
  const [checkingStock, setCheckingStock] = useState(false);

  usePayments();

  useEffect(() => {
    if (productId) {
      loadProduct(productId);
    }
  }, [productId]);

  useEffect(() => {
    // Check stock when size or color changes
    if (product && (selectedSize || selectedColor)) {
      checkStock();
    }
  }, [selectedSize, selectedColor, product]);

  const loadProduct = async (id: number) => {
    try {
      setLoading(true);
      setError(null);
      console.log("Loading product with ID:", id); // Debug log
      
      const productData = await productService.getProductById(id);
      console.log("Loaded product data:", productData); // Debug log

      if (!productData) {
        setError("Produto não encontrado");
        return;
      }

      setProduct(productData);
      
      // Debug logs para verificar as variações
      console.log("Product colors:", productData.colors);
      console.log("Product sizes:", productData.sizes);
      
      // Set default selections - com verificação mais robusta
      if (productData.colors && Array.isArray(productData.colors) && productData.colors.length > 0) {
        console.log("Setting default color:", productData.colors[0].name);
        setSelectedColor(productData.colors[0].name);
      } else {
        console.log("No colors available");
      }
      
      if (productData.sizes && Array.isArray(productData.sizes) && productData.sizes.length > 0) {
        // Try to select "M" as default, or first available
        const mediumSize = productData.sizes.find(s => s.name === "M");
        const defaultSize = mediumSize ? mediumSize.name : productData.sizes[0].name;
        console.log("Setting default size:", defaultSize);
        setSelectedSize(defaultSize);
      } else {
        console.log("No sizes available");
      }
    } catch (err) {
      console.error("Error loading product:", err);
      setError(err instanceof Error ? err.message : "Erro ao carregar produto");
    } finally {
      setLoading(false);
    }
  };

  const checkStock = async () => {
    if (!product) return;
    
    setCheckingStock(true);
    try {
      const hasStock = await productService.checkVariationStock(
        product.id,
        selectedSize,
        selectedColor
      );
      setStockCheck(hasStock);
    } catch (error) {
      console.error("Error checking stock:", error);
      setStockCheck(false);
    } finally {
      setCheckingStock(false);
    }
  };

  const getSelectedVariationStock = (): number => {
    if (!product) return 0;
    
    let stock = 0;
    
    if (selectedSize && product.sizes && Array.isArray(product.sizes)) {
      const sizeVariation = product.sizes.find(s => s.name === selectedSize);
      if (sizeVariation) {
        stock = Math.min(stock || sizeVariation.stock_quantity, sizeVariation.stock_quantity);
      }
    }
    
    if (selectedColor && product.colors && Array.isArray(product.colors)) {
      const colorVariation = product.colors.find(c => c.name === selectedColor);
      if (colorVariation) {
        stock = stock ? Math.min(stock, colorVariation.stock_quantity) : colorVariation.stock_quantity;
      }
    }
    
    return stock;
  };

  const calculatePrice = (): number => {
    if (!product) return 0;
    
    let finalPrice = product.price;
    
    // Add price modifiers from selected variations
    if (selectedSize && product.sizes && Array.isArray(product.sizes)) {
      const sizeVariation = product.sizes.find(s => s.name === selectedSize);
      if (sizeVariation && sizeVariation.price_modifier) {
        finalPrice += sizeVariation.price_modifier;
      }
    }
    
    if (selectedColor && product.colors && Array.isArray(product.colors)) {
      const colorVariation = product.colors.find(c => c.name === selectedColor);
      if (colorVariation && colorVariation.price_modifier) {
        finalPrice += colorVariation.price_modifier;
      }
    }
    
    return Math.max(0, finalPrice); // Ensure price is never negative
  };

  const handleAddToCart = () => {
    if (product && onAddToCart && selectedSize && selectedColor && stockCheck) {
      const productWithVariations = {
        ...product,
        selectedSize,
        selectedColor,
        quantity,
        finalPrice: calculatePrice()
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

  const renderColorOption = (color: ProductVariation) => {
    const isSelected = selectedColor === color.name;
    const isOutOfStock = color.stock_quantity <= 0;
    
    return (
      <button
        key={color.id}
        onClick={() => {
          if (!isOutOfStock) {
            console.log("Color selected:", color.name); // Debug log
            setSelectedColor(color.name);
          }
        }}
        disabled={isOutOfStock}
        className={`relative w-10 h-10 rounded-full border-2 transition-all ${
          isSelected
            ? 'border-purple-500 ring-2 ring-purple-200'
            : isOutOfStock
            ? 'border-gray-300 opacity-50 cursor-not-allowed'
            : 'border-gray-300 hover:border-gray-400'
        }`}
        style={{ backgroundColor: color.value || '#cccccc' }}
        title={`${color.name} - ${isOutOfStock ? 'Indisponível' : `${color.stock_quantity} disponível`}`}
      >
        {(color.value === '#FFFFFF' || color.value === 'white') && (
          <div className="w-full h-full rounded-full border border-gray-200"></div>
        )}
        {isOutOfStock && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-6 h-0.5 bg-red-500 rotate-45"></div>
          </div>
        )}
      </button>
    );
  };

  const renderSizeOption = (size: ProductVariation) => {
    const isSelected = selectedSize === size.name;
    const isOutOfStock = size.stock_quantity <= 0;
    
    return (
      <button
        key={size.id}
        onClick={() => {
          if (!isOutOfStock) {
            console.log("Size selected:", size.name); // Debug log
            setSelectedSize(size.name);
          }
        }}
        disabled={isOutOfStock}
        className={`py-2 px-3 rounded-lg border text-sm font-medium transition-colors relative ${
          isSelected
            ? 'border-purple-500 bg-purple-50 text-purple-700'
            : isOutOfStock
            ? 'border-gray-300 bg-gray-100 text-gray-400 cursor-not-allowed'
            : 'border-gray-300 hover:border-gray-400'
        }`}
        title={`Tamanho ${size.name} - ${isOutOfStock ? 'Indisponível' : `${size.stock_quantity} disponível`}`}
      >
        {size.name}
        {isOutOfStock && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-4 h-0.5 bg-red-500 rotate-45"></div>
          </div>
        )}
      </button>
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

  // Generate image gallery
  const productImages =
    product && product.images && product.images.length > 0
      ? product.images
      : [product?.image_url || "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=600&h=600&fit=crop"];

  const finalPrice = calculatePrice();
  const selectedStock = getSelectedVariationStock();
  const maxQuantity = Math.min(selectedStock, 10); // Limit to 10 or available stock

  // Debug logs para verificar se as variações existem antes de renderizar
  console.log("Before render - Colors:", product.colors);
  console.log("Before render - Sizes:", product.sizes);

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
                    -{Math.round((1 - finalPrice / product.original_price) * 100)}% OFF
                  </span>
                )}
                {!stockCheck && (
                  <span className="bg-red-500 text-white text-sm px-3 py-1 rounded-full font-medium">
                    Indisponível
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
                    {formatPrice(finalPrice)}
                  </span>
                  {product.original_price && finalPrice !== product.price && (
                    <span className="text-lg text-gray-400 line-through">
                      {formatPrice(product.price)}
                    </span>
                  )}
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
                {selectedStock > 0 && (
                  <p className="text-gray-600 text-sm flex items-center mt-1">
                    <Package className="w-4 h-4 mr-1 text-blue-500" />
                    {selectedStock} disponível{selectedStock > 1 ? 's' : ''} em estoque
                  </p>
                )}
              </div>
            </div>

            {/* Product Options */}
            <div className="bg-white rounded-2xl p-6 shadow-xl space-y-6">
              {/* Debug info - remover em produção */}
           

              {/* Color Selection */}
              {product.colors && Array.isArray(product.colors) && product.colors.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">
                    Cor: <span className="font-normal">{selectedColor || 'Selecione uma cor'}</span>
                  </h3>
                  <div className="flex flex-wrap gap-3">
                    {product.colors.map(renderColorOption)}
                  </div>
                </div>
              )}

              {/* Size Selection */}
              {product.sizes && Array.isArray(product.sizes) && product.sizes.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-lg font-semibold text-gray-900">
                      Tamanho: <span className="font-normal">{selectedSize || 'Selecione um tamanho'}</span>
                    </h3>
                    <button className="text-sm text-purple-600 hover:text-purple-700 flex items-center">
                      <Ruler className="w-4 h-4 mr-1" />
                      Guia de tamanhos
                    </button>
                  </div>
                  <div className="grid grid-cols-6 gap-3">
                    {product.sizes.map(renderSizeOption)}
                  </div>
                </div>
              )}

              {/* Fallback message se não houver variações */}
              {(!product.colors || product.colors.length === 0) && (!product.sizes || product.sizes.length === 0) && (
                <div className="text-center py-4 text-gray-500">
                  <p>Este produto não possui variações de cor ou tamanho disponíveis.</p>
                </div>
              )}

              {/* Stock Status */}
              {checkingStock ? (
                <div className="flex items-center space-x-2 text-gray-600">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span className="text-sm">Verificando disponibilidade...</span>
                </div>
              ) : !stockCheck && (selectedSize || selectedColor) ? (
                <div className="flex items-center space-x-2 text-red-600 bg-red-50 p-3 rounded-lg">
                  <AlertCircle className="w-4 h-4" />
                  <span className="text-sm">
                    Combinação indisponível. Tente outras opções.
                  </span>
                </div>
              ) : null}

              {/* Quantity */}
              {stockCheck && selectedSize && selectedColor && (
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
                        onClick={() => setQuantity(Math.min(maxQuantity, quantity + 1))}
                        className="p-2 hover:bg-gray-100 rounded-r-lg"
                        disabled={quantity >= maxQuantity}
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                    <span className="text-gray-600 text-sm">
                      {quantity > 1 && `Total: ${formatPrice(finalPrice * quantity)}`}
                      {maxQuantity < 10 && (
                        <span className="block text-orange-600">
                          Máx: {maxQuantity} unidades
                        </span>
                      )}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="bg-white rounded-2xl p-6 shadow-xl">
              <Button
                onClick={handleAddToCart}
                disabled={addedToCart || !selectedSize || !selectedColor || !stockCheck || selectedStock <= 0}
                className="w-full h-14 text-lg font-semibold bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 transform hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                {addedToCart ? (
                  <>
                    <CheckCircle className="w-5 h-5 mr-2" />
                    Adicionado ao Carrinho!
                  </>
                ) : !stockCheck || selectedStock <= 0 ? (
                  <>
                    <AlertCircle className="w-5 h-5 mr-2" />
                    Indisponível
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
                          ? "border-purple-600 text-purple-600"
                          : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                      }`}
                    >
                      <Icon className="w-4 h-4 mr-1" />
                      {label}
                    </button>
                  ))}
                </nav>
              </div>
            </div>

            {/* Tab Content */}
            <div className="p-6">
              {activeTab === "description" && (
                <div className="prose max-w-none">
                  <p>{product.description || "Sem descrição disponível para este produto."}</p>
                </div>
              )}

              {activeTab === "details" && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-gray-700">
                  <div>
                    <p><strong>Categoria:</strong> {product.category || "N/A"}</p>
                    <p><strong>Marca:</strong> {product.brand || "N/A"}</p>
                  </div>
                  <div>
                    <p><strong>Código do produto:</strong> #{product.id}</p>
                    <p><strong>Disponibilidade:</strong> {selectedStock > 0 ? "Em estoque" : "Indisponível"}</p>
                  </div>
                </div>
              )}

              {activeTab === "sizing" && (
                <div className="text-sm text-gray-700">
                  <p className="mb-2">Confira abaixo as medidas aproximadas:</p>
                  <ul className="list-disc pl-5 space-y-1">
                    <li>P: 90-96 cm de busto</li>
                    <li>M: 96-102 cm de busto</li>
                    <li>G: 102-110 cm de busto</li>
                    <li>GG: 110-118 cm de busto</li>
                  </ul>
                  <p className="mt-3 text-gray-500 text-xs">* As medidas podem variar dependendo do modelo.</p>
                </div>
              )}

              {activeTab === "reviews" && (
                <div className="space-y-4">
                  {/* Exemplo de review fixa, pode ser substituída por dados do Supabase */}
                  <div className="border-b pb-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-1">
                        {renderStars(5)}
                        <span className="text-sm text-gray-500">(5/5)</span>
                      </div>
                      <span className="text-xs text-gray-400">há 2 dias</span>
                    </div>
                    <p className="text-gray-700 text-sm">Ótima qualidade, chegou super rápido e bem embalado. Recomendo!</p>
                    <p className="mt-1 text-xs text-gray-500">– Ana Paula</p>
                  </div>
                  <div className="border-b pb-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-1">
                        {renderStars(4)}
                        <span className="text-sm text-gray-500">(4/5)</span>
                      </div>
                      <span className="text-xs text-gray-400">há 1 semana</span>
                    </div>
                    <p className="text-gray-700 text-sm">Produto bom, mas a cor é um pouco diferente da foto.</p>
                    <p className="mt-1 text-xs text-gray-500">– João Silva</p>
                  </div>
                  <Button variant="outline" className="mt-4">
                    Ver mais avaliações
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
