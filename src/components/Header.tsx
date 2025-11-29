import logo from "../assets/6fb8a256c99a56e649839f9169b72a09f3f0ff8d.png";
import { useState } from "react"
import { Button } from "./ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar"
import { ChefHat, User, LogIn, UserPlus } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "./ui/dropdown-menu"
import { AuthModal } from "./AuthModal"
import { useAuth } from "./AuthContext"

interface HeaderProps {
  onProfileClick?: () => void
  onSignOut?: () => void
  isProfilePage?: boolean
}

export function Header({ onProfileClick, onSignOut, isProfilePage }: HeaderProps) {
  const [showAuthModal, setShowAuthModal] = useState(false)
  const { user, logout } = useAuth() // Используем logout вместо signOut

  const handleSignOut = async () => {
    logout() // Просто вызываем logout из контекста
    if (onSignOut) {
      onSignOut()
    }
  }

  // Получаем инициалы из email (первая буква до @)
  const getUserInitials = () => {
    if (!user?.email) return "U"
    return user.email.split('@')[0].charAt(0).toUpperCase()
  }

  // Получаем отображаемое имя (часть email до @)
  const getDisplayName = () => {
    if (!user?.email) return "User"
    return user.email.split('@')[0]
  }

  return (
    <header className="border-b bg-white px-3 md:px-4 py-3 flex items-center justify-between">
      {/* Logo and App Name */}
      <div className="flex items-center gap-2 md:gap-3 min-w-0 flex-1">
        <div className="flex items-center justify-center w-8 h-8 md:w-10 md:h-10 rounded-lg overflow-hidden flex-shrink-0">
          <img 
            src={logo} 
            alt="Nonchalant Recipe Assistant Logo" 
            className="w-full h-full object-cover"
          />
        </div>
        <div className="min-w-0 flex-1">
          <h1 className="text-sm md:text-lg font-semibold text-gray-900 truncate">Nonchalant Recipe Assistant</h1>
          <p className="text-xs md:text-sm text-gray-500 hidden sm:block">Your AI cooking companion</p>
        </div>
      </div>

      {/* Auth and Profile Section */}
      <div className="flex items-center gap-2 md:gap-3 flex-shrink-0">
        {user ? (
          /* Authenticated user menu */
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                <Avatar className="h-8 w-8">
                  <AvatarImage src="/placeholder-avatar.jpg" alt={getDisplayName()} />
                  <AvatarFallback className="bg-green-100 text-green-700">
                    {getUserInitials()}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <div className="px-2 py-1.5 text-sm font-medium border-b">
                <div className="truncate">{getDisplayName()}</div>
                <div className="text-xs text-gray-500 truncate">{user.email}</div>
              </div>
              <DropdownMenuItem onClick={onProfileClick}>
                <User className="w-4 h-4 mr-2" />
                Profile
              </DropdownMenuItem>
              <DropdownMenuItem>Settings</DropdownMenuItem>
              <DropdownMenuItem>Help</DropdownMenuItem>
              <DropdownMenuItem className="text-red-600" onClick={handleSignOut}>
                Sign Out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          /* Guest user buttons */
          <>
            <Button 
              variant="outline" 
              size="sm" 
              className="border-green-200 text-green-700 hover:bg-green-50 hidden sm:flex"
              onClick={() => setShowAuthModal(true)}
            >
              <LogIn className="w-4 h-4 mr-1 md:mr-2" />
              <span className="hidden md:inline">Sign In</span>
              <span className="md:hidden">In</span>
            </Button>
            <Button 
              size="sm" 
              className="bg-green-600 hover:bg-green-700"
              onClick={() => setShowAuthModal(true)}
            >
              <UserPlus className="w-4 h-4 mr-1 md:mr-2" />
              <span className="hidden md:inline">Sign Up</span>
              <span className="md:hidden">Up</span>
            </Button>
          </>
        )}
      </div>
      
      <AuthModal 
        isOpen={showAuthModal} 
        onClose={() => setShowAuthModal(false)} 
      />
    </header>
  )
}