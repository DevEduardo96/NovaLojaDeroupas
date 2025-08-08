import React from "react";
import {
  ArrowLeft,
  Shield,
  Eye,
  Database,
  Lock,
  Users,
  Mail,
  AlertCircle,
} from "lucide-react";

interface PrivacyPolicyProps {
  onBack?: () => void;
}

const PrivacyPolicy: React.FC<PrivacyPolicyProps> = ({ onBack }) => {
  const lastUpdated = "15 de Janeiro de 2025";

  const sections = [
    {
      id: "introduction",
      title: "1. Introdução",
      icon: <Shield className="w-5 h-5" />,
      content: [
        "A Nectix Tecnologia Ltda. ('Nectix', 'nós' ou 'nosso') respeita sua privacidade e está comprometida em proteger suas informações pessoais.",
        "Esta Política de Privacidade explica como coletamos, usamos, armazenamos e protegemos suas informações quando você usa nossa plataforma.",
        "Ao usar nossos serviços, você concorda com as práticas descritas nesta política.",
      ],
    },
    {
      id: "collection",
      title: "2. Informações que Coletamos",
      icon: <Database className="w-5 h-5" />,
      content: [
        "Informações de Conta: Nome, email, senha (criptografada) e foto de perfil.",
        "Informações de Pagamento: Dados de cartão de crédito processados por provedores seguros (não armazenamos dados completos do cartão).",
        "Informações de Uso: Como você interage com nossa plataforma, páginas visitadas e recursos utilizados.",
        "Informações Técnicas: Endereço IP, tipo de navegador, sistema operacional e dados de dispositivo.",
        "Cookies e Tecnologias Similares: Para melhorar sua experiência e analisar o uso da plataforma.",
      ],
    },
    {
      id: "usage",
      title: "3. Como Usamos suas Informações",
      icon: <Eye className="w-5 h-5" />,
      content: [
        "Fornecer e melhorar nossos serviços e funcionalidades.",
        "Processar transações e entregar produtos digitais adquiridos.",
        "Comunicar com você sobre sua conta, atualizações e suporte.",
        "Personalizar sua experiência na plataforma.",
        "Detectar e prevenir fraudes e atividades maliciosas.",
        "Cumprir obrigações legais e regulamentares.",
        "Enviar comunicações de marketing (com seu consentimento).",
      ],
    },
    {
      id: "sharing",
      title: "4. Compartilhamento de Informações",
      icon: <Users className="w-5 h-5" />,
      content: [
        "Não vendemos suas informações pessoais para terceiros.",
        "Podemos compartilhar informações com provedores de serviços confiáveis (processamento de pagamentos, hospedagem).",
        "Compartilhamos dados quando exigido por lei ou para proteger nossos direitos.",
        "Em caso de fusão ou aquisição, suas informações podem ser transferidas.",
        "Informações públicas do perfil podem ser visíveis para outros usuários.",
      ],
    },
    {
      id: "security",
      title: "5. Segurança dos Dados",
      icon: <Lock className="w-5 h-5" />,
      content: [
        "Implementamos medidas técnicas e organizacionais para proteger suas informações.",
        "Usamos criptografia SSL/TLS para proteger dados em trânsito.",
        "Senhas são armazenadas usando algoritmos de hash seguros.",
        "Acesso aos dados é restrito apenas a funcionários autorizados.",
        "Realizamos auditorias regulares de segurança e monitoramento.",
        "Nenhum sistema é 100% seguro, mas nos esforçamos para proteger seus dados.",
      ],
    },
    {
      id: "retention",
      title: "6. Retenção de Dados",
      icon: <Database className="w-5 h-5" />,
      content: [
        "Mantemos suas informações apenas pelo tempo necessário para fornecer nossos serviços.",
        "Dados de conta são mantidos enquanto sua conta estiver ativa.",
        "Informações de transações são mantidas conforme exigido por lei (geralmente 5 anos).",
        "Você pode solicitar a exclusão de seus dados a qualquer momento.",
        "Alguns dados podem ser mantidos em backups por períodos limitados.",
      ],
    },
    {
      id: "rights",
      title: "7. Seus Direitos",
      icon: <Shield className="w-5 h-5" />,
      content: [
        "Acesso: Solicitar uma cópia das informações que temos sobre você.",
        "Correção: Corrigir informações imprecisas ou incompletas.",
        "Exclusão: Solicitar a exclusão de suas informações pessoais.",
        "Portabilidade: Receber suas informações em formato estruturado.",
        "Objeção: Opor-se ao processamento de suas informações para determinados fins.",
        "Retirada de Consentimento: Retirar consentimento para processamento baseado em consentimento.",
      ],
    },
    {
      id: "cookies",
      title: "8. Cookies e Tecnologias de Rastreamento",
      icon: <Eye className="w-5 h-5" />,
      content: [
        "Usamos cookies essenciais para o funcionamento da plataforma.",
        "Cookies de análise nos ajudam a entender como você usa nossos serviços.",
        "Cookies de preferência lembram suas configurações e escolhas.",
        "Você pode controlar cookies através das configurações do seu navegador.",
        "Alguns recursos podem não funcionar corretamente se você desabilitar cookies.",
      ],
    },
    {
      id: "children",
      title: "9. Proteção de Menores",
      icon: <AlertCircle className="w-5 h-5" />,
      content: [
        "Nossos serviços são destinados a usuários com 18 anos ou mais.",
        "Não coletamos intencionalmente informações de menores de 18 anos.",
        "Se descobrirmos que coletamos informações de um menor, excluiremos imediatamente.",
        "Pais ou responsáveis podem entrar em contato conosco sobre informações de menores.",
      ],
    },
    {
      id: "international",
      title: "10. Transferências Internacionais",
      icon: <Shield className="w-5 h-5" />,
      content: [
        "Seus dados podem ser processados em servidores localizados no Brasil e outros países.",
        "Garantimos que transferências internacionais atendam aos padrões de proteção adequados.",
        "Implementamos salvaguardas apropriadas para proteger seus dados durante transferências.",
      ],
    },
    {
      id: "changes",
      title: "11. Alterações nesta Política",
      icon: <AlertCircle className="w-5 h-5" />,
      content: [
        "Podemos atualizar esta política periodicamente para refletir mudanças em nossas práticas.",
        "Notificaremos sobre alterações significativas por email ou através da plataforma.",
        "A versão mais recente estará sempre disponível em nosso site.",
        "O uso continuado de nossos serviços após alterações constitui aceitação da nova política.",
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
                  Política de Privacidade
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
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <Shield className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">
                Sua Privacidade é Nossa Prioridade
              </h2>
              <p className="text-gray-600 leading-relaxed">
                No Nectix, levamos sua privacidade a sério. Esta política
                explica como coletamos, usamos e protegemos suas informações
                pessoais quando você usa nossa plataforma de desenvolvimento e
                venda de produtos digitais.
              </p>
            </div>
          </div>
        </div>

        {/* Privacy Sections */}
        <div className="space-y-6">
          {sections.map((section, index) => (
            <div
              key={section.id}
              className="bg-white rounded-lg shadow-sm overflow-hidden"
            >
              <div className="p-6">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
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
        <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-6 mt-8">
          <div className="flex items-start space-x-4">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <Mail className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Exercer seus Direitos de Privacidade
              </h3>
              <p className="text-gray-600 mb-4">
                Para exercer qualquer um dos seus direitos de privacidade ou
                esclarecer dúvidas sobre esta política:
              </p>
              <div className="space-y-2 text-sm text-gray-600">
                <p>
                  <strong>Email de Privacidade:</strong> eleccshopping@gmail.com
                </p>
                <p>
                  <strong>Email Geral:</strong> eleccshopping@gmail.com
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

        {/* LGPD Notice */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mt-8">
          <div className="flex items-start space-x-3">
            <Shield className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" />
            <div>
              <h3 className="text-lg font-semibold text-blue-900 mb-2">
                Conformidade com a LGPD
              </h3>
              <p className="text-blue-800 text-sm leading-relaxed">
                Esta política está em conformidade com a Lei Geral de Proteção
                de Dados (LGPD) do Brasil. Você tem direitos específicos sobre
                seus dados pessoais e pode exercê-los a qualquer momento
                entrando em contato conosco.
              </p>
            </div>
          </div>
        </div>

        {/* Footer Note */}
        <div className="text-center mt-8 p-4 bg-gray-100 rounded-lg">
          <p className="text-sm text-gray-600">
            Ao usar o Nectix, você confirma que leu e entendeu esta Política de
            Privacidade e concorda com o processamento de suas informações
            conforme descrito.
          </p>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
