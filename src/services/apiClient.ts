// Cliente HTTP centralizado para o backend
export class ApiClient {
  private baseURL: string;
  private timeout: number;

  constructor() {
    // IMPORTANTE: backend no Render usa /api
    this.baseURL = import.meta.env.VITE_API_BASE_URL || "https://backend-nectix.onrender.com/api";
    this.timeout = 30000; // 30 segundos
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
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
      console.log(`[API] ${response.status} ${response.statusText} - ${url}`);

      if (!response.ok) {
        let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
        try {
          const contentType = response.headers.get("content-type");
          if (contentType?.includes("application/json")) {
            const errorData = await response.json();
            errorMessage = errorData.error || errorData.message || errorMessage;
            console.error("[API] Error JSON:", errorData);
          } else {
            const errorText = await response.text();
            errorMessage = errorText || errorMessage;
            console.error("[API] Error Text:", errorText);
          }
        } catch {
          // ignora erro de parse
        }
        throw new Error(errorMessage);
      }

      const text = await response.text();
      if (!text) return null as T;

      const contentType = response.headers.get("content-type");
      if (contentType?.includes("application/json")) {
        return JSON.parse(text);
      }
      return text as unknown as T;
    } catch (error) {
      clearTimeout(timeoutId);
      if (error instanceof Error && error.name === "AbortError") {
        throw new Error("Timeout: a requisição demorou muito para responder");
      }
      throw error instanceof Error ? error : new Error("Erro desconhecido na requisição");
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

  // Health check
  async healthCheck(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseURL.replace("/api", "")}/health`, { method: "GET" });
      return response.ok;
    } catch {
      return false;
    }
  }
}

// Singleton
export const apiClient = new ApiClient();
