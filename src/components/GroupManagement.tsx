import { useState, useEffect } from "react"
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
import { Users, Plus, Share2, Copy, Trash2, UserPlus, LogOut, Crown, Settings } from "lucide-react"
import { toast } from "sonner"

interface GroupManagementProps {
  onClose: () => void
}

export function GroupManagement({ onClose }: GroupManagementProps) {
  const { groups, isLoading, createGroup, joinGroup, leaveGroup, deleteGroup, getGroupMembers, shareRecipeWithGroup, getGroupInviteCode, refreshGroups } = useGroups()
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
      toast.error("Group name is required")
      return
    }

    setIsCreating(true)
    try {
      const result = await createGroup(groupName.trim(), groupDescription.trim())
      if (result.success) {
        toast.success("Group created successfully!")
        setGroupName("")
        setGroupDescription("")
        setShowCreateDialog(false)
      } else {
        toast.error(result.error || "Failed to create group")
      }
    } catch (error) {
      toast.error("Failed to create group")
    } finally {
      setIsCreating(false)
    }
  }

  const handleJoinGroup = async () => {
    if (!inviteCode.trim()) {
      toast.error("Invite code is required")
      return
    }

    setIsJoining(true)
    try {
      const result = await joinGroup(inviteCode.trim())
      if (result.success) {
        toast.success("Successfully joined group!")
        setInviteCode("")
        setShowJoinDialog(false)
      } else {
        toast.error(result.error || "Failed to join group")
      }
    } catch (error) {
      toast.error("Failed to join group")
    } finally {
      setIsJoining(false)
    }
  }

  const handleShareRecipe = async () => {
    if (!selectedGroup || !selectedRecipe) {
      toast.error("Please select both a group and a recipe")
      return
    }

    const recipe = favorites.find(f => f.id === selectedRecipe)
    if (!recipe) {
      toast.error("Recipe not found")
      return
    }

    try {
      const result = await shareRecipeWithGroup(selectedGroup, selectedRecipe, recipe.content)
      if (result.success) {
        toast.success("Recipe shared successfully!")
        setSelectedGroup("")
        setSelectedRecipe("")
        setShowShareDialog(false)
      } else {
        toast.error(result.error || "Failed to share recipe")
      }
    } catch (error) {
      toast.error("Failed to share recipe")
    }
  }

  const handleCopyInviteCode = async (groupId: string) => {
    try {
      const inviteCode = await getGroupInviteCode(groupId)
      if (inviteCode) {
        await navigator.clipboard.writeText(inviteCode)
        toast.success("Invite code copied to clipboard!")
      } else {
        toast.error("Failed to get invite code")
      }
    } catch (error) {
      toast.error("Failed to copy invite code")
    }
  }

  const handleLeaveGroup = async (groupId: string) => {
    try {
      const result = await leaveGroup(groupId)
      if (result.success) {
        toast.success("Left group successfully")
      } else {
        toast.error(result.error || "Failed to leave group")
      }
    } catch (error) {
      toast.error("Failed to leave group")
    }
  }

  const handleDeleteGroup = async (groupId: string) => {
    try {
      const result = await deleteGroup(groupId)
      if (result.success) {
        toast.success("Group deleted successfully")
      } else {
        toast.error(result.error || "Failed to delete group")
      }
    } catch (error) {
      toast.error("Failed to delete group")
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Users className="w-5 h-5 text-green-600" />
          <h2 className="text-xl font-semibold text-gray-900">My Groups</h2>
        </div>
        <div className="flex items-center gap-2">
          <Dialog open={showJoinDialog} onOpenChange={setShowJoinDialog}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" className="border-green-200 text-green-700 hover:bg-green-50">
                <UserPlus className="w-4 h-4 mr-2" />
                Join Group
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Join a Group</DialogTitle>
                <DialogDescription>
                  Enter an invite code to join an existing recipe sharing group.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="inviteCode">Invite Code</Label>
                  <Input
                    id="inviteCode"
                    placeholder="Enter invite code..."
                    value={inviteCode}
                    onChange={(e) => setInviteCode(e.target.value)}
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setShowJoinDialog(false)}>
                    Cancel
                  </Button>
                  <Button 
                    onClick={handleJoinGroup} 
                    disabled={isJoining}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    {isJoining ? "Joining..." : "Join Group"}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogTrigger asChild>
              <Button size="sm" className="bg-green-600 hover:bg-green-700">
                <Plus className="w-4 h-4 mr-2" />
                Create Group
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Group</DialogTitle>
                <DialogDescription>
                  Create a new group to share recipes with family and friends.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="groupName">Group Name</Label>
                  <Input
                    id="groupName"
                    placeholder="Enter group name..."
                    value={groupName}
                    onChange={(e) => setGroupName(e.target.value)} className="mx-[0px] my-[8px]"
                  />
                </div>
                <div>
                  <Label htmlFor="groupDescription">Description (Optional)</Label>
                  <Textarea
                    id="groupDescription"
                    placeholder="Describe your group..."
                    value={groupDescription}
                    onChange={(e) => setGroupDescription(e.target.value)}
                    className="resize-none h-20 px-[12px] py-[8px] mx-[0px] my-[8px]"
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                    Cancel
                  </Button>
                  <Button 
                    onClick={handleCreateGroup} 
                    disabled={isCreating}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    {isCreating ? "Creating..." : "Create Group"}
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
          <p className="text-gray-500">Loading groups...</p>
        </div>
      ) : groups.length === 0 ? (
        <Card className="border-green-200">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Users className="w-12 h-12 text-green-300 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No groups yet</h3>
            <p className="text-gray-500 text-center mb-4">
              Create a group to share recipes with family and friends, or join an existing group.
            </p>
            <div className="flex gap-2">
              <Button 
                onClick={() => setShowCreateDialog(true)}
                className="bg-green-600 hover:bg-green-700"
              >
                Create Your First Group
              </Button>
              <Button 
                variant="outline"
                onClick={() => setShowJoinDialog(true)}
                className="border-green-200 text-green-700 hover:bg-green-50"
              >
                Join a Group
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
                            Owner
                          </Badge>
                        )}
                      </div>
                      {group.description && (
                        <p className="text-sm text-gray-600 mb-2">{group.description}</p>
                      )}
                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <span>{group.memberCount} member{group.memberCount !== 1 ? 's' : ''}</span>
                        <span>Created {new Date(group.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleCopyInviteCode(group.id)}
                        className="text-green-600 hover:text-green-700 hover:bg-green-50"
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
                              <AlertDialogTitle>Delete Group?</AlertDialogTitle>
                              <AlertDialogDescription>
                                This will permanently delete "{group.name}" and remove all members. 
                                This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction 
                                onClick={() => handleDeleteGroup(group.id)}
                                className="bg-red-600 hover:bg-red-700"
                              >
                                Delete Group
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
                              <AlertDialogTitle>Leave Group?</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to leave "{group.name}"? You'll need a new invite to rejoin.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction 
                                onClick={() => handleLeaveGroup(group.id)}
                                className="bg-red-600 hover:bg-red-700"
                              >
                                Leave Group
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
                Share Recipe with Group
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Share Recipe</DialogTitle>
                <DialogDescription>
                  Share one of your favorite recipes with a group you're a member of.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label>Select Group</Label>
                  <Select value={selectedGroup} onValueChange={setSelectedGroup}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose a group..." />
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
                  <Label>Select Recipe</Label>
                  <Select value={selectedRecipe} onValueChange={setSelectedRecipe}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose a recipe..." />
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
                    Cancel
                  </Button>
                  <Button 
                    onClick={handleShareRecipe}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    Share Recipe
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