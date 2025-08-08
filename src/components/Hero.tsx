import React from "react";
import { ArrowRight, Play, Star } from "lucide-react";
import { useLocation } from "wouter";

const Hero: React.FC = () => {
  const [location, setLocation] = useLocation();
  return (
    <section className="bg-gradient-to-br from-blue-50 to-purple-50 py-12 lg:py-20">
      <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6 text-center lg:text-left">
            <div className="inline-flex items-center space-x-2 bg-blue-100 text-blue-800 px-4 py-2 rounded-full text-sm font-medium mx-auto lg:mx-0">
              <Star className="h-4 w-4 fill-current" />
              <span>Agência de sites e produtos digitais premium.</span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-6xl font-bold text-gray-800 leading-tight">
              Destaque-se no
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
                {" "}
                Digital{" "}
              </span>
              com sites, Apps, e-books e templates.
            </h1>

            <p className="text-base sm:text-lg text-gray-600 max-w-xl mx-auto lg:mx-0">
              Da criação de sites e apps à venda de produtos digitais: tudo para
              você crescer no mundo digital.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <button
                onClick={() => setLocation("/produtos")}
                className="flex items-center justify-center space-x-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 "
              >
                <span>Explorar Produtos</span>
                <ArrowRight className="h-5 w-5" />
              </button>

              <button className="flex items-center justify-center space-x-2 border-2 border-gray-300 text-gray-700 px-8 py-4 rounded-lg font-semibold hover:border-blue-600 hover:text-blue-600 transition-all duration-300">
                <Play className="h-5 w-5" />
                <span>Ver Demo</span>
              </button>
            </div>

            <div className="flex justify-center lg:justify-start items-center space-x-8 pt-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-800">1000+</div>
                <div className="text-sm text-gray-600">Produtos</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-800">50k+</div>
                <div className="text-sm text-gray-600">Clientes</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-800">4.9</div>
                <div className="text-sm text-gray-600">Avaliação</div>
              </div>
            </div>
          </div>

          <div className="relative w-full max-w-md mx-auto">
            <div className="relative z-10 w-full rounded-2xl overflow-hidden aspect-[3/2]">
              <img
                src="/BannerLogo.webp"
                alt="Aprendizado Online"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="absolute -top-2 -right-2 sm:-top-4 sm:-right-4 w-full h-full bg-gradient-to-br from-blue-200 to-purple-200 rounded-2xl -z-10"></div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
