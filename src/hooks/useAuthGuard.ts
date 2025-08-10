
import { useEffect } from "react";
import { useLocation } from "wouter";
import { useAuth } from "../contexts/AuthContext";
import toast from "react-hot-toast";

interface UseAuthGuardOptions {
  redirectTo?: string;
  showToast?: boolean;
  message?: string;
}

export const useAuthGuard = (options: UseAuthGuardOptions = {}) => {
  const { 
    redirectTo = "/login", 
    showToast = true, 
    message = "Você precisa fazer login para acessar esta página" 
  } = options;
  
  const { user, loading } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (!loading && !user) {
      if (showToast) {
        toast.error(message);
      }
      setLocation(redirectTo);
    }
  }, [user, loading, redirectTo, showToast, message, setLocation]);

  return {
    user,
    loading,
    isAuthenticated: !!user
  };
};

// Hook para verificar se o usuário está autenticado (sem redirecionamento)
export const useAuthCheck = () => {
  const { user, loading } = useAuth();
  
  return {
    user,
    loading,
    isAuthenticated: !!user,
    isGuest: !loading && !user
  };
};
