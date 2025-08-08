import React, { useState } from "react";
import {
  User,
  LogOut,
  Settings,
  Shield,
  Mail,
  Calendar,
  RefreshCw,
} from "lucide-react";
import { useAuthContext } from "./AuthProvider";

export const UserProfile: React.FC = () => {
  const { user, signOut, session, refreshSession } = useAuthContext();
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleSignOut = async () => {
    try {
      setIsLoading(true);
      await signOut();
    } catch (error) {
      console.error("Erro ao fazer logout:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefreshSession = async () => {
    try {
      setIsRefreshing(true);
      await refreshSession();
    } catch (error) {
      console.error("Erro ao renovar sessão:", error);
    } finally {
      setIsRefreshing(false);
    }
  };

  if (!user) return null;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getSessionTimeRemaining = () => {
    if (!session?.expires_at) return "N/A";

    const expiresAt = session.expires_at * 1000;
    const now = Date.now();
    const timeRemaining = expiresAt - now;

    if (timeRemaining <= 0) return "Expirada";

    const hours = Math.floor(timeRemaining / (1000 * 60 * 60));
    const minutes = Math.floor(
      (timeRemaining % (1000 * 60 * 60)) / (1000 * 60)
    );

    return `${hours}h ${minutes}m`;
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 max-w-md mx-auto">
      <div className="flex items-center space-x-4 mb-6">
        <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
          <User className="w-8 h-8 text-white" />
        </div>
        <div>
          <h2 className="text-xl font-semibold text-gray-800">
            {user.user_metadata?.full_name || "Usuário"}
          </h2>
          <p className="text-gray-600">{user.email}</p>
        </div>
      </div>

      <div className="space-y-4 mb-6">
        <div className="flex items-center space-x-3 text-sm text-gray-600">
          <Mail className="w-4 h-4" />
          <span>
            Email verificado: {user.email_confirmed_at ? "Sim" : "Não"}
          </span>
        </div>

        <div className="flex items-center space-x-3 text-sm text-gray-600">
          <Calendar className="w-4 h-4" />
          <span>Membro desde: {formatDate(user.created_at)}</span>
        </div>

        <div className="flex items-center space-x-3 text-sm text-gray-600">
          <Shield className="w-4 h-4" />
          <span>
            Último login:{" "}
            {user.last_sign_in_at ? formatDate(user.last_sign_in_at) : "N/A"}
          </span>
        </div>

        <div className="flex items-center space-x-3 text-sm text-gray-600">
          <RefreshCw className="w-4 h-4" />
          <span>Sessão expira em: {getSessionTimeRemaining()}</span>
        </div>
      </div>

      <div className="space-y-3">
        <button
          onClick={handleRefreshSession}
          disabled={isRefreshing}
          className="w-full flex items-center justify-center space-x-2 bg-blue-100 hover:bg-blue-200 text-blue-700 py-2 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isRefreshing ? (
            <div className="w-4 h-4 border-2 border-blue-700 border-t-transparent rounded-full animate-spin" />
          ) : (
            <RefreshCw className="w-4 h-4" />
          )}
          <span>{isRefreshing ? "Renovando..." : "Renovar Sessão"}</span>
        </button>

        <button className="w-full flex items-center justify-center space-x-2 bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 px-4 rounded-lg transition-colors">
          <Settings className="w-4 h-4" />
          <span>Configurações</span>
        </button>

        <button
          onClick={handleSignOut}
          disabled={isLoading}
          className="w-full flex items-center justify-center space-x-2 bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <LogOut className="w-4 h-4" />
          )}
          <span>{isLoading ? "Saindo..." : "Sair"}</span>
        </button>
      </div>

      {/* Debug info - apenas em desenvolvimento */}
      {process.env.NODE_ENV === "development" && (
        <div className="mt-6 p-3 bg-gray-50 rounded text-xs space-y-1">
          <p>
            <strong>User ID:</strong> {user.id}
          </p>
          <p>
            <strong>Session expires:</strong>{" "}
            {session?.expires_at
              ? new Date(session.expires_at * 1000).toLocaleString()
              : "N/A"}
          </p>
          <p>
            <strong>Time remaining:</strong> {getSessionTimeRemaining()}
          </p>
        </div>
      )}
    </div>
  );
};
