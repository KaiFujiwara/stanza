import { getTagDetail, getTags } from '@/infra/query/tag';
import { MAX_TAGS_PER_USER } from '@lyrics-notes/core';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Alert } from 'react-native';
import {
  createTagUseCase,
  updateTagUseCase,
  deleteTagUseCase,
} from '@/application/usecases';

export const tagKeys = {
  all: ['tags'] as const,
  lists: () => [...tagKeys.all, 'list'] as const,
  detail: (id: string) => [...tagKeys.all, 'detail', id] as const,
};

/**
 * タグ一覧取得用フック
 */
export function useTags() {
  const { data: tags, isLoading, refetch } = useQuery({
    queryKey: tagKeys.lists(),
    queryFn: getTags,
  });

  const currentCount = tags?.length ?? 0;
  const canCreate = currentCount < MAX_TAGS_PER_USER;

  return {
    tags: tags ?? [],
    loading: isLoading,
    refetch,
    canCreate,
    currentCount,
    maxCount: MAX_TAGS_PER_USER,
  };
}

/**
 * タグ作成用フック
 */
export function useCreateTag() {
  const queryClient = useQueryClient();

  const createTagMutation = useMutation({
    mutationFn: async (params: { name: string; color?: string }) => {
      const { tag } = await createTagUseCase.execute(params);
      return tag;
    },
    onSuccess: async () => {
      // タグ一覧を無効化して再取得を促す
      await queryClient.invalidateQueries({ queryKey: tagKeys.lists() });
      // キャッシュを即座にリフレッシュ
      await queryClient.refetchQueries({ queryKey: tagKeys.lists() });
    },
    onError: (error: Error) => {
      Alert.alert('エラー', error.message);
    },
  });

  return {
    createTag: createTagMutation.mutateAsync,
    isCreating: createTagMutation.isPending,
  };
}

/**
 * タグ詳細取得用フック
 */
export function useTagDetail(tagId: string) {
  const queryClient = useQueryClient();

  const { data: tag, isLoading, refetch } = useQuery({
    queryKey: tagKeys.detail(tagId),
    queryFn: () => getTagDetail(tagId),
    enabled: !!tagId,
  });

  // 更新
  const updateTagMutation = useMutation({
    mutationFn: async (params: { name?: string; color?: string }) => {
      await updateTagUseCase.execute({ id: tagId, ...params });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: tagKeys.lists() });
      queryClient.invalidateQueries({ queryKey: tagKeys.detail(tagId) });
      // フレーズ一覧も無効化（タグ名や色が変更されたフレーズの表示を更新）
      queryClient.invalidateQueries({ queryKey: ['phrases'] });
    },
    onError: (error: Error) => {
      Alert.alert('エラー', error.message);
    },
  });

  // 削除
  const deleteTagMutation = useMutation({
    mutationFn: async () => {
      await deleteTagUseCase.execute({ id: tagId });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: tagKeys.lists() });
      // フレーズ一覧も無効化（タグが削除されたフレーズの表示を更新）
      queryClient.invalidateQueries({ queryKey: ['phrases'] });
    },
    onError: (error: Error) => {
      Alert.alert('エラー', error.message);
    },
  });

  return {
    tag,
    isLoading,
    refetch,
    updateTag: updateTagMutation.mutateAsync,
    deleteTag: deleteTagMutation.mutateAsync,
    isUpdating: updateTagMutation.isPending,
    isDeleting: deleteTagMutation.isPending,
  };
}
