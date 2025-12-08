import { useState } from "react"
import { useGroups } from "./GroupsContext"
import { useFavorites } from "./FavoritesContext"
import { Button } from "./ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card"
import { Input } from "./ui/input"
import { Label } from "./ui/label"
import { Textarea } from "./ui/textarea"
import { Badge } from "./ui/badge"
import { ScrollArea } from "./ui/scroll-area"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "./ui/dialog"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "./ui/alert-dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select"
import { Users, Plus, Share2, Copy, Trash2, UserPlus, LogOut, Crown } from "lucide-react"
import { toast } from "sonner"
// 1. Импорт хука
import { useTranslation } from "react-i18next"

interface GroupManagementProps {
  onClose: () => void
}

export function GroupManagement({ onClose }: GroupManagementProps) {
  // 2. Инициализация хука
  const { t } = useTranslation()
  
  const { groups, isLoading, createGroup, joinGroup, leaveGroup, deleteGroup, shareRecipeWithGroup, getGroupInviteCode } = useGroups()
  const { favorites } = useFavorites()
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [showJoinDialog, setShowJoinDialog] = useState(false)
  const [showShareDialog, setShowShareDialog] = useState(false)
  const [selectedGroup, setSelectedGroup] = useState<string>("")
  const [selectedRecipe, setSelectedRecipe] = useState<string>("")
  
  // Create group form
  const [groupName, setGroupName] = useState("")
  const [groupDescription, setGroupDescription] = useState("")
  const [isCreating, setIsCreating] = useState(false)
  
  // Join group form
  const [inviteCode, setInviteCode] = useState("")
  const [isJoining, setIsJoining] = useState(false)

  const handleCreateGroup = async () => {
    if (!groupName.trim()) {
      toast.error(t('groups.errors.nameRequired'))
      return
    }

    setIsCreating(true)
    try {
      const result = await createGroup(groupName.trim(), groupDescription.trim())
      if (result.success) {
        toast.success(t('groups.success.created'))
        setGroupName("")
        setGroupDescription("")
        setShowCreateDialog(false)
      } else {
        toast.error(result.error || t('groups.errors.createFailed'))
      }
    } catch (error) {
      toast.error(t('groups.errors.createFailed'))
    } finally {
      setIsCreating(false)
    }
  }

  const handleJoinGroup = async () => {
    if (!inviteCode.trim()) {
      toast.error(t('groups.errors.codeRequired'))
      return
    }

    setIsJoining(true)
    try {
      const result = await joinGroup(inviteCode.trim())
      if (result.success) {
        toast.success(t('groups.success.joined'))
        setInviteCode("")
        setShowJoinDialog(false)
      } else {
        toast.error(result.error || t('groups.errors.joinFailed'))
      }
    } catch (error) {
      toast.error(t('groups.errors.joinFailed'))
    } finally {
      setIsJoining(false)
    }
  }

  const handleShareRecipe = async () => {
    if (!selectedGroup || !selectedRecipe) {
      toast.error(t('groups.errors.selectBoth'))
      return
    }

    const recipe = favorites.find(f => f.id === selectedRecipe)
    if (!recipe) {
      toast.error(t('groups.errors.recipeNotFound'))
      return
    }

    try {
      const result = await shareRecipeWithGroup(selectedGroup, selectedRecipe, recipe.content)
      if (result.success) {
        toast.success(t('groups.success.shared'))
        setSelectedGroup("")
        setSelectedRecipe("")
        setShowShareDialog(false)
      } else {
        toast.error(result.error || t('groups.errors.shareFailed'))
      }
    } catch (error) {
      toast.error(t('groups.errors.shareFailed'))
    }
  }

  const handleCopyInviteCode = async (groupId: string) => {
    try {
      const inviteCode = await getGroupInviteCode(groupId)
      if (inviteCode) {
        await navigator.clipboard.writeText(inviteCode)
        toast.success(t('groups.success.codeCopied'))
      } else {
        toast.error(t('groups.errors.getCodeFailed'))
      }
    } catch (error) {
      toast.error(t('groups.errors.copyFailed'))
    }
  }

  const handleLeaveGroup = async (groupId: string) => {
    try {
      const result = await leaveGroup(groupId)
      if (result.success) {
        toast.success(t('groups.success.left'))
      } else {
        toast.error(result.error || t('groups.errors.leaveFailed'))
      }
    } catch (error) {
      toast.error(t('groups.errors.leaveFailed'))
    }
  }

  const handleDeleteGroup = async (groupId: string) => {
    try {
      const result = await deleteGroup(groupId)
      if (result.success) {
        toast.success(t('groups.success.deleted'))
      } else {
        toast.error(result.error || t('groups.errors.deleteFailed'))
      }
    } catch (error) {
      toast.error(t('groups.errors.deleteFailed'))
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Users className="w-5 h-5 text-green-600" />
          <h2 className="text-xl font-semibold text-gray-900">{t('groups.myGroups')}</h2>
        </div>
        <div className="flex items-center gap-2">
          <Dialog open={showJoinDialog} onOpenChange={setShowJoinDialog}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" className="border-green-200 text-green-700 hover:bg-green-50">
                <UserPlus className="w-4 h-4 mr-2" />
                {t('groups.join')}
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{t('groups.joinTitle')}</DialogTitle>
                <DialogDescription>
                  {t('groups.joinDesc')}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="inviteCode">{t('groups.codeLabel')}</Label>
                  <Input
                    id="inviteCode"
                    placeholder={t('groups.placeholders.code')}
                    value={inviteCode}
                    onChange={(e: { target: { value: string } }) => setInviteCode(e.target.value)}
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setShowJoinDialog(false)}>
                    {t('groups.cancel')}
                  </Button>
                  <Button 
                    onClick={handleJoinGroup} 
                    disabled={isJoining}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    {isJoining ? t('groups.joining') : t('groups.join')}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogTrigger asChild>
              <Button size="sm" className="bg-green-600 hover:bg-green-700">
                <Plus className="w-4 h-4 mr-2" />
                {t('groups.create')}
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{t('groups.createTitle')}</DialogTitle>
                <DialogDescription>
                  {t('groups.createDesc')}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="groupName">{t('groups.nameLabel')}</Label>
                  <Input
                    id="groupName"
                    placeholder={t('groups.placeholders.name')}
                    value={groupName}
                    onChange={(e) => setGroupName(e.target.value)} 
                    className="mx-[0px] my-[8px]"
                  />
                </div>
                <div>
                  <Label htmlFor="groupDescription">{t('groups.descLabel')}</Label>
                  <Textarea
                    id="groupDescription"
                    placeholder={t('groups.placeholders.desc')}
                    value={groupDescription}
                    onChange={(e) => setGroupDescription(e.target.value)}
                    className="resize-none h-20 px-[12px] py-[8px] mx-[0px] my-[8px]"
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                    {t('groups.cancel')}
                  </Button>
                  <Button 
                    onClick={handleCreateGroup} 
                    disabled={isCreating}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    {isCreating ? t('groups.creating') : t('groups.create')}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Groups List */}
      {isLoading ? (
        <div className="text-center py-8">
          <p className="text-gray-500">{t('groups.loading')}</p>
        </div>
      ) : groups.length === 0 ? (
        <Card className="border-green-200">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Users className="w-12 h-12 text-green-300 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">{t('groups.noGroups')}</h3>
            <p className="text-gray-500 text-center mb-4">
              {t('groups.noGroupsDesc')}
            </p>
            <div className="flex gap-2">
              <Button 
                onClick={() => setShowCreateDialog(true)}
                className="bg-green-600 hover:bg-green-700"
              >
                {t('groups.createFirst')}
              </Button>
              <Button 
                variant="outline"
                onClick={() => setShowJoinDialog(true)}
                className="border-green-200 text-green-700 hover:bg-green-50"
              >
                {t('groups.join')}
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <ScrollArea className="h-[400px]">
          <div className="space-y-4">
            {groups.map((group) => (
              <Card key={group.id} className="border-green-200">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <CardTitle className="text-green-800">{group.name}</CardTitle>
                        {group.isOwner && (
                          <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                            <Crown className="w-3 h-3 mr-1" />
                            {t('groups.owner')}
                          </Badge>
                        )}
                      </div>
                      {group.description && (
                        <p className="text-sm text-gray-600 mb-2">{group.description}</p>
                      )}
                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        {/* Использование интерполяции для множественного числа и даты */}
                        <span>{t('groups.members', { count: group.memberCount })}</span>
                        <span>{t('groups.created', { date: new Date(group.createdAt).toLocaleDateString() })}</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleCopyInviteCode(group.id)}
                        className="text-green-600 hover:text-green-700 hover:bg-green-50"
                        title={t('groups.copyInvite')}
                      >
                        <Copy className="w-4 h-4" />
                      </Button>
                      
                      {group.isOwner ? (
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>{t('groups.confirmDeleteTitle')}</AlertDialogTitle>
                              <AlertDialogDescription>
                                {t('groups.confirmDeleteDesc', { name: group.name })}
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>{t('groups.cancel')}</AlertDialogCancel>
                              <AlertDialogAction 
                                onClick={() => handleDeleteGroup(group.id)}
                                className="bg-red-600 hover:bg-red-700"
                              >
                                {t('groups.delete')}
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      ) : (
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                              <LogOut className="w-4 h-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>{t('groups.confirmLeaveTitle')}</AlertDialogTitle>
                              <AlertDialogDescription>
                                {t('groups.confirmLeaveDesc', { name: group.name })}
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>{t('groups.cancel')}</AlertDialogCancel>
                              <AlertDialogAction 
                                onClick={() => handleLeaveGroup(group.id)}
                                className="bg-red-600 hover:bg-red-700"
                              >
                                {t('groups.leave')}
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      )}
                    </div>
                  </div>
                </CardHeader>
              </Card>
            ))}
          </div>
        </ScrollArea>
      )}

      {/* Share Recipe Dialog */}
      {favorites.length > 0 && groups.length > 0 && (
        <div className="pt-4 border-t">
          <Dialog open={showShareDialog} onOpenChange={setShowShareDialog}>
            <DialogTrigger asChild>
              <Button variant="outline" className="w-full border-green-200 text-green-700 hover:bg-green-50">
                <Share2 className="w-4 h-4 mr-2" />
                {t('groups.shareBtn')}
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{t('groups.shareTitle')}</DialogTitle>
                <DialogDescription>
                  {t('groups.shareDesc')}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label>{t('groups.selectGroup')}</Label>
                  <Select value={selectedGroup} onValueChange={setSelectedGroup}>
                    <SelectTrigger>
                      <SelectValue placeholder={t('groups.placeholders.selectGroup')} />
                    </SelectTrigger>
                    <SelectContent>
                      {groups.map((group) => (
                        <SelectItem key={group.id} value={group.id}>
                          {group.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>{t('groups.selectRecipe')}</Label>
                  <Select value={selectedRecipe} onValueChange={setSelectedRecipe}>
                    <SelectTrigger>
                      <SelectValue placeholder={t('groups.placeholders.selectRecipe')} />
                    </SelectTrigger>
                    <SelectContent>
                      {favorites.map((recipe) => (
                        <SelectItem key={recipe.id} value={recipe.id}>
                          {recipe.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setShowShareDialog(false)}>
                    {t('groups.cancel')}
                  </Button>
                  <Button 
                    onClick={handleShareRecipe}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    {t('groups.share')}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      )}
    </div>
  )
}