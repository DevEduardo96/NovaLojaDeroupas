import React, { useState, useEffect, useRef } from "react";
import {
  Search,
  Heart,
  User,
  LogOut,
} from "lucide-react";
import { Link } from "wouter";
import { useAuth } from "../contexts/AuthContext";

interface HeaderProps {
  cartItemCount: number;
  onCartClick: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  cartItemCount,
  onCartClick,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const { user, signOut } = useAuth();
  const userMenuRef = useRef<HTMLDivElement>(null);

  // Fechar menu ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false);
      }
    };

    if (showUserMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showUserMenu]);

  // Função para obter as iniciais do usuário
  const getUserInitials = (user: any): string => {
    if (user?.user_metadata?.full_name) {
      return user.user_metadata.full_name
        .split(' ')
        .map((name: string) => name.charAt(0))
        .join('')
        .substring(0, 2)
        .toUpperCase();
    }

    if (user?.email) {
      return user.email.charAt(0).toUpperCase();
    }

    return 'U';
  };

  const handleSignOut = async () => {
    try {
      setShowUserMenu(false);
      await signOut();
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    }
  };

  return (
    <header className="bg-white shadow-md border-b sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-8">
        <div className="flex items-center justify-between gap-4 py-4">
          {/* Logo */}
          <div className="flex items-center space-x-3">
            <Link to="/">
              <div className="flex items-center space-x-2 cursor-pointer">
                <div className="w-20 h-15">
                  <img src="/ntix.webp" alt="Logo" />
                </div>
               
              </div>
            </Link>
          </div>

          {/* Menu Desktop */}
          <nav className="hidden md:flex gap-6 text-sm font-medium text-gray-600">
            <Link to="/" className="hover:text-[#069b8b] transition-colors">
              INICIO
            </Link>
           
            <Link
              to="/suporte"
              className="hover:text-[#069b8b] transition-colors"
            >
              SUPORTE
            </Link>
            <Link
              to="/sobre"
              className="hover:text-[#069b8b] transition-colors"
            >
              SOBRE
            </Link>
          </nav>

          {/* Campo de Busca */}
          <div className="hidden md:block flex-1 max-w-md">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Buscar produtos, cursos, templates..."
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-full shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm transition"
              />
            </div>
          </div>

          {/* User Actions */}
          <div className="flex items-center space-x-4">
           

            {/* Favorites */}
            <Link
              to="/favorites"
              className="p-2 rounded-full hover:bg-gray-100 transition-colors relative"
            >
              <Heart className="h-6 w-6 text-gray-600" />
            </Link>

            {/* Cart */}
           <button
  onClick={onCartClick}
  className="p-2 rounded-full hover:bg-gray-100 transition-colors relative"
>
  {/* Substituí o ícone pelo <img /> */}
  <img 
    src="/meu-carrinho.webp" 
    alt="Carrinho de compras" 
    className="h-7 w-7 object-contain" 
  />

  {cartItemCount > 0 && (
    <span className="absolute -top-2 -right-2 bg-[#069b8b] text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
      {cartItemCount}
    </span>
  )}
</button>


            {/* User */}
            {user ? (
              <div className="relative" ref={userMenuRef}>
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center justify-center w-8 h-8 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors font-medium text-sm"
                >
                  {getUserInitials(user)}
                </button>

                {/* User Menu Dropdown */}
                {showUserMenu && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 border border-gray-200">
                    <Link
                      to="/meu-perfil"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                      onClick={() => setShowUserMenu(false)}
                    >
                      <User className="h-4 w-4 inline mr-2" />
                      Meu Perfil
                    </Link>

                    <Link
                      to="/favorites"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                      onClick={() => setShowUserMenu(false)}
                    >
                      <Heart className="h-4 w-4 inline mr-2" />
                      Favoritos
                    </Link>

                    <button
                      onClick={handleSignOut}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                    >
                      <LogOut className="h-4 w-4 inline mr-2" />
                      Sair
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link
                to="/login"
                className="p-2 rounded-full hover:bg-gray-100 transition-colors"
              >
                <User className="h-6 w-6 text-gray-600" />
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Menu Mobile com transição de baixo pra cima */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-x-0 bottom-0 bg-white border-t shadow-lg z-40 animate-slide-up">
          <nav className="flex flex-col divide-y text-center text-sm font-medium text-gray-700">
            <Link
              to="/"
              onClick={() => setMobileMenuOpen(false)}
              className="py-3 hover:bg-gray-100"
            >
              Início
            </Link>
            
            <Link
              to="/suporte"
              onClick={() => setMobileMenuOpen(false)}
              className="py-3 hover:bg-gray-100"
            >
              Suporte
            </Link>
            <Link
              to="/sobre"
              onClick={() => setMobileMenuOpen(false)}
              className="py-3 hover:bg-gray-100"
            >
              Sobre
            </Link>
            {user ? (
              <>
                <Link
                  to="/favorites"
                  onClick={() => setMobileMenuOpen(false)}
                  className="py-3 hover:bg-gray-100 flex items-center justify-center gap-2"
                >
                  <Heart className="w-4 h-4" />
                  Favoritos
                </Link>
                <button
                  onClick={() => {
                    handleSignOut();
                    setMobileMenuOpen(false);
                  }}
                  className="py-3 hover:bg-gray-100 flex items-center justify-center gap-2 text-red-600"
                >
                  <LogOut className="w-4 h-4" />
                  Sair
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="py-3 hover:bg-gray-100"
                >
                  Entrar
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="py-3 bg-indigo-600 text-white hover:bg-indigo-700"
                >
                  Criar conta
                </Link>
              </>
            )}
          </nav>
        </div>
      )}
    </header>
  );
};