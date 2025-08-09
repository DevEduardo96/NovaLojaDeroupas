// Cliente HTTP centralizado para o backend
export class ApiClient {
  private baseURL: string;
  private timeout: number;

  constructor() {
    // Corrigir para usar a URL completa do backend
    this.baseURL = import.meta.env.VITE_API_BASE_URL || "https://backend-nectix.onrender.com/api";
    this.timeout = 30000; // 30 segundos
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
        headers: {
          "Content-Type": "application/json",
          ...options.headers,
        },
      });

      clearTimeout(timeoutId);

      // Log da resposta bruta para debug
      console.log(`[API] ${response.status} ${response.statusText} - ${url}`);
      
      if (!response.ok) {
        let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
        
        // Verificar content-type antes de tentar parsear JSON
        const contentType = response.headers.get("content-type");
        console.log(`[API] Error Content-Type: ${contentType}`);
        
        try {
          if (contentType && contentType.includes("application/json")) {
            const errorData = await response.json();
            console.log(`[API] Error JSON:`, errorData);
            errorMessage = errorData.error || errorData.message || errorMessage;
          } else {
            const errorText = await response.text();
            console.log(`[API] Error Text:`, errorText);
            errorMessage = errorText || errorMessage;
          }
        } catch (parseError) {
          console.log(`[API] Error parsing response:`, parseError);
          // Se não conseguir parsear, usa a mensagem padrão
        }
        throw new Error(errorMessage);
      }

      // Verificar content-type da resposta de sucesso
      const contentType = response.headers.get("content-type");
      console.log(`[API] Success Content-Type: ${contentType}`);
      
      // Se a resposta for vazia, retorna null
      const text = await response.text();
      console.log(`[API] Response body (raw):`, text);
      
      if (!text) {
        console.log(`[API] Empty response, returning null`);
        return null as T;
      }

      // Verificar se é JSON válido antes de parsear
      try {
        if (contentType && contentType.includes("application/json")) {
          const parsed = JSON.parse(text);
          console.log(`[API] Parsed JSON:`, parsed);
          return parsed;
        } else {
          console.warn(`[API] Response is not JSON, content-type: ${contentType}`);
          // Se não for JSON, tentar parsear mesmo assim
          const parsed = JSON.parse(text);
          console.log(`[API] Force parsed JSON:`, parsed);
          return parsed;
        }
      } catch (parseError) {
        console.error(`[API] JSON parse error:`, parseError);
        console.error(`[API] Raw text that failed to parse:`, text);
        throw new Error(`Resposta inválida do servidor: não é JSON válido`);
      }
    } catch (error) {
      clearTimeout(timeoutId);
      if (error instanceof Error) {
        if (error.name === "AbortError") {
          throw new Error("Timeout: A requisição demorou muito para responder");
        }
        throw error;
      }
      throw new Error("Erro desconhecido na requisição");
    }
  }

  // Métodos HTTP
  async get<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: "GET" });
  }

  async post<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: "POST",
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async put<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: "PUT",
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: "DELETE" });
  }

  // Método para verificar se o servidor está online
  async healthCheck(): Promise<boolean> {
    try {
      // Usar a URL completa para o health check
      const healthUrl = this.baseURL.replace('/api', '/health');
      const response = await fetch(healthUrl, {
        method: "GET",
        signal: AbortSignal.timeout(5000), // 5 segundos para health check
      });
      return response.ok;
    } catch {
      return false;
    }
  }
}

// Instância singleton do cliente
export const apiClient = new ApiClient();