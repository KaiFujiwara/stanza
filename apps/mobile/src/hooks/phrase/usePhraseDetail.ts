import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getPhraseDetail } from '@/infra/query/phrase';
import { phraseKeys } from './usePhrases';
import { Alert } from 'react-native';
import { updatePhraseUseCase } from '@/application/usecases/phrase/UpdatePhraseUseCase';
import { deletePhraseUseCase } from '@/application/usecases/phrase/DeletePhraseUseCase';

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
      await updatePhraseUseCase.execute({ id: phraseId, ...params });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: phraseKeys.lists() });
      queryClient.invalidateQueries({ queryKey: phraseKeys.detail(phraseId) });
    },
    onError: (error: Error) => {
      Alert.alert('エラー', error.message);
    },
  });

  // 削除
  const deletePhraseMutation = useMutation({
    mutationFn: async () => {
      await deletePhraseUseCase.execute({ id: phraseId });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: phraseKeys.lists() });
    },
    onError: (error: Error) => {
      Alert.alert('エラー', error.message);
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
