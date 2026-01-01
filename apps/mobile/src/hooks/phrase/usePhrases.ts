import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { MAX_PHRASES_PER_USER } from '@lyrics-notes/core';
import { getPhrases } from '@/infra/query/phrase';
import { Alert } from 'react-native';
import {
  createPhraseUseCase,
  updatePhraseUseCase,
  deletePhraseUseCase,
} from '@/application/usecases';
export const phraseKeys = {
  all: ['phrases'] as const,
  lists: () => [...phraseKeys.all, 'list'] as const,
  detail: (id: string) => [...phraseKeys.all, 'detail', id] as const,
};

export function usePhrases() {
  const queryClient = useQueryClient();
  const [searchText, setSearchText] = useState('');
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>([]);

  // フレーズ一覧を全件取得
  const { data: allPhrases, isLoading, refetch } = useQuery({
    queryKey: phraseKeys.lists(),
    queryFn: getPhrases,
  });

  // クライアント側でフィルタリング
  const phrases = useMemo(() => {
    if (!allPhrases) return [];

    let filtered = allPhrases;

    // テキスト検索
    if (searchText.trim()) {
      const normalized = searchText.trim().toLowerCase();
      filtered = filtered.filter(
        (phrase) =>
          phrase.text.toLowerCase().includes(normalized) ||
          phrase.note?.toLowerCase().includes(normalized)
      );
    }

    // タグフィルタ（OR検索: いずれかのタグが含まれる）
    if (selectedTagIds.length > 0) {
      filtered = filtered.filter((phrase) =>
        phrase.tags.some((tag) => selectedTagIds.includes(tag.id))
      );
    }

    return filtered;
  }, [allPhrases, searchText, selectedTagIds]);

  // 新規作成
  const createPhraseMutation = useMutation({
    mutationFn: async (params: { text: string; note?: string; tagIds?: string[] }) => {
      const { phrase } = await createPhraseUseCase.execute(params);
      return phrase;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: phraseKeys.lists() });
    },
    onError: (error: Error) => {
      Alert.alert('エラー', error.message);
    },
  });

  // 更新
  const updatePhraseMutation = useMutation({
    mutationFn: async (params: {
      id: string;
      text?: string;
      note?: string;
      tagIds?: string[];
    }) => {
      await updatePhraseUseCase.execute(params);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: phraseKeys.lists() });
      queryClient.invalidateQueries({ queryKey: phraseKeys.detail(variables.id) });
    },
    onError: (error: Error) => {
      Alert.alert('エラー', error.message);
    },
  });

  // 削除
  const deletePhraseMutation = useMutation({
    mutationFn: async (id: string) => {
      await deletePhraseUseCase.execute({ id });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: phraseKeys.lists() });
    },
    onError: (error: Error) => {
      Alert.alert('エラー', error.message);
    },
  });

  const currentCount = allPhrases?.length ?? 0;
  const canCreate = currentCount < MAX_PHRASES_PER_USER;

  return {
    phrases,
    loading: isLoading,
    refetch,
    searchText,
    setSearchText,
    selectedTagIds,
    setSelectedTagIds,
    createPhrase: createPhraseMutation.mutateAsync,
    updatePhrase: updatePhraseMutation.mutateAsync,
    deletePhrase: deletePhraseMutation.mutateAsync,
    isCreating: createPhraseMutation.isPending,
    isUpdating: updatePhraseMutation.isPending,
    canCreate,
    isDeleting: deletePhraseMutation.isPending,
    currentCount,
    maxCount: MAX_PHRASES_PER_USER,
  };
}
