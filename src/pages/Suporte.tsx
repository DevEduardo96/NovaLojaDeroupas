import React from "react";
import {
  Mail,
  Phone,
  MapPin,
  MessageCircle,
  Send,
  Clock,
  CheckCircle,
} from "lucide-react";
import { useForm, ValidationError } from "@formspree/react";

const Suporte: React.FC = () => {
  const [state, handleSubmit] = useForm("mblkgnyv"); // Seu ID Formspree

  const faqs = [
    {
      question: "Como faço o acompanhamento do meu pedido?",
      answer:
        "Após a confirmação do pagamento, você receberá um código de rastreamento por email para acompanhar sua entrega em tempo real.",
    },
    {
      question: "Qual o prazo de entrega das roupas?",
      answer:
        "O prazo varia de 3 a 7 dias úteis para todo o Brasil. Entregas em capitais podem ser mais rápidas. Frete grátis acima de R$ 200.",
    },
    {
      question: "Posso trocar ou devolver uma peça?",
      answer:
        "Sim! Você tem até 30 dias para trocar ou devolver qualquer item, desde que esteja nas condições originais com etiquetas.",
    },
    {
      question: "Como funciona o guia de tamanhos?",
      answer:
        "Cada produto tem uma tabela de medidas detalhada. Em caso de dúvida, nossa equipe pode ajudar a escolher o tamanho ideal.",
    },
    {
      question: "As roupas são de que qualidade?",
      answer:
        "Trabalhamos apenas com fornecedores selecionados e tecidos premium. Todas as peças passam por controle de qualidade rigoroso.",
    },
    {
      question: "Quais formas de pagamento vocês aceitam?",
      answer:
        "Aceitamos PIX (desconto de 5%), cartão de crédito em até 12x, cartão de débito e boleto bancário.",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-[#069b8b] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
          <MessageCircle className="w-16 h-16 mx-auto mb-4" />
          <h1 className="text-4xl font-bold mb-4 font-teko">Central de Atendimento</h1>
          <p className="text-xl text-blue-100 max-w-2xl mx-auto font-barlow">
            Precisa de ajuda com seu pedido? Estamos aqui para garantir a melhor experiência na sua compra!
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Contact Form */}
          <div className="bg-white rounded-xl shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Entre em Contato
            </h2>

            {state.succeeded ? (
              <div className="text-center py-8">
                <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Mensagem Enviada!
                </h3>
                <p className="text-gray-600">
                  Recebemos sua mensagem e responderemos em até 24 horas.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nome Completo
                  </label>
                  <input
                    id="nome"
                    type="text"
                    name="nome"
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  />
                  <ValidationError
                    prefix="Nome"
                    field="nome"
                    errors={state.errors}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email
                  </label>
                  <input
                    id="email"
                    type="email"
                    name="email"
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  />
                  <ValidationError
                    prefix="Email"
                    field="email"
                    errors={state.errors}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Assunto
                  </label>
                  <select
                    id="assunto"
                    name="assunto"
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Selecione um assunto</option>
                    <option value="pedido-entrega">Pedido e Entrega</option>
                    <option value="problema-pagamento">
                      Problema com Pagamento
                    </option>
                    <option value="troca-devolucao">Troca e Devolução</option>
                    <option value="tamanho-produto">Dúvida sobre Tamanho</option>
                    <option value="qualidade-produto">Qualidade do Produto</option>
                    <option value="outro">Outro</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Mensagem
                  </label>
                  <textarea
                    id="mensagem"
                    name="message"
                    rows={5}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="Descreva sua dúvida sobre o pedido, entrega, troca..."
                  />
                  <ValidationError
                    prefix="Mensagem"
                    field="message"
                    errors={state.errors}
                  />
                </div>

                <button
                  type="submit"
                  disabled={state.submitting}
                  className="w-full bg-[#000000] hover:bg-[#2d2d2d] disabled:bg-blue-400 text-white font-semibold py-3 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2"
                >
                  {state.submitting ? (
                    <>
                      <div className=" animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      <span>Enviando...</span>
                    </>
                  ) : (
                    <>
                      <Send className= "w-5 h-5" />
                      <span>Enviar Mensagem</span>
                    </>
                  )}
                </button>
              </form>
            )}
          </div>

          {/* Contact Info & FAQ */}
          <div className="space-y-8">
            <div className="bg-white rounded-xl shadow-lg p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Informações de Contato
              </h2>
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <Mail className="w-5 h-5 text-[#000000]" />
                  <span>atendimento@nectixstore.com</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Phone className="w-5 h-5 text-[#000000]" />
                  <span>+55 (86) 99946-1236</span>
                </div>
                <div className="flex items-center space-x-3">
                  <MapPin className="w-5 h-5 text-[#000000]" />
                  <span>Teresina, PI - Brasil</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Clock className="w-5 h-5 text-[#000000]" />
                  <span>Seg - Sáb: 8h às 20h</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Perguntas Frequentes
              </h2>
              <div className="space-y-4">
                {faqs.map((faq, index) => (
                  <details key={index} className="group">
                    <summary className="flex justify-between items-center cursor-pointer p-4 bg-gray-50 rounded-lg hover:bg-gray-100">
                      <span className="font-medium text-gray-900">
                        {faq.question}
                      </span>
                      <span className="text-gray-500 group-open:rotate-180 transition-transform">
                        ▼
                      </span>
                    </summary>
                    <div className="p-4 text-gray-600">{faq.answer}</div>
                  </details>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Suporte;
