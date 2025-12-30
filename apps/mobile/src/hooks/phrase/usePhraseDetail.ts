import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getPhraseDetail } from '@/infra/query/phrase';
import { phraseRepository } from '@/infra/repositories/PhraseRepository';
import { phraseKeys } from './usePhrases';

/**
 * フレーズ詳細取得用フック
 */
export function usePhraseDetail(phraseId: string) {
  const queryClient = useQueryClient();

  const { data: phrase, isLoading, refetch } = useQuery({
    queryKey: phraseKeys.detail(phraseId),
    queryFn: () => getPhraseDetail(phraseId),
    enabled: !!phraseId,
  });

  // 更新
  const updatePhraseMutation = useMutation({
    mutationFn: async (params: {
      text?: string;
      note?: string;
      tagIds?: string[];
    }) => {
      const existing = await phraseRepository.findById(phraseId);
      if (!existing) {
        throw new Error('フレーズが見つかりません');
      }

      if (params.text !== undefined) {
        existing.updateText(params.text);
      }
      if (params.note !== undefined) {
        existing.updateNote(params.note);
      }
      if (params.tagIds !== undefined) {
        existing.setTags(params.tagIds);
      }

      await phraseRepository.save(existing);
      return existing;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: phraseKeys.lists() });
      queryClient.invalidateQueries({ queryKey: phraseKeys.detail(phraseId) });
    },
  });

  // 削除
  const deletePhraseMutation = useMutation({
    mutationFn: async () => {
      const phrase = await phraseRepository.findById(phraseId);
      if (!phrase) {
        throw new Error('フレーズが見つかりません');
      }
      await phraseRepository.delete(phraseId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: phraseKeys.lists() });
    },
  });

  return {
    phrase,
    loading: isLoading,
    refetch,
    updatePhrase: updatePhraseMutation.mutateAsync,
    deletePhrase: deletePhraseMutation.mutateAsync,
    isUpdating: updatePhraseMutation.isPending,
    isDeleting: deletePhraseMutation.isPending,
  };
}
