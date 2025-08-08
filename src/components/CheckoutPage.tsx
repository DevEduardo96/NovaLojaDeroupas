import React, { useState } from 'react';
import { CheckoutForm } from '../components/CheckoutForm';
import { PaymentStatus } from '../components/PaymentStatus';
import { PaymentData } from '../types';
import { api } from '../services/api';
import { useCart } from '../hooks/useCart';

export const CheckoutPage: React.FC = () => {
  const { items: cartItems, getTotal } = useCart();
  const [isLoading, setIsLoading] = useState(false);
  const [paymentData, setPaymentData] = useState<PaymentData | null>(null);

  const totalAmount = getTotal();

  const handleSubmit = async (formData: { nomeCliente: string; email: string }) => {
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

      const response = await api.createPayment({
        carrinho: carrinhoFormatado,
        nomeCliente: formData.nomeCliente,
        email: formData.email,
        total: totalAmount
      });

      console.log('Resposta recebida:', response);

      // Salva o paymentId no localStorage (para usar na página de download)
      if (response?.id) {
        localStorage.setItem('artfyPaymentId', response.id);
      }

      setPaymentData(response);

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