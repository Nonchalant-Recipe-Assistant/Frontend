import { useState, useEffect, useRef } from "react"
import { MessageCircle, X, Send, Lock, Globe } from "lucide-react"
import { useAuth } from "./AuthContext"
import { useWebSocket } from "../hooks/useWebSocket"
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import { ScrollArea } from "./ui/scroll-area"
import { Avatar, AvatarFallback } from "./ui/avatar"

export function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false)
  const [inputMessage, setInputMessage] = useState("")
  const [privateMode, setPrivateMode] = useState(false)
  const [targetUser, setTargetUser] = useState("")
  const { user } = useAuth()
  const { messages, sendMessage, isConnected, connectionStatus } = useWebSocket()
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Получаем инициалы из email
  const getUserInitials = (email: string) => {
    if (!email) return "U"
    return email.split('@')[0].charAt(0).toUpperCase()
  }

  // Получаем отображаемое имя из email
  const getDisplayName = (email: string) => {
    if (!email) return "User"
    return email.split('@')[0]
  }

  const handleSendMessage = () => {
    if (!inputMessage.trim()) return

    let messageToSend
    
    if (privateMode && targetUser) {
      // Отправляем объект для приватного сообщения
      messageToSend = {
        text: inputMessage,
        message_type: "private",
        target_user: targetUser
      }
    } else {
      // Отправляем объект для обычного сообщения
      messageToSend = {
        text: inputMessage,
        message_type: "text"
      }
    }

    // Преобразуем в JSON строку для отправки
    if (sendMessage(JSON.stringify(messageToSend))) {
      setInputMessage("")
      // Сбрасываем приватный режим после отправки
      if (privateMode) {
        setPrivateMode(false)
        setTargetUser("")
      }
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  if (!user) return null

  return (
    <>
      {/* Chat Button - левый нижний угол */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          style={{
            position: 'fixed',
            bottom: '24px',
            left: '24px',
            backgroundColor: '#16a34a',
            color: 'white',
            borderRadius: '50%',
            padding: '16px',
            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
            border: 'none',
            cursor: 'pointer',
            transition: 'all 0.2s',
            zIndex: 50,
            width: '56px',
            height: '56px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'scale(1.1)';
            e.currentTarget.style.backgroundColor = '#15803d';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'scale(1)';
            e.currentTarget.style.backgroundColor = '#16a34a';
          }}
        >
          <MessageCircle style={{ width: '24px', height: '24px' }} />
        </button>
      )}

      {/* Chat Window - левый нижний угол */}
      {isOpen && (
        <div
          style={{
            position: 'fixed',
            bottom: '24px',
            left: '24px',
            width: '380px',
            height: '480px',
            backgroundColor: 'white',
            borderRadius: '8px',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
            border: '1px solid #e5e7eb',
            display: 'flex',
            flexDirection: 'column',
            zIndex: 50
          }}
        >
          {/* Header */}
          <div style={{
            backgroundColor: '#16a34a',
            color: 'white',
            padding: '12px 16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderTopLeftRadius: '8px',
            borderTopRightRadius: '8px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                backgroundColor: connectionStatus === 'connected' ? '#86efac' : 
                                connectionStatus === 'connecting' ? '#fde047' : 
                                '#fca5a5'
              }} />
              <div>
                <h3 style={{ fontWeight: 600, fontSize: '14px' }}>Recipe Chat</h3>
                <p style={{ fontSize: '12px', color: '#dcfce7', opacity: 0.8 }}>
                  {connectionStatus === 'connected' ? 'Online' : 
                   connectionStatus === 'connecting' ? 'Connecting...' : 
                   'Disconnected'}
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              style={{
                color: 'white',
                backgroundColor: 'transparent',
                border: 'none',
                padding: '4px',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#15803d';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
              }}
            >
              <X style={{ width: '16px', height: '16px' }} />
            </button>
          </div>

          {/* Private Mode Toggle */}
          <div style={{
            padding: '8px 16px',
            backgroundColor: '#f8f9fa',
            borderBottom: '1px solid #e5e7eb',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '12px'
          }}>
            <button
              onClick={() => setPrivateMode(!privateMode)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                padding: '4px 8px',
                borderRadius: '4px',
                border: '1px solid #d1d5db',
                backgroundColor: privateMode ? '#dbeafe' : 'white',
                color: privateMode ? '#1e40af' : '#6b7280',
                cursor: 'pointer',
                fontSize: '12px'
              }}
            >
              {privateMode ? <Lock size={12} /> : <Globe size={12} />}
              {privateMode ? 'Private' : 'Public'}
            </button>
            
            {privateMode && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', flex: 1 }}>
                <span style={{ color: '#6b7280', fontSize: '11px' }}>To:</span>
                <input
                  type="email"
                  placeholder="user@example.com"
                  value={targetUser}
                  onChange={(e) => setTargetUser(e.target.value)}
                  style={{
                    flex: 1,
                    fontSize: '12px',
                    padding: '4px 8px',
                    border: '1px solid #d1d5db',
                    borderRadius: '4px',
                    outline: 'none'
                  }}
                />
              </div>
            )}
          </div>

          {/* Messages */}
          <div style={{ flex: 1, overflow: 'hidden' }}>
            <div style={{ height: '100%', padding: '12px' }}>
              <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                {messages.length === 0 ? (
                  <div style={{ 
                    textAlign: 'center', 
                    padding: '32px 0',
                    color: '#6b7280'
                  }}>
                    <MessageCircle style={{ 
                      width: '32px', 
                      height: '32px', 
                      margin: '0 auto 8px',
                      color: '#d1d5db'
                    }} />
                    <p style={{ fontSize: '14px' }}>No messages yet</p>
                    <p style={{ fontSize: '12px', color: '#9ca3af', marginTop: '4px' }}>
                      Start a conversation about recipes!
                    </p>
                  </div>
                ) : (
                  <div style={{ 
                    flex: 1, 
                    overflow: 'auto',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '12px'
                  }}>
                    {messages.map((message, index) => (
                      <div
                        key={`${message.id}-${index}-${message.timestamp}`}
                        style={{
                          display: 'flex',
                          gap: '8px',
                          justifyContent: message.sender_email === user.email ? 'flex-end' : 'flex-start'
                        }}
                      >
                        {message.sender_email !== user.email && (
                          <div style={{
                            width: '24px',
                            height: '24px',
                            borderRadius: '50%',
                            backgroundColor: '#3b82f6',
                            color: 'white',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '10px',
                            flexShrink: 0
                          }}>
                            {getUserInitials(message.sender_email)}
                          </div>
                        )}
                        
                        <div
                          style={{
                            maxWidth: '70%',
                            borderRadius: '8px',
                            padding: '8px 12px',
                            backgroundColor: message.sender_email === user.email 
                              ? '#16a34a' 
                              : message.message_type === 'private'
                              ? '#f0f8ff'
                              : '#f3f4f6',
                            color: message.sender_email === user.email ? 'white' : '#111827',
                            border: message.message_type === 'private' ? '1px solid #3b82f6' : 'none',
                            borderBottomRightRadius: message.sender_email === user.email ? 0 : '8px',
                            borderBottomLeftRadius: message.sender_email === user.email ? '8px' : 0,
                            position: 'relative'
                          }}
                        >
                          {/* Бейдж для приватных сообщений */}
                          {message.message_type === 'private' && (
                            <div style={{
                              position: 'absolute',
                              top: '-8px',
                              left: '8px',
                              backgroundColor: '#3b82f6',
                              color: 'white',
                              padding: '2px 6px',
                              borderRadius: '10px',
                              fontSize: '10px',
                              lineHeight: 1
                            }}>
                              🔒 Private
                            </div>
                          )}
                          
                          <p style={{ 
                            fontSize: '14px', 
                            wordBreak: 'break-word',
                            marginTop: message.message_type === 'private' ? '8px' : '0'
                          }}>
                            {message.text}
                          </p>
                          <p style={{ 
                            fontSize: '11px', 
                            marginTop: '4px',
                            color: message.sender_email === user.email ? '#dcfce7' : '#6b7280',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px'
                          }}>
                            {message.sender_email !== user.email && (
                              <span>{getDisplayName(message.sender_email)} • </span>
                            )}
                            {new Date(message.timestamp).toLocaleTimeString([], { 
                              hour: '2-digit', 
                              minute: '2-digit' 
                            })}
                          </p>
                        </div>

                        {message.sender_email === user.email && (
                          <div style={{
                            width: '24px',
                            height: '24px',
                            borderRadius: '50%',
                            backgroundColor: '#22c55e',
                            color: 'white',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '10px',
                            flexShrink: 0
                          }}>
                            {getUserInitials(user.email)}
                          </div>
                        )}
                      </div>
                    ))}
                    <div ref={messagesEndRef} />
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Input Area */}
          <div style={{
            padding: '12px',
            borderTop: '1px solid #e5e7eb',
            backgroundColor: '#f9fafb'
          }}>
            <div style={{ display: 'flex', gap: '8px' }}>
              <input
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={
                  privateMode && targetUser 
                    ? `Private message to ${targetUser}...` 
                    : "Type a message about recipes..."
                }
                disabled={!isConnected}
                style={{
                  flex: 1,
                  fontSize: '14px',
                  padding: '8px 12px',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  outline: 'none'
                }}
              />
              <button
                onClick={handleSendMessage}
                disabled={!inputMessage.trim() || !isConnected || (privateMode && !targetUser)}
                style={{
                  backgroundColor: privateMode ? '#3b82f6' : '#16a34a',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  padding: '8px',
                  cursor: (!inputMessage.trim() || !isConnected || (privateMode && !targetUser)) ? 'not-allowed' : 'pointer',
                  opacity: (!inputMessage.trim() || !isConnected || (privateMode && !targetUser)) ? 0.5 : 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <Send style={{ width: '16px', height: '16px' }} />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}