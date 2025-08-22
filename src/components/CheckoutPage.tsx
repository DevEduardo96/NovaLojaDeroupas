
import React, { useState, useEffect } from "react";
import { useValidation } from "../utils/validation";
import { useCart } from "../hooks/useCart";

interface CarrinhoItem {
  id: number;
  name: string;
  quantity: number;
  price: number;
}

interface PaymentResponse {
  id: number;
  status: string;
  qr_code: string;
  qr_code_base64: string;
  ticket_url: string;
}

const CheckoutPage: React.FC = () => {
  const { validateCheckout } = useValidation();
  const { items: cartItems, getMostCommonVariations } = useCart();

  // Obter variações mais comuns do carrinho para pré-preenchimento
  const commonVariations = getMostCommonVariations();

  const [formData, setFormData] = useState({
    nomeCliente: "",
    email: "",
    telefone: "",
    cep: "",
    rua: "",
    numero: "",
    complemento: "",
    bairro: "",
    cidade: "",
    estado: "",
    cor: commonVariations.color || "",
    tamanho: commonVariations.size || "",
    carrinho: [] as CarrinhoItem[],
    total: 0,
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const [paymentData, setPaymentData] = useState<PaymentResponse | null>(null);
  const [showQRCode, setShowQRCode] = useState(false);

  // 📝 Atualiza campos do formulário
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // 📝 Handler para checkboxes de cor e tamanho
  const handleCheckboxChange = (field: 'cor' | 'tamanho', value: string) => {
    setFormData({
      ...formData,
      [field]: formData[field] === value ? "" : value,
    });
  };

  // 📦 Atualizar carrinho e variações baseado no carrinho real
  useEffect(() => {
    // Converter itens do carrinho para formato esperado
    const carrinhoFormatado = cartItems.map(item => ({
      id: item.product.id,
      name: item.product.name,
      quantity: item.quantity,
      price: item.product.price,
    }));

    const total = carrinhoFormatado.reduce(
      (acc, item) => acc + item.price * item.quantity,
      0
    );

    // Atualizar variações mais comuns se ainda não foram definidas pelo usuário
    const newCommonVariations = getMostCommonVariations();
    
    setFormData((prev) => ({ 
      ...prev, 
      carrinho: carrinhoFormatado, 
      total,
      // Só atualiza cor e tamanho se estiverem vazios (não foram alterados pelo usuário)
      cor: prev.cor || newCommonVariations.color || "",
      tamanho: prev.tamanho || newCommonVariations.size || "",
    }));
  }, [cartItems, getMostCommonVariations]);

  // 📋 Copiar código PIX
  const copyPixCode = () => {
    if (paymentData?.qr_code) {
      navigator.clipboard.writeText(paymentData.qr_code);
      alert("Código PIX copiado para a área de transferência!");
    }
  };

  // 🔄 Voltar para o formulário
  const backToForm = () => {
    setShowQRCode(false);
    setPaymentData(null);
    setErrors([]);
  };

  // 🚀 Enviar dados
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors([]);
    setLoading(true);

    // ✅ Validação local
    const validation = validateCheckout(formData);
    
    // Validação adicional para cor e tamanho
    const additionalErrors = [];
    if (!formData.cor.trim()) {
      additionalErrors.push("Cor é obrigatória");
    }
    if (!formData.tamanho.trim()) {
      additionalErrors.push("Tamanho é obrigatório");
    }
    
    if (!validation.isValid || additionalErrors.length > 0) {
      setErrors([...validation.errors, ...additionalErrors]);
      setLoading(false);
      return;
    }

    // ✅ Montar payload no formato esperado pelo backend (Zod schema)
    const payload = {
      carrinho: formData.carrinho.map((item) => ({
        id: item.id,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        variacoes: {
          cor: formData.cor.trim() || undefined,
          tamanho: formData.tamanho.trim() || undefined
        }
      })),
      nomeCliente: formData.nomeCliente.trim(),
      email: formData.email.trim(),
      telefone: formData.telefone.trim(),
      endereco: {
        cep: formData.cep.trim(),
        rua: formData.rua.trim(),
        numero: formData.numero.trim(),
        complemento: formData.complemento.trim() || undefined,
        bairro: formData.bairro.trim(),
        cidade: formData.cidade.trim(),
        estado: formData.estado.trim(),
      },
      total: formData.total,
    };

    try {
      console.log("📦 Payload enviado para backend:", payload);

      const response = await fetch(
        "https://backend-nectix.onrender.com/api/payments/criar-pagamento",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Erro no pagamento");
      }

      console.log("✅ Resposta backend:", data);
      setPaymentData(data);
      setShowQRCode(true);
      console.log("🎯 Estado atualizado - showQRCode:", true, "paymentData:", data);
    } catch (err: any) {
      setErrors([err.message || "Erro inesperado"]);
    } finally {
      setLoading(false);
    }
  };

  // 🎨 Renderizar QR Code
  console.log("🔍 Debug render - showQRCode:", showQRCode, "paymentData:", paymentData);
  
  // Força exibição se temos dados de pagamento
  if ((showQRCode && paymentData) || (paymentData && paymentData.qr_code_base64)) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-4 px-4 sm:py-8">
        <div className="max-w-md mx-auto">
          <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-green-500 to-green-600 p-6 text-center">
              <div className="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">Pagamento PIX</h2>
              <p className="text-green-100">Escaneie o QR Code ou copie o código PIX</p>
            </div>

            <div className="p-6">
              {/* QR Code */}
              <div className="bg-gray-50 p-6 rounded-xl border-2 border-dashed border-gray-200 mb-6 text-center">
                {paymentData.qr_code_base64 ? (
                  <img
                    src={`data:image/png;base64,${paymentData.qr_code_base64}`}
                    alt="QR Code PIX"
                    className="w-full max-w-xs mx-auto rounded-lg"
                    style={{ imageRendering: 'pixelated' }}
                    onError={(e) => {
                      console.error("❌ Erro ao carregar QR Code:", e);
                      console.log("🔍 Base64 data:", paymentData.qr_code_base64?.substring(0, 100) + "...");
                    }}
                    onLoad={() => console.log("✅ QR Code carregado com sucesso")}
                  />
                ) : (
                  <div className="w-64 h-64 bg-gray-200 rounded-lg flex items-center justify-center mx-auto">
                    <p className="text-gray-500">QR Code indisponível</p>
                  </div>
                )}
              </div>

              {/* Informações do Pagamento */}
              <div className="bg-gray-50 rounded-xl p-4 mb-6">
                <h3 className="font-semibold text-gray-800 mb-3 text-center">Detalhes do Pagamento</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">ID do Pagamento:</span>
                    <span className="font-mono text-xs bg-gray-200 px-2 py-1 rounded">#{paymentData.id}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Status:</span>
                    <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-medium">
                      {paymentData.status === 'pending' ? 'Aguardando Pagamento' : paymentData.status}
                    </span>
                  </div>
                  <div className="flex justify-between items-center pt-2 border-t border-gray-200">
                    <span className="text-gray-600 font-medium">Total:</span>
                    <span className="font-bold text-lg text-green-600">R$ {formData.total.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* Botões de Ação */}
              <div className="space-y-3">
                <button
                  onClick={copyPixCode}
                  className="w-full bg-blue-500 text-white py-3 px-4 rounded-xl hover:bg-blue-600 transition-colors flex items-center justify-center space-x-2 font-medium"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                  <span>Copiar Código PIX</span>
                </button>

                {paymentData.ticket_url && (
                  <a
                    href={paymentData.ticket_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full bg-green-500 text-white py-3 px-4 rounded-xl hover:bg-green-600 transition-colors flex items-center justify-center space-x-2 font-medium"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                    <span>Ver no Mercado Pago</span>
                  </a>
                )}

                <button
                  onClick={backToForm}
                  className="w-full bg-gray-500 text-white py-3 px-4 rounded-xl hover:bg-gray-600 transition-colors font-medium"
                >
                  ← Voltar ao Checkout
                </button>
              </div>

              {/* Instruções */}
              <div className="mt-6 p-4 bg-blue-50 rounded-xl border border-blue-200">
                <h4 className="font-semibold text-blue-800 mb-2 text-center">Como pagar:</h4>
                <ol className="text-sm text-blue-700 space-y-1">
                  <li className="flex items-center"><span className="w-5 h-5 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs mr-2">1</span>Abra o app do seu banco</li>
                  <li className="flex items-center"><span className="w-5 h-5 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs mr-2">2</span>Escolha a opção PIX</li>
                  <li className="flex items-center"><span className="w-5 h-5 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs mr-2">3</span>Escaneie o QR Code ou cole o código</li>
                  <li className="flex items-center"><span className="w-5 h-5 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs mr-2">4</span>Confirme o pagamento</li>
                </ol>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Obter primeira imagem do carrinho para exibir
  const getProductImage = () => {
    if (cartItems.length > 0) {
      return cartItems[0].product.image_url || 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400&h=400&fit=crop';
    }
    return 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400&h=400&fit=crop';
  };

  // 📝 Renderizar formulário
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 py-4 sm:py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">Finalizar Pedido</h1>
          <p className="text-gray-600">Complete suas informações para realizar o pagamento</p>
        </div>

        {/* Layout responsivo: Uma coluna no mobile, duas colunas no desktop */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Coluna da esquerda - Formulário (2/3 no desktop) */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8">
              {/* 🔔 Exibir erros */}
              {errors.length > 0 && (
                <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded-lg mb-6">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-red-800">Corrija os seguintes erros:</h3>
                      <div className="mt-2 text-sm text-red-700">
                        <ul className="list-disc list-inside space-y-1">
                          {errors.map((err, i) => (
                            <li key={i}>{err}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Seção - Dados Pessoais */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <svg className="w-5 h-5 mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    Dados Pessoais
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="sm:col-span-2">
                      <input
                        type="text"
                        name="nomeCliente"
                        placeholder="Nome completo"
                        value={formData.nomeCliente}
                        onChange={handleChange}
                        className="w-full border-2 border-gray-200 p-3 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all outline-none"
                        required
                      />
                    </div>
                    <input
                      type="email"
                      name="email"
                      placeholder="Email"
                      value={formData.email}
                      onChange={handleChange}
                      className="w-full border-2 border-gray-200 p-3 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all outline-none"
                      required
                    />
                    <input
                      type="text"
                      name="telefone"
                      placeholder="Telefone"
                      value={formData.telefone}
                      onChange={handleChange}
                      className="w-full border-2 border-gray-200 p-3 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all outline-none"
                      required
                    />
                  </div>
                </div>

                {/* Seção - Endereço */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <svg className="w-5 h-5 mr-2 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    Endereço de Entrega
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    <input
                      type="text"
                      name="cep"
                      placeholder="CEP"
                      value={formData.cep}
                      onChange={handleChange}
                      className="w-full border-2 border-gray-200 p-3 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all outline-none"
                      required
                    />
                    <div className="sm:col-span-2">
                      <input
                        type="text"
                        name="rua"
                        placeholder="Rua"
                        value={formData.rua}
                        onChange={handleChange}
                        className="w-full border-2 border-gray-200 p-3 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all outline-none"
                        required
                      />
                    </div>
                    <input
                      type="text"
                      name="numero"
                      placeholder="Número"
                      value={formData.numero}
                      onChange={handleChange}
                      className="w-full border-2 border-gray-200 p-3 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all outline-none"
                      required
                    />
                    <input
                      type="text"
                      name="complemento"
                      placeholder="Complemento (opcional)"
                      value={formData.complemento}
                      onChange={handleChange}
                      className="w-full border-2 border-gray-200 p-3 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all outline-none"
                    />
                    <input
                      type="text"
                      name="bairro"
                      placeholder="Bairro"
                      value={formData.bairro}
                      onChange={handleChange}
                      className="w-full border-2 border-gray-200 p-3 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all outline-none"
                      required
                    />
                    <input
                      type="text"
                      name="cidade"
                      placeholder="Cidade"
                      value={formData.cidade}
                      onChange={handleChange}
                      className="w-full border-2 border-gray-200 p-3 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all outline-none"
                      required
                    />
                    <input
                      type="text"
                      name="estado"
                      placeholder="Estado"
                      value={formData.estado}
                      onChange={handleChange}
                      className="w-full border-2 border-gray-200 p-3 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all outline-none"
                      required
                    />
                  </div>
                </div>

                {/* Seção de Variações do Produto */}
                <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-xl border border-blue-100">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                      <svg className="w-5 h-5 mr-2 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                      </svg>
                      Opções do Produto
                    </h3>
                    {(formData.cor || formData.tamanho) && (
                      <span className="text-xs text-blue-600 bg-blue-100 px-3 py-1 rounded-full font-medium">
                        📋 Pré-preenchido do carrinho
                      </span>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Seleção de Cor */}
                    <div className="space-y-3">
                      <label className="block text-sm font-medium text-gray-700">
                        Cor do produto *
                      </label>
                      <div className="space-y-3">
                        {['Branco', 'Preto'].map((cor) => (
                          <label 
                            key={cor} 
                            className={`flex items-center p-4 border-2 rounded-xl cursor-pointer transition-all hover:shadow-md ${
                              formData.cor === cor 
                                ? 'border-blue-500 bg-blue-50 shadow-lg' 
                                : 'border-gray-200 hover:border-gray-300 bg-white'
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={formData.cor === cor}
                              onChange={() => handleCheckboxChange('cor', cor)}
                              className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                            />
                            <div className="ml-3 flex items-center space-x-3">
                              <div 
                                className={`w-8 h-8 rounded-full border-2 shadow-sm ${
                                  cor === 'Branco' 
                                    ? 'bg-white border-gray-400' 
                                    : 'bg-black border-black'
                                }`}
                              />
                              <span className="text-sm font-medium text-gray-900">{cor}</span>
                            </div>
                          </label>
                        ))}
                      </div>
                      {formData.cor && (
                        <p className="text-sm text-green-600 mt-2 flex items-center">
                          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          Cor selecionada: {formData.cor}
                        </p>
                      )}
                    </div>

                    {/* Seleção de Tamanho */}
                    <div className="space-y-3">
                      <label className="block text-sm font-medium text-gray-700">
                        Tamanho do produto *
                      </label>
                      <div className="grid grid-cols-3 gap-3">
                        {['P', 'M', 'G'].map((tamanho) => (
                          <label 
                            key={tamanho}
                            className={`
                              flex items-center justify-center p-4 border-2 rounded-xl cursor-pointer transition-all font-semibold text-lg hover:shadow-md
                              ${formData.tamanho === tamanho 
                                ? 'border-blue-500 bg-blue-50 text-blue-700 shadow-lg' 
                                : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50 text-gray-700'
                              }
                            `}
                          >
                            <input
                              type="checkbox"
                              checked={formData.tamanho === tamanho}
                              onChange={() => handleCheckboxChange('tamanho', tamanho)}
                              className="sr-only"
                            />
                            <span>{tamanho}</span>
                          </label>
                        ))}
                      </div>
                      {formData.tamanho && (
                        <p className="text-sm text-green-600 mt-2 flex items-center">
                          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          Tamanho selecionado: {formData.tamanho}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white py-4 px-8 rounded-xl hover:from-green-600 hover:to-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-semibold text-lg shadow-lg hover:shadow-xl"
                >
                  {loading ? (
                    <div className="flex items-center justify-center">
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Processando...
                    </div>
                  ) : (
                    <div className="flex items-center justify-center">
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                      Finalizar Pedido
                    </div>
                  )}
                </button>

                {/* Debug temporário */}
                {paymentData && (
                  <div className="mt-4 p-3 bg-yellow-100 border rounded-lg">
                    <p className="text-sm font-semibold">🐛 Debug Info:</p>
                    <p className="text-xs">showQRCode: {showQRCode.toString()}</p>
                    <p className="text-xs">paymentData.id: {paymentData.id}</p>
                    <p className="text-xs">qr_code_base64 length: {paymentData.qr_code_base64?.length || 0}</p>
                    <button
                      type="button"
                      onClick={() => setShowQRCode(true)}
                      className="mt-2 px-3 py-1 bg-blue-500 text-white text-xs rounded"
                    >
                      Forçar mostrar QR Code
                    </button>
                  </div>
                )}
              </form>
            </div>
          </div>

          {/* Coluna da direita - Resumo e Imagem (1/3 no desktop) */}
          <div className="lg:col-span-1 space-y-6">
            
            {/* Imagem do Produto */}
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
              <div className="aspect-square">
                <img
                  src={getProductImage()}
                  alt="Produto do carrinho"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400&h=400&fit=crop';
                  }}
                />
              </div>
              <div className="p-4">
                <h3 className="font-semibold text-gray-900 text-center">Produto do seu pedido</h3>
              </div>
            </div>

            {/* Resumo do pedido */}
            <div className="bg-white rounded-2xl shadow-xl p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                <svg className="w-5 h-5 mr-2 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                Resumo do Pedido
              </h3>
              
              {/* Variações selecionadas */}
              {(formData.cor || formData.tamanho) && (
                <div className="mb-4 p-4 bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-xl">
                  <p className="text-sm font-medium text-blue-800 mb-2">Variações selecionadas:</p>
                  <div className="flex flex-wrap gap-2">
                    {formData.cor && (
                      <span className="inline-flex items-center text-xs bg-white px-3 py-1 rounded-full border border-blue-200 text-blue-700 font-medium">
                        <div className={`w-3 h-3 rounded-full mr-2 ${formData.cor === 'Branco' ? 'bg-white border border-gray-400' : 'bg-black'}`}></div>
                        {formData.cor}
                      </span>
                    )}
                    {formData.tamanho && (
                      <span className="inline-flex items-center text-xs bg-white px-3 py-1 rounded-full border border-blue-200 text-blue-700 font-medium">
                        <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                        </svg>
                        Tamanho {formData.tamanho}
                      </span>
                    )}
                  </div>
                </div>
              )}

              {/* Itens do carrinho */}
              <div className="space-y-3 mb-4">
                {formData.carrinho.map((item) => (
                  <div key={item.id} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-b-0">
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900 text-sm">{item.name}</h4>
                      <p className="text-xs text-gray-600">Qtd: {item.quantity}</p>
                    </div>
                    <span className="font-semibold text-gray-900">R$ {(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>
              
              <div className="border-t-2 border-gray-200 pt-4">
                <div className="flex justify-between items-center text-xl font-bold text-gray-900">
                  <span>Total:</span>
                  <span className="text-green-600">R$ {formData.total.toFixed(2)}</span>
                </div>
              </div>

              {/* Garantias */}
              <div className="mt-6 space-y-2">
                <div className="flex items-center text-sm text-gray-600">
                  <svg className="w-4 h-4 mr-2 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Compra 100% segura
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <svg className="w-4 h-4 mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Entrega expressa
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <svg className="w-4 h-4 mr-2 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                  Garantia de qualidade
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
