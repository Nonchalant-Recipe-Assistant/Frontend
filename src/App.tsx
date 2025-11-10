import { useState } from "react"
import React from "react"
import { Header } from "./components/Header"
import { ChatInterface } from "./components/ChatInterface"
import { ProfilePage } from "./components/ProfilePage"
import { FavoritesProvider } from "./components/FavoritesContext"
import { AuthProvider } from "./components/AuthContext"
import { GroupsProvider } from "./components/GroupsContext"
import { Toaster } from "./components/ui/sonner"
import { ChatWidget } from './components/ChatWidget'
export default function App() {
  const [currentPage, setCurrentPage] = useState<'chat' | 'profile'>('chat')

  const handleProfileClick = () => {
    setCurrentPage('profile')
  }

  const handleBackToChat = () => {
    setCurrentPage('chat')
  }

  const handleSignOut = () => {
    // Redirect back to chat after sign out
    setCurrentPage('chat')
  }

  return (
    <AuthProvider>
      <FavoritesProvider>
        <GroupsProvider>
          <div className="h-screen flex flex-col bg-gray-50">
            {currentPage === 'chat' ? (
              <>
                <Header 
                  onProfileClick={handleProfileClick}
                  onSignOut={handleSignOut}
                />
                <ChatInterface />
              </>
            ) : (
              <ProfilePage 
                onBackToChat={handleBackToChat}
                onSignOut={handleSignOut}
              />
            )}
            <ChatWidget />
            <Toaster />
          </div>
        </GroupsProvider>
      </FavoritesProvider>
    </AuthProvider>
  )
}