import { createClient } from "@supabase/supabase-js";
import type { Product, ProductVariation } from "../types";

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
    flowType: "pkce",
    debug: false,
    // Add throttling to prevent too many refresh requests
    refreshTokenGrace: 30, // seconds before token expires to refresh
    retryDelayMin: 2, // minimum delay between retries (seconds)
    retryDelayMax: 10, // maximum delay between retries (seconds)
  },
  global: {
    headers: {
      'Content-Type': 'application/json',
    },
  },
  db: {
    schema: 'public',
  },
  realtime: {
    params: {
      eventsPerSecond: 5, // Reduced to prevent rate limiting
    },
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

  // Fetch single product by ID
  async getProduct(id: number): Promise<Product | null> {
    try {
      const { data, error } = await supabase
        .from("produtos")
        .select("*")
        .eq("id", id)
        .single();

      if (error) {
        console.error("Error fetching product:", error);
        return null;
      }

      return data;
    } catch (error) {
      console.error("Error in getProduct:", error);
      return null;
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

  // Get product variations from variacoes_produto table
  async getProductVariations(productId: number): Promise<ProductVariation[]> {
    try {
      console.log(`Fetching variations for product ID: ${productId}`);

      const { data, error } = await supabase
        .from('product_variations')
        .select('id, type, name, value, stock_quantity, price_modifier, is_available')
        .eq('product_id', productId)
        .eq('is_available', true)
        .order('type', { ascending: true })
        .order('name', { ascending: true });

      if (error) {
        console.error('Error fetching product variations:', error);
        throw new Error(`Failed to fetch product variations: ${error.message}`);
      }

      // Transform the data to match the expected format
      const transformedData = (data || []).map(variation => ({
        id: variation.id,
        product_id: productId, // This should be added if not already present in the mapped object, based on ProductVariation type.
        type: variation.type,
        name: variation.name,
        value: variation.value,
        size: variation.name.split(' - ')[0] || '', // Assuming name is "Size - Color"
        color: variation.name.split(' - ')[1] || '', // Assuming name is "Size - Color"
        stock_quantity: variation.stock_quantity || 0,
        price_modifier: variation.price_modifier || 0,
        image_url: null, // Not available in new schema, assuming null or default
        is_available: variation.is_available,
        created_at: new Date().toISOString(), // Placeholder, actual creation date might not be available
        updated_at: new Date().toISOString() // Placeholder, actual update date might not be available
      }));

      console.log(`Found ${transformedData.length} variations for product ${productId}`);
      return transformedData;
    } catch (error) {
      console.error('Error in getProductVariations:', error);
      throw error;
    }
  },

  // Add product variation
  async addProductVariation(variation: Omit<ProductVariation, 'id' | 'created_at' | 'updated_at'>): Promise<ProductVariation> {
    try {
      // Assuming the 'product_variations' table structure is being used for insertion
      // and the 'variation' object passed in already conforms to it or can be mapped.
      // The original code inserts into "product_variations" but the select was for "variacoes_produto".
      // The fix above in getProductVariations aligns with "product_variations".
      // This add function should also use the new schema.
      const { data, error } = await supabase
        .from("product_variations")
        .insert({
          product_id: variation.product_id,
          type: variation.name.includes('-') ? (variation.name.split(' - ')[0] === variation.size ? 'size' : 'color') : 'other', // Example logic, adjust based on actual 'type' usage
          name: variation.name,
          value: variation.value,
          stock_quantity: variation.stock_quantity,
          price_modifier: variation.price_modifier,
          is_available: variation.is_available,
          // image_url is not in the new schema, assuming it's handled elsewhere or not needed for this insert
          // created_at and updated_at are typically handled by Supabase DB defaults or triggers
        })
        .select()
        .single();

      if (error) {
        console.error("Error adding product variation:", error);
        throw new Error(`Failed to add product variation: ${error.message}`);
      }

      return data;
    } catch (error) {
      console.error("Error in addProductVariation:", error);
      throw error;
    }
  },

  // Update product variation
  async updateProductVariation(id: number, variation: Partial<ProductVariation>): Promise<ProductVariation> {
    try {
      // Map to the new schema structure if necessary
      const updatePayload: Partial<any> = {};
      if (variation.name !== undefined) updatePayload.name = variation.name;
      if (variation.value !== undefined) updatePayload.value = variation.value;
      if (variation.stock_quantity !== undefined) updatePayload.stock_quantity = variation.stock_quantity;
      if (variation.price_modifier !== undefined) updatePayload.price_modifier = variation.price_modifier;
      if (variation.is_available !== undefined) updatePayload.is_available = variation.is_available;
      if (variation.type !== undefined) updatePayload.type = variation.type;

      // Assuming 'product_variations' table is the target for updates.
      const { data, error } = await supabase
        .from("product_variations")
        .update(updatePayload)
        .eq("id", id)
        .select()
        .single();

      if (error) {
        console.error("Error updating product variation:", error);
        throw new Error(`Failed to update product variation: ${error.message}`);
      }

      return data;
    } catch (error) {
      console.error("Error in updateProductVariation:", error);
      throw error;
    }
  },

  // Delete product variation
  async deleteProductVariation(id: number): Promise<void> {
    try {
      // Assuming 'product_variations' table is the target for deletion.
      const { error } = await supabase
        .from("product_variations")
        .delete()
        .eq("id", id);

      if (error) {
        console.error("Error deleting product variation:", error);
        throw new Error(`Failed to delete product variation: ${error.message}`);
      }
    } catch (error) {
      console.error("Error in deleteProductVariation:", error);
      throw error;
    }
  },
};

// Re-export the Product type for convenience
export type { Product, ProductVariation };