import { Hono } from 'npm:hono'
import { cors } from 'npm:hono/cors'
import { logger } from 'npm:hono/logger'
import { createClient } from 'npm:@supabase/supabase-js'
import * as kv from './kv_store.tsx'

const app = new Hono()

// Enable CORS for all routes
app.use('*', cors({
  origin: '*',
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization'],
}))

// Enable logging
app.use('*', logger(console.log))

// Health check
app.get('/make-server-4322d4fa/health', (c) => {
  return c.json({ status: 'healthy', timestamp: new Date().toISOString() })
})

// Helper function to authenticate user
const authenticateUser = async (authHeader: string | undefined) => {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new Error('Authorization header required')
  }

  const token = authHeader.split(' ')[1]
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
  )

  const { data: { user }, error } = await supabase.auth.getUser(token)
  if (error || !user) {
    throw new Error('Invalid token')
  }

  return user
}

// Generate random invite code
const generateInviteCode = () => {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
}

// Sign up endpoint
app.post('/make-server-4322d4fa/signup', async (c) => {
  try {
    const { email, password, name } = await c.req.json()

    if (!email || !password || !name) {
      return c.json({ error: 'Email, password, and name are required' }, 400)
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    )

    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      user_metadata: { name },
      // Automatically confirm the user's email since an email server hasn't been configured.
      email_confirm: true
    })

    if (error) {
      console.log('Sign up error:', error)
      return c.json({ error: error.message }, 400)
    }

    return c.json({ success: true, user: data.user })
  } catch (error) {
    console.log('Sign up error:', error)
    return c.json({ error: 'Internal server error during sign up' }, 500)
  }
})

// Groups endpoints

// Get user's groups
app.get('/make-server-4322d4fa/groups', async (c) => {
  try {
    const user = await authenticateUser(c.req.header('Authorization'))
    
    // Get groups where user is a member
    const userGroupsKey = `user_groups:${user.id}`
    const userGroups = await kv.get(userGroupsKey) || []
    
    const groups = []
    for (const groupId of userGroups) {
      const group = await kv.get(`group:${groupId}`)
      if (group) {
        // Get member count
        const members = await kv.get(`group_members:${groupId}`) || []
        groups.push({
          ...group,
          memberCount: members.length,
          isOwner: group.createdBy === user.id
        })
      }
    }

    return c.json({ groups })
  } catch (error) {
    console.log('Get groups error:', error)
    return c.json({ error: error.message }, 401)
  }
})

// Create group
app.post('/make-server-4322d4fa/groups', async (c) => {
  try {
    const user = await authenticateUser(c.req.header('Authorization'))
    const { name, description } = await c.req.json()

    if (!name?.trim()) {
      return c.json({ error: 'Group name is required' }, 400)
    }

    const groupId = `group_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`
    const inviteCode = generateInviteCode()
    
    const group = {
      id: groupId,
      name: name.trim(),
      description: description?.trim() || '',
      createdBy: user.id,
      createdAt: new Date().toISOString(),
      inviteCode
    }

    // Store group
    await kv.set(`group:${groupId}`, group)
    
    // Store invite code mapping
    await kv.set(`invite:${inviteCode}`, groupId)
    
    // Add creator as first member
    const members = [{
      id: user.id,
      email: user.email,
      name: user.user_metadata?.name || user.email,
      joinedAt: new Date().toISOString(),
      role: 'owner'
    }]
    await kv.set(`group_members:${groupId}`, members)
    
    // Add group to user's groups
    const userGroups = await kv.get(`user_groups:${user.id}`) || []
    userGroups.push(groupId)
    await kv.set(`user_groups:${user.id}`, userGroups)

    return c.json({ success: true, group })
  } catch (error) {
    console.log('Create group error:', error)
    return c.json({ error: error.message }, 500)
  }
})

// Join group
app.post('/make-server-4322d4fa/groups/join', async (c) => {
  try {
    const user = await authenticateUser(c.req.header('Authorization'))
    const { inviteCode } = await c.req.json()

    if (!inviteCode?.trim()) {
      return c.json({ error: 'Invite code is required' }, 400)
    }

    // Get group ID from invite code
    const groupId = await kv.get(`invite:${inviteCode.trim()}`)
    if (!groupId) {
      return c.json({ error: 'Invalid invite code' }, 400)
    }

    // Check if user is already a member
    const userGroups = await kv.get(`user_groups:${user.id}`) || []
    if (userGroups.includes(groupId)) {
      return c.json({ error: 'You are already a member of this group' }, 400)
    }

    // Add user to group members
    const members = await kv.get(`group_members:${groupId}`) || []
    members.push({
      id: user.id,
      email: user.email,
      name: user.user_metadata?.name || user.email,
      joinedAt: new Date().toISOString(),
      role: 'member'
    })
    await kv.set(`group_members:${groupId}`, members)
    
    // Add group to user's groups
    userGroups.push(groupId)
    await kv.set(`user_groups:${user.id}`, userGroups)

    return c.json({ success: true })
  } catch (error) {
    console.log('Join group error:', error)
    return c.json({ error: error.message }, 500)
  }
})

// Leave group
app.post('/make-server-4322d4fa/groups/:groupId/leave', async (c) => {
  try {
    const user = await authenticateUser(c.req.header('Authorization'))
    const groupId = c.req.param('groupId')

    // Check if user is a member
    const userGroups = await kv.get(`user_groups:${user.id}`) || []
    if (!userGroups.includes(groupId)) {
      return c.json({ error: 'You are not a member of this group' }, 400)
    }

    // Check if user is the owner
    const group = await kv.get(`group:${groupId}`)
    if (group?.createdBy === user.id) {
      return c.json({ error: 'Group owners cannot leave their own group. Delete the group instead.' }, 400)
    }

    // Remove user from group members
    const members = await kv.get(`group_members:${groupId}`) || []
    const updatedMembers = members.filter((member: any) => member.id !== user.id)
    await kv.set(`group_members:${groupId}`, updatedMembers)
    
    // Remove group from user's groups
    const updatedUserGroups = userGroups.filter((id: string) => id !== groupId)
    await kv.set(`user_groups:${user.id}`, updatedUserGroups)

    return c.json({ success: true })
  } catch (error) {
    console.log('Leave group error:', error)
    return c.json({ error: error.message }, 500)
  }
})

// Delete group (owner only)
app.delete('/make-server-4322d4fa/groups/:groupId', async (c) => {
  try {
    const user = await authenticateUser(c.req.header('Authorization'))
    const groupId = c.req.param('groupId')

    // Check if user is the owner
    const group = await kv.get(`group:${groupId}`)
    if (!group || group.createdBy !== user.id) {
      return c.json({ error: 'Only group owners can delete groups' }, 403)
    }

    // Get all members to remove group from their lists
    const members = await kv.get(`group_members:${groupId}`) || []
    for (const member of members) {
      const userGroups = await kv.get(`user_groups:${member.id}`) || []
      const updatedUserGroups = userGroups.filter((id: string) => id !== groupId)
      await kv.set(`user_groups:${member.id}`, updatedUserGroups)
    }

    // Delete group data
    await kv.del(`group:${groupId}`)
    await kv.del(`group_members:${groupId}`)
    await kv.del(`group_recipes:${groupId}`)
    await kv.del(`invite:${group.inviteCode}`)

    return c.json({ success: true })
  } catch (error) {
    console.log('Delete group error:', error)
    return c.json({ error: error.message }, 500)
  }
})

// Get group invite code
app.get('/make-server-4322d4fa/groups/:groupId/invite-code', async (c) => {
  try {
    const user = await authenticateUser(c.req.header('Authorization'))
    const groupId = c.req.param('groupId')

    // Check if user is a member
    const userGroups = await kv.get(`user_groups:${user.id}`) || []
    if (!userGroups.includes(groupId)) {
      return c.json({ error: 'You are not a member of this group' }, 403)
    }

    const group = await kv.get(`group:${groupId}`)
    if (!group) {
      return c.json({ error: 'Group not found' }, 404)
    }

    return c.json({ inviteCode: group.inviteCode })
  } catch (error) {
    console.log('Get invite code error:', error)
    return c.json({ error: error.message }, 500)
  }
})

// Get group members
app.get('/make-server-4322d4fa/groups/:groupId/members', async (c) => {
  try {
    const user = await authenticateUser(c.req.header('Authorization'))
    const groupId = c.req.param('groupId')

    // Check if user is a member
    const userGroups = await kv.get(`user_groups:${user.id}`) || []
    if (!userGroups.includes(groupId)) {
      return c.json({ error: 'You are not a member of this group' }, 403)
    }

    const members = await kv.get(`group_members:${groupId}`) || []
    return c.json({ members })
  } catch (error) {
    console.log('Get members error:', error)
    return c.json({ error: error.message }, 500)
  }
})

// Share recipe with group
app.post('/make-server-4322d4fa/groups/:groupId/recipes', async (c) => {
  try {
    const user = await authenticateUser(c.req.header('Authorization'))
    const groupId = c.req.param('groupId')
    const { recipeId, recipeContent, sharedBy } = await c.req.json()

    // Check if user is a member
    const userGroups = await kv.get(`user_groups:${user.id}`) || []
    if (!userGroups.includes(groupId)) {
      return c.json({ error: 'You are not a member of this group' }, 403)
    }

    // Store shared recipe
    const sharedRecipe = {
      id: recipeId,
      content: recipeContent,
      sharedBy: sharedBy || user.user_metadata?.name || user.email,
      sharedAt: new Date().toISOString(),
      sharedById: user.id
    }

    const groupRecipes = await kv.get(`group_recipes:${groupId}`) || []
    groupRecipes.push(sharedRecipe)
    await kv.set(`group_recipes:${groupId}`, groupRecipes)

    return c.json({ success: true })
  } catch (error) {
    console.log('Share recipe error:', error)
    return c.json({ error: error.message }, 500)
  }
})

Deno.serve(app.fetch)