import { createClient } from "@supabase/supabase-js";
import type { Product } from "../types";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Missing Supabase environment variables");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    storageKey: "supabase.auth.token",
  },
});

// Product service functions
export const productService = {
  // Fetch all products
  async getAllProducts(): Promise<Product[]> {
    try {
      const { data, error } = await supabase
        .from("produtos")
        .select("*")
        .order("id", { ascending: true });

      if (error) {
        console.error("Error fetching products:", error);
        console.warn("Supabase error, returning empty array:", error.message);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error("Error in getAllProducts:", error);
      console.warn("Network or connection error, returning empty array");
      return [];
    }
  },

  // Fetch products by category
  async getProductsByCategory(category: string): Promise<Product[]> {
    try {
      const { data, error } = await supabase
        .from("produtos")
        .select("*")
        .eq("category", category)
        .order("id", { ascending: true });

      if (error) {
        console.error("Error fetching products by category:", error);
        throw new Error(`Failed to fetch products by category: ${error.message}`);
      }

      return data || [];
    } catch (error) {
      console.error("Error in getProductsByCategory:", error);
      throw error;
    }
  },

  // Search products by name or description
  async searchProducts(query: string): Promise<Product[]> {
    try {
      const { data, error } = await supabase
        .from("produtos")
        .select("*")
        .or(`name.ilike.%${query}%,description.ilike.%${query}%`)
        .order("id", { ascending: true });

      if (error) {
        console.error("Error searching products:", error);
        throw new Error(`Failed to search products: ${error.message}`);
      }

      return data || [];
    } catch (error) {
      console.error("Error in searchProducts:", error);
      throw error;
    }
  },

  // Get a single product by ID
  async getProductById(id: number): Promise<Product | null> {
    try {
      const { data, error } = await supabase
        .from("produtos")
        .select("*")
        .eq("id", id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // No rows returned
          return null;
        }
        console.error("Error fetching product:", error);
        throw new Error(`Failed to fetch product: ${error.message}`);
      }

      return data;
    } catch (error) {
      console.error("Error in getProductById:", error);
      throw error;
    }
  },

  // Get unique categories
  async getCategories(): Promise<string[]> {
    try {
      const { data, error } = await supabase
        .from("produtos")
        .select("category");

      if (error) {
        console.error("Error fetching categories:", error);
        throw new Error(`Failed to fetch categories: ${error.message}`);
      }

      // Extract unique categories
      const uniqueCategories = new Set(data?.map((item) => item.category) || []);
      const categories = Array.from(uniqueCategories);
      return categories.filter(Boolean);
    } catch (error) {
      console.error("Error in getCategories:", error);
      throw error;
    }
  },
};

// Re-export the Product type for convenience
export type { Product };
