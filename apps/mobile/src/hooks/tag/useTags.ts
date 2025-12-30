import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Tag, EntityId } from '@lyrics-notes/core';
import { getTags, getTagDetail } from '@/infra/query/tag';
import { tagRepository } from '@/infra/repositories/TagRepository';

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

  return {
    tags: tags ?? [],
    loading: isLoading,
    refetch,
  };
}

/**
 * タグ作成用フック
 */
export function useCreateTag() {
  const queryClient = useQueryClient();

  const createTagMutation = useMutation({
    mutationFn: async (params: { name: string; color?: string }) => {
      const tag = Tag.create(params.name, params.color);
      await tagRepository.save(tag);
      return tag;
    },
    onSuccess: async () => {
      // タグ一覧を無効化して再取得を促す
      await queryClient.invalidateQueries({ queryKey: tagKeys.lists() });
      // キャッシュを即座にリフレッシュ
      await queryClient.refetchQueries({ queryKey: tagKeys.lists() });
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
      const tag = await tagRepository.findById(EntityId.from(tagId));
      if (!tag) {
        throw new Error('タグが見つかりません');
      }

      if (params.name !== undefined) {
        tag.updateName(params.name);
      }
      if (params.color !== undefined) {
        tag.updateColor(params.color);
      }

      await tagRepository.save(tag);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: tagKeys.lists() });
      queryClient.invalidateQueries({ queryKey: tagKeys.detail(tagId) });
      // フレーズ一覧も無効化（タグ名や色が変更されたフレーズの表示を更新）
      queryClient.invalidateQueries({ queryKey: ['phrases'] });
    },
  });

  // 削除
  const deleteTagMutation = useMutation({
    mutationFn: async () => {
      const tag = await tagRepository.findById(EntityId.from(tagId));
      if (!tag) {
        throw new Error('タグが見つかりません');
      }
      await tagRepository.delete(EntityId.from(tagId));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: tagKeys.lists() });
      // フレーズ一覧も無効化（タグが削除されたフレーズの表示を更新）
      queryClient.invalidateQueries({ queryKey: ['phrases'] });
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
