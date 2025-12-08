import logo from "../assets/6fb8a256c99a56e649839f9169b72a09f3f0ff8d.png";
import { useState } from "react"
import { Button } from "./ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar"
import { User, LogIn, UserPlus } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "./ui/dropdown-menu"
import { AuthModal } from "./AuthModal"
import { useAuth } from "./AuthContext"
import LanguageSwitcher from "./LanguageSwitcher";
import { useTranslation } from "react-i18next"; 
import { SearchBar } from "./SearchBar";

interface HeaderProps {
  onProfileClick?: () => void
  onSignOut?: () => void
  isProfilePage?: boolean
}

export function Header({ onProfileClick, onSignOut, isProfilePage }: HeaderProps) {
  const [showAuthModal, setShowAuthModal] = useState(false)
  const { user, logout } = useAuth()
  const { t } = useTranslation(); 

  const handleSignOut = async () => {
    logout()
    if (onSignOut) {
      onSignOut()
    }
  }

  const getUserInitials = () => {
    if (!user?.email) return "U"
    return user.email.split('@')[0].charAt(0).toUpperCase()
  }

  const getDisplayName = () => {
    if (!user?.email) return "User"
    return user.email.split('@')[0]
  }

  return (
    <header className="border-b bg-white px-3 md:px-4 py-3 flex items-center justify-between gap-4">
      {/* Logo and App Name */}
      <div className="flex items-center gap-2 md:gap-3 flex-shrink-0">
        <div className="flex items-center justify-center w-8 h-8 md:w-10 md:h-10 rounded-lg overflow-hidden flex-shrink-0">
          <img 
            src={logo} 
            alt="Nonchalant Recipe Assistant Logo" 
            className="w-full h-full object-cover"
          />
        </div>
        <div className="min-w-0 flex-1">
          <h1 className="text-sm md:text-lg font-semibold text-gray-900 truncate">
            {t('header.title')}
          </h1>
          <p className="text-xs md:text-sm text-gray-500 hidden sm:block">
            {t('header.subtitle')}
          </p>
        </div>
      </div>

      {/* Search Bar */}
      <div className="flex-1 max-w-xl px-2 flex justify-center">
        <SearchBar />
      </div>

      {/* Auth and Profile Section */}
      <div className="flex items-center gap-2 md:gap-3 flex-shrink-0">
        
        <LanguageSwitcher />

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
                {t('header.profile')} 
              </DropdownMenuItem>
              <DropdownMenuItem>{t('header.settings')}</DropdownMenuItem>
              <DropdownMenuItem>{t('header.help')}</DropdownMenuItem>
              <DropdownMenuItem className="text-red-600" onClick={handleSignOut}>
                {t('header.logout')}
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
              <span className="hidden md:inline">{t('header.signIn')}</span>
              {/* Короткая версия для мобилок */}
              <span className="md:hidden">{t('header.signInShort')}</span>
            </Button>
            <Button 
              size="sm" 
              className="bg-green-600 hover:bg-green-700"
              onClick={() => setShowAuthModal(true)}
            >
              <UserPlus className="w-4 h-4 mr-1 md:mr-2" />
              <span className="hidden md:inline">{t('header.signUp')}</span>
              {/* Короткая версия для мобилок */}
              <span className="md:hidden">{t('header.signUpShort')}</span>
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