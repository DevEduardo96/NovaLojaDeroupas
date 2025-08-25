import React from "react";
import { ShoppingBag, Star } from "lucide-react";
import { useLocation } from "wouter";
import { useAuthCheck } from "../hooks/useAuthGuard";

const Hero: React.FC = () => {
  const [, setLocation] = useLocation();
  const { isAuthenticated } = useAuthCheck();

  const handleExploreProducts = () => {
    // Sempre permite acesso aos produtos, independente da autenticação
    setLocation("/produtos");
  };

  return (
    <section className="bg-white min-h-screen flex items-center py-12 lg:py-0">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="grid lg:grid-cols-5 gap-8 lg:gap-16 items-center">
          {/* Content Section */}
          <div className="lg:col-span-2 text-center lg:text-left space-y-6 lg:space-y-8 order-2 lg:order-1">
            {/* Badge/Tag */}
            <div className="inline-flex items-center space-x-2 bg-gray-100 text-black px-4 py-2 rounded-full text-sm font-medium font-barlow">
              <Star className="h-4 w-4" />
              <span>Roupas Personalizadas</span>
            </div>

            {/* Main Heading */}
{/* Container principal com alinhamento vertical em telas menores */}
<div className="flex flex-col lg:block space-y-4 lg:space-y-2">
  {/* Main Heading */}
  <div className="order-1 lg:order-none">
    <h1 className="text-5xl sm:text-6xl lg:text-7xl xl:text-8xl font-bold text-black leading-none tracking-tight text-center lg:text-left">
      <span className="font-teko block">
        <img src="/grandelogo.webp" alt="" className="mx-auto lg:mx-0" />
      </span>
    </h1>
  </div>

  {/* Number 07 */}
  <div className="order-2 lg:order-none text-center lg:text-right xl:text-left">
    <span className="text-4xl sm:text-5xl lg:text-6xl font-light text-gray-400 font-teko">07</span>
  </div>

  {/* Subtitle */}
  <div className="order-3 lg:order-none">
    <p className="text-lg text-gray-600 max-w-md mx-auto lg:mx-0 font-barlow leading-relaxed text-center lg:text-left">
      Qualidade premium em roupas personalizadas, camisetas e acessórios para todas as suas necessidades.
    </p>
  </div>
</div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start pt-2">
              <button
                onClick={handleExploreProducts}
                className="flex items-center justify-center space-x-2 bg-black text-white px-8 py-4 rounded-none font-semibold text-base hover:bg-gray-800 transition-colors duration-300 font-barlow"
              >
                <ShoppingBag className="h-5 w-5" />
                <span>Ver Produtos</span>
              </button>

              <button className="flex items-center justify-center space-x-2 border border-gray-300 text-black px-8 py-4 rounded-none font-semibold text-base hover:bg-gray-50 transition-colors duration-300 font-barlow">
                <span>View</span>
              </button>
            </div>

            {/* Features - Minimal */}
            <div className="flex flex-wrap justify-center lg:justify-start gap-6 pt-6 text-sm text-gray-500">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
                <span className="font-barlow">Free Shipping</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
                <span className="font-barlow">Premium Quality</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
                <span className="font-barlow">Easy Returns</span>
              </div>
            </div>
          </div>

          {/* Image Section - Much Larger */}
          <div className="lg:col-span-3 relative order-1 lg:order-2">
            <div className="relative w-full h-[400px] sm:h-[500px] md:h-[500px] lg:h-[500px] xl:h-[600px]">
              {/* Main Product Image */}
              <div className="absolute inset-0 flex items-center justify-center">
                <img
                  src="/modelobase.webp"
                  alt="Premium Hoodie"
                  className="w-full h-full object-contain max-w-[500px]lg:object-cover lg:object-center"
                />
              </div>

              {/* Minimal Info Cards */}
              <div className="absolute top-4 right-4 bg-white bg-opacity-90 backdrop-blur-sm p-3 rounded-sm shadow-sm border border-gray-100 hidden lg:block">
                <div className="text-right">
                  <div className="font-semibold text-black text-sm font-teko">R$ 129</div>
                  <div className="text-gray-500 text-xs font-barlow">Premium</div>
                </div>
              </div>

              <div className="absolute bottom-4 left-4 bg-white bg-opacity-90 backdrop-blur-sm p-3 rounded-sm shadow-sm border border-gray-100 hidden lg:block">
                <div>
                  <div className="font-semibold text-black text-sm font-teko">100% Cotton</div>
                  <div className="text-gray-500 text-xs font-barlow">Sustainable</div>
                </div>
              </div>

              {/* Size Indicator */}
              <div className="absolute top-1/2 right-8 transform -translate-y-1/2 hidden xl:block">
                <div className="flex flex-col space-y-2 text-gray-400">
                  <span className="text-xs font-barlow">S</span>
                  <span className="text-xs font-barlow font-bold text-black">M</span>
                  <span className="text-xs font-barlow">L</span>
                  <span className="text-xs font-barlow">XL</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Navigation Dots */}
        <div className="flex justify-center lg:justify-start space-x-2 mt-8 lg:mt-12">
          <div className="w-2 h-2 bg-black rounded-full"></div>
          <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
          <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
        </div>
      </div>
    </section>
  );
};

export default Hero;