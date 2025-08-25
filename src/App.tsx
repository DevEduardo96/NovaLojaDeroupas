import { useState, createContext, useContext, useEffect } from "react";
import { Router, Route, Switch, useLocation } from "wouter";
import { Header } from "./components/Header";
import { Cart } from "./components/Cart";
import Hero from "./components/Hero";
import SupabaseProductGrid from "./components/SupabaseProductGrid";
import { SupabaseProductDetail } from "./components/SupabaseProductDetail";
import CheckoutPage from "./components/CheckoutPage";
import { PaymentStatus } from "./components/PaymentStatus";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { useCart } from "./hooks/useCart";
import type { PaymentData } from "./types";
import { Login } from "./pages/Login";
import { Register } from "./pages/Register";
import { Favorites } from "./pages/Favorites";
import Sites from "./pages/Sites";
import Suporte from "./pages/Suporte";
import Sobre from "./pages/Sobre";
import { Toaster } from "react-hot-toast";
import Footer from "./components/Footer";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import { TermsOfService } from "./pages/TermsOfService";
import { WhatsAppButton } from "./components/WhatsAppButton";
import ScrollToTop from "./components/ScrollToTo";
import { AuthProvider } from "./contexts/AuthContext";
import { FavoritesProvider } from "./contexts/FavoritesContext";
import { ProfilePage } from "./pages/ProfilePage";
import SEO from "./components/SEO";

// Payment Data Context
const PaymentDataContext = createContext<{
  paymentData: PaymentData | null;
  setPaymentData: (data: PaymentData | null) => void;
}>({ paymentData: null, setPaymentData: () => {} });

function AppContent() {
  const [, setLocation] = useLocation();
  const {
    items,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    getTotal,
    getItemCount,
  } = useCart();
  const [isCartOpen, setIsCartOpen] = useState(false);

  const { paymentData, setPaymentData } = useContext(PaymentDataContext);



  return (
    <div className="min-h-screen bg-gray-50">
      <Header
        cartItemCount={getItemCount()}
        onCartClick={() => setIsCartOpen(true)}
      />
      <main className="pb-8">
        <ScrollToTop />
        <Switch>
          <Route path="/">
            <SEO 
              title="Nectix Store - Loja de Roupas Premium | Hoodies, Camisetas e Moda Streetwear"
              description="Loja online de roupas premium: hoodies, camisetas, moda streetwear e acessórios. Qualidade superior, estilo único e entrega rápida para todo Brasil."
            />
            <Hero />
          </Route>

          <Route path="/produtos">
            <SEO 
              title="Produtos - Coleção Completa de Roupas Premium"
              description="Explore nossa coleção completa de hoodies, camisetas, calças e acessórios. Roupas de qualidade premium com entrega para todo Brasil."
              keywords="produtos roupas online, coleção hoodies, camisetas premium, moda streetwear, roupas masculinas, roupas femininas"
            />
            <ProtectedRoute>
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <SupabaseProductGrid
                  onAddToCart={addToCart}
                  onProductClick={(product) => setLocation(`/produto/${product.id}`)}
                />
              </div>
            </ProtectedRoute>
          </Route>

          <Route path="/produto/:id">
            {(params) => (
              <>
                <SEO 
                  title="Detalhes do Produto - Roupas Premium"
                  description="Veja todos os detalhes, tamanhos e informações do produto. Qualidade garantida e entrega rápida para todo Brasil."
                  keywords="detalhes produto, roupas premium, comprar online, moda streetwear"
                />
                <SupabaseProductDetail
                  productId={Number(params.id)}
                  onBack={() => setLocation("/produtos")}
                  onAddToCart={addToCart}
                />
              </>
            )}
          </Route>

          <Route path="/login">
            <SEO 
              title="Login - Acesse sua Conta"
              description="Faça login na sua conta Nectix Store para acessar seus pedidos, favoritos e área exclusiva do cliente."
              keywords="login cliente, entrar conta, acesso área cliente, minha conta nectix"
            />
            <Login />
          </Route>
          <Route path="/register">
            <SEO 
              title="Criar Conta - Cadastre-se na Nectix Store"
              description="Crie sua conta na Nectix Store e tenha acesso a ofertas exclusivas, histórico de pedidos e uma experiência personalizada."
              keywords="criar conta, cadastro cliente, nova conta, registro nectix store"
            />
            <Register />
          </Route>
          <Route path="/favorites">
            <SEO 
              title="Meus Favoritos - Lista de Desejos"
              description="Suas peças favoritas salvas em um só lugar. Adicione produtos à lista de desejos e compre quando quiser."
              keywords="favoritos, lista desejos, produtos salvos, wishlist roupas"
            />
            <ProtectedRoute>
              <Favorites
                onAddToCart={addToCart}
                onProductClick={(product) => setLocation(`/produto/${product.id}`)}
              />
            </ProtectedRoute>
          </Route>
          <Route path="/checkout">
            <SEO 
              title="Finalizar Compra - Checkout Seguro"
              description="Finalize sua compra com segurança. Múltiplas formas de pagamento e entrega rápida para todo Brasil."
              keywords="finalizar compra, checkout seguro, pagamento online, carrinho compras"
            />
            <CheckoutPage />
          </Route>
          <Route path="/pagamento">
            {paymentData ? (
              <PaymentStatus
                paymentData={paymentData}
                onBack={() => {
                  setPaymentData(null);
                  clearCart();
                  setLocation("/");
                }}
              />
            ) : (
              <p>Pagamento não encontrado. Redirecionando...</p>
            )}
          </Route>
          <Route path="/meu-site">
            <Sites />
          </Route>
          <Route path="/suporte">
            <SEO 
              title="Suporte e Atendimento - Central de Ajuda"
              description="Precisa de ajuda? Entre em contato conosco! Suporte para pedidos, trocas, entregas e dúvidas sobre produtos. Atendimento especializado."
              keywords="suporte loja roupas, atendimento cliente, dúvidas pedido, troca devolução, ajuda compra online"
            />
            <Suporte />
          </Route>
          <Route path="/sobre">
            <SEO 
              title="Sobre a Nectix Store - Nossa História e Valores"
              description="Conheça a história da Nectix Store, nossos valores e missão. Loja especializada em roupas premium e moda streetwear de qualidade."
              keywords="sobre nectix store, história loja roupas, valores empresa, moda premium, streetwear brasileiro"
            />
            <Sobre />
          </Route>
          <Route path="/meu-perfil">
            <SEO 
              title="Meu Perfil - Área do Cliente"
              description="Gerencie suas informações pessoais, histórico de pedidos e preferências na sua área exclusiva da Nectix Store."
              keywords="perfil cliente, área cliente, histórico pedidos, dados pessoais"
            />
            <ProfilePage />
          </Route>
          <Route path="/terms">
            <SEO 
              title="Termos de Uso - Nectix Store"
              description="Leia nossos termos de uso e condições de compra na Nectix Store. Política de trocas, devoluções e direitos do consumidor."
              keywords="termos uso, condições compra, política troca, direitos consumidor"
            />
            <TermsOfService />
          </Route>
          <Route path="/privacy">
            <SEO 
              title="Política de Privacidade - Proteção de Dados"
              description="Nossa política de privacidade e proteção de dados pessoais. Segurança e transparência no tratamento das suas informações."
              keywords="política privacidade, proteção dados, LGPD, segurança informações"
            />
            <PrivacyPolicy />
          </Route>
        </Switch>
        <WhatsAppButton />
      </main>
      <Cart
        items={items}
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        onUpdateQuantity={updateQuantity}
        onRemoveItem={removeFromCart}
        onCheckout={() => {
          setIsCartOpen(false);
          setLocation("/checkout");
        }}
        total={getTotal()}
      />
    </div>
  );
}

function App() {
  const [paymentData, setPaymentData] = useState<PaymentData | null>(null);
  const location = useLocation();


  return (
    <Router>
      <AuthProvider>
        <FavoritesProvider>
          <PaymentDataContext.Provider value={{ paymentData, setPaymentData }}>
            <AppContent />
          </PaymentDataContext.Provider>
          <Footer />
          <Toaster
            position="bottom-right"
            toastOptions={{
              duration: 3000,
              style: { background: "#363636", color: "#fff" },
            }}
          />
        </FavoritesProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;