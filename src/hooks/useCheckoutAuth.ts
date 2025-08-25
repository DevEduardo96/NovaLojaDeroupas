import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';

export const useCheckoutAuth = () => {
  const { isAuthenticated } = useAuth();
  const [pendingCheckout, setPendingCheckout] = useState(false);

  // Salvar intenção de checkout no localStorage
  const savePendingCheckout = () => {
    localStorage.setItem('pendingCheckout', 'true');
    setPendingCheckout(true);
  };

  // Limpar intenção de checkout
  const clearPendingCheckout = () => {
    localStorage.removeItem('pendingCheckout');
    setPendingCheckout(false);
  };

  // Verificar se há checkout pendente ao carregar
  useEffect(() => {
    const hasPendingCheckout = localStorage.getItem('pendingCheckout') === 'true';
    setPendingCheckout(hasPendingCheckout);
  }, []);

  // Quando usuário fizer login e tiver checkout pendente, redirecionar
  useEffect(() => {
    if (isAuthenticated && pendingCheckout) {
      clearPendingCheckout();
      // Redirecionar para checkout será feito no componente
      return true;
    }
    return false;
  }, [isAuthenticated, pendingCheckout]);

  return {
    isAuthenticated,
    pendingCheckout,
    savePendingCheckout,
    clearPendingCheckout,
    shouldRedirectToCheckout: isAuthenticated && pendingCheckout
  };
};
