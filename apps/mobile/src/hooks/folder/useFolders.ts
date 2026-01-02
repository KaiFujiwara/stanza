import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { MAX_FOLDERS_PER_USER } from '@stanza/core';
import { getFoldersWithCount, FolderWithCount } from '@/infra/query/folder';
import { Alert } from 'react-native';
import {
  createFolderUseCase,
  updateFolderUseCase,
  deleteFolderUseCase,
  reorderFoldersUseCase,
} from '@/application/usecases';

// Query Keys
export const folderKeys = {
  all: ['folders'] as const,
  detail: (id: string) => ['folders', id] as const,
};

/**
 * フォルダ一覧を取得するhook
 */
export function useFolders() {
  const query = useQuery({
    queryKey: folderKeys.all,
    queryFn: getFoldersWithCount,
    staleTime: 1000 * 60 * 5, // 5分間はキャッシュを新鮮とみなす
    refetchOnWindowFocus: false, // ウィンドウフォーカス時の自動再取得を無効化
    refetchOnMount: false, // マウント時の自動再取得を無効化（初回のみ取得）
  });

  const currentCount = query.data?.length ?? 0;
  const canCreate = currentCount < MAX_FOLDERS_PER_USER;

  return {
    ...query,
    canCreate,
    currentCount,
    maxCount: MAX_FOLDERS_PER_USER,
  };
}

/**
 * フォルダを作成するhook
 */
export function useCreateFolder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: { name: string }) => {
      const result = await createFolderUseCase.execute(params);
      return result.folder;
    },
    onSuccess: (newFolder) => {
      // 作成されたフォルダをキャッシュに追加
      const previousFolders = queryClient.getQueryData<FolderWithCount[]>(folderKeys.all);

      if (previousFolders) {
        const newFolderWithCount: FolderWithCount = {
          id: newFolder.id,
          name: newFolder.name,
          orderIndex: newFolder.orderIndex,
          projectCount: 0,
        };
        queryClient.setQueryData(folderKeys.all, [...previousFolders, newFolderWithCount]);
      }

      // プロジェクト概要も無効化（フォルダタブ表示のため）
      queryClient.invalidateQueries({ queryKey: ['projects', 'overview'] });
    },
    onError: (error: Error) => {
      Alert.alert('エラー', error.message);
    },
  });
}

/**
 * フォルダ名を更新するhook
 */
export function useUpdateFolderName() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: { id: string; name: string }) => {
      await updateFolderUseCase.execute(params);
      return params;
    },
    onMutate: async (params) => {
      // オプティミスティックアップデート: 即座にUIを更新
      await queryClient.cancelQueries({ queryKey: folderKeys.all });

      const previousFolders = queryClient.getQueryData<FolderWithCount[]>(folderKeys.all);

      if (previousFolders) {
        // フォルダ名を更新
        const updatedFolders = previousFolders.map(f =>
          f.id === params.id ? { ...f, name: params.name } : f
        );
        queryClient.setQueryData(folderKeys.all, updatedFolders);
      }

      return { previousFolders };
    },
    onError: (error: Error, _params, context) => {
      // エラー時は元に戻す
      if (context?.previousFolders) {
        queryClient.setQueryData(folderKeys.all, context.previousFolders);
      }
      Alert.alert('エラー', error.message);
    },
    onSettled: () => {
      // 成功後にサーバーから再取得して同期
      queryClient.invalidateQueries({ queryKey: folderKeys.all });
      queryClient.invalidateQueries({ queryKey: ['projects', 'overview'] });
    },
  });
}

/**
 * フォルダを削除するhook
 */
export function useDeleteFolder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      await deleteFolderUseCase.execute({ id });
    },
    onMutate: async (id) => {
      // オプティミスティックアップデート: 即座にUIを更新
      await queryClient.cancelQueries({ queryKey: folderKeys.all });

      const previousFolders = queryClient.getQueryData<FolderWithCount[]>(folderKeys.all);

      if (previousFolders) {
        // 削除対象を除いたフォルダリストに更新
        const updatedFolders = previousFolders.filter(f => f.id !== id);
        queryClient.setQueryData(folderKeys.all, updatedFolders);
      }

      return { previousFolders };
    },
    onError: (error: Error, _id, context) => {
      // エラー時は元に戻す
      if (context?.previousFolders) {
        queryClient.setQueryData(folderKeys.all, context.previousFolders);
      }
      Alert.alert('エラー', error.message);
    },
    onSettled: () => {
      // 成功後にサーバーから再取得して同期
      queryClient.invalidateQueries({ queryKey: folderKeys.all });
      queryClient.invalidateQueries({ queryKey: ['projects', 'overview'] });
    },
  });
}

/**
 * フォルダを並び替えるhook
 */
export function useReorderFolders() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (folderIds: string[]) => {
      await reorderFoldersUseCase.execute({ folderIds });
    },
    onMutate: async (folderIds) => {
      // オプティミスティックアップデート: 即座にUIを更新
      await queryClient.cancelQueries({ queryKey: folderKeys.all });

      const previousFolders = queryClient.getQueryData<FolderWithCount[]>(folderKeys.all);

      if (previousFolders) {
        // 新しい順序でフォルダを並び替え
        const reorderedFolders = folderIds
          .map((id, index) => {
            const folder = previousFolders.find(f => f.id === id);
            if (folder) {
              return { ...folder, orderIndex: index };
            }
            return null;
          })
          .filter((f): f is FolderWithCount => f !== null);

        queryClient.setQueryData(folderKeys.all, reorderedFolders);
      }

      return { previousFolders };
    },
    onError: (error: Error, _variables, context) => {
      // エラー時は元に戻す
      if (context?.previousFolders) {
        queryClient.setQueryData(folderKeys.all, context.previousFolders);
      }
      Alert.alert('エラー', error.message);
    },
    onSettled: () => {
      // 成功/失敗にかかわらず最終的にサーバーから再取得
      queryClient.invalidateQueries({ queryKey: folderKeys.all });
      // プロジェクト概要も無効化（フォルダタブ表示のため）
      queryClient.invalidateQueries({ queryKey: ['projects', 'overview'] });
    },
  });
}
