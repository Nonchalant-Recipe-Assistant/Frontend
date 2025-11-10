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

    // Очищаем предыдущее соединение
    if (ws.current) {
      ws.current.close();
      ws.current = null;
    }

    try {
      // Используем порт 8080, как указано в docker-compose.yml
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      
      // Определяем хост в зависимости от окружения
      let host;
      if (process.env.NODE_ENV === 'development') {
        // В разработке подключаемся к localhost:8080
        host = 'localhost:8080';
      } else {
        // В продакшене используем текущий хост
        host = window.location.host;
      }
      
      const wsUrl = `${protocol}//${host}/ws/chat?token=${token}`;
      // const wsUrl = `${protocol}//${host}/ws/test`;

      
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
          const message: ChatMessage = JSON.parse(event.data);
          console.log('📨 Received WebSocket message:', message);
          setMessages(prev => [...prev, message]);
        } catch (error) {
          console.error('❌ Error parsing WebSocket message:', error, 'Raw data:', event.data);
        }
      };

      ws.current.onclose = (event) => {
        console.log('🔴 WebSocket disconnected:', event.code, event.reason);
        setIsConnected(false);
        setConnectionStatus('disconnected');
        
        // Пытаемся переподключиться
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

  const sendMessage = useCallback((text: string) => {
    if (ws.current && ws.current.readyState === WebSocket.OPEN) {
      const message = {
        text,
        message_type: 'text'
      };
      try {
        ws.current.send(JSON.stringify(message));
        console.log('📤 Message sent:', message);
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

  // Загружаем историю сообщений
  const loadMessageHistory = useCallback(async () => {
    try {
      const baseUrl = process.env.NODE_ENV === 'development' 
        ? 'http://localhost:8080' 
        : '';
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
      console.log('🔄 Initializing WebSocket connection with token:', token);
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