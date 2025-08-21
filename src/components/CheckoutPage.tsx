import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
  const navigate = useNavigate();
  const { handleError } = useErrorHandler();
  const isRetryable = (error: any) => {
    return error?.code === 'NETWORK_ERROR' || 
           error?.message?.includes('timeout') || 
           error?.message?.includes('fetch');
  };
  const { validateCheckout } = useValidation();
  const supabaseRetry = useSupabaseRetry();
  const apiRetry = useApiRetry();



  const handleCheckoutSubmit = async (formData: any) => {
    if (isProcessing) return;

    setIsProcessing(true);

    try {
      // 🔍 Validar dados do formulário
      const validation = validateCheckout(formData);
      if (!validation.isValid) {
        throw new Error(validation.errors[0]); // Mostrar primeiro erro
      }

      const totalAmount = getTotal();

      if (!cartItems || cartItems.length === 0) {
        throw new Error('Carrinho vazio. Adicione produtos antes de finalizar a compra.');
      }

      const validItems = cartItems.filter(item =>
        item &&
        item.product &&
        typeof item.product.id === 'number' &&
        typeof item.product.name === 'string' &&
        typeof item.quantity === 'number' &&
        item.quantity > 0
      );

      if (validItems.length === 0) {
        throw new Error('Dados do carrinho inválidos. Recarregue a página e tente novamente.');
      }

      const carrinhoFormatado = validItems.map(item => ({
        id: item.product.id,
        name: item.product.name,
        quantity: item.quantity
      }));

      console.log('Enviando dados para pagamento:', {
        carrinho: carrinhoFormatado,
        nomeCliente: formData.nomeCliente,
        email: formData.email,
        total: totalAmount
      });

      await api.wakeUpServer();

      // Preparar dados do pedido para o orderService
      const orderDataForService: OrderData = {
        nomeCliente: formData.nomeCliente,
        email: formData.email,
        telefone: formData.telefone || '',
        cpf: formData.cpf || '',
        cep: formData.cep || '',
        rua: formData.rua || '',
        numero: formData.numero || '',
        complemento: formData.complemento || '',
        bairro: formData.bairro || '',
        cidade: formData.cidade || '',
        estado: formData.estado || ''
      };

      console.log('🚀 Processando checkout...');
      console.log('📋 Dados do formulário:', formData);
      console.log('📋 Dados formatados para orderService:', orderDataForService);
      console.log('🛒 Itens do carrinho:', cartItems);
      console.log('🛒 Itens validados:', validItems);

      // Criar pedido no Supabase primeiro (com retry)
      console.log('📝 Criando pedido no Supabase...');
      const order = await supabaseRetry.executeWithRetry(
        () => orderService.createOrder(
          orderDataForService,
          validItems,
          'pix', // método de pagamento
          0, // desconto
          0  // taxa de entrega
        ),
        'Criação de pedido'
      );

      console.log('✅ Pedido criado com ID:', order.id);
      console.log('📊 Detalhes completos do pedido:', order);

      // Salvar o ID do pedido para referência
      localStorage.setItem('currentOrderId', order.id.toString());

      const paymentDataPayload = {
        email_cliente: formData.email,
        nome_cliente: formData.nomeCliente,
        valor_total: totalAmount,
        carrinho: carrinhoFormatado,
        pedido_id: order.id // Vincular com o pedido do Supabase
      };

      console.log('💳 Payload completo para pagamento:', paymentDataPayload);

      const paymentResponse = await apiRetry.executeWithRetry(
        () => api.createPayment({
          carrinho: carrinhoFormatado,
          nomeCliente: formData.nomeCliente,
          email: formData.email,
          total: totalAmount
        }),
        'Pagamento PIX'
      );

      console.log('💳 Resposta do pagamento:', paymentResponse);

      if (!paymentResponse?.qr_code_base64) {
        throw new Error('QR Code não foi gerado. Tente novamente.');
      }

      toast.success('Pedido criado com sucesso!');

      // Redirecionar para a página de pagamento
      navigate('/payment', {
        state: {
          paymentData: paymentResponse,
          customerData: {
            nome: formData.nomeCliente,
            email: formData.email
          },
          orderData: order // Incluir dados do pedido do Supabase
        }
      });

      clearCart();
    } catch (error: any) {
      console.error('💥 Erro no checkout:', error);

      // Se o pagamento falhou mas o pedido foi criado, cancelar o pedido
      const currentOrderId = localStorage.getItem('currentOrderId');
      if (currentOrderId) {
        try {
          console.log('🔄 Cancelando pedido devido ao erro no pagamento...');
          await orderService.cancelOrder(parseInt(currentOrderId));
          localStorage.removeItem('currentOrderId');
          console.log('✅ Pedido cancelado com sucesso');
        } catch (cancelError) {
          console.error('❌ Erro ao cancelar pedido:', cancelError);
        }
      }

      // 🛡️ Usar error handler melhorado
      const friendlyMessage = handleError(error, 'Checkout');
      toast.error(friendlyMessage);

      // Se o erro é retryable, mostrar opção de retry
      if (isRetryable(error)) {
        toast.error('Você pode tentar novamente', {
          duration: 5000,
          icon: '🔄'
        });
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
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Carrinho vazio
          </h1>
          <p className="text-gray-600 mb-8">
            Adicione produtos ao carrinho antes de finalizar a compra.
          </p>
          <button
            onClick={() => navigate('/')}
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
            <h1 className="text-2xl font-bold text-gray-900">
              Finalizar compra
            </h1>
            <p className="text-gray-600 mt-1">
              {cartItems.length} item(s) - Total: R$ {getTotal().toFixed(2)}
            </p>
          </div>

          <div className="p-6">
            {/* Resumo dos itens */}
            <div className="mb-8">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Resumo do pedido
              </h2>
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
                      <span className="text-sm text-gray-500">
                        Quantidade: {item.quantity}
                      </span>
                    </div>
                    <span className="font-medium">
                      R$ {(item.product.price * item.quantity).toFixed(2)}
                    </span>
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
          </div>
        </div>
      </div>
    </div>
  );
};
