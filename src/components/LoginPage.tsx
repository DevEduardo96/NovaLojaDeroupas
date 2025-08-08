import React, { useState, useEffect } from "react";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  User,
  ArrowRight,
  CheckCircle,
  AlertCircle,
  Key,
  X,
  Loader2,
} from "lucide-react";

interface LoginPageProps {
  onClose?: () => void;
  onSuccess?: (user: any) => void;
}

interface FormErrors {
  email?: string;
  password?: string;
  confirmPassword?: string;
  name?: string;
  terms?: string;
}

const LoginPage: React.FC<LoginPageProps> = ({ onClose, onSuccess }) => {
  const [activeTab, setActiveTab] = useState<"login" | "register" | "forgot">(
    "login"
  );
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error" | "info";
    text: string;
  } | null>(null);
  const [formErrors, setFormErrors] = useState<FormErrors>({});

  const [loginForm, setLoginForm] = useState({
    email: "",
    password: "",
    rememberMe: false,
  });

  const [registerForm, setRegisterForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    acceptTerms: false,
    newsletter: true,
  });

  const [forgotForm, setForgotForm] = useState({
    email: "",
  });

  // Validação de email
  const isValidEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // Validação de senha forte //testando
  const isStrongPassword = (password: string): boolean => {
    return (
      password.length >= 8 &&
      /[A-Z]/.test(password) &&
      /[a-z]/.test(password) &&
      /\d/.test(password)
    );
  };

  // Validação do formulário de login
  const validateLoginForm = (): boolean => {
    const errors: FormErrors = {};

    if (!loginForm.email) {
      errors.email = "Email é obrigatório";
    } else if (!isValidEmail(loginForm.email)) {
      errors.email = "Email inválido";
    }

    if (!loginForm.password) {
      errors.password = "Senha é obrigatória";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Validação do formulário de registro
  const validateRegisterForm = (): boolean => {
    const errors: FormErrors = {};

    if (!registerForm.name.trim()) {
      errors.name = "Nome é obrigatório";
    } else if (registerForm.name.trim().length < 2) {
      errors.name = "Nome deve ter pelo menos 2 caracteres";
    }

    if (!registerForm.email) {
      errors.email = "Email é obrigatório";
    } else if (!isValidEmail(registerForm.email)) {
      errors.email = "Email inválido";
    }

    if (!registerForm.password) {
      errors.password = "Senha é obrigatória";
    } else if (!isStrongPassword(registerForm.password)) {
      errors.password =
        "Senha deve ter pelo menos 8 caracteres, incluindo maiúscula, minúscula e número";
    }

    if (!registerForm.confirmPassword) {
      errors.confirmPassword = "Confirmação de senha é obrigatória";
    } else if (registerForm.password !== registerForm.confirmPassword) {
      errors.confirmPassword = "Senhas não coincidem";
    }

    if (!registerForm.acceptTerms) {
      errors.terms = "Você deve aceitar os termos de uso";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Limpar mensagens e erros quando trocar de aba
  useEffect(() => {
    setMessage(null);
    setFormErrors({});
  }, [activeTab]);

  // Auto-clear de mensagens após 5 segundos
  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => {
        setMessage(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  // LOGIN simulado (sem Supabase)
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateLoginForm()) {
      return;
    }

    setIsLoading(true);
    setMessage(null);

    try {
      // Simular delay de requisição
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // Simular verificação de credenciais
      const isValidCredentials =
        loginForm.email === "teste@email.com" &&
        loginForm.password === "Teste123";

      if (!isValidCredentials) {
        setMessage({ type: "error", text: "Email ou senha incorretos" });
      } else {
        setMessage({ type: "success", text: "Login realizado com sucesso!" });

        // Reset do formulário
        setLoginForm({ email: "", password: "", rememberMe: false });

        // Simular dados do usuário
        const userData = {
          id: "user-123",
          email: loginForm.email,
          name: "Usuário Teste",
        };

        // Callback de sucesso
        if (onSuccess) {
          onSuccess(userData);
        }

        // Fechar modal apenas se fornecido
        if (onClose) {
          setTimeout(() => {
            onClose();
          }, 1000);
        }
      }
    } catch (error) {
      console.error("Erro no login:", error);
      setMessage({ type: "error", text: "Erro interno. Tente novamente." });
    } finally {
      setIsLoading(false);
    }
  };

  // REGISTRO simulado (sem Supabase)
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateRegisterForm()) {
      return;
    }

    setIsLoading(true);
    setMessage(null);

    try {
      // Simular delay de requisição
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Simular verificação se email já existe
      const emailExists = registerForm.email === "existente@email.com";

      if (emailExists) {
        setMessage({ type: "error", text: "Este email já está registrado" });
      } else {
        setMessage({
          type: "success",
          text: "Conta criada com sucesso! Verifique seu email para confirmar.",
        });

        // Reset do formulário
        setRegisterForm({
          name: "",
          email: "",
          password: "",
          confirmPassword: "",
          acceptTerms: false,
          newsletter: true,
        });

        // Só mudar de aba se não for um modal
        if (!onClose) {
          setTimeout(() => {
            setActiveTab("login");
            setMessage({
              type: "info",
              text: "Confirme seu email para fazer login",
            });
          }, 3000);
        }
      }
    } catch (error) {
      console.error("Erro no registro:", error);
      setMessage({ type: "error", text: "Erro interno. Tente novamente." });
    } finally {
      setIsLoading(false);
    }
  };

  // RECUPERAÇÃO DE SENHA simulada (sem Supabase)
  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!forgotForm.email) {
      setFormErrors({ email: "Email é obrigatório" });
      return;
    }

    if (!isValidEmail(forgotForm.email)) {
      setFormErrors({ email: "Email inválido" });
      return;
    }

    setIsLoading(true);
    setMessage(null);
    setFormErrors({});

    try {
      // Simular delay de requisição
      await new Promise((resolve) => setTimeout(resolve, 1500));

      setMessage({
        type: "success",
        text: "Email de recuperação enviado! Verifique sua caixa de entrada.",
      });

      setForgotForm({ email: "" });

      // Só mudar de aba se não for um modal
      if (!onClose) {
        setTimeout(() => {
          setActiveTab("login");
          setMessage(null);
        }, 3000);
      }
    } catch (error) {
      console.error("Erro na recuperação:", error);
      setMessage({ type: "error", text: "Erro interno. Tente novamente." });
    } finally {
      setIsLoading(false);
    }
  };

  // LOGIN SOCIAL - implementação simulada
  const socialLogin = async (provider: "google" | "facebook" | "github") => {
    try {
      setIsLoading(true);
      setMessage({ type: "info", text: `Conectando com ${provider}...` });

      // Simular delay
      await new Promise((resolve) => setTimeout(resolve, 2000));

      setMessage({
        type: "success",
        text: `Login com ${provider} realizado com sucesso!`,
      });

      // Simular dados do usuário
      const userData = {
        id: `${provider}-user-123`,
        email: `usuario@${provider}.com`,
        name: `Usuário ${provider}`,
        provider,
      };

      // Callback de sucesso
      if (onSuccess) {
        onSuccess(userData);
      }

      // Fechar modal apenas se fornecido
      if (onClose) {
        setTimeout(() => {
          onClose();
        }, 1000);
      }
    } catch (error) {
      console.error(`Erro no login ${provider}:`, error);
      setMessage({ type: "error", text: "Erro interno. Tente novamente." });
    } finally {
      setIsLoading(false);
    }
  };

  const renderFormField = (
    label: string,
    type: string,
    value: string,
    onChange: (value: string) => void,
    placeholder: string,
    icon: React.ReactNode,
    error?: string,
    showPasswordToggle?: boolean,
    showPassword?: boolean,
    onTogglePassword?: () => void
  ) => (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label}
      </label>
      <div className="relative">
        <input
          type={
            showPasswordToggle ? (showPassword ? "text" : "password") : type
          }
          required
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={`w-full px-4 py-3 pl-10 ${
            showPasswordToggle ? "pr-10" : ""
          } border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
            error ? "border-red-300 bg-red-50" : "border-gray-300"
          }`}
          placeholder={placeholder}
        />
        {icon && (
          <div className="absolute left-3 top-3.5 text-gray-400">{icon}</div>
        )}
        {showPasswordToggle && onTogglePassword && (
          <button
            type="button"
            onClick={onTogglePassword}
            className="absolute right-3 top-3.5 text-gray-400 hover:text-gray-600 transition-colors"
            tabIndex={-1}
          >
            {showPassword ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
          </button>
        )}
      </div>
      {error && (
        <p className="mt-1 text-sm text-red-600 flex items-center">
          <AlertCircle className="h-3 w-3 mr-1" />
          {error}
        </p>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center space-x-2 mb-4">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xl">N</span>
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Nectix
            </span>
          </div>
          <p className="text-gray-600">Sua loja de produtos digitais</p>
        </div>

        {/* Main Card */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
          {/* Header com botão de fechar */}
          {onClose && (
            <div className="flex justify-end p-4 pb-0">
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 transition-colors"
                aria-label="Fechar"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          )}

          {/* Tabs */}
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => setActiveTab("login")}
              className={`flex-1 py-4 px-6 text-sm font-medium transition-all duration-200 ${
                activeTab === "login"
                  ? "text-blue-600 border-b-2 border-blue-600 bg-blue-50"
                  : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
              }`}
            >
              Entrar
            </button>
            <button
              onClick={() => setActiveTab("register")}
              className={`flex-1 py-4 px-6 text-sm font-medium transition-all duration-200 ${
                activeTab === "register"
                  ? "text-blue-600 border-b-2 border-blue-600 bg-blue-50"
                  : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
              }`}
            >
              Criar Conta
            </button>
          </div>

          <div className="p-6">
            {/* Message */}
            {message && (
              <div
                className={`mb-4 p-3 rounded-lg flex items-center space-x-2 transition-all duration-200 ${
                  message.type === "success"
                    ? "bg-green-50 text-green-700 border border-green-200"
                    : message.type === "error"
                    ? "bg-red-50 text-red-700 border border-red-200"
                    : "bg-blue-50 text-blue-700 border border-blue-200"
                }`}
              >
                {message.type === "success" ? (
                  <CheckCircle className="h-4 w-4 flex-shrink-0" />
                ) : (
                  <AlertCircle className="h-4 w-4 flex-shrink-0" />
                )}
                <span className="text-sm">{message.text}</span>
              </div>
            )}

            {/* Demo Info */}
            <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-xs text-yellow-700">
                <strong>Demo:</strong> Para testar o login, use: teste@email.com
                / Teste123
              </p>
            </div>

            {/* Login Form */}
            {activeTab === "login" && (
              <form onSubmit={handleLogin} className="space-y-4">
                {renderFormField(
                  "Email",
                  "email",
                  loginForm.email,
                  (value) => setLoginForm({ ...loginForm, email: value }),
                  "seu@email.com",
                  <Mail className="h-4 w-4" />,
                  formErrors.email
                )}

                {renderFormField(
                  "Senha",
                  "password",
                  loginForm.password,
                  (value) => setLoginForm({ ...loginForm, password: value }),
                  "Sua senha",
                  <Lock className="h-4 w-4" />,
                  formErrors.password,
                  true,
                  showPassword,
                  () => setShowPassword(!showPassword)
                )}

                <div className="flex items-center justify-between">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={loginForm.rememberMe}
                      onChange={(e) =>
                        setLoginForm({
                          ...loginForm,
                          rememberMe: e.target.checked,
                        })
                      }
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="ml-2 text-sm text-gray-600">
                      Lembrar de mim
                    </span>
                  </label>
                  <button
                    type="button"
                    onClick={() => setActiveTab("forgot")}
                    className="text-sm text-blue-600 hover:text-blue-700 transition-colors"
                  >
                    Esqueci minha senha
                  </button>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 transition-all duration-300 flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
                >
                  {isLoading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      <span>Entrar</span>
                      <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </button>
              </form>
            )}

            {/* Register Form */}
            {activeTab === "register" && (
              <form onSubmit={handleRegister} className="space-y-4">
                {renderFormField(
                  "Nome Completo",
                  "text",
                  registerForm.name,
                  (value) => setRegisterForm({ ...registerForm, name: value }),
                  "Seu nome completo",
                  <User className="h-4 w-4" />,
                  formErrors.name
                )}

                {renderFormField(
                  "Email",
                  "email",
                  registerForm.email,
                  (value) => setRegisterForm({ ...registerForm, email: value }),
                  "seu@email.com",
                  <Mail className="h-4 w-4" />,
                  formErrors.email
                )}

                {renderFormField(
                  "Senha",
                  "password",
                  registerForm.password,
                  (value) =>
                    setRegisterForm({ ...registerForm, password: value }),
                  "Mínimo 8 caracteres",
                  <Lock className="h-4 w-4" />,
                  formErrors.password,
                  true,
                  showPassword,
                  () => setShowPassword(!showPassword)
                )}

                {renderFormField(
                  "Confirmar Senha",
                  "password",
                  registerForm.confirmPassword,
                  (value) =>
                    setRegisterForm({
                      ...registerForm,
                      confirmPassword: value,
                    }),
                  "Confirme sua senha",
                  <Lock className="h-4 w-4" />,
                  formErrors.confirmPassword,
                  true,
                  showConfirmPassword,
                  () => setShowConfirmPassword(!showConfirmPassword)
                )}

                <div className="space-y-3">
                  <div>
                    <label className="flex items-start">
                      <input
                        type="checkbox"
                        checked={registerForm.acceptTerms}
                        onChange={(e) =>
                          setRegisterForm({
                            ...registerForm,
                            acceptTerms: e.target.checked,
                          })
                        }
                        className={`rounded border-gray-300 text-blue-600 focus:ring-blue-500 mt-1 ${
                          formErrors.terms ? "border-red-300" : ""
                        }`}
                      />
                      <span className="ml-2 text-sm text-gray-600">
                        Aceito os{" "}
                        <a
                          href="/terms"
                          target="_blank"
                          className="text-blue-600 hover:text-blue-700 underline"
                        >
                          termos de uso
                        </a>{" "}
                        e{" "}
                        <a
                          href="/privacy"
                          target="_blank"
                          className="text-blue-600 hover:text-blue-700 underline"
                        >
                          política de privacidade
                        </a>
                      </span>
                    </label>
                    {formErrors.terms && (
                      <p className="mt-1 text-sm text-red-600 flex items-center ml-6">
                        <AlertCircle className="h-3 w-3 mr-1" />
                        {formErrors.terms}
                      </p>
                    )}
                  </div>

                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={registerForm.newsletter}
                      onChange={(e) =>
                        setRegisterForm({
                          ...registerForm,
                          newsletter: e.target.checked,
                        })
                      }
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="ml-2 text-sm text-gray-600">
                      Quero receber novidades e ofertas por email
                    </span>
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 transition-all duration-300 flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
                >
                  {isLoading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      <span>Criar Conta</span>
                      <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </button>
              </form>
            )}

            {/* Forgot Password Form */}
            {activeTab === "forgot" && (
              <div className="space-y-4">
                <div className="text-center mb-6">
                  <Key className="h-12 w-12 text-blue-600 mx-auto mb-3" />
                  <h3 className="text-lg font-semibold text-gray-800">
                    Recuperar Senha
                  </h3>
                  <p className="text-sm text-gray-600">
                    Digite seu email para receber as instruções de recuperação
                  </p>
                </div>

                <form onSubmit={handleForgotPassword} className="space-y-4">
                  {renderFormField(
                    "Email",
                    "email",
                    forgotForm.email,
                    (value) => setForgotForm({ ...forgotForm, email: value }),
                    "seu@email.com",
                    <Mail className="h-4 w-4" />,
                    formErrors.email
                  )}

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 transition-all duration-300 flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
                  >
                    {isLoading ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <>
                        <span>Enviar Email</span>
                        <ArrowRight className="h-4 w-4" />
                      </>
                    )}
                  </button>
                </form>

                <button
                  onClick={() => {
                    setActiveTab("login");
                    setMessage(null);
                    setFormErrors({});
                  }}
                  className="w-full text-center text-blue-600 hover:text-blue-700 mt-4 transition-colors"
                >
                  Voltar para o login
                </button>
              </div>
            )}

            {/* Social Login */}
            {(activeTab === "login" || activeTab === "register") && (
              <div className="mt-6 border-t border-gray-200 pt-6">
                <p className="text-center text-gray-500 mb-4 text-sm">
                  Ou continue com
                </p>
                <div className="flex justify-center gap-4">
                  <button
                    onClick={() => socialLogin("google")}
                    disabled={isLoading}
                    className="p-3 rounded-full border border-gray-300 hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    aria-label="Continuar com Google"
                  >
                    <svg className="h-5 w-5" viewBox="0 0 24 24">
                      <path
                        fill="#4285F4"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="#34A853"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      />
                      <path
                        fill="#EA4335"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      />
                    </svg>
                  </button>

                  <button
                    onClick={() => socialLogin("github")}
                    disabled={isLoading}
                    className="p-3 rounded-full border border-gray-300 hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    aria-label="Continuar com GitHub"
                  >
                    <svg
                      className="h-5 w-5 text-gray-900"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M12 0C5.374 0 0 5.373 0 12 0 17.302 3.438 21.8 8.207 23.387c.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z" />
                    </svg>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
