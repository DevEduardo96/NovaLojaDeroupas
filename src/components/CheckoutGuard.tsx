
import React from "react";
import { useAuth } from "../contexts/AuthContext";
import { useLocation } from "wouter";
import LoginPage from "./LoginPage";

interface CheckoutGuardProps {
  children: React.ReactNode;
}

export const CheckoutGuard: React.FC<CheckoutGuardProps> = ({ children }) => {
  const { user, loading } = useAuth();
  const [, setLocation] = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <LoginPage
        onSuccess={(userData) => {
          // Usuário logado com sucesso, verificar se tem carrinho
          const cartItems = localStorage.getItem('digitalstore_cart');
          const hasItemsInCart = cartItems && JSON.parse(cartItems).length > 0;
          
          if (hasItemsInCart) {
            // Remover flag de checkout pendente
            localStorage.removeItem('pendingCheckout');
            // Continuar para o checkout
            setLocation("/checkout");
          } else {
            // Se não há itens no carrinho, voltar para a loja
            setLocation("/produtos");
          }
        }}
      />
    );
  }

  return <>{children}</>;
};
