import React, { createContext, useContext, useEffect, useState } from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import { ensureAnonymousAuth } from '@/lib/supabase/auth';

interface AuthContextValue {
  isAuthenticated: boolean;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextValue>({
  isAuthenticated: false,
  isLoading: true,
});

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    async function initAuth() {
      try {
        await ensureAnonymousAuth();
        setIsAuthenticated(true);
      } catch (err) {
        console.error('[AuthProvider] 認証エラー:', err);
        setError(err as Error);
      } finally {
        setIsLoading(false);
      }
    }

    initAuth();
  }, []);

  if (isLoading) {
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <ActivityIndicator size="large" color="#3B82F6" />
        <Text className="mt-4 text-gray-600">認証中...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View className="flex-1 justify-center items-center p-5 bg-white">
        <Text className="text-xl font-bold text-red-600 mb-2">
          認証エラー
        </Text>
        <Text className="text-sm text-gray-600 text-center">
          {error.message}
        </Text>
      </View>
    );
  }

  return (
    <AuthContext.Provider value={{ isAuthenticated, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}
