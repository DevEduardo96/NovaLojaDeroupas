import React from "react";
import { Users, Target, Award, Heart, Code, Palette, Zap } from "lucide-react";

const Sobre: React.FC = () => {
  const team = [
    {
      name: "Eduardo Araújo",
      role: "Fundador e CEO",
      image: "/Fundador.jpg",
      description: "Desenvolvedor Full Stack com mais de 5 anos de experiência",
    },
  ];

  const values = [
    {
      icon: <Target className="w-8 h-8" />,
      title: "Foco no Cliente",
      description:
        "Priorizamos sempre a satisfação e sucesso dos nossos clientes",
    },
    {
      icon: <Award className="w-8 h-8" />,
      title: "Qualidade Premium",
      description: "Entregamos apenas produtos e serviços de alta qualidade",
    },
    {
      icon: <Heart className="w-8 h-8" />,
      title: "Paixão pelo Digital",
      description: "Amamos o que fazemos e isso se reflete em cada projeto",
    },
    {
      icon: <Zap className="w-8 h-8" />,
      title: "Inovação Constante",
      description: "Sempre buscamos as melhores tecnologias e tendências",
    },
  ];

  const services = [
    {
      icon: <Code className="w-12 h-12" />,
      title: "Desenvolvimento Web",
      description: "Sites, sistemas e aplicações web modernas e responsivas",
    },
    {
      icon: <Palette className="w-12 h-12" />,
      title: "Design Digital",
      description: "Criação de identidades visuais e interfaces atrativas",
    },
    {
      icon: <Users className="w-12 h-12" />,
      title: "Consultoria Digital",
      description: "Estratégias para acelerar sua transformação digital",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Sobre a Nectix
            </h1>
            <p className="text-xl text-purple-100 max-w-3xl mx-auto">
              Somos uma agência digital especializada em criar soluções
              inovadoras que transformam ideias em realidade digital.
            </p>
          </div>
        </div>
      </div>

      {/* Mission */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-6">
              Nossa Missão
            </h2>
            <p className="text-lg text-gray-600 mb-6">
              Democratizar o acesso a produtos digitais de qualidade e ajudar
              pessoas e empresas a alcançarem seus objetivos no mundo digital.
            </p>
            <p className="text-gray-600 mb-8">
              Acreditamos que a tecnologia deve ser acessível e que cada projeto
              merece atenção especial. Por isso, combinamos expertise técnica
              com criatividade para entregar soluções que realmente fazem a
              diferença.
            </p>
            <div className="grid grid-cols-2 gap-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-600 mb-2">
                  500+
                </div>
                <div className="text-gray-600">Projetos Entregues</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-600 mb-2">
                  98%
                </div>
                <div className="text-gray-600">Satisfação</div>
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
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Nossos Valores
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Os princípios que guiam nosso trabalho e relacionamento com
              clientes
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => (
              <div key={index} className="text-center">
                <div className="text-purple-600 mb-4 flex justify-center">
                  {value.icon}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {value.title}
                </h3>
                <p className="text-gray-600">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Services */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            O que Fazemos
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Oferecemos soluções completas para sua presença digital
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {services.map((service, index) => (
            <div
              key={index}
              className="bg-white rounded-xl shadow-lg p-8 text-center hover:shadow-xl transition-shadow"
            >
              <div className="text-purple-600 mb-6 flex justify-center">
                {service.icon}
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">
                {service.title}
              </h3>
              <p className="text-gray-600">{service.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Team */}
      <div className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Nossa Equipe
            </h2>
            <p className="text-gray-600">
              Conheça quem está por trás da Nectix
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
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  {member.name}
                </h3>
                <p className="text-purple-600 font-medium mb-4">
                  {member.role}
                </p>
                <p className="text-gray-600">{member.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white py-16">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold mb-4">Vamos trabalhar juntos?</h2>
          <p className="text-xl text-purple-100 mb-8">
            Entre em contato e descubra como podemos ajudar seu projeto a
            decolar
          </p>

          <a
            href="https://wa.me/558699461236?text=Olá%2C%20gostaria%20de%20contratar%20o%20serviço%20"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-white text-purple-600 px-8 py-4 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
          >
            Falar Conosco
          </a>
        </div>
      </div>
    </div>
  );
};

export default Sobre;
