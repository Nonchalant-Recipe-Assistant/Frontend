// src/contexts/AuthContext.tsx
import { createContext, useContext, useState, useEffect, ReactNode } from "react"
import { api, tokenStorage, User as BackendUser } from "../services/api"

// Адаптируем тип под твое приложение
interface User {
  id: string;  // используем user_id как string
  email: string;
  name: string; // используем email как name, или можно добавить поле name в бэкенд позже
}

interface AuthContextType {
  user: User | null
  isLoading: boolean
  signIn: (email: string, password: string) => Promise<{ success: boolean; error?: string }>
  signUp: (email: string, password: string, name: string) => Promise<{ success: boolean; error?: string }>
  signInWithGoogle: () => Promise<{ success: boolean; error?: string }>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Преобразование пользователя из бэкенда в фронтенд
  const transformUser = (backendUser: BackendUser): User => ({
    id: backendUser.user_id.toString(),
    email: backendUser.email,
    name: backendUser.email, // пока используем email как name
  })

  // Проверяем токен при загрузке
  useEffect(() => {
    const initAuth = async () => {
      const token = tokenStorage.getToken();
      if (token) {
        try {
          const backendUser = await api.getProfile(token);
          setUser(transformUser(backendUser));
        } catch (error) {
          tokenStorage.removeToken();
          setUser(null);
        }
      }
      setIsLoading(false);
    };

    initAuth();
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      const { access_token } = await api.login({ email, password });
      const backendUser = await api.getProfile(access_token);
      
      tokenStorage.setToken(access_token);
      setUser(transformUser(backendUser));
      
      return { success: true };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Login failed';
      return { success: false, error: errorMessage };
    }
  }

  const signUp = async (email: string, password: string, name: string) => {
    try {
      // Пока игнорируем name, т.к. в бэкенде его нет
      // Можно добавить позже поле name в бэкенд
      await api.register({ email, password });
      // После регистрации автоматически логинимся
      return await signIn(email, password);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Registration failed';
      return { success: false, error: errorMessage };
    }
  }

  const signInWithGoogle = async () => {
    // Заглушка - можно реализовать позже через бэкенд
    return { success: false, error: "Google sign in is not supported yet" };
  }

  const signOut = async () => {
    tokenStorage.removeToken();
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{
      user,
      isLoading,
      signIn,
      signUp,
      signInWithGoogle,
      signOut
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}