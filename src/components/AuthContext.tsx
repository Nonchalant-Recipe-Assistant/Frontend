import { useState, useEffect, createContext, useContext, ReactNode } from 'react';

interface User {
  email: string;
  username?: string;
  name?: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  signIn: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signUp: (email: string, password: string, name: string) => Promise<{ success: boolean; error?: string }>;
  signInWithGoogle: () => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Функция для получения базового URL в зависимости от окружения
const getBaseUrl = () => {
  if (process.env.NODE_ENV === 'development') {
    return 'http://localhost:8080';
  }
  return ''; // В production используем относительные пути
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('access_token'));

  // Функция для проверки, является ли токен демо-токеном
  const isDemoToken = (token: string) => {
    return token.startsWith('demo-');
  };

  const signIn = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const baseUrl = getBaseUrl();
      const response = await fetch(`${baseUrl}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (response.ok) {
        const data = await response.json();
        const accessToken = data.access_token;
        
        localStorage.setItem('access_token', accessToken);
        setToken(accessToken);
        
        // Получаем данные пользователя
        const userResponse = await fetch(`${baseUrl}/auth/me`, {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
          },
        });

        if (userResponse.ok) {
          const userData = await userResponse.json();
          setUser(userData);
          return { success: true };
        } else {
          return { success: false, error: 'Failed to get user data' };
        }
      } else {
        const errorData = await response.json();
        return { success: false, error: errorData.detail || 'Login failed' };
      }
    } catch (error) {
      console.error('Login error:', error);
      // Fallback to demo mode if backend is not available
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      if (email && password) {
        const demoToken = 'demo-jwt-token-' + Date.now();
        const userData: User = { 
          email, 
          username: email.split('@')[0],
          name: email.split('@')[0]
        };
        
        localStorage.setItem('access_token', demoToken);
        setToken(demoToken);
        setUser(userData);
        return { success: true };
      }
      
      return { success: false, error: 'Login failed' };
    }
  };

  const signUp = async (email: string, password: string, name: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const baseUrl = getBaseUrl();
      const response = await fetch(`${baseUrl}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password, name }),
      });

      if (response.ok) {
        // После регистрации автоматически логинимся
        return await signIn(email, password);
      } else {
        const errorData = await response.json();
        return { success: false, error: errorData.detail || 'Registration failed' };
      }
    } catch (error) {
      console.error('Registration error:', error);
      // Fallback to demo mode
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      if (email && password) {
        const demoToken = 'demo-jwt-token-' + Date.now();
        const userData: User = { 
          email, 
          username: name || email.split('@')[0],
          name: name || email.split('@')[0]
        };
        
        localStorage.setItem('access_token', demoToken);
        setToken(demoToken);
        setUser(userData);
        return { success: true };
      }
      
      return { success: false, error: 'Registration failed' };
    }
  };

  const signInWithGoogle = async (): Promise<{ success: boolean; error?: string }> => {
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const demoToken = 'demo-google-token-' + Date.now();
      const userData: User = { 
        email: 'google-user@example.com', 
        username: 'google_user',
        name: 'Google User'
      };
      
      localStorage.setItem('access_token', demoToken);
      setToken(demoToken);
      setUser(userData);
      return { success: true };
    } catch (error) {
      return { success: false, error: 'Google sign in failed' };
    }
  };

  const logout = () => {
    localStorage.removeItem('access_token');
    setToken(null);
    setUser(null);
  };

  useEffect(() => {
    const initializeAuth = async () => {
      const storedToken = localStorage.getItem('access_token');
      if (storedToken) {
        if (isDemoToken(storedToken)) {
          // Для демо-токенов используем демо-пользователя
          const userData: User = { 
            email: 'demo@example.com', 
            username: 'demo_user',
            name: 'Demo User'
          };
          setUser(userData);
          setToken(storedToken);
        } else {
          // Для реальных токенов запрашиваем данные с сервера
          try {
            const baseUrl = getBaseUrl();
            const userResponse = await fetch(`${baseUrl}/auth/me`, {
              headers: {
                'Authorization': `Bearer ${storedToken}`,
              },
            });

            if (userResponse.ok) {
              const userData = await userResponse.json();
              setUser(userData);
              setToken(storedToken);
            } else {
              // Если токен невалидный, разлогиниваем
              console.warn('Token invalid, logging out');
              logout();
            }
          } catch (error) {
            console.error('Failed to fetch user data:', error);
            // Если бэкенд недоступен, используем демо-режим для демо-токенов
            if (isDemoToken(storedToken)) {
              const userData: User = { 
                email: 'demo@example.com', 
                username: 'demo_user',
                name: 'Demo User'
              };
              setUser(userData);
              setToken(storedToken);
            } else {
              logout();
            }
          }
        }
      }
    };

    initializeAuth();
  }, []);

  return (
    <AuthContext.Provider value={{ 
      user, 
      token, 
      signIn, 
      signUp, 
      signInWithGoogle, 
      logout 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};