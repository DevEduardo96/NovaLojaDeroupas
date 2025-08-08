import React, { useState, useEffect } from "react";
import {
  Search,
  Filter,
  Loader2,
  ShoppingCart,
  Eye,
  Heart,
  Download,
  Star,
} from "lucide-react";
import { productService } from "../lib/supabase";
import type { Product } from "../types";
import { formatPrice } from "../lib/utils";
import { useAuth } from "../contexts/AuthContext";
import { useFavorites } from "../contexts/FavoritesContext";
import { Button } from "./ui/Button";
import { Input } from "./ui/Input";
import { Select } from "./ui/Select";

interface SupabaseProductGridProps {
  showFilter?: boolean;
  showActions?: boolean;
  onProductClick?: (product: Product) => void;
  onAddToCart?: (product: Product) => void;
}

const SupabaseProductGrid: React.FC<SupabaseProductGridProps> = ({
  showFilter = true,
  showActions = true,
  onProductClick,
  onAddToCart,
}) => {
  const { user } = useAuth();
  const { toggleFavorite, isFavorite } = useFavorites();
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [sortBy, setSortBy] = useState("newest");

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    filterProducts();
  }, [products, searchQuery, selectedCategory, sortBy]);

  const loadInitialData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [productsData, categoriesData] = await Promise.all([
        productService.getAllProducts(),
        productService.getCategories(),
      ]);

      setProducts(productsData);
      setCategories(categoriesData);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Erro ao carregar produtos"
      );
    } finally {
      setLoading(false);
    }
  };

  const filterProducts = () => {
    let filtered = [...products];

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (product) =>
          product.name.toLowerCase().includes(query) ||
          product.description.toLowerCase().includes(query)
      );
    }

    if (selectedCategory) {
      filtered = filtered.filter(
        (product) => product.category === selectedCategory
      );
    }

    filtered.sort((a, b) => {
      const getPrice = (p: Product) => p.price || 0;

      switch (sortBy) {
        case "preco-low":
          return getPrice(a) - getPrice(b);
        case "preco-high":
          return getPrice(b) - getPrice(a);
        case "name":
          return a.name.localeCompare(b.name);
        default:
          return a.id - b.id;
      }
    });

    setFilteredProducts(filtered);
  };

  const handleAddToCart = (product: Product, e: React.MouseEvent) => {
    e.stopPropagation();
    onAddToCart?.(product);
  };

  const handleToggleFavorite = async (
    productId: number,
    e: React.MouseEvent
  ) => {
    e.stopPropagation();
    if (user) await toggleFavorite(productId);
  };

  const handleClickProduct = (product: Product) => {
    onProductClick?.(product);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        <span className="ml-2 text-gray-600">Carregando produtos...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600 text-lg font-semibold mb-2">
          Erro ao carregar produtos
        </p>
        <p className="text-sm text-gray-500 mb-4">{error}</p>
        <Button onClick={loadInitialData} variant="outline">
          Tentar novamente
        </Button>
      </div>
    );
  }

  return (
    <div className="p-4">
      {/* Filtros e busca */}
      {showFilter && (
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                type="text"
                placeholder="Buscar produtos..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-gray-400" />
              <Select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="min-w-[150px]"
              >
                <option value="">Todas as categorias</option>
                {categories.map((category) => (
                  <option key={category}>{category}</option>
                ))}
              </Select>
            </div>

            <Select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="min-w-[150px]"
            >
              <option value="newest">Mais recentes</option>
              <option value="preco-low">Menor preço</option>
              <option value="preco-high">Maior preço</option>
              <option value="name">Nome A-Z</option>
            </Select>
          </div>
          <p className="mt-4 text-sm text-gray-600">
            {filteredProducts.length} produto(s) encontrado(s)
          </p>
        </div>
      )}

      {/* Lista de produtos */}
      {filteredProducts.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">Nenhum produto encontrado</p>
          <p className="text-gray-400 text-sm mt-2">
            Tente ajustar os filtros ou termo de busca
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProducts.map((product) => (
            <div
              key={product.id}
              onClick={() => handleClickProduct(product)}
              className="bg-white rounded-2xl shadow-sm hover:shadow-md transition-all cursor-pointer overflow-hidden group"
            >
              {/* Imagem e badges */}
              <div className="relative">
                <img
                  src={product.image_url}
                  alt={product.name}
                  className="w-full h-50 object-cover"
                  onError={(e) =>
                    ((e.target as HTMLImageElement).src =
                      "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400&h=400&fit=crop")
                  }
                />
                <div className="absolute top-4 left-4">
                  <span className="px-3 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
                    {product.category}
                  </span>
                </div>
                <div className="absolute top-4 right-4">
                  <div className="flex items-center bg-white bg-opacity-90 rounded-full px-2 py-1">
                    <Star className="w-3 h-3 text-yellow-400 mr-1" />
                    <span className="text-xs font-semibold text-gray-800">
                      4.8
                    </span>
                  </div>
                </div>
                {user && (
                  <button
                    onClick={(e) => handleToggleFavorite(product.id, e)}
                    className="absolute top-2 right-2 p-2 bg-white bg-opacity-90 rounded-full hover:bg-opacity-100"
                  >
                    <Heart
                      className={`h-4 w-4 ${
                        isFavorite(product.id)
                          ? "text-red-500 fill-current"
                          : "text-gray-400"
                      }`}
                    />
                  </button>
                )}
              </div>

              {/* Conteúdo */}
              <div className="p-6 w-full">
                <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2">
                  {product.name}
                </h3>
                <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                  {product.description}
                </p>

                {/* Preços + Download */}
                <div className="mb-6">
                  <div className="flex flex-wrap items-center gap-4">
                    <span className="text-2xl font-bold text-blue-600">
                      {formatPrice(product.price)}
                    </span>
                    {product.original_price && (
                      <h5 className="text-lg font-bold text-red-500 line-through">
                        {formatPrice(product.original_price)}
                      </h5>
                    )}
                    <div className="flex items-center text-gray-500 text-sm">
                      <Download className="w-4 h-4 mr-1" />
                      <span>Download Digital</span>
                    </div>
                  </div>
                </div>

                {/* Botões */}
                {showActions && (
                  <div className="space-y-3">
                    <button
                      onClick={() => handleClickProduct(product)}
                      className="w-full flex items-center justify-center space-x-2 bg-gray-100 text-gray-700 py-3 rounded-lg font-medium hover:bg-gray-200"
                    >
                      <Eye className="w-4 h-4" />
                      <span>Ver Detalhes</span>
                    </button>

                    <button
                      onClick={(e) => handleAddToCart(product, e)}
                      className="w-full flex items-center justify-center space-x-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 transition-all duration-200 transform hover:scale-[1.02]"
                    >
                      <ShoppingCart className="w-4 h-4" />
                      <span>Adicionar ao Carrinho</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SupabaseProductGrid;
