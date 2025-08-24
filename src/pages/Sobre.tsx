import React from "react";
import { Target, Award, Heart, Sparkles, Shirt, Scissors, Truck } from "lucide-react";

const Sobre: React.FC = () => {
  const team = [
    {
      name: "Eduardo Araújo",
      role: "Fundador e CEO",
      image: "/Fundador.jpg",
      description: "Especialista em moda com mais de 5 anos de experiência no varejo fashion",
    },
  ];

  const values = [
    {
      icon: <Target  className="w-8 h-8 text-[#069b8b]" />,
      title: "Foco no Cliente",
      description:
        "Priorizamos sempre o seu estilo e satisfação com cada peça escolhida",
    },
    {
      icon: <Award  className="w-8 h-8 text-[#069b8b]" />,
      title: "Qualidade Premium",
      description: "Selecionamos apenas tecidos e materiais da mais alta qualidade",
    },
    {
      icon: <Heart  className="w-8 h-8 text-[#069b8b]" />,
      title: "Paixão pela Moda",
      description: "Vivemos e respiramos moda, trazendo as últimas tendências para você",
    },
    {
      icon: <Sparkles  className="w-8 h-8 text-[#069b8b]" />,
      title: "Estilo Único",
      description: "Cada peça é pensada para destacar sua personalidade única",
    },
  ];

  const services = [
    {
      icon: <Shirt  className="w-8 h-8 text-[#069b8b]" />,
      title: "Roupas Personalizadas",
      description: "Camisetas, blusas e peças exclusivas com seu estilo único",
    },
    {
      icon: <Scissors  className="w-8 h-8 text-[#069b8b]" />,
      title: "Consultoria de Estilo",
      description: "Ajudamos você a encontrar o look perfeito para cada ocasião",
    },
    {
      icon: <Truck  className="w-8 h-8 text-[#069b8b]" />,
      title: "Entrega Rápida",
      description: "Receba suas peças favoritas no conforto da sua casa",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <div className="bg-[#069b8b] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6 font-teko">
              Sobre a Nectix Store
            </h1>
            <p className="text-xl text-blue-100 max-w-3xl mx-auto font-barlow">
              Somos uma loja de moda que acredita no poder da autoexpressão através do vestuário. 
              Criamos peças únicas que contam sua história.
            </p>
          </div>
        </div>
      </div>

      {/* Mission */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-6 font-teko">
              Nossa Missão
            </h2>
            <p className="text-lg text-gray-600 mb-6 font-barlow">
              Democratizar o acesso à moda de qualidade e ajudar cada pessoa a 
              encontrar seu estilo único e autêntico através das nossas peças.
            </p>
            <p className="text-gray-600 mb-8 font-barlow">
              Acreditamos que a moda deve ser acessível e que cada cliente merece 
              atenção especial. Por isso, combinamos qualidade excepcional com 
              designs exclusivos para criar peças que realmente fazem a diferença no seu guarda-roupa.
            </p>
            <div className="grid grid-cols-2 gap-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-[#069b8b]  mb-2 font-teko">
                  2000+
                </div>
                <div className="text-gray-600">Clientes Satisfeitos</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-[#069b8b] mb-2 font-teko">
                  5★
                </div>
                <div className="text-gray-600">Avaliação Média</div>
              </div>
            </div>
          </div>
          <div className="relative">
            <img
              src={"/BannerEquipe.webp"}
              alt="Nossa equipe trabalhando"
              className="rounded-lg shadow-lg"
            />
          </div>
        </div>
      </div>

      {/* Values */}
      <div className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4 font-teko">
              Nossos Valores
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto font-barlow">
              Os princípios que guiam nossa curadoria de moda e relacionamento com nossos clientes
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => (
              <div key={index} className="text-center">
                <div className="text-blue-600 mb-4 flex justify-center">
                  {value.icon}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2 font-teko">
                  {value.title}
                </h3>
                <p className="text-gray-600 font-barlow">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Services */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
        <h2 className="text-3xl font-bold text-gray-900 mb-4 font-teko">
        Nossos Serviços
        </h2>
        <p className="text-gray-600 max-w-2xl mx-auto font-barlow">
        Oferecemos muito mais que roupas - criamos experiências completas de moda
        </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {services.map((service, index) => (
            <div
              key={index}
              className="bg-white rounded-xl shadow-lg p-8 text-center hover:shadow-xl transition-shadow"
            >
              <div className="text-blue-600 mb-6 flex justify-center">
                {service.icon}
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4 font-teko">
                {service.title}
              </h3>
              <p className="text-gray-600 font-barlow">{service.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Team */}
      <div className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4 font-teko">
              Nossa Equipe
            </h2>
            <p className="text-gray-600 font-barlow">
              Conheça quem está por trás da Nectix Store
            </p>
          </div>

          <div className="flex justify-center">
            {team.map((member, index) => (
              <div key={index} className="text-center max-w-sm">
                <div className="relative mb-6">
                  <img
                    src={member.image}
                    alt={member.name}
                    className="w-48 h-48 rounded-full mx-auto object-cover shadow-lg"
                  />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2 font-teko">
                  {member.name}
                </h3>
                <p className="text-blue-600 font-medium mb-4 font-barlow">
                  {member.role}
                </p>
                <p className="text-gray-600 font-barlow">{member.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="bg-[#000000] text-white py-16">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold mb-4 font-teko">Pronto para renovar seu guarda-roupa?</h2>
          <p className="text-xl text-blue-100 mb-8 font-barlow">
            Explore nossa coleção exclusiva e encontre peças que combinam perfeitamente com seu estilo
          </p>

          <a
            href="https://wa.me/558699461236?text=Olá%2C%20gostaria%20de%20conhecer%20a%20coleção%20da%20Nectix%20Store"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-white text-[#069b8b] px-8 py-4 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
          >
            Ver Coleção
          </a>
        </div>
      </div>
    </div>
  );
};

export default Sobre;
