import React, { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import type { User, Session } from "@supabase/supabase-js";

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signUp: (email: string, password: string) => Promise<{ error: any }>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<{ error: any }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    // Get initial session
    const getInitialSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (!isMounted) return;
        
        if (error) {
          console.error("Error getting initial session:", error);
        }
        
        setSession(session);
        setUser(session?.user ?? null);
      } catch (error) {
        console.error("Error in getInitialSession:", error);
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
    } = supabase.auth.onAuthStateChange((_event, session) => {
      // Atualiza estado só se o componente ainda está montado
      if (!isMounted) return;

      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Cleanup: cancela a inscrição e evita setState se desmontado
    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const signUp = async (email: string, password: string) => {
    try {
      if (!email || !password) {
        return { error: { message: "Email e senha são obrigatórios" } };
      }

      const { error } = await supabase.auth.signUp({ email, password });
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

      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      return { error };
    } catch (error) {
      console.error("Error in signIn:", error);
      return { error: { message: "Erro interno ao fazer login" } };
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      return { error };
    } catch (error) {
      console.error("Error in signOut:", error);
      return { error: { message: "Erro interno ao fazer logout" } };
    }
  };

  return (
    <AuthContext.Provider
      value={{ user, session, loading, signUp, signIn, signOut }}
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
