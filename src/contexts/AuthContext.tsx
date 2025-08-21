import React, { createContext, useContext, useEffect, useState, useRef } from "react";
import { supabase } from "../lib/supabase";
import type { User, Session } from "@supabase/supabase-js";

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signUp: (email: string, password: string) => Promise<{ error: any }>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<{ error: any }>;
  getUserInitial: () => string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const isRefreshing = useRef(false);
  const refreshPromise = useRef<Promise<any> | null>(null);
  const lastSessionCheck = useRef<number>(0);

  useEffect(() => {
    let isMounted = true;

    // Get initial session
    const getInitialSession = async () => {
      const now = Date.now();
      // Prevent excessive session checks - minimum 5 seconds between calls
      if (now - lastSessionCheck.current < 5000) {
        setLoading(false);
        return;
      }
      lastSessionCheck.current = now;

      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (!isMounted) return;
        
        if (error) {
          console.error("Error getting initial session:", error);
          // Se houver erro de sessão, limpa o estado
          setSession(null);
          setUser(null);
        } else {
          setSession(session);
          setUser(session?.user ?? null);
        }
      } catch (error) {
        console.error("Error in getInitialSession:", error);
        setSession(null);
        setUser(null);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    getInitialSession();

    // Listen for auth state changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!isMounted) return;

      if (import.meta.env.DEV) {
        console.log("Auth state changed:", event, session?.user?.email);
      }

      // Evita múltiplos refresh simultâneos
      if (event === 'TOKEN_REFRESHED' && isRefreshing.current) {
        return;
      }

      // Controla o refresh token para evitar múltiplas requisições
      if (event === 'TOKEN_REFRESHED') {
        isRefreshing.current = true;
        setTimeout(() => {
          isRefreshing.current = false;
        }, 1000);
      }

      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Cleanup
    return () => {
      isMounted = false;
      subscription.unsubscribe();
      isRefreshing.current = false;
      refreshPromise.current = null;
    };
  }, []);

  const signUp = async (email: string, password: string) => {
    try {
      // Validação de entrada
      if (!email || !password) {
        return { error: { message: "Email e senha são obrigatórios" } };
      }

      if (password.length < 6) {
        return { error: { message: "Senha deve ter pelo menos 6 caracteres" } };
      }

      const { error } = await supabase.auth.signUp({ 
        email: email.trim().toLowerCase(), 
        password 
      });
      
      return { error };
    } catch (error) {
      console.error("Error in signUp:", error);
      return { error: { message: "Erro interno ao criar conta" } };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      // Validação de entrada
      if (!email || !password) {
        return { error: { message: "Email e senha são obrigatórios" } };
      }

      // Limpa estados anteriores
      setLoading(true);
      
      const { error } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password,
      });

      if (error) {
        setLoading(false);
        // Mensagens de erro mais amigáveis
        if (error.message.includes('Invalid login credentials')) {
          return { error: { message: "Email ou senha incorretos" } };
        } else if (error.message.includes('Email not confirmed')) {
          return { error: { message: "Por favor, confirme seu email antes de fazer login" } };
        } else if (error.message.includes('Too many requests')) {
          return { error: { message: "Muitas tentativas de login. Tente novamente em alguns minutos" } };
        } else if (error.message.includes('Invalid email')) {
          return { error: { message: "Formato de email inválido" } };
        }
        return { error: { message: error.message } };
      }

      return { error: null };
    } catch (error) {
      console.error("Error in signIn:", error);
      setLoading(false);
      return { error: { message: "Erro de conexão. Verifique sua internet e tente novamente" } };
    }
  };

  const signOut = async () => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signOut();
      
      if (!error) {
        // Limpa estados locais
        setSession(null);
        setUser(null);
      }
      
      setLoading(false);
      return { error };
    } catch (error) {
      console.error("Error in signOut:", error);
      setLoading(false);
      return { error: { message: "Erro interno ao fazer logout" } };
    }
  };

  const getUserInitial = (): string => {
    if (!user) return "";
    
    // Tenta pegar o nome primeiro
    const fullName = user.user_metadata?.full_name || user.user_metadata?.name;
    if (fullName && typeof fullName === 'string') {
      return fullName.charAt(0).toUpperCase();
    }
    
    // Se não tiver nome, usa a inicial do email
    if (user.email) {
      return user.email.charAt(0).toUpperCase();
    }
    
    return "U"; // Fallback
  };

  return (
    <AuthContext.Provider
      value={{ 
        user, 
        session, 
        loading, 
        signUp, 
        signIn, 
        signOut,
        getUserInitial
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
