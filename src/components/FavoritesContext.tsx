import { createContext, useContext, useState, useEffect, ReactNode } from "react"

export interface FavoriteRecipe {
  id: string
  title: string
  content: string
  timestamp: string
  ingredients?: string[]
  tools?: string[]
  timeLimit?: string
  difficulty?: string
}

interface FavoritesContextType {
  favorites: FavoriteRecipe[]
  addToFavorites: (recipe: FavoriteRecipe) => void
  removeFromFavorites: (id: string) => void
  isFavorite: (id: string) => boolean
}

const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined)

export function FavoritesProvider({ children }: { children: ReactNode }) {
  const [favorites, setFavorites] = useState<FavoriteRecipe[]>([])

  // Load favorites from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem('recipe-favorites')
    if (stored) {
      try {
        setFavorites(JSON.parse(stored))
      } catch (error) {
        console.error('Failed to parse stored favorites:', error)
      }
    }
  }, [])

  // Save favorites to localStorage whenever favorites change
  useEffect(() => {
    localStorage.setItem('recipe-favorites', JSON.stringify(favorites))
  }, [favorites])

  const addToFavorites = (recipe: FavoriteRecipe) => {
    setFavorites(prev => {
      // Check if already exists
      if (prev.some(fav => fav.id === recipe.id)) {
        return prev
      }
      return [...prev, recipe]
    })
  }

  const removeFromFavorites = (id: string) => {
    setFavorites(prev => prev.filter(fav => fav.id !== id))
  }

  const isFavorite = (id: string) => {
    return favorites.some(fav => fav.id === id)
  }

  return (
    <FavoritesContext.Provider value={{
      favorites,
      addToFavorites,
      removeFromFavorites,
      isFavorite
    }}>
      {children}
    </FavoritesContext.Provider>
  )
}

export function useFavorites() {
  const context = useContext(FavoritesContext)
  if (context === undefined) {
    throw new Error('useFavorites must be used within a FavoritesProvider')
  }
  return context
}