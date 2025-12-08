import { createContext, useContext, useState, useEffect, ReactNode } from "react"
import { useAuth } from "./AuthContext"
import { getSupabaseClient } from "../utils/supabase/client"
import { projectId, publicAnonKey } from "../utils/supabase/info"
// 1. Импорт
import { useTranslation } from "react-i18next"

interface Group {
  id: string
  name: string
  description: string
  createdBy: string
  createdAt: string
  memberCount: number
  isOwner: boolean
}

interface GroupMember {
  id: string
  email: string
  name: string
  joinedAt: string
  role: 'owner' | 'member'
}

interface GroupsContextType {
  groups: Group[]
  isLoading: boolean
  createGroup: (name: string, description: string) => Promise<{ success: boolean; error?: string }>
  joinGroup: (inviteCode: string) => Promise<{ success: boolean; error?: string }>
  leaveGroup: (groupId: string) => Promise<{ success: boolean; error?: string }>
  deleteGroup: (groupId: string) => Promise<{ success: boolean; error?: string }>
  getGroupMembers: (groupId: string) => Promise<GroupMember[]>
  shareRecipeWithGroup: (groupId: string, recipeId: string, recipeContent: string) => Promise<{ success: boolean; error?: string }>
  getGroupInviteCode: (groupId: string) => Promise<string | null>
  refreshGroups: () => Promise<void>
}

const GroupsContext = createContext<GroupsContextType | undefined>(undefined)

export function GroupsProvider({ children }: { children: ReactNode }) {
  const [groups, setGroups] = useState<Group[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const { user } = useAuth()
  // 2. Хук
  const { t } = useTranslation()

  const apiCall = async (endpoint: string, options: RequestInit = {}) => {
    if (!user) {
      throw new Error(t('errors.notAuthenticated'))
    }

    // Get the current session to get the access token
    const supabase = getSupabaseClient()
    const { data: { session } } = await supabase.auth.getSession()
    
    if (!session?.access_token) {
      throw new Error(t('errors.noSession'))
    }

    const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-4322d4fa${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.access_token}`,
        ...options.headers
      }
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: t('errors.network') }))
      throw new Error(errorData.error || t('errors.requestFailed'))
    }

    return response.json()
  }

  const refreshGroups = async () => {
    if (!user) {
      setGroups([])
      return
    }

    setIsLoading(true)
    try {
      const data = await apiCall('/groups')
      setGroups(data.groups || [])
    } catch (error) {
      console.error('Failed to fetch groups:', error)
      // Only show error if it's not an authentication issue
      if (error instanceof Error && !error.message.includes('not authenticated') && !error.message.includes('No valid session')) {
        console.error('Groups fetch error:', error.message)
      }
      setGroups([])
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (user) {
      // Add a small delay to ensure session is fully established
      const timer = setTimeout(() => {
        refreshGroups()
      }, 100)
      
      return () => clearTimeout(timer)
    } else {
      setGroups([])
    }
  }, [user])

  const createGroup = async (name: string, description: string) => {
    if (!user) return { success: false, error: t('errors.notAuthenticated') }

    try {
      await apiCall('/groups', {
        method: 'POST',
        body: JSON.stringify({ name, description, userId: user.id })
      })
      
      await refreshGroups()
      return { success: true }
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : t('groups.errors.createFailed') }
    }
  }

  const joinGroup = async (inviteCode: string) => {
    if (!user) return { success: false, error: t('errors.notAuthenticated') }

    try {
      await apiCall('/groups/join', {
        method: 'POST',
        body: JSON.stringify({ inviteCode, userId: user.id })
      })
      
      await refreshGroups()
      return { success: true }
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : t('groups.errors.joinFailed') }
    }
  }

  const leaveGroup = async (groupId: string) => {
    if (!user) return { success: false, error: t('errors.notAuthenticated') }

    try {
      await apiCall(`/groups/${groupId}/leave`, {
        method: 'POST',
        body: JSON.stringify({ userId: user.id })
      })
      
      await refreshGroups()
      return { success: true }
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : t('groups.errors.leaveFailed') }
    }
  }

  const deleteGroup = async (groupId: string) => {
    if (!user) return { success: false, error: t('errors.notAuthenticated') }

    try {
      await apiCall(`/groups/${groupId}`, {
        method: 'DELETE',
        body: JSON.stringify({ userId: user.id })
      })
      
      await refreshGroups()
      return { success: true }
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : t('groups.errors.deleteFailed') }
    }
  }

  const getGroupMembers = async (groupId: string): Promise<GroupMember[]> => {
    if (!user) return []

    try {
      const data = await apiCall(`/groups/${groupId}/members`)
      return data.members || []
    } catch (error) {
      console.error('Failed to fetch group members:', error)
      return []
    }
  }

  const shareRecipeWithGroup = async (groupId: string, recipeId: string, recipeContent: string) => {
    if (!user) return { success: false, error: t('errors.notAuthenticated') }

    try {
      await apiCall(`/groups/${groupId}/recipes`, {
        method: 'POST',
        body: JSON.stringify({ 
          recipeId, 
          recipeContent, 
          userId: user.id,
          sharedBy: user.name
        })
      })
      
      return { success: true }
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : t('groups.errors.shareFailed') }
    }
  }

  const getGroupInviteCode = async (groupId: string): Promise<string | null> => {
    if (!user) return null

    try {
      const data = await apiCall(`/groups/${groupId}/invite-code`)
      return data.inviteCode || null
    } catch (error) {
      console.error('Failed to get invite code:', error)
      return null
    }
  }

  return (
    <GroupsContext.Provider value={{
      groups,
      isLoading,
      createGroup,
      joinGroup,
      leaveGroup,
      deleteGroup,
      getGroupMembers,
      shareRecipeWithGroup,
      getGroupInviteCode,
      refreshGroups
    }}>
      {children}
    </GroupsContext.Provider>
  )
}

export function useGroups() {
  const context = useContext(GroupsContext)
  if (context === undefined) {
    throw new Error('useGroups must be used within a GroupsProvider')
  }
  return context
}