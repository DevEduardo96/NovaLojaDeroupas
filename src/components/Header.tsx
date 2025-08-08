import React, { useState } from "react";
import {
  ShoppingCart,
  Search,
  Menu as MenuIcon,
  X as CloseIcon,
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
  const { user, signOut } = useAuth()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="bg-white shadow-md border-b sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-8">
        <div className="flex items-center justify-between gap-4 py-4">
          {/* Logo */}
          <div className="flex items-center space-x-3">
            <Link to="/">
              <div className="flex items-center space-x-2 cursor-pointer">
                <div className="w-10 h-10">
                  <img src="/logo02.webp" alt="Logo" />
                </div>
                <span className="text-xl font-bold text-gray-800">Nectix</span>
              </div>
            </Link>
          </div>

          {/* Menu Desktop */}
          <nav className="hidden md:flex gap-6 text-sm font-medium text-gray-600">
            <Link to="/" className="hover:text-indigo-600 transition-colors">
              Início
            </Link>
            <Link
              to="/meu-site"
              className="hover:text-indigo-600 transition-colors"
            >
              Meu site
            </Link>
            <Link
              to="/suporte"
              className="hover:text-indigo-600 transition-colors"
            >
              Suporte
            </Link>
            <Link
              to="/sobre"
              className="hover:text-indigo-600 transition-colors"
            >
              Sobre
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
          <div className="flex items-center gap-4">
            {/* Favorites - only for logged in users */}
            {user && (
              <Link
                to="/favorites"
                className="relative p-2 text-gray-600 hover:text-indigo-600 transition-colors"
                title="Meus Favoritos"
              >
                <Heart className="w-6 h-6" />
              </Link>
            )}

            {/* Cart */}
            <button
              onClick={onCartClick}
              className="relative p-2 text-gray-600 hover:text-indigo-600 transition-colors"
            >
              <ShoppingCart className="w-6 h-6" />
              {cartItemCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-indigo-600 text-white text-[10px] font-semibold rounded-full w-5 h-5 flex items-center justify-center shadow-md">
                  {cartItemCount}
                </span>
              )}
            </button>

            {/* User Menu */}
            {user ? (
              <div className="relative flex items-center gap-2">
                <span className="hidden md:block text-sm text-gray-600">
                  Olá, {user.email?.split('@')[0]}
                </span>
                <button
                  onClick={() => signOut()}
                  className="p-2 text-gray-600 hover:text-red-600 transition-colors"
                  title="Sair"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <div className="hidden md:flex items-center gap-2">
                <Link
                  to="/login"
                  className="px-4 py-2 text-sm text-gray-600 hover:text-indigo-600 transition-colors"
                >
                  Entrar
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  Criar conta
                </Link>
              </div>
            )}

            {/* Botão de Menu Mobile */}
            <button
              className="md:hidden p-2 text-gray-600 hover:text-indigo-600 transition-colors"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? (
                <CloseIcon className="w-6 h-6" />
              ) : (
                <MenuIcon className="w-6 h-6" />
              )}
            </button>
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
              to="/meu-site"
              onClick={() => setMobileMenuOpen(false)}
              className="py-3 hover:bg-gray-100"
            >
              Meu site
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
                    signOut()
                    setMobileMenuOpen(false)
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
