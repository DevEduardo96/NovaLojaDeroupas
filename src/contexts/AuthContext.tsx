
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
  const subscriptionRef = useRef<any>(null);
  const refreshingRef = useRef(false);
  const mountedRef = useRef(true);

  useEffect(() => {
    // Prevent multiple initializations
    if (isInitialized.current) return;
    isInitialized.current = true;
    mountedRef.current = true;

    let isMounted = true;

    // Get initial session with retry logic
    const getInitialSession = async (retryCount = 0) => {
      try {
        // Avoid multiple simultaneous session requests
        if (refreshingRef.current) {
          return;
        }

        refreshingRef.current = true;
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (!isMounted || !mountedRef.current) return;
        
        if (error) {
          console.error("Error getting initial session:", error);
          
          // Handle rate limiting with exponential backoff
          if (error.message?.includes('429') || error.message?.includes('Too Many Requests')) {
            if (retryCount < 3) {
              const delay = Math.pow(2, retryCount) * 1000; // 1s, 2s, 4s
              console.log(`Rate limited, retrying in ${delay}ms...`);
              setTimeout(() => {
                if (isMounted && mountedRef.current) {
                  refreshingRef.current = false;
                  getInitialSession(retryCount + 1);
                }
              }, delay);
              return;
            }
          }
          
          setSession(null);
          setUser(null);
        } else {
          setSession(session);
          setUser(session?.user ?? null);
        }
      } catch (error) {
        console.error("Error in getInitialSession:", error);
        if (isMounted && mountedRef.current) {
          setSession(null);
          setUser(null);
        }
      } finally {
        refreshingRef.current = false;
        if (isMounted && mountedRef.current) {
          setLoading(false);
        }
      }
    };

    getInitialSession();

    // Single auth state listener with improved error handling
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!isMounted || !mountedRef.current) return;

      // Handle different auth events appropriately
      switch (event) {
        case 'SIGNED_IN':
          console.log("Auth state: User signed in", session?.user?.email);
          setSession(session);
          setUser(session?.user ?? null);
          setLoading(false);
          break;
          
        case 'SIGNED_OUT':
          console.log("Auth state: User signed out");
          setSession(null);
          setUser(null);
          setLoading(false);
          refreshingRef.current = false; // Reset refresh state
          break;
          
        case 'TOKEN_REFRESHED':
          // Silently handle token refresh without logging
          if (session) {
            setSession(session);
            setUser(session.user);
          }
          break;
          
        case 'USER_UPDATED':
          console.log("Auth state: User updated");
          if (session) {
            setSession(session);
            setUser(session.user);
          }
          break;
          
        default:
          // Handle other events silently
          setSession(session);
          setUser(session?.user ?? null);
          setLoading(false);
      }
    });

    subscriptionRef.current = subscription;

    // Cleanup function
    return () => {
      isMounted = false;
      mountedRef.current = false;
      refreshingRef.current = false;
      
      if (subscriptionRef.current) {
        subscriptionRef.current.unsubscribe();
        subscriptionRef.current = null;
      }
      isInitialized.current = false;
    };
  }, []); // Empty dependency array ensures this runs only once

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

      // Prevent concurrent login attempts
      if (refreshingRef.current) {
        return { error: { message: "Aguarde, processando requisição anterior..." } };
      }

      setLoading(true);
      refreshingRef.current = true;
      
      const { error } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password,
      });

      if (error) {
        refreshingRef.current = false;
        setLoading(false);
        
        // User-friendly error messages with rate limiting handling
        if (error.message.includes('Invalid login credentials')) {
          return { error: { message: "Email ou senha incorretos" } };
        } else if (error.message.includes('Email not confirmed')) {
          return { error: { message: "Por favor, confirme seu email antes de fazer login" } };
        } else if (error.message.includes('Too many requests') || error.message.includes('429')) {
          return { error: { message: "Muitas tentativas de login. Aguarde alguns minutos antes de tentar novamente" } };
        } else if (error.message.includes('Invalid email')) {
          return { error: { message: "Formato de email inválido" } };
        }
        return { error: { message: error.message } };
      }

      // Success - the auth state change listener will handle state updates
      refreshingRef.current = false;
      return { error: null };
    } catch (error) {
      console.error("Error in signIn:", error);
      refreshingRef.current = false;
      setLoading(false);
      return { error: { message: "Erro de conexão. Verifique sua internet e tente novamente" } };
    }
  };

  const signOut = async () => {
    try {
      // Prevent concurrent logout attempts
      if (refreshingRef.current) {
        return { error: { message: "Aguarde, processando requisição anterior..." } };
      }

      setLoading(true);
      refreshingRef.current = true;
      
      const { error } = await supabase.auth.signOut();
      
      if (!error) {
        setSession(null);
        setUser(null);
      }
      
      refreshingRef.current = false;
      setLoading(false);
      return { error };
    } catch (error) {
      console.error("Error in signOut:", error);
      refreshingRef.current = false;
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
