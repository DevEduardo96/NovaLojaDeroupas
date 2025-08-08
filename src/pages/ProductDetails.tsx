import React, { useState } from "react";
import {
  ArrowLeft,
  Star,
  Download,
  Shield,
  Clock,
  FileText,
  Users,
  Heart,
  Share2,
  Play,
  CheckCircle,
  Monitor,
  Smartphone,
  Tablet,
  Tag,
  ShoppingCart,
} from "lucide-react";
import { Product } from "../types";

interface ProductDetailsProps {
  product: Product;
  onBack: () => void;
  onAddToCart: (product: Product) => void;
}

export const ProductDetails: React.FC<ProductDetailsProps> = ({
  product,
  onBack,
  onAddToCart,
}) => {
  const [selectedImage, setSelectedImage] = useState(0);
  const [activeTab, setActiveTab] = useState("description");
  const [isWishlisted, setIsWishlisted] = useState(false);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(price);
  };

  const getCategoryColor = (category?: string) => {
    const colors = {
      Programação: "bg-blue-100 text-blue-800",
      Design: "bg-purple-100 text-purple-800",
      Templates: "bg-green-100 text-green-800",
      Marketing: "bg-orange-100 text-orange-800",
    };
    return (
      colors[category as keyof typeof colors] || "bg-gray-100 text-gray-800"
    );
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

  // Para produtos que podem ter múltiplas imagens (usar a mesma imagem como fallback)
  const images = [product.image_url, product.image_url, product.image_url];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <button
            onClick={onBack}
            className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Voltar aos produtos
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Galeria de Imagens */}
          <div className="space-y-4">
            <div className="relative bg-white rounded-2xl overflow-hidden shadow-lg">
              <img
                src={images[selectedImage]}
                alt={product.name}
                className="w-full h-96 object-cover"
              />
              <button className="absolute top-4 right-4 p-2 bg-white bg-opacity-90 rounded-full hover:bg-opacity-100 transition-all">
                <Play className="w-5 h-5 text-gray-700" />
              </button>
            </div>

            {images.length > 1 && (
              <div className="flex space-x-2 overflow-x-auto pb-2">
                {images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${
                      selectedImage === index
                        ? "border-blue-500 ring-2 ring-blue-200"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <img
                      src={image}
                      alt={`Preview ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Informações do Produto */}
          <div className="space-y-6">
            <div>
              <div className="flex items-center justify-between mb-4">
                {product.category && (
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-medium ${getCategoryColor(
                      product.category
                    )}`}
                  >
                    {product.category}
                  </span>
                )}
                <div className="flex space-x-2">
                  <button
                    onClick={() => setIsWishlisted(!isWishlisted)}
                    className={`p-2 rounded-full transition-all ${
                      isWishlisted
                        ? "bg-red-100 text-red-600"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}
                  >
                    <Heart
                      className={`w-5 h-5 ${
                        isWishlisted ? "fill-current" : ""
                      }`}
                    />
                  </button>
                  <button className="p-2 bg-gray-100 text-gray-600 rounded-full hover:bg-gray-200 transition-all">
                    <Share2 className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <h1 className="text-3xl font-bold text-gray-900 mb-4">
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
                  1234 downloads
                </div>
              </div>

              <div className="text-4xl font-bold text-indigo-600 mb-6">
                {formatPrice(product.price)}
              </div>

              <button
                onClick={() => onAddToCart(product)}
                className="w-full flex items-center justify-center space-x-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 shadow-lg"
              >
                <ShoppingCart className="w-6 h-6" />
                <span>Adicionar ao Carrinho</span>
              </button>

              <div className="grid grid-cols-2 gap-4 mt-6">
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <Shield className="w-4 h-4 text-green-500" />
                  <span>Compra Segura</span>
                </div>
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <Download className="w-4 h-4 text-blue-500" />
                  <span>Download Imediato</span>
                </div>
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <Clock className="w-4 h-4 text-orange-500" />
                  <span>Acesso Vitalício</span>
                </div>
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <Users className="w-4 h-4 text-purple-500" />
                  <span>Suporte Incluído</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs de Informações */}
        <div className="mt-16">
          <div className="border-b border-gray-200">
            <div className="overflow-x-auto scroll-smooth scrollbar-thin scrollbar-thumb-blue-500 scrollbar-track-transparent">
              <nav className="flex whitespace-nowrap space-x-4 sm:space-x-8 px-1">
                {[
                  { id: "description", label: "Descrição", icon: FileText },
                  {
                    id: "features",
                    label: "Características",
                    icon: CheckCircle,
                  },
                  { id: "requirements", label: "Requisitos", icon: Monitor },
                  { id: "reviews", label: "Avaliações", icon: Star },
                ].map(({ id, label, icon: Icon }) => (
                  <button
                    key={id}
                    onClick={() => setActiveTab(id)}
                    className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
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

          <div className="py-8">
            {activeTab === "description" && (
              <div className="prose max-w-none">
                <p className="text-lg text-gray-700 leading-relaxed mb-6">
                  {product.description ||
                    "Este produto digital foi cuidadosamente desenvolvido para atender às suas necessidades. Com design moderno e funcionalidades avançadas, oferece uma solução completa e profissional."}
                </p>
              </div>
            )}

            {activeTab === "features" && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  O que está incluído:
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    "Arquivos em alta resolução",
                    "Múltiplos formatos disponíveis",
                    "Documentação completa",
                    "Suporte técnico",
                    "Atualizações gratuitas",
                    "Licença comercial",
                  ].map((feature, index) => (
                    <div key={index} className="flex items-center space-x-3">
                      <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                      <span className="text-gray-700">{feature}</span>
                    </div>
                  ))}
                </div>

                <div className="mt-8 p-6 bg-blue-50 rounded-lg">
                  <h4 className="font-semibold text-blue-900 mb-2">
                    Informações Técnicas
                  </h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="text-blue-700 font-medium">
                        Formato:
                      </span>
                      <p className="text-blue-800">Múltiplos</p>
                    </div>
                    <div>
                      <span className="text-blue-700 font-medium">
                        Tamanho:
                      </span>
                      <p className="text-blue-800">25 MB</p>
                    </div>
                    <div>
                      <span className="text-blue-700 font-medium">
                        Licença:
                      </span>
                      <p className="text-blue-800">Comercial</p>
                    </div>
                    <div>
                      <span className="text-blue-700 font-medium">
                        Atualizado:
                      </span>
                      <p className="text-blue-800">Dez 2024</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "requirements" && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-gray-900">
                  Requisitos do Sistema
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="p-6 bg-white rounded-lg shadow-sm border">
                    <Monitor className="w-8 h-8 text-blue-500 mb-3" />
                    <h4 className="font-semibold text-gray-900 mb-2">
                      Desktop
                    </h4>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>Windows 10+ ou macOS 10.15+</li>
                      <li>4GB RAM mínimo</li>
                      <li>500MB espaço livre</li>
                    </ul>
                  </div>

                  <div className="p-6 bg-white rounded-lg shadow-sm border">
                    <Tablet className="w-8 h-8 text-green-500 mb-3" />
                    <h4 className="font-semibold text-gray-900 mb-2">Tablet</h4>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>iOS 14+ ou Android 8+</li>
                      <li>2GB RAM mínimo</li>
                      <li>Tela 9" ou maior</li>
                    </ul>
                  </div>

                  <div className="p-6 bg-white rounded-lg shadow-sm border">
                    <Smartphone className="w-8 h-8 text-purple-500 mb-3" />
                    <h4 className="font-semibold text-gray-900 mb-2">Mobile</h4>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>iOS 13+ ou Android 7+</li>
                      <li>1GB RAM mínimo</li>
                      <li>100MB espaço livre</li>
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "reviews" && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Avaliações dos Clientes
                  </h3>
                  <div className="flex items-center space-x-2">
                    {renderStars(4.8)}
                    <span className="text-lg font-semibold">4.8</span>
                    <span className="text-gray-600">(127 avaliações)</span>
                  </div>
                </div>

                {/*<div className="space-y-4">
                  {[
                    {
                      id: "1",
                      userName: "Maria Silva",
                      userAvatar:
                        "https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&dpr=1",
                      rating: 5,
                      comment:
                        "Produto excelente! Superou minhas expectativas. A qualidade é incrível e o suporte foi muito prestativo.",
                      date: "2024-12-10",
                      verified: true,
                    },
                    {
                      id: "2",
                      userName: "João Santos",
                      userAvatar:
                        "https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&dpr=1",
                      rating: 4,
                      comment:
                        "Muito bom produto. Fácil de usar e bem documentado. Recomendo!",
                      date: "2024-12-08",
                      verified: true,
                    },
                    {
                      id: "3",
                      userName: "Ana Costa",
                      userAvatar:
                        "https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&dpr=1",
                      rating: 5,
                      comment:
                        "Perfeito para o que eu precisava. Download rápido e arquivos organizados.",
                      date: "2024-12-05",
                      verified: false,
                    },
                  ].map((review) => (
                    <div
                      key={review.id}
                      className="p-6 bg-white rounded-lg shadow-sm border"
                    >
                      <div className="flex items-start space-x-4">
                        <img
                          src={review.userAvatar}
                          alt={review.userName}
                          className="w-12 h-12 rounded-full"
                        />
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center space-x-2">
                              <span className="font-medium text-gray-900">
                                {review.userName}
                              </span>
                              {review.verified && (
                                <CheckCircle className="w-4 h-4 text-green-500" />
                              )}
                            </div>
                            <div className="flex items-center space-x-2">
                              {renderStars(review.rating)}
                              <span className="text-sm text-gray-500">
                                {new Date(review.date).toLocaleDateString(
                                  "pt-BR"
                                )}
                              </span>
                            </div>
                          </div>
                          <p className="text-gray-700">{review.comment}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>*/}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;
