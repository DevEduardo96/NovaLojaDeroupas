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
        throw new Error(validation.errors[0]);
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

      console.log('🚀 Processando checkout...');
      console.log('📋 Dados do formulário:', formData);
      console.log('🛒 Itens do carrinho:', cartItems);
      console.log('🛒 Itens validados:', validItems);

      await api.wakeUpServer();

      // 📝 Preparar dados do pedido conforme schema da tabela pedidos
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

      console.log('📋 Dados formatados para orderService:', orderDataForService);

      // 🎯 Criar pedido no Supabase primeiro (PRIORIDADE)
      console.log('📝 Criando pedido na tabela pedidos...');
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

      console.log('✅ Pedido criado na tabela pedidos com ID:', order.id);
      console.log('📊 Detalhes do pedido:', {
        id: order.id,
        email_cliente: order.email_cliente,
        nome_cliente: order.nome_cliente,
        telefone: order.telefone,
        endereco: {
          cep: order.cep,
          rua: order.rua,
          numero: order.numero,
          complemento: order.complemento,
          bairro: order.bairro,
          cidade: order.cidade,
          estado: order.estado
        },
        total: order.total,
        status: order.status,
        itens: order.itens?.length || 0
      });

      // Salvar ID do pedido para referência
      localStorage.setItem('currentOrderId', order.id.toString());

      // 💳 Preparar dados para pagamento (formato antigo para compatibilidade)
      const carrinhoFormatado = validItems.map(item => ({
        id: item.product.id,
        name: item.product.name,
        quantity: item.quantity
      }));

      const paymentDataPayload = {
        email_cliente: formData.email,
        nome_cliente: formData.nomeCliente,
        valor_total: totalAmount,
        carrinho: carrinhoFormatado,
        pedido_id: order.id // Vincular com o pedido criado
      };

      console.log('💳 Payload para pagamento:', paymentDataPayload);

      // 💳 Criar pagamento PIX
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

      toast.success('Pedido criado com sucesso! Redirecionando para pagamento...');

      // 🎯 Redirecionar para página de pagamento
      navigate('/payment', {
        state: {
          paymentData: paymentResponse,
          customerData: {
            nome: formData.nomeCliente,
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
            }
          },
          orderData: order // Dados completos do pedido
        }
      });

      clearCart();

    } catch (error: any) {
      console.error('💥 Erro no checkout:', error);

      // 🔄 Rollback: Se pagamento falhou mas pedido foi criado, cancelar
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

      // 🛡️ Tratamento de erro melhorado
      const friendlyMessage = handleError(error, 'Checkout');
      toast.error(friendlyMessage);

      if (isRetryable(error)) {
        toast.error('Você pode tentar novamente em alguns instantes', {
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
