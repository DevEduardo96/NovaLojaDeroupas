import React, { useState } from 'react';
import { CheckoutForm } from '../components/CheckoutForm';
import { PaymentStatus } from '../components/PaymentStatus';
import { PaymentData } from '../types';
import { api } from '../services/api';
import { useCart } from '../hooks/useCart';
import { useAuth } from '../contexts/AuthContext';
import { useApi } from '../hooks/useApi';
import { orderService, type OrderData } from '../lib/orderService';
import { toast } from 'react-hot-toast';

export const CheckoutPage: React.FC = () => {
  const { items: cartItems, getTotal, clearCart } = useCart();
  const [isLoading, setIsLoading] = useState(false);
  const [paymentData, setPaymentData] = useState<PaymentData | null>(null);
  const { user } = useAuth();
  const { createPayment } = api; // Assumindo que createPayment está disponível em api

  const totalAmount = getTotal();

  const handleSubmit = async (formData: { nomeCliente: string; email: string; telefone: string; cpf: string; cep: string; rua: string; numero: string; complemento: string; bairro: string; cidade: string; estado: string }) => {
    try {
      setIsLoading(true);

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
        product: {
          id: item.product.id,
          name: item.product.name
        },
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

      // Criar pedido no Supabase primeiro
      console.log('📝 Criando pedido no Supabase...');
      const order = await orderService.createOrder(
        orderDataForService,
        validItems,
        'pix', // método de pagamento
        0, // desconto
        0  // taxa de entrega
      );

      console.log('✅ Pedido criado com ID:', order.id);
      console.log('📊 Detalhes completos do pedido:', order);

      // Salvar o ID do pedido para referência
      localStorage.setItem('currentOrderId', order.id.toString());


      const paymentDataPayload = {
        email_cliente: formData.email,
        nome_cliente: formData.nomeCliente,
        valor_total: totalAmount,
        status: 'pending',
        metodo_pagamento: 'pix',
        pedido_id: order.id,
        items: validItems.map(item => ({
          product_id: item.product.id,
          name: item.product.name,
          price: item.product.price,
          quantity: item.quantity,
          selectedSize: item.selectedSize,
          selectedColor: item.selectedColor,
        })),
        dados_cliente: {
          telefone: formData.telefone,
          cpf: formData.cpf,
          endereco: {
            cep: formData.cep,
            rua: formData.rua,
            numero: formData.numero,
            complemento: formData.complemento,
            bairro: formData.bairro,
            cidade: formData.cidade,
            estado: formData.estado
          }
        }
      };

      const response = await createPayment(paymentDataPayload);

      console.log('Resposta recebida:', response);

      // Salva o paymentId no localStorage (para usar na página de download)
      if (response?.id) {
        localStorage.setItem('artfyPaymentId', response.id);
      }

      setPaymentData(response);
      clearCart(); // Limpa o carrinho após o sucesso

    } catch (err) {
      console.error('Erro ao criar pagamento:', err);

      let errorMessage = 'Erro ao gerar QR Code do Pix. Tente novamente.';

      if (err instanceof Error) {
        if (err.message.includes('Carrinho vazio')) {
          errorMessage = err.message;
        } else if (err.message.includes('Erro ao criar pagamento PIX')) {
          errorMessage = 'Erro no servidor de pagamentos. Por favor, tente novamente em alguns minutos.';
        } else if (err.message.includes('500')) {
          errorMessage = 'Servidor temporariamente indisponível. Tente novamente em alguns minutos.';
        } else {
          errorMessage = err.message; // Captura outras mensagens de erro genéricas
        }
      }

      // Tenta cancelar o pedido se houve um erro após a criação do pedido
      if (err instanceof Error && err.message !== 'Carrinho vazio.' && typeof err.message === 'string' && err.message.includes('Falha ao criar pagamento')) {
        try {
          // Assumindo que 'order' está acessível ou que o ID do pedido foi salvo temporariamente
          const currentOrderJson = localStorage.getItem('currentOrder');
          if (currentOrderJson) {
            const currentOrder = JSON.parse(currentOrderJson);
            if (currentOrder && currentOrder.id) {
              await orderService.cancelOrder(currentOrder.id);
              localStorage.removeItem('currentOrder');
            }
          }
        } catch (cancelError) {
          console.error('Erro ao cancelar pedido após falha no pagamento:', cancelError);
        }
      }

      alert(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    setPaymentData(null);
  };

  return (
    <div className="min-h-screen bg-gray-100 py-10 px-4 sm:px-6 lg:px-8">
      {paymentData ? (
        <PaymentStatus paymentData={paymentData} onBack={handleBack} />
      ) : (
        <CheckoutForm
          items={cartItems}
          total={totalAmount}
          onSubmit={handleSubmit}
          isLoading={isLoading}
        />
      )}
    </div>
  );
};