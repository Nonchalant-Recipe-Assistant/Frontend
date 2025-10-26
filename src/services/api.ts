// src/services/api.ts
const API_BASE_URL = 'http://25.29.64.173:8080';

// Типы для API
export interface User {
  user_id: number;
  email: string;
  role_id: number;
  created_at: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  role_id?: number;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
}

// Функции API
export const api = {
  // Регистрация
  async register(userData: RegisterRequest): Promise<User> {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ...userData,
        role_id: userData.role_id || 1
      }),
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Registration failed: ${response.statusText} - ${errorText}`);
    }
    
    return response.json();
  },

  // Логин - исправленная версия с JSON
  async login(credentials: LoginRequest): Promise<AuthResponse> {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: credentials.email,
        password: credentials.password
      }),
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Login failed: ${response.statusText} - ${errorText}`);
    }
    
    return response.json();
  },

  // Получение профиля
  async getProfile(token: string): Promise<User> {
    const response = await fetch(`${API_BASE_URL}/auth/me`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch profile: ${response.statusText}`);
    }
    
    return response.json();
  },
};

// Утилиты для работы с токеном
export const tokenStorage = {
  getToken(): string | null {
    return localStorage.getItem('authToken');
  },
  
  setToken(token: string): void {
    localStorage.setItem('authToken', token);
  },
  
  removeToken(): void {
    localStorage.removeItem('authToken');
  }
};