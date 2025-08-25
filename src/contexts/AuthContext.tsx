
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
  const isInitialized = useRef(false);
  const lastRefreshTime = useRef(0);
  const authListenerRef = useRef<any>(null);

  useEffect(() => {
    let isMounted = true;

    const initializeAuth = async () => {
      if (isInitialized.current) return;

      try {
        // Buscar sessão inicial
        const { data: { session }, error } = await supabase.auth.getSession();

        if (!isMounted) return;

        if (error) {
          console.error("Error getting initial session:", error);
          setSession(null);
          setUser(null);
        } else {
          setSession(session);
          setUser(session?.user ?? null);
          
          if (session) {
            console.log("User is logged in:", session.user?.email);
          }
        }

        // Configurar listener único
        if (!authListenerRef.current) {
          authListenerRef.current = supabase.auth.onAuthStateChange(
            async (event, currentSession) => {
              if (!isMounted) return;

              console.log("Auth state changed:", event, currentSession?.user?.email);

              // Implementar debouncing para TOKEN_REFRESHED
              if (event === 'TOKEN_REFRESHED') {
                const now = Date.now();
                const timeSinceLastRefresh = now - lastRefreshTime.current;
                
                // Se refresh foi há menos de 30 segundos, ignore
                if (timeSinceLastRefresh < 30000) {
                  console.log("Ignoring rapid token refresh, last refresh was", timeSinceLastRefresh, "ms ago");
                  return;
                }
                
                lastRefreshTime.current = now;
              }

              // Atualizar estado apenas quando necessário
              setSession(currentSession);
              setUser(currentSession?.user ?? null);

              // Persistir sessão no localStorage
              if (currentSession) {
                try {
                  localStorage.setItem('supabase_session', JSON.stringify({
                    access_token: currentSession.access_token,
                    refresh_token: currentSession.refresh_token,
                    expires_at: currentSession.expires_at,
                    user: currentSession.user
                  }));
                } catch (error) {
                  console.warn("Failed to save session to localStorage:", error);
                }
              } else {
                localStorage.removeItem('supabase_session');
              }
            }
          );
        }

      } catch (error) {
        console.error("Error in auth initialization:", error);
        if (isMounted) {
          setSession(null);
          setUser(null);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
          isInitialized.current = true;
        }
      }
    };

    initializeAuth();

    // Cleanup
    return () => {
      isMounted = false;
      if (authListenerRef.current) {
        authListenerRef.current.unsubscribe();
        authListenerRef.current = null;
      }
    };
  }, []); // Array vazio - executa apenas uma vez

  const signUp = async (email: string, password: string) => {
    try {
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
      if (!email || !password) {
        return { error: { message: "Email e senha são obrigatórios" } };
      }

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
        }
        return { error: { message: error.message } };
      }

      // Não setLoading(false) aqui, deixar o onAuthStateChange fazer isso
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
      
      // Limpar localStorage primeiro
      localStorage.removeItem('supabase_session');
      localStorage.removeItem('pendingCheckout');
      localStorage.removeItem('digitalstore_cart');
      
      const { error } = await supabase.auth.signOut();

      if (!error) {
        setSession(null);
        setUser(null);
        lastRefreshTime.current = 0;
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

    const fullName = user.user_metadata?.full_name || user.user_metadata?.name;
    if (fullName && typeof fullName === 'string') {
      return fullName.charAt(0).toUpperCase();
    }

    if (user.email) {
      return user.email.charAt(0).toUpperCase();
    }

    return "U";
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
