import React, { useState } from 'react';
import { useLocation } from 'wouter';
import { CheckoutForm } from './CheckoutForm';
import { api } from '../services/api';
import { useCart } from '../hooks/useCart';
import { orderService, type OrderData } from '../services/orderService';
import { useErrorHandler } from '../utils/errorHandler';
import { useValidation } from '../utils/validation';
import { useSupabaseRetry, useApiRetry } from '../hooks/useRetry';
import { toast } from 'react-hot-toast';

export const CheckoutPage: React.FC = () => {
  const { items: cartItems, getTotal, clearCart } = useCart();
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentData, setPaymentData] = useState<{
    qrCodeBase64: string;
    ticketUrl: string;
  } | null>(null);
  const [, setLocation] = useLocation();
  const { handleError } = useErrorHandler();
  const { validateCheckout } = useValidation();
  const supabaseRetry = useSupabaseRetry();
  const apiRetry = useApiRetry();

  const isRetryable = (error: any) => {
    return error?.code === 'NETWORK_ERROR' ||
           error?.message?.includes('timeout') ||
           error?.message?.includes('fetch');
  };

  const handleCheckoutSubmit = async (formData: any) => {
    if (isProcessing) return;
    setIsProcessing(true);

    try {
      // 🔍 Validar formulário
      const validation = validateCheckout(formData);
      if (!validation.isValid) throw new Error(validation.errors[0]);

      const totalAmount = getTotal();
      if (!cartItems || cartItems.length === 0) {
        throw new Error('Carrinho vazio. Adicione produtos antes de finalizar a compra.');
      }

      const validItems = cartItems.filter(item =>
        item && item.product && typeof item.product.id === 'number' &&
        typeof item.product.name === 'string' && typeof item.quantity === 'number' &&
        item.quantity > 0
      );

      if (validItems.length === 0) {
        throw new Error('Dados do carrinho inválidos. Recarregue a página e tente novamente.');
      }

      await api.wakeUpServer();

      // 📝 Preparar dados do pedido
      const orderDataForService: OrderData = {
        nomeCliente: formData.nomeCliente?.trim() || '',
        email: formData.email?.trim() || '',
        telefone: formData.telefone?.trim() || '',
        cpf: formData.cpf?.trim() || '',
        cep: formData.cep?.trim() || '',
        rua: formData.rua?.trim() || '',
        numero: formData.numero?.trim() || '',
        complemento: formData.complemento?.trim() || '',
        bairro: formData.bairro?.trim() || '',
        cidade: formData.cidade?.trim() || '',
        estado: formData.estado?.trim() || ''
      };

      // Preparar dados para pagamento
      const carrinhoFormatado = validItems.map(item => ({
        id: item.product.id,
        name: item.product.name,
        quantity: item.quantity
      }));

      // 🎯 Criar pedido no Supabase
      const order = await supabaseRetry.executeWithRetry(
        () => orderService.createOrder(orderDataForService, validItems, 'pix', 0, 0),
        'Criação de pedido'
      );
      localStorage.setItem('currentOrderId', order.id.toString());

      // 💳 Criar pagamento PIX
      const paymentResponse = await apiRetry.executeWithRetry(
        () => api.createPayment({
          carrinho: carrinhoFormatado,
          nomeCliente: formData.nomeCliente,
          email: formData.email,
          telefone: formData.telefone,
          endereco: {
            cep: formData.cep,
            rua: formData.rua,
            numero: formData.numero,
            complemento: formData.complemento,
            bairro: formData.bairro,
            cidade: formData.cidade,
            estado: formData.estado
          },
          total: totalAmount
        }),
        'Pagamento PIX'
      );

      if (!paymentResponse?.qr_code_base64) {
        await orderService.cancelOrder(order.id);
        throw new Error('QR Code não foi gerado. Tente novamente.');
      }

      // Salvar QR Code para exibir
      setPaymentData({
        qrCodeBase64: paymentResponse.qr_code_base64,
        ticketUrl: paymentResponse.ticket_url
      });

      toast.success('Pedido criado! Escaneie o QR Code para pagar.');

      clearCart();
    } catch (error: any) {
      console.error('💥 Erro no checkout:', error);

      const currentOrderId = localStorage.getItem('currentOrderId');
      if (currentOrderId) {
        try {
          await orderService.cancelOrder(parseInt(currentOrderId));
          localStorage.removeItem('currentOrderId');
        } catch (cancelError) {
          console.error('❌ Erro ao cancelar pedido:', cancelError);
        }
      }

      const friendlyMessage = handleError(error, 'Checkout');
      toast.error(friendlyMessage);

      if (isRetryable(error)) {
        toast.error('Você pode tentar novamente em alguns instantes', { duration: 5000, icon: '🔄' });
      }
    } finally {
      setIsProcessing(false);
      supabaseRetry.reset();
      apiRetry.reset();
    }
  };

  if (!cartItems || cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Carrinho vazio</h1>
          <p className="text-gray-600 mb-8">Adicione produtos ao carrinho antes de finalizar a compra.</p>
          <button
            onClick={() => setLocation('/')}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Ver produtos
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-md">
          <div className="px-6 py-4 border-b border-gray-200">
            <h1 className="text-2xl font-bold text-gray-900">Finalizar compra</h1>
            <p className="text-gray-600 mt-1">
              {cartItems.length} item(s) - Total: R$ {getTotal().toFixed(2)}
            </p>
          </div>

          <div className="p-6">
            {/* Resumo dos itens */}
            <div className="mb-8">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Resumo do pedido</h2>
              <div className="space-y-3">
                {cartItems.map((item, index) => (
                  <div key={index} className="flex justify-between items-center">
                    <div>
                      <span className="font-medium">{item.product.name}</span>
                      {(item.selectedSize || item.selectedColor) && (
                        <div className="text-sm text-gray-500">
                          {item.selectedSize && `Tamanho: ${item.selectedSize}`}
                          {item.selectedSize && item.selectedColor && ' • '}
                          {item.selectedColor && `Cor: ${item.selectedColor}`}
                        </div>
                      )}
                      <span className="text-sm text-gray-500">Quantidade: {item.quantity}</span>
                    </div>
                    <span className="font-medium">R$ {(item.product.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>
              <div className="border-t pt-3 mt-3">
                <div className="flex justify-between items-center font-bold">
                  <span>Total:</span>
                  <span>R$ {getTotal().toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Formulário de checkout */}
            <CheckoutForm
              items={cartItems}
              total={getTotal()}
              onSubmit={handleCheckoutSubmit}
              isLoading={isProcessing}
            />

            {/* QR Code PIX */}
            {paymentData && (
              <div className="mt-8 text-center">
                <h2 className="text-xl font-semibold mb-4">Pagamento PIX</h2>
                <p className="mb-2">Escaneie o QR Code abaixo para pagar:</p>
                <img
                  src={`data:image/png;base64,${paymentData.qrCodeBase64}`}
                  alt="QR Code PIX"
                  className="mx-auto mb-4"
                />
                <p>Ou clique no botão para abrir o link do pagamento:</p>
                <a
                  href={paymentData.ticketUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block mt-2 px-6 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                >
                  Pagar via Mercado Pago
                </a>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
};
