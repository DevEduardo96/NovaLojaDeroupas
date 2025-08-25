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
import { productService, reviewService, type ProductWithVariations, type ProductVariation as SupabaseProductVariation } from "../lib/supabase";
import type { Product, ProductVariation } from "../types"; // Ensure ProductVariation from types is imported
import { formatPrice, shareContent } from "../lib/utils";
import { usePayments } from "../hooks/usePayments";
import { Button } from "./ui/Button";
import ProductVariationSelector from "./ProductVariationSelector"; // Import the new selector component
import ProductReviews from "./ProductReviews";

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
  const [product, setProduct] = useState<ProductWithVariations | null>(null); // Use the more specific type
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [addedToCart, setAddedToCart] = useState(false);
  const [productRating, setProductRating] = useState({ average: 4.8, total: 89 });
  // Removed old selectedSize and selectedColor states, as they will be managed by ProductVariationSelector
  const [activeTab, setActiveTab] = useState("description");
  const [, setImageError] = useState(false);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  // Removed stockCheck and checkingStock states, as they will be managed by ProductVariationSelector
  const [selectedVariations, setSelectedVariations] = useState<{
    size?: SupabaseProductVariation; // Use the type from supabase service
    color?: SupabaseProductVariation; // Use the type from supabase service
    totalPrice: number;
    inStock: boolean;
    quantity: number;
  }>({
    totalPrice: 0,
    inStock: true,
    quantity: 1, // Initialize quantity
  });

  usePayments();

  useEffect(() => {
    if (productId) {
      loadProduct(productId);
    }
  }, [productId]);

  // The logic for checking stock and updating UI based on selections is now handled within ProductVariationSelector.
  // We only need to update `selectedVariations` when the selector reports changes.

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

      // Initialize selectedVariations with default values or the first available variation
      let initialVariations = {
        totalPrice: productData.price,
        inStock: true,
        quantity: 1,
      };

      if (productData.colors && Array.isArray(productData.colors) && productData.colors.length > 0) {
        const defaultColor = productData.colors[0];
        initialVariations.color = defaultColor;
        // If price_modifier exists for color, apply it
        if (defaultColor.price_modifier) {
          initialVariations.totalPrice += defaultColor.price_modifier;
        }
      }

      if (productData.sizes && Array.isArray(productData.sizes) && productData.sizes.length > 0) {
        const defaultSize = productData.sizes[0]; // Default to the first size
        initialVariations.size = defaultSize;
        // If price_modifier exists for size, apply it
        if (defaultSize.price_modifier) {
          initialVariations.totalPrice += defaultSize.price_modifier;
        }
      }

      // Check initial stock
      if (initialVariations.size && initialVariations.color) {
        const hasStock = await productService.checkVariationStock(
          productData.id,
          initialVariations.size.name,
          initialVariations.color.name
        );
        initialVariations.inStock = hasStock;
      } else {
        // If no variations are selected yet, assume it's in stock if the base product is available
        initialVariations.inStock = true; // Or check a general stock field if available
      }

      setSelectedVariations(initialVariations);

      // Carregar estatísticas de avaliação
      try {
        const ratingStats = await reviewService.getProductRatingStats(productData.id);
        setProductRating({
          average: ratingStats.averageRating || 4.8,
          total: ratingStats.totalReviews || 89
        });
      } catch (ratingError) {
        console.error("Error loading rating stats:", ratingError);
        // Manter valores padrão em caso de erro
      }

    } catch (err) {
      console.error("Error loading product:", err);
      setError(err instanceof Error ? err.message : "Erro ao carregar produto");
    } finally {
      setLoading(false);
    }
  };

  // The logic for checking stock and updating UI based on selections is now handled within ProductVariationSelector.
  // We only need to update `selectedVariations` when the selector reports changes.

  const handleAddToCart = () => {
    if (product && selectedVariations.inStock && selectedVariations.size && selectedVariations.color) {
      const productWithVariations = {
        ...product,
        price: selectedVariations.totalPrice, // Use the calculated price
        selectedSize: selectedVariations.size?.name,
        selectedColor: selectedVariations.color?.name,
        quantity: selectedVariations.quantity, // Use the selected quantity
        variationInfo: {
          size: selectedVariations.size,
          color: selectedVariations.color,
        }
      };
      onAddToCart?.(productWithVariations); // Call the prop with the enriched product
      setAddedToCart(true);
      setTimeout(() => setAddedToCart(false), 2000);
    } else if (!selectedVariations.inStock) {
      // This case might be handled by the button being disabled, but a toast can be a fallback.
      console.log("Attempted to add out-of-stock item.");
    } else if (!selectedVariations.size || !selectedVariations.color) {
      console.log("Attempted to add with incomplete variations.");
      // Optionally show a message to select variations
    }
  };

  const handleShare = async () => {
    if (product) {
      const shareUrl = `${window.location.origin}/products/${product.id}`; // Construct a shareable URL
      const success = await shareContent({
        title: product.name,
        text: `Confira este produto: ${product.name}!`,
        url: shareUrl,
      });

      if (!success) {
        try {
          await navigator.clipboard.writeText(shareUrl);
          toast.success("Link copiado para a área de transferência!");
        } catch (err) {
          console.error("Error copying to clipboard:", err);
          toast.error("Falha ao copiar link.");
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

  // Removed renderColorOption and renderSizeOption as they are now part of ProductVariationSelector

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

  const finalPrice = selectedVariations.totalPrice || product.price; // Use calculated price, fallback to base price
  const selectedStock = selectedVariations.size && selectedVariations.color
    ? (selectedVariations.size.stock_quantity && selectedVariations.color.stock_quantity
        ? Math.min(selectedVariations.size.stock_quantity, selectedVariations.color.stock_quantity)
        : selectedVariations.size.stock_quantity || selectedVariations.color.stock_quantity || 0) // Handle cases where one might be undefined
    : 0; // If variations aren't selected, stock is effectively 0 for selection purposes

  const maxQuantity = Math.min(selectedStock, 10); // Limit to 10 or available stock

  // Removed debug logs related to old selection states

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
                {product.original_price && finalPrice !== product.price && ( // Show discount if price changed
                  <span className="bg-red-500 text-white text-sm px-3 py-1 rounded-full font-medium">
                    -{Math.round((1 - finalPrice / product.price) * 100)}% OFF
                  </span>
                )}
                {!selectedVariations.inStock && ( // Show out of stock based on selected variations
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
                  {renderStars(productRating.average)}
                  <span className="text-sm font-medium text-gray-700 ml-2">{productRating.average.toFixed(1)}</span>
                </div>
                <span className="text-gray-500 text-sm">{productRating.total} avaliações</span>
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
              {/* Variation Selector Component */}
              <div className="mb-6">
                <ProductVariationSelector
                  productId={product.id}
                  basePrice={product.price}
                  initialVariations={{
                    size: product.sizes?.[0], // Pass initial size if available
                    color: product.colors?.[0], // Pass initial color if available
                  }}
                  onVariationChange={setSelectedVariations}
                  // Pass available variations to the selector
                  availableSizes={product.sizes}
                  availableColors={product.colors}
                />
              </div>

              {/* Quantity Selector (conditionally rendered) */}
              {selectedVariations.size && selectedVariations.color && selectedVariations.inStock && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Quantidade</h3>
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center border border-gray-300 rounded-lg">
                      <button
                        onClick={() => setSelectedVariations(prev => ({ ...prev, quantity: Math.max(1, prev.quantity - 1) }))}
                        className="p-2 hover:bg-gray-100 rounded-l-lg"
                        disabled={selectedVariations.quantity <= 1}
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="px-4 py-2 font-medium">{selectedVariations.quantity}</span>
                      <button
                        onClick={() => setSelectedVariations(prev => ({ ...prev, quantity: Math.min(maxQuantity, prev.quantity + 1) }))}
                        className="p-2 hover:bg-gray-100 rounded-r-lg"
                        disabled={selectedVariations.quantity >= maxQuantity}
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                    <span className="text-gray-600 text-sm">
                      {selectedVariations.quantity > 1 && `Total: ${formatPrice(finalPrice * selectedVariations.quantity)}`}
                      {maxQuantity < 10 && selectedStock < 10 && ( // Show max only if actual stock is limited and less than 10
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
                disabled={addedToCart || !selectedVariations.size || !selectedVariations.color || !selectedVariations.inStock}
                className={`w-full h-14 text-lg font-semibold ${
                  addedToCart
                    ? 'bg-green-500 hover:bg-green-600 text-white'
                    : selectedVariations.inStock && selectedVariations.size && selectedVariations.color
                      ? 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 transform hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                {addedToCart ? (
                  <>
                    <CheckCircle className="w-5 h-5 mr-2" />
                    Adicionado ao Carrinho!
                  </>
                ) : !selectedVariations.size || !selectedVariations.color ? (
                  <>
                    <AlertCircle className="w-5 h-5 mr-2" />
                    Selecione as opções
                  </>
                ) : !selectedVariations.inStock ? (
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

              {!selectedVariations.size || !selectedVariations.color && (
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
                    <p><strong>Disponibilidade:</strong> {selectedVariations.inStock ? "Em estoque" : "Indisponível"}</p>
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
                <ProductReviews 
                  productId={product.id} 
                  productName={product.name} 
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};