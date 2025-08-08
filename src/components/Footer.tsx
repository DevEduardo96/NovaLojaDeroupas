import React from "react";
import { Mail, Phone, MapPin, FileText } from "lucide-react";
import { Link } from "wouter";

const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-12">
        <div className="grid md:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <div className="w-10 h-10  from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <img src="/logowhite.webp" alt="" />
              </div>
              <span className="text-xl font-bold text-white">Nectix</span>
            </div>
            <p className="text-gray-400">
              Sua loja de produtos digitais premium. Cursos, e-books e templates
              para acelerar seu crescimento.
            </p>
            <div className="flex space-x-4">
              {/*<a
                href="#"
                className="text-gray-400 hover:text-blue-400 transition-colors"
              >
                <Facebook className="h-5 w-5" />
              </a>*/}
              {/*<a
                href="#"
                className="text-gray-400 hover:text-blue-400 transition-colors"
              >
                <Twitter className="h-5 w-5" />
              </a>*/}
              {/*<a
                href="https://www.instagram.com/kuchil4_/"
                className="text-gray-400 hover:text-blue-400 transition-colors"
              >
                <Instagram className="h-5 w-5" />
              </a>
             <a
                href="#"
                className="text-gray-400 hover:text-blue-400 transition-colors"
              >
                <Youtube className="h-5 w-5" />
              </a>*/}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold mb-4">Links Rápidos</h3>
            <ul className="space-y-2 text-gray-400">
              <li>
                <Link
                  to={"/sobre"}
                  className="hover:text-white transition-colors"
                >
                  Sobre Nós
                </Link>
              </li>
              <li>
                <Link
                  to={"/produtos"}
                  className="hover:text-white transition-colors"
                >
                  Produtos
                </Link>
              </li>
              <li>
                <Link
                  to={"/suporte"}
                  className="hover:text-white transition-colors"
                >
                  Contato
                </Link>
              </li>
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h3 className="font-semibold mb-4">Links Úteis</h3>
            <ul className="space-y-2 text-gray-400">
              <li>
                <Link
                  to={"/privacy"}
                  className="hover:text-white transition-colors"
                >
                  <span>Política de Privacidade</span>
                </Link>
              </li>
              <li>
                <Link
                  to={"/terms"}
                  className="hover:text-white transition-colors"
                >
                  <span>Termos de Uso</span>
                </Link>
              </li>
              <li></li>
            </ul>
          </div>

          {/* Informação de contato */}
          <div>
            <h3 className="font-semibold mb-4">Contato</h3>
            <ul className="space-y-3 text-gray-400">
              <li className="flex items-center space-x-2">
                <Mail className="h-4 w-4" />
                <span>eleccshopping@gmail.com</span>
              </li>
              <li className="flex items-center space-x-2">
                <Phone className="h-4 w-4" />
                <span>+55 (86) 99946-1236</span>
              </li>
              <li className="flex items-center space-x-2">
                <MapPin className="h-4 w-4" />
                <span>Teresina, Pi</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
          <p>&copy; 2025 Eduardo Araujo. Todos os direitos reservados.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
