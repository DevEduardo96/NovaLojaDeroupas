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
      <div className="max-w-md mx-auto p-6 bg-white shadow-lg rounded-lg">
        <div className="text-center">
          {/* Header */}
          <div className="mb-6">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Pagamento PIX</h2>
            <p className="text-gray-600">Escaneie o QR Code ou copie o código PIX</p>
          </div>

          {/* QR Code */}
          <div className="bg-white p-6 rounded-lg border-2 border-gray-200 mb-6">
            {paymentData.qr_code_base64 ? (
              <img
                src={`data:image/png;base64,${paymentData.qr_code_base64}`}
                alt="QR Code PIX"
                className="w-full max-w-xs mx-auto"
                style={{ imageRendering: 'pixelated' }}
                onError={(e) => {
                  console.error("❌ Erro ao carregar QR Code:", e);
                  console.log("🔍 Base64 data:", paymentData.qr_code_base64?.substring(0, 100) + "...");
                }}
                onLoad={() => console.log("✅ QR Code carregado com sucesso")}
              />
            ) : (
              <div className="w-64 h-64 bg-gray-200 rounded flex items-center justify-center mx-auto">
                <p className="text-gray-500">QR Code indisponível</p>
              </div>
            )}
          </div>

          {/* Informações do Pagamento */}
          <div className="bg-gray-50 p-4 rounded-lg mb-6 text-left">
            <h3 className="font-semibold text-gray-800 mb-3">Detalhes do Pagamento</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">ID do Pagamento:</span>
                <span className="font-medium">#{paymentData.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Status:</span>
                <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded text-xs font-medium">
                  {paymentData.status === 'pending' ? 'Aguardando Pagamento' : paymentData.status}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Total:</span>
                <span className="font-bold text-green-600">R$ {formData.total.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Botões de Ação */}
          <div className="space-y-3">
            <button
              onClick={copyPixCode}
              className="w-full bg-blue-500 text-white py-3 px-4 rounded-lg hover:bg-blue-600 transition-colors flex items-center justify-center space-x-2"
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
                className="w-full bg-green-500 text-white py-3 px-4 rounded-lg hover:bg-green-600 transition-colors flex items-center justify-center space-x-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
                <span>Ver no Mercado Pago</span>
              </a>
            )}

            <button
              onClick={backToForm}
              className="w-full bg-gray-500 text-white py-3 px-4 rounded-lg hover:bg-gray-600 transition-colors"
            >
              ← Voltar ao Checkout
            </button>
          </div>

          {/* Instruções */}
          <div className="mt-6 p-4 bg-blue-50 rounded-lg text-left">
            <h4 className="font-semibold text-blue-800 mb-2">Como pagar:</h4>
            <ol className="text-sm text-blue-700 space-y-1">
              <li>1. Abra o app do seu banco</li>
              <li>2. Escolha a opção PIX</li>
              <li>3. Escaneie o QR Code ou cole o código copiado</li>
              <li>4. Confirme o pagamento</li>
            </ol>
          </div>
        </div>
      </div>
    );
  }

  // 📝 Renderizar formulário
  return (
    <div className="max-w-lg mx-auto p-6 bg-white shadow rounded-lg">
      <h2 className="text-2xl font-bold mb-4">Checkout</h2>

      {/* 🔔 Exibir erros */}
      {errors.length > 0 && (
        <div className="bg-red-100 text-red-700 p-3 rounded mb-4">
          <ul>
            {errors.map((err, i) => (
              <li key={i}>⚠️ {err}</li>
            ))}
          </ul>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          name="nomeCliente"
          placeholder="Nome completo"
          value={formData.nomeCliente}
          onChange={handleChange}
          className="w-full border p-2 rounded"
          required
        />

        <input
          type="email"
          name="email"
          placeholder="Email"
          value={formData.email}
          onChange={handleChange}
          className="w-full border p-2 rounded"
          required
        />

        <input
          type="text"
          name="telefone"
          placeholder="Telefone"
          value={formData.telefone}
          onChange={handleChange}
          className="w-full border p-2 rounded"
          required
        />

        <input
          type="text"
          name="cep"
          placeholder="CEP"
          value={formData.cep}
          onChange={handleChange}
          className="w-full border p-2 rounded"
          required
        />

        <input
          type="text"
          name="rua"
          placeholder="Rua"
          value={formData.rua}
          onChange={handleChange}
          className="w-full border p-2 rounded"
          required
        />

        <input
          type="text"
          name="numero"
          placeholder="Número"
          value={formData.numero}
          onChange={handleChange}
          className="w-full border p-2 rounded"
          required
        />

        <input
          type="text"
          name="bairro"
          placeholder="Bairro"
          value={formData.bairro}
          onChange={handleChange}
          className="w-full border p-2 rounded"
          required
        />

        <input
          type="text"
          name="cidade"
          placeholder="Cidade"
          value={formData.cidade}
          onChange={handleChange}
          className="w-full border p-2 rounded"
          required
        />

        <input
          type="text"
          name="estado"
          placeholder="Estado"
          value={formData.estado}
          onChange={handleChange}
          className="w-full border p-2 rounded"
          required
        />

        {/* Seção de Variações do Produto */}
        <div className="bg-gray-50 p-4 rounded-lg border">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-800">Opções do Produto</h3>
            {(formData.cor || formData.tamanho) && (
              <span className="text-xs text-blue-600 bg-blue-100 px-2 py-1 rounded-full">
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
                    className="flex items-center p-3 border border-gray-200 rounded-md hover:bg-gray-50 cursor-pointer transition-colors"
                  >
                    <input
                      type="checkbox"
                      checked={formData.cor === cor}
                      onChange={() => handleCheckboxChange('cor', cor)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <div className="ml-3 flex items-center space-x-3">
                      <div 
                        className={`w-6 h-6 rounded-full border-2 ${
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
                <p className="text-xs text-green-600 mt-2">
                  ✓ Cor selecionada: {formData.cor}
                </p>
              )}
            </div>

            {/* Seleção de Tamanho */}
            <div className="space-y-3">
              <label className="block text-sm font-medium text-gray-700">
                Tamanho do produto *
              </label>
              <div className="grid grid-cols-3 gap-2">
                {['P', 'M', 'G'].map((tamanho) => (
                  <label 
                    key={tamanho}
                    className={`
                      flex items-center justify-center p-3 border-2 rounded-md cursor-pointer transition-all
                      ${formData.tamanho === tamanho 
                        ? 'border-blue-500 bg-blue-50 text-blue-700' 
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                      }
                    `}
                  >
                    <input
                      type="checkbox"
                      checked={formData.tamanho === tamanho}
                      onChange={() => handleCheckboxChange('tamanho', tamanho)}
                      className="sr-only"
                    />
                    <span className="font-medium">{tamanho}</span>
                  </label>
                ))}
              </div>
              {formData.tamanho && (
                <p className="text-xs text-green-600 mt-2">
                  ✓ Tamanho selecionado: {formData.tamanho}
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="p-3 border rounded bg-gray-50">
          <h3 className="font-semibold mb-2">Resumo do pedido</h3>
          
          {/* Variações selecionadas */}
          {(formData.cor || formData.tamanho) && (
            <div className="mb-3 p-2 bg-blue-50 border border-blue-200 rounded">
              <p className="text-sm font-medium text-blue-800 mb-1">Variações selecionadas:</p>
              <div className="flex flex-wrap gap-2">
                {formData.cor && (
                  <span className="text-xs bg-white px-2 py-1 rounded border text-blue-700">
                    Cor: {formData.cor}
                  </span>
                )}
                {formData.tamanho && (
                  <span className="text-xs bg-white px-2 py-1 rounded border text-blue-700">
                    Tamanho: {formData.tamanho}
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Itens do carrinho */}
          {formData.carrinho.map((item) => (
            <div key={item.id} className="flex justify-between">
              <span>
                {item.name} x{item.quantity}
              </span>
              <span>R$ {(item.price * item.quantity).toFixed(2)}</span>
            </div>
          ))}
          
          <div className="flex justify-between font-bold mt-2 pt-2 border-t">
            <span>Total:</span>
            <span>R$ {formData.total.toFixed(2)}</span>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-green-500 text-white py-2 rounded hover:bg-green-600 disabled:opacity-50"
        >
          {loading ? "Processando..." : "Finalizar Pedido"}
        </button>

        {/* Debug temporário */}
        {paymentData && (
          <div className="mt-4 p-3 bg-yellow-100 border rounded">
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
  );
};

export default CheckoutPage;