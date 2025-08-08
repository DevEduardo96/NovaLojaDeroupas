import React from "react";
import {
  Globe,
  Code,
  Smartphone,
  Zap,
  CheckCircle,
  ArrowRight,
} from "lucide-react";

const Sites: React.FC = () => {
  const services = [
    {
      icon: <Globe className="w-8 h-8" />,
      title: "Sites Institucionais",
      description: "Sites profissionais para empresas e negócios",
      price: "A partir de R$ 1.500",
      features: [
        "Design Responsivo",
        "SEO Otimizado",
        "Painel Admin",
        "Suporte 30 dias",
      ],
    },
    {
      icon: <Code className="w-8 h-8" />,
      title: "E-commerce",
      description: "Lojas virtuais completas e funcionais",
      price: "A partir de R$ 2.500",
      features: [
        "Carrinho de Compras",
        "Pagamento Online",
        "Gestão de Produtos",
        "Relatórios",
      ],
    },
    {
      icon: <Smartphone className="w-8 h-8" />,
      title: "Landing Pages",
      description: "Páginas de conversão otimizadas",
      price: "A partir de R$ 800",
      features: [
        "Alta Conversão",
        "Carregamento Rápido",
        "Integração Analytics",
        "A/B Testing",
      ],
    },
  ];

  const portfolio = [
    {
      title: "E-commerce Fashion",
      category: "Loja Virtual",
      image:
        "https://images.pexels.com/photos/230544/pexels-photo-230544.jpeg?auto=compress&cs=tinysrgb&w=500",
    },
    {
      title: "Site Corporativo",
      category: "Institucional",
      image:
        "https://images.pexels.com/photos/196644/pexels-photo-196644.jpeg?auto=compress&cs=tinysrgb&w=500",
    },
    {
      title: "Landing Page SaaS",
      category: "Conversão",
      image:
        "https://images.pexels.com/photos/265087/pexels-photo-265087.jpeg?auto=compress&cs=tinysrgb&w=500",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center">
            <Globe className="w-16 h-16 mx-auto mb-6" />
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Desenvolvimento de sites e Apps
            </h1>
            <p className="text-xl text-blue-100 max-w-3xl mx-auto mb-8">
              Criamos sites modernos, responsivos e otimizados para converter
              visitantes em clientes. Sua presença digital profissional começa
              aqui.
            </p>
            <a
             href="https://wa.me/558699461236?text=Olá%2C%20gostaria%20de%20solicitar%20um%20orçamento%20para%20a%20criação%20de%20um%20projeto."
             target="_blank"
             rel="noopener noreferrer"
             className="bg-white text-blue-600 px-8 py-4 rounded-lg font-semibold hover:bg-gray-100 transition-colors inline-flex items-center space-x-2"
             >
             Solicitar Orçamento
             </a>
          </div>
        </div>
      </div>

      {/* Services */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Nossos Serviços
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Oferecemos soluções completas para sua presença digital
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {services.map((service, index) => (
            <div
              key={index}
              className="bg-white rounded-xl shadow-lg p-8 hover:shadow-xl transition-shadow"
            >
              <div className="text-blue-600 mb-4">{service.icon}</div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                {service.title}
              </h3>
              <p className="text-gray-600 mb-4">{service.description}</p>
              <div className="text-2xl font-bold text-blue-600 mb-6">
                {service.price}
              </div>

              <ul className="space-y-2 mb-6">
                {service.features.map((feature, idx) => (
                  <li key={idx} className="flex items-center text-gray-600">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                    {feature}
                  </li>
                ))}
              </ul>

              <a
             href="https://wa.me/558699461236?text=Olá%2C%20gostaria%20de%20contratar%20o%20serviço!"
             target="_blank"
             rel="noopener noreferrer"
             className="flex items-center justify-center space-x-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-300 transform hover:scale-105"
             >
             Contratar Serviço
             </a>

            </div>
          ))}
        </div>
      </div>

      {/* Portfolio */}
      <div className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Nosso Portfólio
            </h2>
            <p className="text-gray-600">
              Alguns dos projetos que desenvolvemos
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {portfolio.map((project, index) => (
              <div key={index} className="group cursor-pointer">
                <div className="relative overflow-hidden rounded-lg">
                  <img
                    src={project.image}
                    alt={project.title}
                    className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-40 group-hover:bg-opacity-60 transition-all duration-300 flex items-center justify-center">
                    <div className="text-white text-center">
                      <h3 className="text-xl font-bold mb-2">
                        {project.title}
                      </h3>
                      <p className="text-blue-200">{project.category}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Process */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Como Trabalhamos
          </h2>
          <p className="text-gray-600">Processo simples e transparente</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {[
            {
              step: "1",
              title: "Briefing",
              desc: "Entendemos suas necessidades",
            },
            {
              step: "2",
              title: "Proposta",
              desc: "Criamos uma proposta personalizada",
            },
            {
              step: "3",
              title: "Desenvolvimento",
              desc: "Desenvolvemos seu projeto",
            },
            { step: "4", title: "Entrega", desc: "Entregamos e damos suporte" },
          ].map((item, index) => (
            <div key={index} className="text-center">
              <div className="w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">
                {item.step}
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {item.title}
              </h3>
              <p className="text-gray-600">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div className="bg-blue-600 text-white py-16">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <Zap className="w-16 h-16 mx-auto mb-6" />
          <h2 className="text-3xl font-bold mb-4">
            Pronto para começar seu projeto?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Entre em contato conosco e vamos criar algo incrível juntos
          </p>
         
          <a
         href="https://wa.me/558699461236?text=Olá%2C%20gostaria%20de%20contratar%20o%20serviço%20"
         target="_blank"
         rel="noopener noreferrer"
         className="bg-white text-blue-600 px-8 py-4 rounded-lg font-semibold hover:bg-gray-100 transition-colors">
         Falar com Especialista
         </a>
        </div>
      </div>
    </div>
  );
};

export default Sites;
