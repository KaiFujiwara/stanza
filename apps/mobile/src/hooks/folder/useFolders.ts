import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Folder, EntityId } from '@lyrics-notes/core';
import { getFoldersWithCount, FolderWithCount } from '@/infra/query/folder';
import { folderRepository } from '@/infra/repositories/FolderRepository';

// Query Keys
export const folderKeys = {
  all: ['folders'] as const,
  detail: (id: string) => ['folders', id] as const,
};

/**
 * フォルダ一覧を取得するhook
 */
export function useFolders() {
  return useQuery({
    queryKey: folderKeys.all,
    queryFn: getFoldersWithCount,
  });
}

/**
 * フォルダを作成するhook
 */
export function useCreateFolder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: { name: string; orderIndex: number }) => {
      const folder = Folder.create(params.name, params.orderIndex);
      await folderRepository.save(folder);
    },
    onSuccess: () => {
      // フォルダ一覧を無効化して再取得
      queryClient.invalidateQueries({ queryKey: folderKeys.all });
      // プロジェクト概要も無効化（フォルダタブ表示のため）
      queryClient.invalidateQueries({ queryKey: ['projects', 'overview'] });
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
      const folder = await folderRepository.findById(EntityId.from(params.id));
      if (!folder) {
        throw new Error('フォルダが見つかりません');
      }
      folder.updateName(params.name);
      await folderRepository.save(folder);
    },
    onSuccess: () => {
      // フォルダ一覧を無効化して再取得
      queryClient.invalidateQueries({ queryKey: folderKeys.all });
      // プロジェクト概要も無効化（フォルダタブ表示のため）
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
      const folder = await folderRepository.findById(EntityId.from(id));
      if (!folder) {
        throw new Error('フォルダが見つかりません');
      }
      await folderRepository.delete(EntityId.from(id));
    },
    onSuccess: () => {
      // フォルダ一覧を無効化して再取得
      queryClient.invalidateQueries({ queryKey: folderKeys.all });
      // プロジェクト概要も無効化（フォルダタブ表示のため）
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
      await folderRepository.reorder(folderIds.map(id => EntityId.from(id)));
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
    onError: (_error, _variables, context) => {
      // エラー時は元に戻す
      if (context?.previousFolders) {
        queryClient.setQueryData(folderKeys.all, context.previousFolders);
      }
    },
    onSettled: () => {
      // 成功/失敗にかかわらず最終的にサーバーから再取得
      queryClient.invalidateQueries({ queryKey: folderKeys.all });
      // プロジェクト概要も無効化（フォルダタブ表示のため）
      queryClient.invalidateQueries({ queryKey: ['projects', 'overview'] });
    },
  });
}
