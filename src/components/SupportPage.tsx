import React, { useState } from "react";
import {
  MessageCircle,
  Mail,
  Phone,
  Clock,
  Search,
  ChevronDown,
  ChevronUp,
  Send,
  CheckCircle,
  AlertCircle,
  Book,
  Headphones,
  FileText,
  Users,
} from "lucide-react";
import Footer from "./Footer";
import { Link } from "react-router-dom";

interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: string;
}

const SupportPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Todos");
  const [expandedFAQ, setExpandedFAQ] = useState<string | null>(null);
  const [contactForm, setContactForm] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
    priority: "medium",
  });
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const response = await fetch("https://formspree.io/f/xrblbvge", {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(contactForm),
      });

      if (response.ok) {
        setIsSubmitted(true);
        setContactForm({
          name: "",
          email: "",
          subject: "",
          message: "",
          priority: "medium",
        });

        setTimeout(() => setIsSubmitted(false), 5000);
      } else {
        alert("Erro ao enviar mensagem. Tente novamente.");
      }
    } catch {
      alert("Erro ao conectar com o servidor.");
    }
  };

  const faqData: FAQItem[] = [
    {
      id: "1",
      question: "Como faço o download dos produtos após a compra?",
      answer:
        "Após a confirmação do pagamento, você receberá um email com os links de download.", //'Você também pode acessar seus produtos na área "Meus Downloads" em sua conta.',
      category: "Compras",
    },
    {
      id: "2",
      question: "Posso redownload um produto que já comprei?",
      answer:
        "Sim! Você tem acesso vitalício aos produtos comprados. Basta acessar o link enviado para o seu email para baixar novamente.",
      category: "Compras",
    },
    {
      id: "3",
      question: "Quais formas de pagamento vocês aceitam?",
      answer:
        "Atualmente, estamos aceitando pagamentos apenas via Pix. Em breve, outras formas de pagamento estarão disponíveis.",
      category: "Pagamento",
    },
    {
      id: "4",
      question: "Como funciona a política de reembolso?",
      answer:
        "Oferecemos produtos digitais, criação de sites e apps com total dedicação à qualidade. Caso tenha algum problema com o produto adquirido, entre em contato conosco para avaliarmos a possibilidade de reembolso.",
      category: "Pagamento",
    },
    //{
    //id: "5",
    //question: "Os cursos têm certificado?",
    //answer:
    //"Sim! Todos os nossos cursos oferecem certificado de conclusão digital após completar 100% do conteúdo.",
    //category: "Cursos",
    //},
    //{
    //d: "6",
    //question: "Posso acessar os cursos pelo celular?",
    //answer:
    //"Absolutamente! Nossa plataforma é totalmente responsiva e você pode acessar todos os conteúdos pelo celular, tablet ou computador.",
    //category: "Técnico",
    //},
    {
      id: "7",
      question: "Como criar uma conta?",
      answer:
        'Clique em "Entrar" no menu superior, depois em "Criar conta". Preencha seus dados e confirme seu email para ativar a conta.',
      category: "Conta",
    },
    {
      id: "8",
      question: "Esqueci minha senha, como recuperar?",
      answer:
        'Na tela de login, clique em "Esqueci minha senha" e digite seu email. Você receberá instruções para criar uma nova senha. Caso contrário entre em contato através do suporte',
      category: "Conta",
    },
  ];

  const categories = [
    "Todos",
    ...Array.from(new Set(faqData.map((item) => item.category))),
  ];

  const filteredFAQ = faqData.filter((item) => {
    const matchesSearch =
      item.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.answer.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory =
      selectedCategory === "Todos" || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const supportChannels = [
    {
      icon: MessageCircle,
      title: "Chat ao Vivo",
      description: "Resposta imediata para suas dúvidas",
      availability: "Seg-Sex: 9h às 18h",
      action: "Iniciar Chat",
      color: "bg-blue-500",
    },
    {
      icon: Mail,
      title: "Email",
      description: "Envie sua dúvida detalhada",
      availability: "Resposta em até 24h",
      action: "Enviar Email",
      color: "bg-green-500",
    },
    {
      icon: Phone,
      title: "Telefone",
      description: "+55 (86) 99946-1236",
      availability: "Seg-Sex: 9h às 17h",
      action: "Ligar Agora",
      color: "bg-purple-500",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <section className="bg-gradient-to-br from-blue-600 to-purple-700 text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl lg:text-5xl font-bold mb-4">
            Como podemos ajudar você?
          </h1>
          <p className="text-xl mb-8 opacity-90">
            Encontre respostas rápidas ou entre em contato conosco
          </p>

          <div className="max-w-2xl mx-auto relative">
            <input
              type="text"
              placeholder="Busque por uma dúvida..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-6 py-4 pr-12 rounded-xl text-gray-800 text-lg focus:outline-none focus:ring-4 focus:ring-white/30"
            />
            <Search className="absolute right-4 top-4 h-6 w-6 text-gray-400" />
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-12">
        <div className="grid lg:grid-cols-3 gap-12">
          {/* Conteúdo principal */}
          <div className="lg:col-span-2 space-y-12">
            {/* Canais de Atendimento */}
            <section>
              <h2 className="text-2xl font-bold text-gray-800 mb-6">
                Canais de Atendimento
              </h2>
              <div className="grid md:grid-cols-3 gap-6">
                {supportChannels.map((channel, index) => (
                  <div
                    key={index}
                    className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow"
                  >
                    <div
                      className={`w-12 h-12 ${channel.color} rounded-lg flex items-center justify-center mb-4`}
                    >
                      <channel.icon className="h-6 w-6 text-white" />
                    </div>
                    <h3 className="font-semibold text-gray-800 mb-2">
                      {channel.title}
                    </h3>
                    <p className="text-gray-600 text-sm mb-2">
                      {channel.description}
                    </p>
                    <div className="flex items-center text-xs text-gray-500 mb-4">
                      <Clock className="h-3 w-3 mr-1" />
                      {channel.availability}
                    </div>
                    <button className="w-full bg-gray-100 hover:bg-gray-200 text-gray-800 py-2 rounded-lg transition-colors">
                      {channel.action}
                    </button>
                  </div>
                ))}
              </div>
            </section>

            {/* Perguntas Frequentes */}
            <section>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-800">
                  Perguntas Frequentes
                </h2>
                <div className="flex items-center space-x-2">
                  <Book className="h-5 w-5 text-blue-600" />
                  <span className="text-sm text-gray-600">
                    {filteredFAQ.length} resultados
                  </span>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 mb-6">
                {categories.map((category) => (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                      selectedCategory === category
                        ? "bg-blue-600 text-white"
                        : "bg-white text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    {category}
                  </button>
                ))}
              </div>

              <div className="space-y-4">
                {filteredFAQ.map((item) => (
                  <div
                    key={item.id}
                    className="bg-white rounded-lg shadow-md overflow-hidden"
                  >
                    <button
                      onClick={() =>
                        setExpandedFAQ(expandedFAQ === item.id ? null : item.id)
                      }
                      className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-gray-50 transition-colors"
                    >
                      <span className="font-medium text-gray-800">
                        {item.question}
                      </span>
                      {expandedFAQ === item.id ? (
                        <ChevronUp className="h-5 w-5 text-gray-500" />
                      ) : (
                        <ChevronDown className="h-5 w-5 text-gray-500" />
                      )}
                    </button>
                    {expandedFAQ === item.id && (
                      <div className="px-6 pb-4">
                        <div className="border-t pt-4">
                          <p className="text-gray-600">{item.answer}</p>
                          <span className="inline-block mt-2 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                            {item.category}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {filteredFAQ.length === 0 && (
                <div className="text-center py-12">
                  <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">
                    Nenhuma pergunta encontrada para sua busca.
                  </p>
                </div>
              )}
            </section>
          </div>

          {/* Formulário de contato */}
          <div className="space-y-8">
            <div className="bg-white rounded-xl p-6 shadow-md">
              <h3 className="text-xl font-bold text-gray-800 mb-4">
                Envie sua Dúvida
              </h3>

              {isSubmitted ? (
                <div className="text-center py-8">
                  <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                  <h4 className="font-semibold text-gray-800 mb-2">
                    Mensagem Enviada!
                  </h4>
                  <p className="text-gray-600 text-sm">
                    Recebemos sua mensagem e responderemos em breve.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleContactSubmit} className="space-y-4">
                  <input
                    type="text"
                    required
                    placeholder="Nome"
                    value={contactForm.name}
                    onChange={(e) =>
                      setContactForm({ ...contactForm, name: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />

                  <input
                    type="email"
                    required
                    placeholder="Email"
                    value={contactForm.email}
                    onChange={(e) =>
                      setContactForm({ ...contactForm, email: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />

                  <input
                    type="text"
                    required
                    placeholder="Assunto"
                    value={contactForm.subject}
                    onChange={(e) =>
                      setContactForm({
                        ...contactForm,
                        subject: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />

                  <select
                    value={contactForm.priority}
                    onChange={(e) =>
                      setContactForm({
                        ...contactForm,
                        priority: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  >
                    <option value="low">Baixa</option>
                    <option value="medium">Média</option>
                    <option value="high">Alta</option>
                  </select>

                  <textarea
                    required
                    rows={4}
                    placeholder="Mensagem"
                    value={contactForm.message}
                    onChange={(e) =>
                      setContactForm({
                        ...contactForm,
                        message: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg resize-none"
                  />

                  <button
                    type="submit"
                    className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-2 rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 transition-all flex items-center justify-center space-x-2"
                  >
                    <Send className="h-4 w-4" />
                    <span>Enviar Mensagem</span>
                  </button>
                </form>
              )}
              {/* Quick Links */}
              <div className="bg-white rounded-xl p-6 shadow-md">
                <h3 className="text-xl font-bold text-gray-800 mb-4">
                  Links Úteis
                </h3>
                <div className="space-y-3">
                  <Link
                    to={"/terms"}
                    className="flex items-center space-x-3 text-gray-700 hover:text-blue-600 transition-colors"
                  >
                    <FileText className="h-4 w-4" />
                    <span>Termos de Uso</span>
                  </Link>
                  <Link
                    to={"/privacy"}
                    className="flex items-center space-x-3 text-gray-700 hover:text-blue-600 transition-colors"
                  >
                    <FileText className="h-4 w-4" />
                    <span>Política de Privacidade</span>
                  </Link>
                  <a
                    href="#"
                    className="flex items-center space-x-3 text-gray-700 hover:text-blue-600 transition-colors"
                  >
                    <Users className="h-4 w-4" />
                    <span>Comunidade</span>
                  </a>
                  <a
                    href="#"
                    className="flex items-center space-x-3 text-gray-700 hover:text-blue-600 transition-colors"
                  >
                    <Headphones className="h-4 w-4" />
                    <span>Status do Sistema</span>
                  </a>
                </div>
              </div>
            </div>

            {/* Outros blocos permanecem iguais */}
            {/* ... Links Úteis / Informações de Contato ... */}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default SupportPage;
