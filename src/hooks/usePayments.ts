import { useState, useEffect } from "react";
import { paymentService, type Payment } from "../lib/paymentService";
import { useAuth } from "../contexts/AuthContext";

export const usePayments = () => {
  const { user } = useAuth();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchUserPayments = async () => {
    if (!user) {
      setPayments([]);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const data = await paymentService.getUserPayments();
      setPayments(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Erro ao carregar pagamentos";
      setError(errorMessage);
      console.error("Error in usePayments:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserPayments();
  }, [user]);

  const createPayment = async (paymentData: Omit<Payment, 'created_at' | 'updated_at'>) => {
    try {
      setLoading(true);
      setError(null);
      const newPayment = await paymentService.createPayment(paymentData);
      setPayments(prev => [newPayment, ...prev]);
      return newPayment;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Erro ao criar pagamento";
      setError(errorMessage);
      console.error("Error creating payment:", err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updatePaymentStatus = async (id: string, status: string) => {
    try {
      setLoading(true);
      setError(null);
      const updatedPayment = await paymentService.updatePaymentStatus(id, status);
      setPayments(prev => 
        prev.map(payment => 
          payment.id === id ? updatedPayment : payment
        )
      );
      return updatedPayment;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Erro ao atualizar pagamento";
      setError(errorMessage);
      console.error("Error updating payment:", err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const hasUserPurchasedProduct = async (productId: number): Promise<boolean> => {
    if (!user) return false;
    
    try {
      return await paymentService.hasUserPurchasedProduct(productId);
    } catch (err) {
      console.error("Error checking product purchase:", err);
      return false;
    }
  };

  const getProductDownloadLinks = async (productId: number): Promise<string[]> => {
    if (!user) {
      throw new Error("Usuário não autenticado");
    }
    
    try {
      return await paymentService.getProductDownloadLinks(productId);
    } catch (err) {
      console.error("Error getting download links:", err);
      throw err;
    }
  };

  return {
    payments,
    loading,
    error,
    createPayment,
    updatePaymentStatus,
    hasUserPurchasedProduct,
    getProductDownloadLinks,
    refetch: fetchUserPayments,
  };
}; 