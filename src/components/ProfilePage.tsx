import { useState } from "react"
import { useFavorites } from "./FavoritesContext"
import { useAuth } from "./AuthContext"
import { Button } from "./ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card"
import { Badge } from "./ui/badge"
import { ScrollArea } from "./ui/scroll-area"
import { Separator } from "./ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "./ui/dialog"
import { Input } from "./ui/input"
import { Label } from "./ui/label"
import { ArrowLeft, Trash2, Clock, ChefHat, Utensils, Heart, Users, TestTube, LogOut, Settings, Star } from "lucide-react"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "./ui/alert-dialog"
import { GroupManagement } from "./GroupManagement"
import { toast } from "sonner"

// Локальный интерфейс для профиля пользователя
interface ProfileUser {
  email: string;
  username?: string;
  name?: string;
}

interface ProfilePageProps {
  onBackToChat: () => void
  onSignOut: () => void
}

export function ProfilePage({ onBackToChat, onSignOut }: ProfilePageProps) {
  const { favorites, removeFromFavorites } = useFavorites()
  const { user, signUp } = useAuth()
  const [activeTab, setActiveTab] = useState("favorites")
  const [showTestSignUp, setShowTestSignUp] = useState(false)
  
  // Test sign up form
  const [testEmail, setTestEmail] = useState("")
  const [testPassword, setTestPassword] = useState("")
  const [testName, setTestName] = useState("")
  const [isTestSigningUp, setIsTestSigningUp] = useState(false)

  // Используем тип assertion внутри компонента
  const profileUser = user as ProfileUser;

  const handleDeleteRecipe = (id: string) => {
    removeFromFavorites(id)
    toast.success("Recipe removed from favorites")
  }

  const handleTestSignUp = async () => {
    if (!testEmail.trim() || !testPassword.trim() || !testName.trim()) {
      toast.error("All fields are required")
      return
    }

    setIsTestSigningUp(true)
    try {
      const result = await signUp(testEmail.trim(), testPassword.trim(), testName.trim())
      if (result.success) {
        toast.success("Test account created successfully!")
        setTestEmail("")
        setTestPassword("")
        setTestName("")
        setShowTestSignUp(false)
      } else {
        toast.error(result.error || "Failed to create test account")
      }
    } catch (error) {
      toast.error("Failed to create test account")
    } finally {
      setIsTestSigningUp(false)
    }
  }

  const parseRecipeContent = (content: string) => {
    // Extract recipe title from content
    const titleMatch = content.match(/\*\*Recipe\*\*:\s*([^\n]+)/)
    const title = titleMatch ? titleMatch[1] : "Recipe"
    
    // Extract time, difficulty, tools
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
            <span className="hidden md:inline">Back to Chat</span>
          </Button>
          <Separator orientation="vertical" className="h-6 hidden sm:block" />
          <div className="flex items-center gap-2 min-w-0">
            <Settings className="w-4 h-4 md:w-5 md:h-5 text-green-600 flex-shrink-0" />
            <h1 className="text-base md:text-lg font-semibold text-gray-900 truncate">Profile & Settings</h1>
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
                <span className="hidden md:inline">Test Sign Up</span>
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create Test Account</DialogTitle>
                <DialogDescription>
                  Create a test account to try out the application features.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="testName">Full Name</Label>
                  <Input
                    id="testName"
                    placeholder="Enter your name..."
                    value={testName}
                    onChange={(e) => setTestName(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="testEmail">Email</Label>
                  <Input
                    id="testEmail"
                    type="email"
                    placeholder="Enter test email..."
                    value={testEmail}
                    onChange={(e) => setTestEmail(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="testPassword">Password</Label>
                  <Input
                    id="testPassword"
                    type="password"
                    placeholder="Enter password..."
                    value={testPassword}
                    onChange={(e) => setTestPassword(e.target.value)}
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setShowTestSignUp(false)}>
                    Cancel
                  </Button>
                  <Button 
                    onClick={handleTestSignUp} 
                    disabled={isTestSigningUp}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    {isTestSigningUp ? "Creating..." : "Create Test Account"}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          <Button 
            variant="outline" 
            size="sm"
            onClick={onSignOut}
            className="border-red-200 text-red-700 hover:bg-red-50 flex-shrink-0"
          >
            <LogOut className="w-4 h-4 md:mr-2" />
            <span className="hidden md:inline">Sign Out</span>
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 p-3 md:p-6">
        <div className="max-w-4xl mx-auto">
          {/* User Info */}
          {user && (
            <div className="mb-6">
              <Card className="border-green-200">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                      <span className="text-lg font-semibold text-green-700">
                        {(profileUser.name || profileUser.email).charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        {profileUser.name || profileUser.username || profileUser.email}
                      </h3>
                      <p className="text-sm text-gray-500">{profileUser.email}</p>
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
                <span className="hidden sm:inline">Favorite Recipes</span>
                <span className="sm:hidden">Favorites</span>
                <Badge variant="secondary" className="ml-1">
                  {favorites.length}
                </Badge>
              </TabsTrigger>
              <TabsTrigger value="groups" className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                <span className="hidden sm:inline">Groups & Sharing</span>
                <span className="sm:hidden">Groups</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="favorites" className="mt-6">
              {favorites.length === 0 ? (
                <Card className="border-green-200">
                  <CardContent className="flex flex-col items-center justify-center py-12">
                    <ChefHat className="w-12 h-12 text-green-300 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No favorite recipes yet</h3>
                    <p className="text-gray-500 text-center mb-4">
                      Start a conversation with our AI assistant and save recipes you like by clicking the star button.
                    </p>
                    <Button 
                      onClick={onBackToChat}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      Start Cooking
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
                                  Saved on {new Date(recipe.timestamp).toLocaleDateString()}
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
                                    <AlertDialogTitle>Remove from favorites?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      This will permanently remove "{parsed.title}" from your favorite recipes. 
                                      This action cannot be undone.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction 
                                      onClick={() => handleDeleteRecipe(recipe.id)}
                                      className="bg-red-600 hover:bg-red-700"
                                    >
                                      Remove
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