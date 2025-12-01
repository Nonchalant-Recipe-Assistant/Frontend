import { useState } from "react"
import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import { Header } from "./components/Header"
import { ChatInterface } from "./components/ChatInterface"
import { ProfilePage } from "./components/ProfilePage"
import { FavoritesProvider } from "./components/FavoritesContext"
import { AuthProvider } from "./components/AuthContext"
import { GroupsProvider } from "./components/GroupsContext"
import { Toaster } from "./components/ui/sonner"
import { ChatWidget } from './components/ChatWidget'
import { VerifyEmail } from "./components/VerifyEmail"

// This is your existing "Main Page" logic, moved into a component
function Dashboard() {
  const [currentPage, setCurrentPage] = useState<'chat' | 'profile'>('chat')

  const handleProfileClick = () => {
    setCurrentPage('profile')
  }

  const handleBackToChat = () => {
    setCurrentPage('chat')
  }

  const handleSignOut = () => {
    setCurrentPage('chat')
  }

  return (
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
    </div>
  )
}

// The main App component now handles Routing
export default function App() {
  return (
    <Router>
      <AuthProvider>
        <FavoritesProvider>
          <GroupsProvider>
            <Routes>
              {/* Your main app dashboard */}
              <Route path="/" element={<Dashboard />} />
              
              {/* The new verification page */}
              <Route path="/verify-email" element={<VerifyEmail />} />
            </Routes>
            <Toaster />
          </GroupsProvider>
        </FavoritesProvider>
      </AuthProvider>
    </Router>
  )
}