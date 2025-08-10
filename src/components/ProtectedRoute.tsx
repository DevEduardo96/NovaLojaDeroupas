
import React, { useEffect } from "react";
import { Redirect } from "wouter";
import { useAuth } from "../contexts/AuthContext";
import { Loader2 } from "lucide-react";
import toast from "react-hot-toast";

interface ProtectedRouteProps {
  children: React.ReactNode;
  redirectTo?: string;
  showToast?: boolean;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  redirectTo = "/login",
  showToast = true 
}) => {
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading && !user && showToast) {
      toast.error("Você precisa fazer login para acessar esta página");
    }
  }, [user, loading, showToast]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex items-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          <span className="ml-2 text-gray-600">
            Verificando autenticação...
          </span>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Redirect to={redirectTo} />;
  }

  return <>{children}</>;
};
