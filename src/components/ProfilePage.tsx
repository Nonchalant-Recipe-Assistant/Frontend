import { useState, useRef } from "react"
import { useFavorites } from "./FavoritesContext"
import { useAuth } from "./AuthContext"
import { Button } from "./ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "./ui/card"
import { Badge } from "./ui/badge"
import { ScrollArea } from "./ui/scroll-area"
import { Separator } from "./ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "./ui/dialog"
import { Input } from "./ui/input"
import { Label } from "./ui/label"
import { ArrowLeft, Trash2, Clock, ChefHat, Utensils, Star, Users, TestTube, LogOut, Settings, Camera, Loader2 } from "lucide-react"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "./ui/alert-dialog"
import { GroupManagement } from "./GroupManagement"
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar"
import { toast } from "sonner"
// 1. Импорт
import { useTranslation } from "react-i18next"

// Interface for user profile
interface ProfileUser {
  email: string;
  username?: string;
  name?: string;
  avatar_url?: string;
  email_verified?: boolean;
}

interface ProfilePageProps {
  onBackToChat: () => void
  onSignOut: () => void
}

export function ProfilePage({ onBackToChat, onSignOut }: ProfilePageProps) {
  // 2. Хук
  const { t } = useTranslation()
  
  const { favorites, removeFromFavorites } = useFavorites()
  const { user, signUp, updateAvatar, logout } = useAuth()
  const [activeTab, setActiveTab] = useState("favorites")
  const [showTestSignUp, setShowTestSignUp] = useState(false)
  
  // Avatar state
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Test sign up form
  const [testEmail, setTestEmail] = useState("")
  const [testPassword, setTestPassword] = useState("")
  const [isTestSigningUp, setIsTestSigningUp] = useState(false)

  // Cast user to our interface
  const profileUser = user as ProfileUser;

  // --- Avatar Logic ---
  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error(t('profile.errors.fileTooLarge'));
      return;
    }

    if (!file.type.startsWith("image/")) {
      toast.error(t('profile.errors.invalidFileType'));
      return;
    }

    setIsUploading(true);
    try {
      const result = await updateAvatar(file);
      if (result.success) {
        toast.success(t('profile.success.avatarUpdated'));
      } else {
        toast.error(result.error || t('profile.errors.avatarUpdateFailed'));
      }
    } catch (error) {
      toast.error(t('profile.errors.uploadError'));
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const getAvatarUrl = (url?: string) => {
    if (!url) return undefined;
    if (url.startsWith("http")) return url;
    return `http://localhost:8080${url}`; 
  };
  // --------------------

  const handleDeleteRecipe = (id: string) => {
    removeFromFavorites(id)
    toast.success(t('profile.success.recipeRemoved'))
  }

  const handleSignOut = () => {
    logout();
    onSignOut();
  }

  const handleTestSignUp = async () => {
    if (!testEmail.trim() || !testPassword.trim()) {
      toast.error(t('profile.errors.emailPasswordRequired'))
      return
    }

    setIsTestSigningUp(true)
    try {
      const result = await signUp(testEmail.trim(), testPassword.trim())
      if (result.success) {
        toast.success(t('profile.success.testAccountCreated'))
        setTestEmail("")
        setTestPassword("")
        setShowTestSignUp(false)
      } else {
        toast.error(result.error || t('profile.errors.testAccountFailed'))
      }
    } catch (error) {
      toast.error(t('profile.errors.testAccountFailed'))
    } finally {
      setIsTestSigningUp(false)
    }
  }

  const parseRecipeContent = (content: string) => {
    const titleMatch = content.match(/\*\*Recipe\*\*:\s*([^\n]+)/)
    const title = titleMatch ? titleMatch[1] : "Recipe"
    
    const timeMatch = content.match(/⏰\s*\*\*Time\*\*:\s*([^\n]+)/)
    const difficultyMatch = content.match(/📊\s*\*\*Difficulty\*\*:\s*([^\n]+)/)
    const toolsMatch = content.match(/🔧\s*\*\*Tools needed\*\*:\s*([^\n]+)/)
    
    return {
      title,
      time: timeMatch ? timeMatch[1] : null,
      difficulty: difficultyMatch ? difficultyMatch[1] : null,
      tools: toolsMatch ? toolsMatch[1] : null
    }
  }

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <div className="border-b bg-white px-3 md:px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2 md:gap-3 min-w-0 flex-1">
          <Button 
            variant="ghost" 
            size="sm"
            onClick={onBackToChat}
            className="text-green-700 hover:bg-green-50 flex-shrink-0"
          >
            <ArrowLeft className="w-4 h-4 md:mr-2" />
            <span className="hidden md:inline">{t('profile.backToChat')}</span>
          </Button>
          <Separator orientation="vertical" className="h-6 hidden sm:block" />
          <div className="flex items-center gap-2 min-w-0">
            <Settings className="w-4 h-4 md:w-5 md:h-5 text-green-600 flex-shrink-0" />
            <h1 className="text-base md:text-lg font-semibold text-gray-900 truncate">{t('profile.title')}</h1>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {/* Test Account Creation */}
          <Dialog open={showTestSignUp} onOpenChange={setShowTestSignUp}>
            <DialogTrigger asChild>
              <Button 
                variant="outline" 
                size="sm"
                className="border-blue-200 text-blue-700 hover:bg-blue-50 flex-shrink-0"
              >
                <TestTube className="w-4 h-4 md:mr-2" />
                <span className="hidden md:inline">{t('profile.testSignUp')}</span>
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{t('profile.createTestAccount')}</DialogTitle>
                <DialogDescription>
                  {t('profile.testAccountDesc')}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="testEmail">{t('auth.emailLabel')}</Label>
                  <Input
                    id="testEmail"
                    type="email"
                    placeholder={t('profile.placeholders.testEmail')}
                    value={testEmail}
                    onChange={(e) => setTestEmail(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="testPassword">{t('auth.passwordLabel')}</Label>
                  <Input
                    id="testPassword"
                    type="password"
                    placeholder={t('auth.passwordPlaceholder')}
                    value={testPassword}
                    onChange={(e) => setTestPassword(e.target.value)}
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setShowTestSignUp(false)}>
                    {t('groups.cancel')}
                  </Button>
                  <Button 
                    onClick={handleTestSignUp} 
                    disabled={isTestSigningUp}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    {isTestSigningUp ? t('auth.creatingAccount') : t('profile.createTestAccount')}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          <Button 
            variant="outline" 
            size="sm"
            onClick={handleSignOut}
            className="border-red-200 text-red-700 hover:bg-red-50 flex-shrink-0"
          >
            <LogOut className="w-4 h-4 md:mr-2" />
            <span className="hidden md:inline">{t('header.logout')}</span>
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 p-3 md:p-6">
        <div className="max-w-4xl mx-auto">
          
          {/* AVATAR & USER INFO CARD */}
          {user && (
            <div className="mb-6">
              <Card className="border-green-200">
                <CardContent className="p-6 flex flex-col md:flex-row items-center gap-6">
                  
                  {/* Interactive Avatar */}
                  <div className="relative cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                    <Avatar className="w-24 h-24 md:w-32 md:h-32 border-4 border-white shadow-lg bg-white">
                      <AvatarImage 
                        src={getAvatarUrl(profileUser?.avatar_url)} 
                        className="object-cover"
                      />
                      {/* Show initials if no image */}
                      <AvatarFallback className="text-4xl bg-green-100 text-green-700">
                        {profileUser.email.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    
                    {/* Small Edit Button in the corner (Doesn't block the view) */}
                    <div className="absolute bottom-0 right-0 bg-white rounded-full p-2 shadow-md border border-gray-200 hover:bg-gray-100 transition-colors">
                      {isUploading ? (
                        <Loader2 className="w-5 h-5 text-green-600 animate-spin" />
                      ) : (
                        <Camera className="w-5 h-5 text-gray-600" />
                      )}
                    </div>
                  </div>
                  
                  {/* Hidden File Input */}
                  <input
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    accept="image/jpeg,image/png,image/webp,image/gif"
                    onChange={handleFileChange}
                    disabled={isUploading}
                  />

                  {/* User Details */}
                  <div className="text-center md:text-left flex-1">
                    <h3 className="text-2xl font-bold text-gray-900 mb-1">
                      {profileUser.username || t('profile.defaultUsername')}
                    </h3>
                    <p className="text-gray-500 mb-3">{profileUser.email}</p>
                    
                    <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                      {profileUser.email_verified ? (
                        <Badge className="bg-green-100 text-green-700 hover:bg-green-100">
                          {t('profile.verified')}
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-yellow-600 border-yellow-200">
                          {t('profile.unverified')}
                        </Badge>
                      )}
                      <p className="text-xs text-gray-400 self-center">
                        {t('profile.changeAvatarTip')}
                      </p>
                    </div>
                  </div>

                </CardContent>
              </Card>
            </div>
          )}

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="favorites" className="flex items-center gap-2">
                <Star className="w-4 h-4" />
                <span className="hidden sm:inline">{t('profile.tabs.favorites')}</span>
                <span className="sm:hidden">{t('profile.tabs.favoritesShort')}</span>
                <Badge variant="secondary" className="ml-1">
                  {favorites.length}
                </Badge>
              </TabsTrigger>
              <TabsTrigger value="groups" className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                <span className="hidden sm:inline">{t('profile.tabs.groups')}</span>
                <span className="sm:hidden">{t('profile.tabs.groupsShort')}</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="favorites" className="mt-6">
              {favorites.length === 0 ? (
                <Card className="border-green-200">
                  <CardContent className="flex flex-col items-center justify-center py-12">
                    <ChefHat className="w-12 h-12 text-green-300 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">{t('profile.favorites.emptyTitle')}</h3>
                    <p className="text-gray-500 text-center mb-4">
                      {t('profile.favorites.emptyDesc')}
                    </p>
                    <Button 
                      onClick={onBackToChat}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      {t('profile.favorites.startCooking')}
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <ScrollArea className="h-[calc(100vh-300px)] md:h-[calc(100vh-320px)]">
                  <div className="space-y-3 md:space-y-4">
                    {favorites.map((recipe) => {
                      const parsed = parseRecipeContent(recipe.content)
                      return (
                        <Card key={recipe.id} className="border-green-200 hover:shadow-md transition-shadow">
                          <CardHeader className="pb-3">
                            <div className="flex items-start justify-between gap-3">
                              <div className="flex-1 min-w-0">
                                <CardTitle className="text-base md:text-lg text-green-800 mb-2">
                                  {parsed.title}
                                </CardTitle>
                                <div className="flex flex-wrap gap-1 md:gap-2 mb-2">
                                  {parsed.time && (
                                    <Badge variant="secondary" className="bg-blue-100 text-blue-800 text-xs">
                                      <Clock className="w-3 h-3 mr-1" />
                                      {parsed.time}
                                    </Badge>
                                  )}
                                  {parsed.difficulty && (
                                    <Badge variant="secondary" className="bg-purple-100 text-purple-800 text-xs">
                                      <ChefHat className="w-3 h-3 mr-1" />
                                      {parsed.difficulty}
                                    </Badge>
                                  )}
                                  {parsed.tools && (
                                    <Badge variant="secondary" className="bg-orange-100 text-orange-800 text-xs">
                                      <Utensils className="w-3 h-3 mr-1" />
                                      <span className="truncate max-w-24 md:max-w-none">{parsed.tools}</span>
                                    </Badge>
                                  )}
                                </div>
                                <p className="text-xs md:text-sm text-gray-500">
                                  {t('profile.favorites.savedOn', { date: new Date(recipe.timestamp).toLocaleDateString() })}
                                </p>
                              </div>
                              
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button 
                                    variant="ghost" 
                                    size="sm"
                                    className="text-red-600 hover:text-red-700 hover:bg-red-50 flex-shrink-0"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent className="max-w-sm md:max-w-lg">
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>{t('profile.favorites.confirmRemoveTitle')}</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      {t('profile.favorites.confirmRemoveDesc', { title: parsed.title })}
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>{t('groups.cancel')}</AlertDialogCancel>
                                    <AlertDialogAction 
                                      onClick={() => handleDeleteRecipe(recipe.id)}
                                      className="bg-red-600 hover:bg-red-700"
                                    >
                                      {t('profile.favorites.remove')}
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </div>
                          </CardHeader>
                          
                          <CardContent className="pt-0">
                            <div className="bg-gray-50 rounded-lg p-3 md:p-4">
                              <pre className="whitespace-pre-wrap text-xs md:text-sm text-gray-700 font-sans overflow-x-auto">
                                {recipe.content}
                              </pre>
                            </div>
                          </CardContent>
                        </Card>
                      )
                    })}
                  </div>
                </ScrollArea>
              )}
            </TabsContent>

            <TabsContent value="groups" className="mt-6">
              <GroupManagement onClose={() => setActiveTab("favorites")} />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}