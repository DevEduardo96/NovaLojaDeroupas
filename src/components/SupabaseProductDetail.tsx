
import React, { useState, useEffect } from "react";
import {
  ArrowLeft,
  Star,
  ShoppingCart,
  Heart,
  Share2,
  Loader2,
  CheckCircle,
  Download,
  Shield,
  Clock,
  Users,
  FileText,
  Monitor,
  Smartphone,
  Tablet,
  Play,
  ExternalLink,
  Zap,
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
  const [hasPurchased, setHasPurchased] = useState(false);
  const [downloadLinks, setDownloadLinks] = useState<string[]>([]);
  const [checkingPurchase, setCheckingPurchase] = useState(false);
  const [activeTab, setActiveTab] = useState("description");
  const [imageError, setImageError] = useState(false);

  const { hasUserPurchasedProduct, getProductDownloadLinks } = usePayments();

  useEffect(() => {
    if (productId) {
      loadProduct(productId);
    }
  }, [productId]);

  useEffect(() => {
    if (product && productId) {
      checkPurchaseStatus();
    }
  }, [product, productId]);

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
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao carregar produto");
      console.error("Error loading product:", err);
    } finally {
      setLoading(false);
    }
  };

  const checkPurchaseStatus = async () => {
    if (!productId) return;

    try {
      setCheckingPurchase(true);
      const purchased = await hasUserPurchasedProduct(productId);
      setHasPurchased(purchased);

      if (purchased) {
        const links = await getProductDownloadLinks(productId);
        setDownloadLinks(links);
      }
    } catch (err) {
      console.error("Error checking purchase status:", err);
    } finally {
      setCheckingPurchase(false);
    }
  };

  const handleAddToCart = () => {
    if (product && onAddToCart) {
      onAddToCart(product);
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

  const handleDownload = (link: string) => {
    window.open(link, '_blank');
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
      Programação: "bg-blue-100 text-blue-800 border-blue-200",
      Design: "bg-purple-100 text-purple-800 border-purple-200",
      Templates: "bg-green-100 text-green-800 border-green-200",
      Marketing: "bg-orange-100 text-orange-800 border-orange-200",
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
              <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
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
                <FileText className="h-16 w-16 mx-auto mb-4 opacity-50" />
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
              <span className="text-gray-900 font-medium truncate max-w-[200px]">
                {product.name}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Product Image Section */}
          <div className="space-y-6">
            <div className="relative bg-white rounded-2xl overflow-hidden shadow-xl">
              <img
                src={imageError 
                  ? "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=600&h=400&fit=crop"
                  : product.image_url
                }
                alt={product.name || "Produto"}
                className="w-full h-80 sm:h-96 object-cover"
                onError={handleImageError}
              />
              
              {/* Badges */}
              <div className="absolute top-4 left-4 flex flex-wrap gap-2">
                {product.category && (
                  <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getCategoryColor(product.category)}`}>
                    {product.category}
                  </span>
                )}
                {hasPurchased && (
                  <span className="bg-green-600 text-white text-sm px-3 py-1 rounded-full flex items-center shadow-lg">
                    <CheckCircle className="w-4 h-4 mr-1" />
                    Comprado
                  </span>
                )}
              </div>

              {/* Preview Button */}
              <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-10 transition-all duration-300 flex items-center justify-center opacity-0 hover:opacity-100">
                <Button variant="secondary" className="bg-white/90 hover:bg-white">
                  <Play className="w-4 h-4 mr-2" />
                  Preview
                </Button>
              </div>
            </div>

            {/* Trust Indicators */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[
                { icon: Shield, text: "Compra Segura", color: "text-green-500" },
                { icon: Download, text: "Download Imediato", color: "text-blue-500" },
                { icon: Clock, text: "Acesso Vitalício", color: "text-purple-500" },
                { icon: Users, text: "Suporte Incluso", color: "text-orange-500" },
              ].map(({ icon: Icon, text, color }, index) => (
                <div key={index} className="flex items-center space-x-2 text-sm text-gray-600 bg-white rounded-lg p-3 shadow-sm">
                  <Icon className={`w-4 h-4 ${color} flex-shrink-0`} />
                  <span className="font-medium">{text}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Product Information */}
          <div className="space-y-8">
            {/* Header */}
            <div className="bg-white rounded-2xl p-6 shadow-xl">
              <div className="flex items-start justify-between mb-4">
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 leading-tight">
                  {product.name}
                </h1>
                <div className="flex space-x-2 ml-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsWishlisted(!isWishlisted)}
                    className="p-2"
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
                    className="p-2"
                  >
                    <Share2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* Rating and Stats */}
              <div className="flex flex-wrap items-center gap-4 mb-6">
                <div className="flex items-center space-x-1">
                  {renderStars(4.8)}
                  <span className="text-sm font-medium text-gray-700 ml-2">4.8</span>
                </div>
                <span className="text-gray-500 text-sm">127 avaliações</span>
                <div className="flex items-center text-gray-500 text-sm">
                  <Download className="w-4 h-4 mr-1" />
                  1.2k downloads
                </div>
              </div>

              {/* Price */}
              <div className="border-t border-gray-200 pt-6">
                <div className="flex items-baseline space-x-3 mb-2">
                  <span className="text-3xl sm:text-4xl font-bold text-blue-600">
                    {formatPrice(product.price)}
                  </span>
                  {product.original_price && (
                    <span className="text-lg text-gray-400 line-through">
                      {formatPrice(product.original_price)}
                    </span>
                  )}
                  {product.original_price && (
                    <span className="bg-red-100 text-red-800 text-sm px-2 py-1 rounded-full font-medium">
                      -{Math.round((1 - product.price / product.original_price) * 100)}%
                    </span>
                  )}
                </div>
                <p className="text-gray-600 text-sm flex items-center">
                  <Zap className="w-4 h-4 mr-1 text-yellow-500" />
                  Produto digital • Download imediato
                </p>
              </div>
            </div>

            {/* Actions */}
            {!hasPurchased ? (
              <div className="bg-white rounded-2xl p-6 shadow-xl">
                <Button
                  onClick={handleAddToCart}
                  disabled={addedToCart}
                  className="w-full h-14 text-lg font-semibold bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 transform hover:scale-105 transition-all duration-200"
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
                
                <div className="mt-4 text-center">
                  <p className="text-sm text-gray-500 flex items-center justify-center space-x-4">
                    <span className="flex items-center">
                      <Shield className="w-4 h-4 mr-1 text-green-500" />
                      Pagamento seguro
                    </span>
                    <span>•</span>
                    <span className="flex items-center">
                      <Clock className="w-4 h-4 mr-1 text-blue-500" />
                      7 dias de garantia
                    </span>
                  </p>
                </div>
              </div>
            ) : (
              /* Download Section */
              downloadLinks.length > 0 && (
                <div className="bg-white rounded-2xl p-6 shadow-xl">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <Download className="w-5 h-5 mr-2 text-green-500" />
                    Seus Downloads
                  </h3>
                  <div className="space-y-3">
                    {downloadLinks.map((link, index) => (
                      <Button
                        key={index}
                        onClick={() => handleDownload(link)}
                        variant="outline"
                        className="w-full justify-between group"
                      >
                        <span className="flex items-center">
                          <FileText className="w-4 h-4 mr-2" />
                          Download {index + 1}
                        </span>
                        <ExternalLink className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                      </Button>
                    ))}
                  </div>
                </div>
              )
            )}
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
                    { id: "features", label: "O que inclui", icon: CheckCircle },
                    { id: "requirements", label: "Requisitos", icon: Monitor },
                    { id: "reviews", label: "Avaliações", icon: Star },
                  ].map(({ id, label, icon: Icon }) => (
                    <button
                      key={id}
                      onClick={() => setActiveTab(id)}
                      className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap transition-colors ${
                        activeTab === id
                          ? "border-blue-500 text-blue-600"
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
                        "Este produto digital foi cuidadosamente desenvolvido para atender às suas necessidades. Com design moderno e funcionalidades avançadas, oferece uma solução completa e profissional."
                      }
                    </p>
                  </div>
                </div>
              )}

              {activeTab === "features" && (
                <div className="space-y-6">
                  <h3 className="text-xl font-semibold text-gray-900">
                    O que você vai receber:
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[
                      "Arquivos em alta qualidade",
                      "Múltiplos formatos disponíveis",
                      "Documentação completa",
                      "Suporte técnico incluso",
                      "Atualizações gratuitas",
                      "Licença para uso comercial",
                    ].map((feature, index) => (
                      <div key={index} className="flex items-center space-x-3">
                        <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                        <span className="text-gray-700">{feature}</span>
                      </div>
                    ))}
                  </div>

                  <div className="mt-8 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6">
                    <h4 className="font-semibold text-gray-900 mb-4 flex items-center">
                      <FileText className="w-5 h-5 mr-2 text-blue-600" />
                      Especificações Técnicas
                    </h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div>
                        <span className="text-blue-700 font-medium block">Formato:</span>
                        <p className="text-gray-700">Múltiplos</p>
                      </div>
                      <div>
                        <span className="text-blue-700 font-medium block">Tamanho:</span>
                        <p className="text-gray-700">25 MB</p>
                      </div>
                      <div>
                        <span className="text-blue-700 font-medium block">Licença:</span>
                        <p className="text-gray-700">Comercial</p>
                      </div>
                      <div>
                        <span className="text-blue-700 font-medium block">Atualizado:</span>
                        <p className="text-gray-700">Dez 2024</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "requirements" && (
                <div className="space-y-6">
                  <h3 className="text-xl font-semibold text-gray-900">
                    Requisitos do Sistema
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {[
                      {
                        icon: Monitor,
                        title: "Desktop",
                        color: "text-blue-500",
                        requirements: [
                          "Windows 10+ ou macOS 10.15+",
                          "4GB RAM mínimo",
                          "500MB espaço livre"
                        ]
                      },
                      {
                        icon: Tablet,
                        title: "Tablet", 
                        color: "text-green-500",
                        requirements: [
                          "iOS 14+ ou Android 8+",
                          "2GB RAM mínimo",
                          "Tela 9\" ou maior"
                        ]
                      },
                      {
                        icon: Smartphone,
                        title: "Mobile",
                        color: "text-purple-500", 
                        requirements: [
                          "iOS 13+ ou Android 7+",
                          "1GB RAM mínimo",
                          "100MB espaço livre"
                        ]
                      }
                    ].map(({ icon: Icon, title, color, requirements }, index) => (
                      <div key={index} className="bg-white rounded-xl border-2 border-gray-100 p-6 hover:border-gray-200 transition-colors">
                        <Icon className={`w-8 h-8 ${color} mb-3`} />
                        <h4 className="font-semibold text-gray-900 mb-3">{title}</h4>
                        <ul className="text-sm text-gray-600 space-y-2">
                          {requirements.map((req, idx) => (
                            <li key={idx} className="flex items-start">
                              <CheckCircle className="w-4 h-4 text-green-400 mr-2 mt-0.5 flex-shrink-0" />
                              {req}
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
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
                      <span className="text-gray-600">(127 avaliações)</span>
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
