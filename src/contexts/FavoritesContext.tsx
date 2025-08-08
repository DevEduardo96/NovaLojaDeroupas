import React, { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from './AuthContext'
import toast from 'react-hot-toast'

interface FavoritesContextType {
  favorites: number[]
  loading: boolean
  toggleFavorite: (productId: number) => Promise<void>
  isFavorite: (productId: number) => boolean
}

const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined)

export const FavoritesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth()
  const [favorites, setFavorites] = useState<number[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (user) {
      loadFavorites()
    } else {
      setFavorites([])
    }
  }, [user])

  const loadFavorites = async () => {
    if (!user) return

    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('favorites')
        .select('product_id')
        .eq('user_id', user.id)

      if (error) {
        // If the table doesn't exist (404/42P01), use local storage fallback
        if (error.code === '42P01' || error.message?.includes('does not exist') || error.details?.includes('does not exist')) {
          console.warn('Favorites table does not exist. Using local storage fallback.')
          // Load from localStorage as fallback
          const localFavorites = localStorage.getItem(`favorites_${user.id}`)
          setFavorites(localFavorites ? JSON.parse(localFavorites) : [])
          setLoading(false)
          return
        }
        throw error
      }

      setFavorites(data?.map(item => item.product_id) || [])
    } catch (error) {
      console.error('Error loading favorites:', error)
      // Fallback to localStorage
      try {
        const localFavorites = localStorage.getItem(`favorites_${user.id}`)
        setFavorites(localFavorites ? JSON.parse(localFavorites) : [])
      } catch (localError) {
        console.error('Error parsing localStorage favorites:', localError)
        setFavorites([])
      }
    } finally {
      setLoading(false)
    }
  }

  const toggleFavorite = async (productId: number) => {
    if (!user) {
      toast.error('Você precisa estar logado para favoritar produtos')
      return
    }

    if (!productId || isNaN(productId)) {
      console.error('Invalid product ID:', productId)
      return
    }

    const isFav = favorites.includes(productId)
    console.log(`Toggling favorite for product ${productId}, currently favorited: ${isFav}`)

    // Optimistically update UI first
    const newFavorites = isFav 
      ? favorites.filter(id => id !== productId)
      : [...favorites, productId]
    
    setFavorites(newFavorites)

    try {
      if (isFav) {
        // Remove from favorites
        const { error } = await supabase
          .from('favorites')
          .delete()
          .eq('user_id', user.id)
          .eq('product_id', productId)

        if (error) {
          // If table doesn't exist, use localStorage fallback
          if (error.code === '42P01' || error.message?.includes('does not exist') || error.details?.includes('does not exist')) {
            console.log('Using localStorage fallback for removing favorite')
            localStorage.setItem(`favorites_${user.id}`, JSON.stringify(newFavorites))
            toast.success('Removido dos favoritos')
            return
          }
          throw error
        }

        console.log('Successfully removed from favorites in database')
        toast.success('Removido dos favoritos')
      } else {
        // Add to favorites
        const { error } = await supabase
          .from('favorites')
          .insert({
            user_id: user.id,
            product_id: productId
          })

        if (error) {
          // If table doesn't exist, use localStorage fallback
          if (error.code === '42P01' || error.message?.includes('does not exist') || error.details?.includes('does not exist')) {
            console.log('Using localStorage fallback for adding favorite')
            localStorage.setItem(`favorites_${user.id}`, JSON.stringify(newFavorites))
            toast.success('Adicionado aos favoritos')
            return
          }
          throw error
        }

        console.log('Successfully added to favorites in database')
        toast.success('Adicionado aos favoritos')
      }

      // Update localStorage as backup
      localStorage.setItem(`favorites_${user.id}`, JSON.stringify(newFavorites))

    } catch (error) {
      console.error('Error toggling favorite:', error)
      
      // Revert optimistic update on error
      setFavorites(favorites)
      
      // Still save to localStorage as fallback
      try {
        localStorage.setItem(`favorites_${user.id}`, JSON.stringify(newFavorites))
        console.log('Saved to localStorage as fallback')
        
        // Show appropriate toast message
        if (isFav) {
          toast.success('Removido dos favoritos')
        } else {
          toast.success('Adicionado aos favoritos')
        }
      } catch (localError) {
        console.error('Error saving to localStorage:', localError)
        toast.error('Erro ao salvar favorito')
      }
    }
  }

  const isFavorite = (productId: number) => {
    if (!productId || isNaN(productId)) return false
    return favorites.includes(productId)
  }

  const value = {
    favorites,
    loading,
    toggleFavorite,
    isFavorite,
  }

  return <FavoritesContext.Provider value={value}>{children}</FavoritesContext.Provider>
}

export const useFavorites = () => {
  const context = useContext(FavoritesContext)
  if (context === undefined) {
    throw new Error('useFavorites must be used within a FavoritesProvider')
  }
  return context
}