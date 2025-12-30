import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactNode } from 'react';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5分間はキャッシュを新鮮とみなす
      gcTime: 1000 * 60 * 10, // 10分間キャッシュを保持
      retry: 1, // 失敗時1回だけリトライ
      refetchOnWindowFocus: false, // ウィンドウフォーカス時の再取得を無効化
    },
  },
});

interface QueryProviderProps {
  children: ReactNode;
}

export function QueryProvider({ children }: QueryProviderProps) {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}

export { queryClient };
