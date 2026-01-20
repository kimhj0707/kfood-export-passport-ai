import React, { createContext, useContext, useState, useEffect } from 'react';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

interface AuthUser {
  userId: string;
  email: string;
}

interface AuthContextType {
  user: AuthUser | null;
  isLoggedIn: boolean;
  isLoading: boolean;
  login: (email: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // 앱 시작 시 저장된 로그인 정보 복원
  useEffect(() => {
    const savedUser = localStorage.getItem('auth_user');
    if (savedUser) {
      try {
        const parsedUser = JSON.parse(savedUser);
        setUser(parsedUser);
        // user_id도 업데이트
        localStorage.setItem('user_id', parsedUser.userId);
      } catch (e) {
        localStorage.removeItem('auth_user');
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const formData = new FormData();
      formData.append('email', email);

      const response = await fetch(`${API_BASE_URL}/api/users/login-by-email`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        return { success: false, error: errorData.detail || '로그인에 실패했습니다.' };
      }

      const data = await response.json();
      const authUser: AuthUser = {
        userId: data.user_id,
        email: data.email,
      };

      setUser(authUser);
      localStorage.setItem('auth_user', JSON.stringify(authUser));
      localStorage.setItem('user_id', data.user_id);

      return { success: true };
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: '서버에 연결할 수 없습니다.' };
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('auth_user');
    // 로그아웃 시 새로운 익명 user_id 생성
    const newUserId = crypto.randomUUID();
    localStorage.setItem('user_id', newUserId);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoggedIn: !!user,
        isLoading,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
