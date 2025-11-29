import { useState, useEffect, createContext, useContext, ReactNode } from 'react';

interface User {
  user_id: number;
  email: string;
  role_id: number;
  created_at: string;
  email_verified: boolean;
  avatar_url?: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  signIn: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signUp: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signInWithGoogle: () => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  resendVerification: () => Promise<{ success: boolean; error?: string }>;
  updateAvatar: (file: File) => Promise<{ success: boolean; avatarUrl?: string; error?: string }>;
  verifyEmail: (token: string) => Promise<{ success: boolean; error?: string }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const getBaseUrl = () => {
  if (typeof process !== 'undefined' && process.env?.JEST_WORKER_ID) {
    return 'http://localhost:8080';
  }
  
  if (typeof import.meta !== 'undefined' && import.meta.env) {
    return import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';
  }
  
  return 'http://localhost:8080';
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('access_token'));

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
          localStorage.removeItem('access_token');
          setToken(null);
          return { success: false, error: 'Failed to get user data' };
        }
      } else {
        const errorData = await response.json();
        return { success: false, error: errorData.detail || 'Login failed' };
      }
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: 'Network error - cannot connect to server' };
    }
  };

  const signUp = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const baseUrl = getBaseUrl();
      const response = await fetch(`${baseUrl}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (response.ok) {
        const userData = await response.json();
        // После успешной регистрации автоматически логиним пользователя
        return await signIn(email, password);
      } else {
        const errorData = await response.json();
        return { success: false, error: errorData.detail || 'Registration failed' };
      }
    } catch (error) {
      console.error('Registration error:', error);
      return { success: false, error: 'Network error - cannot connect to server' };
    }
  };

  const signInWithGoogle = async (): Promise<{ success: boolean; error?: string }> => {
    return { success: false, error: 'Google authentication not implemented yet' };
  };

  const resendVerification = async (): Promise<{ success: boolean; error?: string }> => {
    try {
      const baseUrl = getBaseUrl();
      const response = await fetch(`${baseUrl}/auth/resend-verification`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        return { success: true };
      } else {
        const errorData = await response.json();
        return { success: false, error: errorData.detail || 'Failed to resend verification' };
      }
    } catch (error) {
      console.error('Resend verification error:', error);
      return { success: false, error: 'Network error' };
    }
  };

  const verifyEmail = async (token: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const baseUrl = getBaseUrl();
      const response = await fetch(`${baseUrl}/auth/verify-email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token }),
      });

      if (response.ok) {
        // Обновляем данные пользователя
        if (user) {
          setUser({ ...user, email_verified: true });
        }
        return { success: true };
      } else {
        const errorData = await response.json();
        return { success: false, error: errorData.detail || 'Failed to verify email' };
      }
    } catch (error) {
      console.error('Email verification error:', error);
      return { success: false, error: 'Network error' };
    }
  };

  const updateAvatar = async (file: File): Promise<{ success: boolean; avatarUrl?: string; error?: string }> => {
    try {
      const baseUrl = getBaseUrl();
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch(`${baseUrl}/auth/upload-avatar`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        // Обновляем пользователя с новым аватаром
        if (user) {
          setUser({ ...user, avatar_url: data.avatar_url });
        }
        return { success: true, avatarUrl: data.avatar_url };
      } else {
        const errorData = await response.json();
        return { success: false, error: errorData.detail || 'Failed to upload avatar' };
      }
    } catch (error) {
      console.error('Avatar upload error:', error);
      return { success: false, error: 'Network error' };
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
            console.warn('Token invalid, logging out');
            logout();
          }
        } catch (error) {
          console.error('Failed to fetch user data:', error);
          logout();
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
      logout,
      resendVerification,
      updateAvatar,
      verifyEmail
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