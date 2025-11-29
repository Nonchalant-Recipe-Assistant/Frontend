import { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '../components/AuthContext';

interface ChatMessage {
  id: number;
  text: string;
  sender_email: string;
  sender_username: string;
  timestamp: string;
  message_type: string;
}

export const useWebSocket = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'disconnected' | 'error'>('disconnected');
  const ws = useRef<WebSocket | null>(null);
  const { token } = useAuth();
  const reconnectTimeoutRef = useRef<number | null>(null);
  const reconnectAttemptsRef = useRef(0);
  const maxReconnectAttempts = 5;

  const connect = useCallback(() => {
    if (!token) {
      console.log('❌ No token available, cannot connect to WebSocket');
      setConnectionStatus('error');
      return;
    }

    if (ws.current) {
      ws.current.close();
      ws.current = null;
    }

    try {
      const apiUrl = import.meta.env.VITE_API_BASE_URL || '';
      let host;
      let protocol;
      
      if (apiUrl) {
        const url = new URL(apiUrl);
        host = url.host;
        protocol = url.protocol === 'https:' ? 'wss:' : 'ws:';
      } else {
        host = window.location.host;
        protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      }
      
      const wsUrl = `${protocol}//${host}/ws/chat?token=${token}`;
      console.log('🔄 Connecting to WebSocket:', wsUrl);
      
      ws.current = new WebSocket(wsUrl);
      setConnectionStatus('connecting');
      reconnectAttemptsRef.current += 1;

      ws.current.onopen = () => {
        console.log('✅ WebSocket connected successfully');
        setIsConnected(true);
        setConnectionStatus('connected');
        reconnectAttemptsRef.current = 0;
      };

      ws.current.onmessage = (event) => {
        try {
          console.log('📨 Raw WebSocket message:', event.data);
          
          // Parse the message - it should be a JSON string
          const messageData = JSON.parse(event.data);
          console.log('📨 Parsed WebSocket message:', messageData);
          
          // Create a proper ChatMessage object
          const message: ChatMessage = {
            id: messageData.id || Date.now(),
            text: messageData.text || '',
            sender_email: messageData.sender_email || 'unknown',
            sender_username: messageData.sender_username || 'Unknown',
            timestamp: messageData.timestamp || new Date().toISOString(),
            message_type: messageData.message_type || 'text'
          };
          
          console.log('📨 Processed ChatMessage:', message);
          setMessages(prev => [...prev, message]);
        } catch (error) {
          console.error('❌ Error parsing WebSocket message:', error, 'Raw data:', event.data);
          
          // If it's a string that looks like JSON, try to handle it
          if (typeof event.data === 'string' && event.data.trim().startsWith('{')) {
            try {
              // Try to extract JSON from the string
              const jsonMatch = event.data.match(/\{.*\}/);
              if (jsonMatch) {
                const messageData = JSON.parse(jsonMatch[0]);
                const message: ChatMessage = {
                  id: messageData.id || Date.now(),
                  text: messageData.text || event.data, // Fallback to raw data
                  sender_email: messageData.sender_email || 'unknown',
                  sender_username: messageData.sender_username || 'Unknown',
                  timestamp: messageData.timestamp || new Date().toISOString(),
                  message_type: messageData.message_type || 'text'
                };
                setMessages(prev => [...prev, message]);
              }
            } catch (secondError) {
              console.error('❌ Secondary parsing failed:', secondError);
            }
          }
        }
      };

      ws.current.onclose = (event) => {
        console.log('🔴 WebSocket disconnected:', event.code, event.reason);
        setIsConnected(false);
        setConnectionStatus('disconnected');
        
        if (reconnectAttemptsRef.current < maxReconnectAttempts && event.code !== 1000) {
          const delay = Math.min(1000 * Math.pow(2, reconnectAttemptsRef.current), 30000);
          console.log(`🔄 Attempting to reconnect in ${delay}ms... (attempt ${reconnectAttemptsRef.current + 1})`);
          
          reconnectTimeoutRef.current = window.setTimeout(() => {
            console.log('🔄 Reconnecting...');
            connect();
          }, delay);
        } else if (reconnectAttemptsRef.current >= maxReconnectAttempts) {
          console.log('❌ Max reconnection attempts reached');
          setConnectionStatus('error');
        }
      };

      ws.current.onerror = (error) => {
        console.error('❌ WebSocket error:', error);
        setIsConnected(false);
        setConnectionStatus('error');
      };
    } catch (error) {
      console.error('❌ Error creating WebSocket connection:', error);
      setConnectionStatus('error');
    }
  }, [token]);

  const sendMessage = useCallback((message: string) => {
    if (ws.current && ws.current.readyState === WebSocket.OPEN) {
      try {
        // If the message is already a string, send it as is
        // If it's an object, stringify it
        const messageToSend = typeof message === 'string' ? message : JSON.stringify(message);
        ws.current.send(messageToSend);
        console.log('📤 Message sent:', messageToSend);
        return true;
      } catch (error) {
        console.error('❌ Error sending message:', error);
        return false;
      }
    } else {
      console.warn('⚠️ WebSocket not connected, cannot send message. ReadyState:', ws.current?.readyState);
      return false;
    }
  }, []);

  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current !== null) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
    reconnectAttemptsRef.current = maxReconnectAttempts;
    if (ws.current) {
      ws.current.close(1000, 'Manual disconnect');
    }
  }, []);

  const loadMessageHistory = useCallback(async () => {
    try {
      const baseUrl = import.meta.env.VITE_API_BASE_URL || '';
      const response = await fetch(`${baseUrl}/api/chat/messages`);
      if (response.ok) {
        const history = await response.json();
        setMessages(history);
      }
    } catch (error) {
      console.error('Failed to load message history:', error);
    }
  }, []);

  useEffect(() => {
    if (token) {
      console.log('🔄 Initializing WebSocket connection with token');
      connect();
      loadMessageHistory();
    } else {
      console.log('❌ No token, skipping WebSocket connection');
      setConnectionStatus('error');
    }
    
    return () => {
      disconnect();
    };
  }, [connect, disconnect, token, loadMessageHistory]);

  return {
    messages,
    sendMessage,
    isConnected,
    connectionStatus,
    reconnect: connect
  };
};