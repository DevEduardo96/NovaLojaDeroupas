// Tipos centralizados para o projeto
export interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  original_price?: number;
  image_url: string;
  category: string;
  created_at?: string;
  updated_at?: string;
  download_url?: string; // <-- novo campo
  file_format?: string;
}

export interface User {
  id: string;
  email: string;
  created_at: string;
  updated_at: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface Favorite {
  id: number;
  user_id: string;
  product_id: number;
  created_at: string;
}

// Tipos para respostas da API
export interface ApiResponse<T> {
  data: T | null;
  error: string | null;
}

// Tipos para filtros de produtos
export interface ProductFilters {
  category?: string;
  search?: string;
  sortBy?: 'newest' | 'preco-low' | 'preco-high' | 'name';
  minPrice?: number;
  maxPrice?: number;
}

// Tipos para paginação
export interface PaginationParams {
  page: number;
  limit: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

// Tipos específicos para integração com o backend
export interface PaymentData {
  id: string;
  status: string;
  email_cliente: string;
  nome_cliente: string;
  valor: number;
  links_download: string[];
  produtos: Product[];
  created_at: string;
  updated_at: string;
  qr_code_base64?: string;
  qr_code?: string;
  ticket_url?: string;
}

export interface PaymentStatus {
  id: string | number;
  status: string;
  status_detail?: string;
  transaction_amount?: number;
  paymentId?: string;
  download_links?: Array<{
    produto_id: number;
    nome: string;
    download_url: string;
  }>;
}

export interface DownloadResponse {
  links: string[];
  products: Product[];
  customerName: string;
  total: number;
  downloadedAt: string;
  expiresIn: string;
}

export interface CreatePaymentRequest {
  carrinho: Array<{
    id: number;
    name: string;
    quantity: number;
  }>;
  nomeCliente: string;
  email: string;
  total: number;
}

// Tipos para autenticação
export interface AuthUser {
  id: string;
  email: string;
  created_at: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  confirmPassword: string;
}

// Tipos para notificações e feedback
export interface ToastMessage {
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  duration?: number;
}

// Tipos para configurações da aplicação
export interface AppConfig {
  apiBaseUrl: string;
  supabaseUrl: string;
  environment: 'development' | 'production' | 'staging';
}

export interface ProductVariation {
  id: number;
  product_id: number;
  type: "size" | "color";
  name: string;
  value: string;
  stock_quantity: number;
  price_modifier: number;
  is_available: boolean;
  created_at: string;
  updated_at: string;
}

export interface ProductWithVariations extends Product {
  variations: ProductVariation[];
  sizes: ProductVariation[];
  colors: ProductVariation[];
}