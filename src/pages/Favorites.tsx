import React, { useState, useEffect } from 'react'
import { Heart, ShoppingCart, ArrowLeft } from 'lucide-react'
import { Link } from 'wouter'
import { useAuth } from '../contexts/AuthContext'
import { useFavorites } from '../contexts/FavoritesContext'
import { productService, type Product } from '../lib/supabase'
import { Button } from '../components/ui/Button'

interface FavoritesProps {
  onAddToCart?: (product: Product) => void
  onProductClick?: (product: Product) => void
}

export const Favorites: React.FC<FavoritesProps> = ({
  onAddToCart,
  onProductClick
}) => {
  const { user } = useAuth()
  const { favorites, toggleFavorite } = useFavorites()
  const [favoriteProducts, setFavoriteProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (user && favorites.length > 0) {
      loadFavoriteProducts()
    } else {
      setFavoriteProducts([])
      setLoading(false)
    }
  }, [user, favorites])

  const loadFavoriteProducts = async () => {
    try {
      setLoading(true)
      setError(null)
      
      // Load all products first, then filter by favorites
      const allProducts = await productService.getAllProducts()
      const favProducts = allProducts.filter(product => 
        favorites.includes(product.id)
      )
      
      setFavoriteProducts(favProducts)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar favoritos')
      console.error('Error loading favorite products:', err)
    } finally {
      setLoading(false)
    }
  }

  const formatPrice = (price: number | string | null | undefined) => {
    // Convert to number and handle edge cases
    const numericPrice = typeof price === 'string' ? parseFloat(price) : price
    const validPrice = typeof numericPrice === 'number' && !isNaN(numericPrice) ? numericPrice : 0
    
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(validPrice)
  }

  const handleProductClick = (product: Product) => {
    onProductClick?.(product)
  }

  const handleAddToCart = (product: Product, e: React.MouseEvent) => {
    e.stopPropagation()
    onAddToCart?.(product)
  }

  const handleToggleFavorite = (productId: number, e: React.MouseEvent) => {
    e.stopPropagation()
    toggleFavorite(productId)
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <Heart className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Entre para ver seus favoritos
            </h2>
            <p className="text-gray-600 mb-8">
              Faça login para salvar produtos e acessá-los facilmente
            </p>
            <div className="space-x-4">
              <Link to="/login">
                <Button>Entrar</Button>
              </Link>
              <Link to="/register">
                <Button variant="outline">Criar conta</Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link to="/" className="inline-flex items-center text-blue-600 hover:text-blue-500 mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar aos produtos
          </Link>
          <div className="flex items-center">
            <Heart className="h-8 w-8 text-red-500 mr-3" />
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Meus Favoritos</h1>
              <p className="text-gray-600">
                {favoriteProducts.length} produto(s) favoritado(s)
              </p>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-2 text-gray-600">Carregando favoritos...</span>
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <div className="text-red-600 mb-4">
              <p className="text-lg font-semibold">Erro ao carregar favoritos</p>
              <p className="text-sm">{error}</p>
            </div>
            <Button onClick={loadFavoriteProducts} variant="outline">
              Tentar novamente
            </Button>
          </div>
        ) : favoriteProducts.length === 0 ? (
          <div className="text-center py-16">
            <Heart className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Nenhum favorito ainda
            </h3>
            <p className="text-gray-600 mb-8">
              Navegue pelos produtos e clique no coração para adicionar aos favoritos
            </p>
            <Link to="/">
              <Button>Explorar produtos</Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {favoriteProducts.map((product) => (
              <div
                key={product.id}
                onClick={() => handleProductClick(product)}
                className="bg-white rounded-lg shadow-sm border hover:shadow-lg transition-all duration-200 cursor-pointer group"
              >
                {/* Product Image */}
                <div className="relative aspect-square overflow-hidden rounded-t-lg">
                  <img
                    src={product.image_url || 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400&h=400&fit=crop'}
                    alt={product.name || 'Produto'}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement
                      target.src = 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400&h=400&fit=crop'
                    }}
                  />
                  {/* Category Badge */}
                  <div className="absolute top-2 left-2">
                    <span className="bg-blue-600 text-white text-xs px-2 py-1 rounded-full">
                      {product.category}
                    </span>
                  </div>
                  {/* Favorite Button */}
                  <button
                    onClick={(e) => handleToggleFavorite(product.id, e)}
                    className="absolute top-2 right-2 p-2 bg-white bg-opacity-90 rounded-full hover:bg-opacity-100 transition-all"
                  >
                    <Heart className="h-4 w-4 text-red-500 fill-current" />
                  </button>
                </div>

                {/* Product Info */}
                <div className="p-4">
                  <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
                    {product.name}
                  </h3>
                  <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                    {product.description}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold text-blue-600">
                      {formatPrice(product.price)}
                    </span>
                    {onAddToCart && (
                      <Button
                        size="sm"
                        onClick={(e) => handleAddToCart(product, e)}
                        className="flex items-center gap-1"
                      >
                        <ShoppingCart className="h-4 w-4" />
                        Adicionar
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}