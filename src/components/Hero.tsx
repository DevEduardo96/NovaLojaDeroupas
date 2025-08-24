import React from "react";
import { ArrowRight, ShoppingBag, Star, Truck, Shield } from "lucide-react";
import { useLocation } from "wouter";
import { useAuthCheck } from "../hooks/useAuthGuard";

const Hero: React.FC = () => {
  const [, setLocation] = useLocation();
  const { isAuthenticated } = useAuthCheck();

  const handleExplorarProdutos = () => {
    if (isAuthenticated) {
      setLocation("/produtos");
    } else {
      setLocation("/login");
    }
  };

  return (
    <section className="bg-white py-16 lg:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Content Section */}
          <div className="text-center lg:text-left space-y-8">
            {/* Badge/Tag */}
            <div className="inline-flex items-center space-x-2 bg-blue-50 text-blue-700 px-4 py-2 rounded-full text-sm font-medium">
              <Star className="h-4 w-4 fill-current" />
              <span>Melhores roupas personalizadas para todas as suas necessidades</span>
            </div>

            {/* Main Heading */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold text-gray-900 leading-tight">
              <span className="font-teko">Roupas Personalizadas</span>
            </h1>

            {/* Subtitle */}
            <p className="text-lg lg:text-xl text-gray-600 max-w-xl mx-auto lg:mx-0 font-barlow leading-relaxed">
              Qualidade premium em roupas personalizadas, camisetas e acessórios para todas as suas necessidades.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start pt-4">
              <button
                onClick={handleExplorarProdutos}
                className="flex items-center justify-center space-x-2 bg-blue-600 text-white px-8 py-4 rounded-md font-semibold text-lg hover:bg-blue-700 transition-colors duration-300"
              >
                <span>Explorar Loja</span>
                <ArrowRight className="h-5 w-5" />
              </button>
            </div>

            {/* Features */}
            <div className="flex flex-col sm:flex-row gap-6 justify-center lg:justify-start items-center pt-8 border-t border-gray-100">
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <Truck className="h-5 w-5 text-green-600" />
                <span>Entrega grátis acima de R$ 200</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <Shield className="h-5 w-5 text-blue-600" />
                <span>Garantia de qualidade</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <Star className="h-5 w-5 text-yellow-500 fill-current" />
                <span>Avaliação 5.0</span>
              </div>
            </div>
          </div>

          {/* Image Section */}
          <div className="relative flex justify-center lg:justify-end">
            <div className="relative w-full max-w-lg">
              {/* Main Image */}
              <div className="relative z-10 w-full">
                <img
                  src="/PARTE01.webp"
                  alt="Pessoa vestindo camiseta personalizada"
                  className="w-full h-auto object-cover rounded-lg shadow-lg"
                />
              </div>
              
              {/* Floating Cards */}
              <div className="absolute -top-6 -left-6 bg-white p-4 rounded-lg shadow-lg z-20 border border-gray-100">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <ShoppingBag className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900 text-sm">Camisetas</div>
                    <div className="text-gray-500 text-xs">A partir de R$ 49</div>
                  </div>
                </div>
              </div>

              <div className="absolute -bottom-6 -right-6 bg-white p-4 rounded-lg shadow-lg z-20 border border-gray-100">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-rose-100 rounded-full flex items-center justify-center">
                    <Star className="h-6 w-6 text-rose-600 fill-current" />
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900 text-sm">Acessórios</div>
                    <div className="text-gray-500 text-xs">Personalizados</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
