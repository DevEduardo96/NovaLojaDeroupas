import React from "react";
import { Router, Route, Switch, useLocation } from "wouter";
import { Header } from "./components/Header";
import { Cart } from "./components/Cart";
import Hero from "./components/Hero";
import SupabaseProductGrid from "./components/SupabaseProductGrid";
import { SupabaseProductDetail } from "./components/SupabaseProductDetail";
import { CheckoutForm } from "./components/CheckoutForm";
import { PaymentStatus } from "./components/PaymentStatus";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { useCart } from "./hooks/useCart";
import { useState, createContext, useContext } from "react";
import { api } from "./services/api";
import type { Product, PaymentData } from "./types";
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
import toast from "react-hot-toast";

// Payment Data Context
const PaymentDataContext = createContext<{
  paymentData: PaymentData | null;
  setPaymentData: (data: PaymentData | null) => void;
}>({ paymentData: null, setPaymentData: () => {} });

function AppContent() {
  const [location, setLocation] = useLocation();
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
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [showProductDetails, setShowProductDetails] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState<number | null>(
    null
  );
  const { paymentData, setPaymentData } = useContext(PaymentDataContext);

  const handleShowProductDetails = (product: Product) => {
    setSelectedProductId(product.id);
    setShowProductDetails(true);
  };

  const handleBackFromDetails = () => {
    setShowProductDetails(false);
    setSelectedProductId(null);
  };

  const handlePaymentSubmit = async (customerData: {
    nomeCliente: string;
    email: string;
  }) => {
    setIsProcessingPayment(true);
    try {
      const payment = await api.createPayment({
        carrinho: items.map(item => ({
          id: item.product.id,
          name: item.product.name,
          quantity: item.quantity
        })),
        nomeCliente: customerData.nomeCliente,
        email: customerData.email,
        total: getTotal(),
      });
      setPaymentData(payment);
      setLocation("/pagamento");
    } catch (error: any) {
      toast.error(error.message || "Erro ao processar pagamento.");
    } finally {
      setIsProcessingPayment(false);
    }
  };

  // Show product details if selected
  if (showProductDetails && selectedProductId) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header
          cartItemCount={getItemCount()}
          onCartClick={() => setIsCartOpen(true)}
        />
        <SupabaseProductDetail
          productId={selectedProductId}
          onBack={handleBackFromDetails}
          onAddToCart={addToCart}
        />
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
        <WhatsAppButton />
      </div>
    );
  }

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
            <Hero />
            
          </Route>
          <Route path="/produtos">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
              <SupabaseProductGrid
                onAddToCart={addToCart}
                onProductClick={handleShowProductDetails}
              />
            </div>
          </Route>
          <Route path="/login">
            <Login />
          </Route>
          <Route path="/register">
            <Register />
          </Route>
          <Route path="/favorites">
            <ProtectedRoute>
              <Favorites
                onAddToCart={addToCart}
                onProductClick={handleShowProductDetails}
              />
            </ProtectedRoute>
          </Route>
          <Route path="/checkout">
            <CheckoutForm
              items={items}
              total={getTotal()}
              onSubmit={handlePaymentSubmit}
              isLoading={isProcessingPayment}
            />
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
            <Suporte />
          </Route>
          <Route path="/sobre">
            <Sobre />
          </Route>
          <Route path="/terms">
            <TermsOfService />
          </Route>
          <Route path="/privacy">
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
