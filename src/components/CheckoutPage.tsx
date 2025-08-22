
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../hooks/useCart';
import { CheckoutForm } from './CheckoutForm';
import { ArrowLeft, ShoppingCart } from 'lucide-react';

interface PaymentResponse {
  id: number;
  status: string;
  qr_code: string;
  qr_code_base64: string;
  ticket_url: string;
}

const CheckoutPage: React.FC = () => {
  const navigate = useNavigate();
  const { items, total, clearCart } = useCart();
  const [isLoading, setIsLoading] = useState(false);
  const [paymentData, setPaymentData] = useState<PaymentResponse | null>(null);
  const [showQRCode, setShowQRCode] = useState(false);

  // Se o carrinho estiver vazio, redirecionar
  if (items.length === 0 && !paymentData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-md text-center max-w-md">
          <ShoppingCart className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Carrinho Vazio
          </h2>
          <p className="text-gray-600 mb-6">
            Adicione alguns produtos ao carrinho antes de finalizar a compra.
          </p>
          <button
            onClick={() => navigate('/')}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Continuar Comprando
          </button>
        </div>
      </div>
    );
  }

  // Copiar código PIX
  const copyPixCode = () => {
    if (paymentData?.qr_code) {
      navigator.clipboard.writeText(paymentData.qr_code);
      alert("Código PIX copiado para a área de transferência!");
    }
  };

  // Voltar para o formulário
  const backToForm = () => {
    setShowQRCode(false);
    setPaymentData(null);
  };

  // Nova compra
  const newPurchase = () => {
    setShowQRCode(false);
    setPaymentData(null);
    clearCart();
    navigate('/');
  };

  // Processar checkout
  const handleCheckoutSubmit = async (checkoutData: any) => {
    setIsLoading(true);
    
    try {
      console.log('📦 Dados enviados para o backend:', checkoutData);

      const response = await fetch(
        "https://backend-nectix.onrender.com/api/payments/criar-pagamento",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(checkoutData),
        }
      );

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || "Erro no pagamento");
      }

      console.log("✅ Resposta do backend:", data);
      setPaymentData(data);
      setShowQRCode(true);
    } catch (error: any) {
      console.error("❌ Erro no checkout:", error);
      alert(`Erro ao processar pagamento: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Renderizar QR Code se temos dados de pagamento
  if (showQRCode && paymentData) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-md mx-auto">
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-green-500 to-green-600 p-6 text-white text-center">
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold mb-2">Pagamento PIX</h2>
              <p className="text-green-100">Escaneie o QR Code ou copie o código</p>
            </div>

            {/* QR Code */}
            <div className="p-6">
              <div className="bg-white border-2 border-gray-100 rounded-xl p-4 mb-6">
                {paymentData.qr_code_base64 ? (
                  <img
                    src={`data:image/png;base64,${paymentData.qr_code_base64}`}
                    alt="QR Code PIX"
                    className="w-full max-w-xs mx-auto"
                    style={{ imageRendering: 'pixelated' }}
                  />
                ) : (
                  <div className="w-64 h-64 bg-gray-200 rounded flex items-center justify-center mx-auto">
                    <p className="text-gray-500">QR Code indisponível</p>
                  </div>
                )}
              </div>

              {/* Informações do Pagamento */}
              <div className="bg-gray-50 rounded-xl p-4 mb-6">
                <h3 className="font-semibold text-gray-800 mb-3">Detalhes do Pagamento</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">ID:</span>
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
                    <span className="font-bold text-green-600">
                      {new Intl.NumberFormat('pt-BR', {
                        style: 'currency',
                        currency: 'BRL'
                      }).format(total)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Botões de Ação */}
              <div className="space-y-3">
                <button
                  onClick={copyPixCode}
                  className="w-full bg-blue-500 text-white py-3 px-4 rounded-xl hover:bg-blue-600 transition-colors flex items-center justify-center space-x-2"
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
                    className="w-full bg-green-500 text-white py-3 px-4 rounded-xl hover:bg-green-600 transition-colors flex items-center justify-center space-x-2"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                    <span>Ver no Mercado Pago</span>
                  </a>
                )}

                <button
                  onClick={newPurchase}
                  className="w-full bg-purple-500 text-white py-3 px-4 rounded-xl hover:bg-purple-600 transition-colors"
                >
                  Nova Compra
                </button>

                <button
                  onClick={backToForm}
                  className="w-full bg-gray-500 text-white py-3 px-4 rounded-xl hover:bg-gray-600 transition-colors"
                >
                  ← Voltar ao Checkout
                </button>
              </div>

              {/* Instruções */}
              <div className="mt-6 p-4 bg-blue-50 rounded-xl">
                <h4 className="font-semibold text-blue-800 mb-2">Como pagar:</h4>
                <ol className="text-sm text-blue-700 space-y-1">
                  <li>1. Abra o app do seu banco</li>
                  <li>2. Escolha a opção PIX</li>
                  <li>3. Escaneie o QR Code ou cole o código</li>
                  <li>4. Confirme o pagamento</li>
                </ol>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Renderizar formulário de checkout
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Voltar
            </button>
            <h1 className="text-2xl font-bold text-gray-900">Finalizar Compra</h1>
          </div>
        </div>
      </div>

      {/* Conteúdo */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Formulário */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm p-6">
              <CheckoutForm
                items={items}
                total={total}
                onSubmit={handleCheckoutSubmit}
                isLoading={isLoading}
              />
            </div>
          </div>

          {/* Resumo do Pedido */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm p-6 sticky top-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Resumo do Pedido
              </h3>
              
              <div className="space-y-4">
                {items.map((item, index) => (
                  <div 
                    key={`${item.product.id}-${item.selectedSize || ''}-${item.selectedColor || ''}-${index}`} 
                    className="flex justify-between items-start"
                  >
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">{item.product.name}</h4>
                      {(item.selectedSize || item.selectedColor) && (
                        <p className="text-sm text-gray-600">
                          {item.selectedSize && `Tamanho: ${item.selectedSize}`}
                          {item.selectedSize && item.selectedColor && ', '}
                          {item.selectedColor && `Cor: ${item.selectedColor}`}
                        </p>
                      )}
                      <p className="text-sm text-gray-600">Qtd: {item.quantity}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-gray-900">
                        {new Intl.NumberFormat('pt-BR', {
                          style: 'currency',
                          currency: 'BRL'
                        }).format(item.product.price * item.quantity)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="border-t pt-4 mt-4">
                <div className="flex justify-between items-center text-lg font-bold">
                  <span>Total:</span>
                  <span>
                    {new Intl.NumberFormat('pt-BR', {
                      style: 'currency',
                      currency: 'BRL'
                    }).format(total)}
                  </span>
                </div>
              </div>

              <div className="mt-6 p-4 bg-green-50 rounded-lg">
                <div className="flex items-center space-x-2 text-green-800">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="text-sm font-medium">Pagamento 100% seguro via PIX</span>
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
