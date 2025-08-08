import React from "react";
import {
  ArrowLeft,
  Shield,
  Users,
  CreditCard,
  AlertTriangle,
  FileText,
  Mail,
} from "lucide-react";

interface TermsOfServiceProps {
  onBack?: () => void;
}

export const TermsOfService: React.FC<TermsOfServiceProps> = ({ onBack }) => {
  const lastUpdated = "15 de Janeiro de 2025";

  const sections = [
    {
      id: "acceptance",
      title: "1. Aceitação dos Termos",
      icon: <FileText className="w-5 h-5" />,
      content: [
        "Ao acessar e usar a plataforma Nectix, você concorda em cumprir e estar vinculado a estes Termos de Uso.",
        "Se você não concordar com qualquer parte destes termos, não deve usar nossos serviços.",
        "Reservamo-nos o direito de modificar estes termos a qualquer momento, com notificação prévia aos usuários.",
      ],
    },
    {
      id: "services",
      title: "2. Descrição dos Serviços",
      icon: <Shield className="w-5 h-5" />,
      content: [
        "O Nectix é uma plataforma digital que permite a compra e venda de produtos digitais.",
        "Oferecemos um marketplace seguro para criadores e consumidores de conteúdo digital.",
        "Nossos serviços incluem processamento de pagamentos, entrega de produtos digitais e suporte ao cliente.",
      ],
    },
    {
      id: "accounts",
      title: "3. Contas de Usuário",
      icon: <Users className="w-5 h-5" />,
      content: [
        "Você deve criar uma conta para usar nossos serviços.",
        "É responsável por manter a confidencialidade de suas credenciais de login.",
        "Deve fornecer informações precisas e atualizadas durante o registro.",
        "É responsável por todas as atividades que ocorrem em sua conta.",
        "Deve notificar-nos imediatamente sobre qualquer uso não autorizado de sua conta.",
      ],
    },
    {
      id: "payments",
      title: "4. Pagamentos e Reembolsos",
      icon: <CreditCard className="w-5 h-5" />,
      content: [
        "Todos os pagamentos são processados através de provedores de pagamento seguros.",
        "Os preços são exibidos na moeda local e incluem todos os impostos aplicáveis.",
        "Reembolsos são processados de acordo com nossa Política de Reembolso.",
        "Produtos digitais geralmente não são elegíveis para reembolso após o download.",
        "Reservamo-nos o direito de alterar preços a qualquer momento.",
      ],
    },
    {
      id: "content",
      title: "5. Conteúdo e Propriedade Intelectual",
      icon: <Shield className="w-5 h-5" />,
      content: [
        "Você mantém todos os direitos sobre o conteúdo que carrega em nossa plataforma.",
        "Ao fazer upload, você nos concede uma licença para hospedar e distribuir seu conteúdo.",
        "Você garante que possui todos os direitos necessários sobre o conteúdo enviado.",
        "É proibido carregar conteúdo que viole direitos autorais de terceiros.",
        "Reservamo-nos o direito de remover conteúdo que viole estes termos.",
      ],
    },
    {
      id: "prohibited",
      title: "6. Uso Proibido",
      icon: <AlertTriangle className="w-5 h-5" />,
      content: [
        "É proibido usar nossa plataforma para atividades ilegais ou não autorizadas.",
        "Não é permitido carregar conteúdo ofensivo, difamatório ou prejudicial.",
        "É proibido tentar hackear, interferir ou comprometer a segurança da plataforma.",
        "Não é permitido criar múltiplas contas para contornar limitações.",
        "É proibido usar bots ou scripts automatizados sem autorização.",
      ],
    },
    {
      id: "liability",
      title: "7. Limitação de Responsabilidade",
      icon: <Shield className="w-5 h-5" />,
      content: [
        "Nossos serviços são fornecidos 'como estão', sem garantias expressas ou implícitas.",
        "Não nos responsabilizamos por danos indiretos, incidentais ou consequenciais.",
        "Nossa responsabilidade total não excederá o valor pago pelos serviços.",
        "Não garantimos que nossos serviços estarão sempre disponíveis ou livres de erros.",
        "Você usa nossos serviços por sua própria conta e risco.",
      ],
    },
    {
      id: "termination",
      title: "8. Rescisão",
      icon: <AlertTriangle className="w-5 h-5" />,
      content: [
        "Podemos suspender ou encerrar sua conta a qualquer momento por violação destes termos.",
        "Você pode encerrar sua conta a qualquer momento através das configurações da conta.",
        "Após o encerramento, você perderá acesso aos produtos e serviços adquiridos.",
        "Algumas disposições destes termos permanecerão em vigor após o encerramento.",
        "Reservamo-nos o direito de reter dados conforme exigido por lei.",
      ],
    },
    {
      id: "privacy",
      title: "9. Privacidade",
      icon: <Shield className="w-5 h-5" />,
      content: [
        "Sua privacidade é importante para nós. Consulte nossa Política de Privacidade.",
        "Coletamos apenas as informações necessárias para fornecer nossos serviços.",
        "Não vendemos ou compartilhamos suas informações pessoais com terceiros.",
        "Implementamos medidas de segurança para proteger seus dados.",
        "Você tem direitos sobre seus dados pessoais conforme a legislação aplicável.",
      ],
    },
    {
      id: "governing",
      title: "10. Lei Aplicável",
      icon: <FileText className="w-5 h-5" />,
      content: [
        "Estes termos são regidos pelas leis da República Federativa do Brasil.",
        "Qualquer disputa será resolvida nos tribunais competentes do Brasil.",
        "Se alguma disposição for considerada inválida, as demais permanecerão em vigor.",
        "Estes termos constituem o acordo completo entre você e o Nectix.",
        "Qualquer renúncia deve ser feita por escrito.",
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex items-center space-x-4">
            {onBack && (
              <button
                onClick={onBack}
                className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
                <span>Voltar</span>
              </button>
            )}
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10  flex items-center justify-center">
                <img
                  src="/logo02.webp"
                  alt="Nectix"
                  className="w-10 h-10 object-contain"
                />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Termos de Uso
                </h1>
                <p className="text-gray-600">
                  Última atualização: {lastUpdated}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Introduction */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div className="flex items-start space-x-4">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <FileText className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">
                Bem-vindo aos Termos de Uso do Nectix
              </h2>
              <p className="text-gray-600 leading-relaxed">
                Estes Termos de Uso ("Termos") regem o uso da plataforma Nectix,
                operada pela Nectix Tecnologia Ltda. ("nós", "nosso" ou
                "Nectix"). Ao usar nossos serviços, você concorda com estes
                termos em sua totalidade.
              </p>
            </div>
          </div>
        </div>

        {/* Terms Sections */}
        <div className="space-y-6">
          {sections.map((section, index) => (
            <div
              key={section.id}
              className="bg-white rounded-lg shadow-sm overflow-hidden"
            >
              <div className="p-6">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    {section.icon}
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {section.title}
                  </h3>
                </div>
                <div className="space-y-3">
                  {section.content.map((paragraph, pIndex) => (
                    <p key={pIndex} className="text-gray-600 leading-relaxed">
                      {paragraph}
                    </p>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Contact Information */}
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-6 mt-8">
          <div className="flex items-start space-x-4">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <Mail className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Dúvidas sobre os Termos?
              </h3>
              <p className="text-gray-600 mb-4">
                Se você tiver alguma dúvida sobre estes Termos de Uso, entre em
                contato conosco:
              </p>
              <div className="space-y-2 text-sm text-gray-600">
                <p>
                  <strong>Email:</strong> eleccshopping@gmail.com
                </p>
                <p>
                  <strong>Telefone:</strong> (86) 99946-1236
                </p>
                <p>
                  <strong>Endereço:</strong> Teresina, Pi - Brasil
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Note */}
        <div className="text-center mt-8 p-4 bg-gray-100 rounded-lg">
          <p className="text-sm text-gray-600">
            Ao continuar usando o Nectix, você confirma que leu, entendeu e
            concorda com estes Termos de Uso em sua versão mais recente.
          </p>
        </div>
      </div>
    </div>
  );
};

//importação para o app sem export defalt