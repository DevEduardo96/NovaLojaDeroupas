import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";

// Tipos para simular a estrutura do Supabase
interface User {
  id: string;
  email: string;
  created_at: string;
  last_sign_in_at: string | null;
  email_confirmed_at: string | null;
  user_metadata: {
    full_name?: string;
    avatar_url?: string;
    [key: string]: any;
  };
}

interface Session {
  access_token: string;
  refresh_token: string;
  expires_at: number;
  user: User;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signIn: (
    email: string,
    password: string
  ) => Promise<{ user: User | null; error: Error | null }>;
  signUp: (
    email: string,
    password: string,
    options?: { data?: any }
  ) => Promise<{ user: User | null; error: Error | null }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: Error | null }>;
  refreshSession: () => Promise<void>;
}

// Context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Hook personalizado para usar o contexto
export const useAuthContext = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuthContext deve ser usado dentro de um AuthProvider");
  }
  return context;
};

// Dados simulados de usuários
const MOCK_USERS = [
  {
    id: "user-1",
    email: "teste@email.com",
    password: "Teste123",
    created_at: "2024-01-15T10:30:00Z",
    last_sign_in_at: null,
    email_confirmed_at: "2024-01-15T11:00:00Z",
    user_metadata: {
      full_name: "Usuário Teste",
      avatar_url: null,
    },
  },
  {
    id: "user-2",
    email: "admin@nectix.com",
    password: "Admin123",
    created_at: "2024-01-10T08:00:00Z",
    last_sign_in_at: "2024-07-20T14:30:00Z",
    email_confirmed_at: "2024-01-10T08:30:00Z",
    user_metadata: {
      full_name: "Administrador Nectix",
      avatar_url: null,
    },
  },
];

// Utility functions
const generateToken = () => {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
};

const createSession = (user: User): Session => {
  const now = Math.floor(Date.now() / 1000);
  const expiresAt = now + 60 * 60; // 1 hora

  return {
    access_token: generateToken(),
    refresh_token: generateToken(),
    expires_at: expiresAt,
    user: {
      ...user,
      last_sign_in_at: new Date().toISOString(),
    },
  };
};

// Storage keys
const STORAGE_KEYS = {
  SESSION: "nectix_auth_session",
  USER: "nectix_auth_user",
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  // Carregar sessão do localStorage na inicialização
  useEffect(() => {
    const loadStoredSession = () => {
      try {
        const storedSession = localStorage.getItem(STORAGE_KEYS.SESSION);
        const storedUser = localStorage.getItem(STORAGE_KEYS.USER);

        if (storedSession && storedUser) {
          const parsedSession = JSON.parse(storedSession);
          const parsedUser = JSON.parse(storedUser);

          // Verificar se a sessão ainda é válida
          const now = Math.floor(Date.now() / 1000);
          if (parsedSession.expires_at > now) {
            setSession(parsedSession);
            setUser(parsedUser);
          } else {
            // Sessão expirada, limpar
            localStorage.removeItem(STORAGE_KEYS.SESSION);
            localStorage.removeItem(STORAGE_KEYS.USER);
          }
        }
      } catch (error) {
        console.error("Erro ao carregar sessão:", error);
        localStorage.removeItem(STORAGE_KEYS.SESSION);
        localStorage.removeItem(STORAGE_KEYS.USER);
      } finally {
        setLoading(false);
      }
    };

    loadStoredSession();
  }, []);

  // Salvar sessão no localStorage
  const saveSession = (newSession: Session | null, newUser: User | null) => {
    if (newSession && newUser) {
      localStorage.setItem(STORAGE_KEYS.SESSION, JSON.stringify(newSession));
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(newUser));
    } else {
      localStorage.removeItem(STORAGE_KEYS.SESSION);
      localStorage.removeItem(STORAGE_KEYS.USER);
    }
  };

  // Função de login
  const signIn = async (email: string, password: string) => {
    try {
      // Simular delay de rede
      await new Promise((resolve) => setTimeout(resolve, 1000));

      const mockUser = MOCK_USERS.find(
        (u) => u.email === email && u.password === password
      );

      if (!mockUser) {
        return {
          user: null,
          error: new Error("Invalid login credentials"),
        };
      }

      // Criar user sem a senha
      const { password: _, ...userWithoutPassword } = mockUser;
      const authenticatedUser = userWithoutPassword as unknown as User;

      const newSession = createSession(authenticatedUser);

      setUser(authenticatedUser);
      setSession(newSession);
      saveSession(newSession, authenticatedUser);

      return {
        user: authenticatedUser,
        error: null,
      };
    } catch (error) {
      return {
        user: null,
        error: error as Error,
      };
    }
  };

  // Função de registro
  const signUp = async (
    email: string,
    password: string,
    options?: { data?: any }
  ) => {
    try {
      // Simular delay de rede
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // Verificar se o email já existe
      const existingUser = MOCK_USERS.find((u) => u.email === email);
      if (existingUser) {
        return {
          user: null,
          error: new Error("User already registered"),
        };
      }

      // Criar novo usuário
      const newUser: User = {
        id: `user-${Date.now()}`,
        email,
        created_at: new Date().toISOString(),
        last_sign_in_at: null,
        email_confirmed_at: null, // Simulando que precisa confirmar email
        user_metadata: {
          full_name: options?.data?.full_name || "Novo Usuário",
          ...options?.data,
        },
      };

      // Adicionar aos usuários simulados (apenas para esta sessão)
      MOCK_USERS.push({
        ...newUser,
        password,
        user_metadata: newUser.user_metadata,
      } as any);

      return {
        user: newUser,
        error: null,
      };
    } catch (error) {
      return {
        user: null,
        error: error as Error,
      };
    }
  };

  // Função de logout
  const signOut = async () => {
    try {
      // Simular delay de rede
      await new Promise((resolve) => setTimeout(resolve, 500));

      setUser(null);
      setSession(null);
      saveSession(null, null);
    } catch (error) {
      console.error("Erro no logout:", error);
      throw error;
    }
  };

  // Função de reset de senha
  const resetPassword = async (email: string) => {
    try {
      // Simular delay de rede
      await new Promise((resolve) => setTimeout(resolve, 1000));

      const userExists = MOCK_USERS.find((u) => u.email === email);
      if (!userExists) {
        return {
          error: new Error("User not found"),
        };
      }

      // Simular envio de email
      console.log(`Email de recuperação enviado para: ${email}`);

      return {
        error: null,
      };
    } catch (error) {
      return {
        error: error as Error,
      };
    }
  };

  // Função para renovar a sessão
  const refreshSession = async () => {
    try {
      if (!session || !user) {
        throw new Error("Nenhuma sessão ativa");
      }

      // Simular delay de rede
      await new Promise((resolve) => setTimeout(resolve, 800));

      const newSession = createSession(user);

      setSession(newSession);
      saveSession(newSession, user);
    } catch (error) {
      console.error("Erro ao renovar sessão:", error);
      throw error;
    }
  };

  // Verificar expiração da sessão periodicamente
  useEffect(() => {
    if (!session) return;

    const checkSessionExpiry = () => {
      const now = Math.floor(Date.now() / 1000);
      if (session.expires_at <= now) {
        console.log("Sessão expirada, fazendo logout automático");
        signOut();
      }
    };

    // Verificar a cada minuto
    const interval = setInterval(checkSessionExpiry, 60000);

    return () => clearInterval(interval);
  }, [session]);

  const value: AuthContextType = {
    user,
    session,
    loading,
    signIn,
    signUp,
    signOut,
    resetPassword,
    refreshSession,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Componente para demonstrar o uso
export const AuthDemo: React.FC = () => {
  const { user, loading, signIn, signOut } = useAuthContext();
  const [email, setEmail] = useState("teste@email.com");
  const [password, setPassword] = useState("Teste123");
  const [isLogging, setIsLogging] = useState(false);

  const handleLogin = async () => {
    setIsLogging(true);
    const result = await signIn(email, password);
    if (result.error) {
      alert("Erro no login: " + result.error.message);
    }
    setIsLogging(false);
  };

  const handleLogout = async () => {
    await signOut();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        <span className="ml-2">Carregando...</span>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6 text-center">AuthProvider Demo</h2>

      {user ? (
        <div className="space-y-4">
          <div className="p-4 bg-green-50 rounded-lg">
            <h3 className="font-semibold text-green-800">Usuário logado:</h3>
            <p className="text-green-700">{user.email}</p>
            <p className="text-green-700">{user.user_metadata?.full_name}</p>
          </div>

          <button
            onClick={handleLogout}
            className="w-full bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded-lg transition-colors"
          >
            Fazer Logout
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="seu@email.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Senha
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="sua senha"
            />
          </div>

          <button
            onClick={handleLogin}
            disabled={isLogging}
            className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLogging ? "Entrando..." : "Fazer Login"}
          </button>

          <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded">
            <p>
              <strong>Usuários de teste:</strong>
            </p>
            <p>teste@email.com / Teste123</p>
            <p>admin@nectix.com / Admin123</p>
          </div>
        </div>
      )}
    </div>
  );
};
