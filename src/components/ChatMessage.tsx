import { Bot, User, Star } from "lucide-react"
import { Avatar, AvatarFallback } from "./ui/avatar"
import { Button } from "./ui/button"
import { useFavorites, FavoriteRecipe } from "./FavoritesContext"
import { toast } from "sonner"

interface ChatMessageProps {
  message: string
  isUser: boolean
  timestamp?: string
  messageId?: string
}

export function ChatMessage({ message, isUser, timestamp, messageId }: ChatMessageProps) {
  const { addToFavorites, isFavorite } = useFavorites()
  
  // Check if this is an AI recipe response (contains recipe formatting)
  const isRecipeResponse = !isUser && message.includes('**Recipe**:')
  const isAlreadyFavorited = messageId ? isFavorite(messageId) : false

  const handleFavorite = () => {
    if (!messageId) return
    
    // Extract recipe title from the message
    const titleMatch = message.match(/\*\*Recipe\*\*:\s*([^\n]+)/)
    const title = titleMatch ? titleMatch[1] : "Recipe"
    
    const recipe: FavoriteRecipe = {
      id: messageId,
      title,
      content: message,
      timestamp: new Date().toISOString()
    }
    
    addToFavorites(recipe)
    toast.success(`Added "${title}" to favorites!`)
  }
  return (
    <div className={`flex gap-2 md:gap-3 p-3 md:p-4 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
      <Avatar className="w-7 h-7 md:w-8 md:h-8 flex-shrink-0">
        <AvatarFallback className={isUser ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-700"}>
          {isUser ? <User className="w-3 h-3 md:w-4 md:h-4" /> : <Bot className="w-3 h-3 md:w-4 md:h-4" />}
        </AvatarFallback>
      </Avatar>
      
      <div className={`flex flex-col max-w-[85%] md:max-w-[80%] min-w-0 ${isUser ? 'items-end' : 'items-start'}`}>
        <div className={`rounded-lg px-3 py-2 ${
          isUser 
            ? 'bg-green-600 text-white' 
            : 'bg-gray-100 text-gray-900'
        }`}>
          <p className="whitespace-pre-wrap text-sm md:text-base break-words">{message}</p>
        </div>
        
        <div className={`flex items-center gap-1 md:gap-2 mt-1 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
          {timestamp && (
            <span className="text-xs text-gray-500 px-1">{timestamp}</span>
          )}
          
          {/* Favorite button for recipe responses */}
          {isRecipeResponse && messageId && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleFavorite}
              disabled={isAlreadyFavorited}
              className={`h-5 md:h-6 px-1 md:px-2 ${
                isAlreadyFavorited 
                  ? 'text-yellow-600 bg-yellow-50' 
                  : 'text-gray-500 hover:text-yellow-600 hover:bg-yellow-50'
              }`}
            >
              <Star className={`w-3 h-3 ${isAlreadyFavorited ? 'fill-current' : ''}`} />
              <span className="text-xs ml-1 hidden sm:inline">
                {isAlreadyFavorited ? 'Saved' : 'Save'}
              </span>
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}