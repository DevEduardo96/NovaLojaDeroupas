import React, { useState, useEffect } from "react";
import {
  Loader2,
  ShoppingCart,
  Eye,
  Star,
  X,
} from "lucide-react";
import { productService } from "../lib/supabase";
import type { Product } from "../types";
import { formatPrice } from "../lib/utils";
import { Button } from "./ui/Button";

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
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [searchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [priceRange, setPriceRange] = useState([0, 1000]);

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    filterProducts();
  }, [products, searchQuery, selectedCategory, sortBy, priceRange]);

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

    // Filtrar por faixa de preço
    filtered = filtered.filter((product) => {
      const price = product.price || 0;
      return price >= priceRange[0] && price <= priceRange[1];
    });

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

  const handleClickProduct = (product: Product) => {
    onProductClick?.(product);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16 bg-gray-50">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
          <span className="text-lg font-medium text-gray-700">Carregando produtos...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-16 bg-gray-50">
        <div className="max-w-md mx-auto">
          <p className="text-red-600 text-xl font-semibold mb-3">
            Erro ao carregar produtos
          </p>
          <p className="text-gray-600 mb-6">{error}</p>
          <Button onClick={loadInitialData} variant="outline" className="px-6 py-3">
            Tentar novamente
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="container mx-auto px-4 py-6">
       

        {/* Barra de filtros e ordenação */}
        {showFilter && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-8">
            {/* Linha superior com filtros e ordenação */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-4">
              {/* Lado esquerdo - Botão de filtro */}
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setIsFilterOpen(true)}
                  className="inline-flex items-center gap-3 px-4 py-2 bg-white text-[#069b8b] border border-[#069b8b] hover:bg-[#069b8b] hover:text-white transition-all duration-200 text-sm font-medium uppercase tracking-wide"
                >
                  <div className="flex flex-col gap-0.5">
                    <div className="w-3 h-0.5 bg-current"></div>
                    <div className="w-3 h-0.5 bg-current"></div>
                    <div className="w-3 h-0.5 bg-current"></div>
                  </div>
                  Filtro
                </button>
              </div>

              {/* Lado direito - Ordenação */}
              <div className="flex items-center gap-4">
                <select 
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="px-3 py-2 border border-gray-300 bg-white text-gray-700 text-sm focus:outline-none focus:ring-1 focus:ring-[#069b8b] focus:border-[#069b8b]"
                >
                  <option value="newest">Classificação padrão</option>
                  <option value="name">Classificar por nome</option>
                  <option value="preco-low">Classificar por preço: menor para maior</option>
                  <option value="preco-high">Classificar por preço: alto para baixo</option>
                </select>
              </div>
              
            </div>
            
            {/* Linha inferior com contador de resultados e filtros ativos */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-gray-100">
              <span className="text-sm text-gray-500">
                Mostrando {filteredProducts.length} de {products.length} produtos
              </span>
              
              {/* Filtros ativos */}
              {(selectedCategory || (priceRange[0] > 0 || priceRange[1] < 1000)) && (
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm text-gray-500">Filtros ativos:</span>
                  {selectedCategory && (
                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                      {selectedCategory}
                      <button
                        onClick={() => setSelectedCategory("")}
                        className="hover:text-blue-900"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  )}
                  {(priceRange[0] > 0 || priceRange[1] < 1000) && (
                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                      {formatPrice(priceRange[0])} - {formatPrice(priceRange[1])}
                      <button
                        onClick={() => setPriceRange([0, 1000])}
                        className="hover:text-green-900"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Menu lateral de filtros */}
        {isFilterOpen && (
          <>
            {/* Overlay escuro */}
            <div 
              className="fixed inset-0 bg-black bg-opacity-50 z-40"
              onClick={() => setIsFilterOpen(false)}
            ></div>
            
            {/* Menu lateral */}
            <div className="fixed top-0 left-0 h-full w-80 bg-white z-50 shadow-2xl transform transition-transform duration-300">
              <div className="p-6">
                {/* Cabeçalho do menu */}
                <div className="flex items-center justify-between mb-8">
                  <h3 className="text-xl font-bold text-gray-800 uppercase tracking-wider">Filtro</h3>
                  <button
                    onClick={() => setIsFilterOpen(false)}
                    className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                  >
                    <X className="h-5 w-5 text-gray-500" />
                  </button>
                </div>

                {/* Categorias */}
                <div className="mb-8">
                  <h4 className="text-lg font-semibold text-gray-800 mb-4 uppercase tracking-wider">Categorias</h4>
                  <div className="space-y-3">
                    <button
                      onClick={() => setSelectedCategory("")}
                                              className={`block text-left w-full py-2 text-sm transition-colors uppercase tracking-wider ${
                        selectedCategory === "" 
                          ? "text-[#069b8b] font-bold border-l-2 border-[#069b8b] pl-2" 
                          : "text-gray-600 hover:text-[#069b8b]"
                      }`}
                    >
                      Todas as categorias
                    </button>
                    {categories.map((category) => (
                      <button
                        key={category}
                        onClick={() => setSelectedCategory(category)}
                        className={`block text-left w-full py-2 text-sm transition-colors uppercase tracking-wider ${
                          selectedCategory === category 
                            ? "text-[#069b8b] font-bold border-l-2 border-[#069b8b] pl-2" 
                            : "text-gray-600 hover:text-[#069b8b]"
                        }`}
                      >
                        {category}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Filtro por preço */}
                <div className="mb-8">
                  <h4 className="text-lg font-semibold text-gray-800 mb-4 uppercase tracking-wider">Faixa de preço</h4>
                  
                  {/* Range slider simulado */}
                  <div className="mb-4">
                    <div className="relative h-2 bg-gray-200 rounded-full">
                      <div 
                        className="absolute h-2 bg-[#069b8b] rounded-full"
                        style={{
                          left: `${(priceRange[0] / 1000) * 100}%`,
                          width: `${((priceRange[1] - priceRange[0]) / 1000) * 100}%`
                        }}
                      ></div>
                      <div 
                        className="absolute w-4 h-4 bg-[#069b8b] rounded-full top-1/2 transform -translate-y-1/2 cursor-pointer border-2 border-white shadow-lg"
                        style={{ left: `${(priceRange[0] / 1000) * 100}%` }}
                      ></div>
                      <div 
                        className="absolute w-4 h-4 bg-[#069b8b] rounded-full top-1/2 transform -translate-y-1/2 cursor-pointer border-2 border-white shadow-lg"
                        style={{ left: `${(priceRange[1] / 1000) * 100}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Inputs de preço */}
                  <div className="flex items-center gap-2 mb-4">
                    <input
                      type="number"
                      value={priceRange[0]}
                      onChange={(e) => setPriceRange([parseInt(e.target.value) || 0, priceRange[1]])}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-sm text-sm focus:outline-none focus:ring-1 focus:ring-[#069b8b] focus:border-[#069b8b]"
                      min="0"
                      max="1000"
                    />
                    <span className="text-gray-500">-</span>
                    <input
                      type="number"
                      value={priceRange[1]}
                      onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value) || 1000])}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-sm text-sm focus:outline-none focus:ring-1 focus:ring-[#069b8b] focus:border-[#069b8b]"
                      min="0"
                      max="1000"
                    />
                  </div>

                  <div className="text-sm text-gray-600 mb-4">
                    Price: {formatPrice(priceRange[0])} — {formatPrice(priceRange[1])}
                  </div>

                  <button 
                    onClick={() => setIsFilterOpen(false)}
                    className="w-full px-4 py-3 bg-[#069b8b] text-white hover:bg-[#069b8b] transition-all duration-200 font-semibold uppercase tracking-wider text-sm"
                  >
                    Aplicar Filtros
                  </button>
                </div>

                {/* Botão limpar filtros */}
                <div className="pt-4 border-t border-gray-200">
                  <button
                    onClick={() => {
                      setSelectedCategory("");
                      setPriceRange([0, 1000]);
                      setSortBy("newest");
                    }}
                    className="w-full px-4 py-3 bg-white border border-gray-300 text-gray-700 rounded-sm hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 font-semibold uppercase tracking-wider text-sm"
                  >
                    Limpar
                  </button>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Grade de produtos */}
        {filteredProducts.length === 0 ? (
          <div className="text-center py-20">
            <div className="max-w-md mx-auto">
              <p className="text-gray-500 text-xl font-medium mb-2">Nenhum produto encontrado</p>
              <p className="text-gray-400">Tente ajustar os filtros ou termo de busca</p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProducts.map((product) => (
              <div
                key={product.id}
                className="group bg-white shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden cursor-pointer rounded-lg"
                onClick={() => handleClickProduct(product)}
              >
                {/* Container da imagem */}
                <div className="relative overflow-hidden bg-gray-100 aspect-square">
                  <img
                    src={product.image_url}
                    alt={product.name}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    onError={(e) =>
                      ((e.target as HTMLImageElement).src =
                        "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400&h=400&fit=crop")
                    }
                  />
                  
                  {/* Overlay escuro no hover */}
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300"></div>
                  
                  {/* Botões "Detalhes" e "Adicionar ao Carrinho" que aparecem no hover */}
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
                    <div className="flex gap-3">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleClickProduct(product);
                        }}
                        className="bg-white text-gray-800 font-semibold py-2 px-4 rounded-sm transition-all duration-200 hover:bg-gray-50 shadow-lg flex items-center gap-2 uppercase tracking-wider text-sm"
                      >
                        <Eye className="w-4 h-4" />
                        View
                      </button>
                      
                      {showActions && (
                        <button
                          onClick={(e) => handleAddToCart(product, e)}
                          className="bg-[#069b8b] hover:bg-[#000000] text-white font-semibold py-2 px-4 rounded-sm transition-all duration-200 shadow-lg flex items-center gap-2 uppercase tracking-wider text-sm"
                        >
                          <ShoppingCart className="w-4 h-4" />
                          Carrinho
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Conteúdo do card */}
                <div className="p-4 text-center">
                  {/* Categoria */}
                  <div className="text-xs text-gray-400 uppercase tracking-wider mb-2 font-medium">
                    {product.category}
                  </div>
                  
                  {/* Nome do produto */}
                  <h3 className="text-base font-semibold text-gray-800 mb-3 line-clamp-2 leading-tight">
                    {product.name}
                  </h3>
                  
                  {/* Rating com estrelas */}
                  <div className="flex items-center justify-center mb-3">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star 
                        key={star} 
                        className="w-4 h-4 text-gray-300" 
                        fill="none" 
                        stroke="currentColor"
                      />
                    ))}
                  </div>
                  
                  {/* Preço */}
                  <div className="text-lg font-bold text-gray-800">
                    {formatPrice(product.price)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SupabaseProductGrid;