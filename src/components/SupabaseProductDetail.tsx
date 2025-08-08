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
        // Fallback to clipboard
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Button variant="ghost" onClick={onBack} className="mb-6">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            <span className="ml-2 text-gray-600">Carregando produto...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Button variant="ghost" onClick={onBack} className="mb-6">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
          <div className="text-center py-12">
            <div className="text-red-600 mb-4">
              <p className="text-lg font-semibold">Produto não encontrado</p>
              <p className="text-sm">{error}</p>
            </div>
            <Button onClick={onBack} variant="outline">
              Voltar aos produtos
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <Button variant="ghost" onClick={onBack} className="mb-6">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar aos produtos
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Product Image */}
          <div className="space-y-4">
            <div className="relative bg-white rounded-2xl overflow-hidden shadow-lg">
              <img
                src={product.image_url}
                alt={product.name || "Produto"}
                className="w-full h-96 object-cover"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src =
                    "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=600&h=400&fit=crop";
                }}
              />
              <div className="absolute top-4 left-4">
                <span className="bg-blue-600 text-white text-sm px-3 py-1 rounded-full">
                  {product.category}
                </span>
              </div>
              {hasPurchased && (
                <div className="absolute top-4 right-4">
                  <span className="bg-green-600 text-white text-sm px-3 py-1 rounded-full flex items-center">
                    <CheckCircle className="w-4 h-4 mr-1" />
                    Comprado
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Product Information */}
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {product.name}
              </h1>
              <div className="flex items-center space-x-2 mb-4">
                <div className="flex items-center">
                  {Array.from({ length: 5 }, (_, i) => (
                    <Star
                      key={i}
                      className={`w-5 h-5 ${
                        i < 4 ? "text-yellow-400 fill-current" : "text-gray-300"
                      }`}
                    />
                  ))}
                </div>
                <span className="text-gray-600 text-sm">
                  (4.8) • 127 avaliações
                </span>
              </div>
            </div>

            {/* Price */}
            <div className="border-t border-b border-gray-200 py-6">
              <div className="text-4xl font-bold text-blue-600 mb-2">
                {formatPrice(product.price)}
              </div>
              {product.original_price && (
                <div className="text-lg text-red-500 line-through mb-2">
                  {formatPrice(product.original_price)}
                </div>
              )}
              <p className="text-gray-600">
                Produto digital • Download imediato
              </p>
            </div>

            {/* Description */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                Descrição
              </h3>
              <p className="text-gray-600 leading-relaxed">
                {product.description}
              </p>
            </div>

            {/* Features */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                O que você recebe:
              </h3>
              <ul className="space-y-2">
                <li className="flex items-center text-gray-600">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-2 flex-shrink-0" />
                  Acesso imediato após a compra
                </li>
                <li className="flex items-center text-gray-600">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-2 flex-shrink-0" />
                  Suporte técnico incluso, exceto para planilhas.
                </li>
                <li className="flex items-center text-gray-600">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-2 flex-shrink-0" />
                  Atualizações gratuitas
                </li>
              </ul>
            </div>

            {/* Download Links (if purchased) */}
            {hasPurchased && downloadLinks.length > 0 && (
              <div className="border-t border-gray-200 pt-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  Links de Download
                </h3>
                <div className="space-y-2">
                  {downloadLinks.map((link, index) => (
                    <Button
                      key={index}
                      onClick={() => handleDownload(link)}
                      variant="outline"
                      className="w-full justify-start"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Download {index + 1}
                    </Button>
                  ))}
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="space-y-4">
              {!hasPurchased ? (
                <div className="flex space-x-3">
                  <Button
                    onClick={handleAddToCart}
                    disabled={addedToCart}
                    className="flex-1 h-12 text-lg"
                  >
                    {addedToCart ? (
                      <>
                        <CheckCircle className="w-5 h-5 mr-2" />
                        Adicionado!
                      </>
                    ) : (
                      <>
                        <ShoppingCart className="w-5 h-5 mr-2" />
                        Adicionar ao Carrinho
                      </>
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setIsWishlisted(!isWishlisted)}
                    className="h-12 px-4"
                  >
                    <Heart
                      className={`w-5 h-5 ${
                        isWishlisted ? "fill-current text-red-500" : ""
                      }`}
                    />
                  </Button>
                  <Button
                    variant="outline"
                    onClick={handleShare}
                    className="h-12 px-4"
                  >
                    <Share2 className="w-5 h-5" />
                  </Button>
                </div>
              ) : (
                <div className="flex space-x-3">
                  <Button
                    variant="outline"
                    onClick={() => setIsWishlisted(!isWishlisted)}
                    className="h-12 px-4"
                  >
                    <Heart
                      className={`w-5 h-5 ${
                        isWishlisted ? "fill-current text-red-500" : ""
                      }`}
                    />
                  </Button>
                  <Button
                    variant="outline"
                    onClick={handleShare}
                    className="h-12 px-4"
                  >
                    <Share2 className="w-5 h-5" />
                  </Button>
                </div>
              )}

              <div className="text-center">
                <p className="text-sm text-gray-500">
                  💳 Pagamento seguro • 🚀 Download imediato • 🔒 7 dias de
                  garantia
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
