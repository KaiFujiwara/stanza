import React, { createContext, useContext, useEffect, useState } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { checkSession, signOut as authSignOut } from '@/lib/supabase/auth';
import { supabase } from '@/lib/supabase/client';
import { queryClient } from '@/providers/QueryProvider';
import type { Session } from '@supabase/supabase-js';

interface AuthContextValue {
  isAuthenticated: boolean;
  isLoading: boolean;
  session: Session | null;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue>({
  isAuthenticated: false,
  isLoading: true,
  session: null,
  signOut: async () => {},
});

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [session, setSession] = useState<Session | null>(null);

  useEffect(() => {
    // 初回セッションチェック
    checkSession().then((hasSession) => {
      setIsAuthenticated(hasSession);
      if (hasSession) {
        supabase.auth.getSession().then(({ data: { session } }) => {
          setSession(session);
        });
      }
      setIsLoading(false);
    });

    // 認証状態の変更を監視
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setIsAuthenticated(!!session);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signOut = async () => {
    await authSignOut();
    setIsAuthenticated(false);
    setSession(null);

    // React Query のキャッシュをクリア（前のユーザーのデータを削除）
    queryClient.clear();
  };

  if (isLoading) {
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <ActivityIndicator size="large" color="#3B82F6" />
      </View>
    );
  }

  return (
    <AuthContext.Provider value={{ isAuthenticated, isLoading, session, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}
