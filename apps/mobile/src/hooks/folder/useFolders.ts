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
      await createFolderUseCase.execute(params);
    },
    onSuccess: () => {
      // フォルダ一覧を無効化して再取得
      queryClient.invalidateQueries({ queryKey: folderKeys.all });
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
    },
    onSuccess: () => {
      // フォルダ一覧を無効化して再取得
      queryClient.invalidateQueries({ queryKey: folderKeys.all });
      // プロジェクト概要も無効化（フォルダタブ表示のため）
      queryClient.invalidateQueries({ queryKey: ['projects', 'overview'] });
    },
    onError: (error: Error) => {
      Alert.alert('エラー', error.message);
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
    onSuccess: () => {
      // フォルダ一覧を無効化して再取得
      queryClient.invalidateQueries({ queryKey: folderKeys.all });
      // プロジェクト概要も無効化（フォルダタブ表示のため）
      queryClient.invalidateQueries({ queryKey: ['projects', 'overview'] });
    },
    onError: (error: Error) => {
      Alert.alert('エラー', error.message);
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
