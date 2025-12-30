import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Phrase } from '@lyrics-notes/core';
import { getPhrases } from '@/infra/query/phrase';
import { phraseRepository } from '@/infra/repositories/PhraseRepository';

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
      const phrase = Phrase.create(params.text, {
        note: params.note,
        tagIds: params.tagIds,
      });
      await phraseRepository.save(phrase);
      return phrase;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: phraseKeys.lists() });
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
      const existing = await phraseRepository.findById(params.id);
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
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: phraseKeys.lists() });
      queryClient.invalidateQueries({ queryKey: phraseKeys.detail(variables.id) });
    },
  });

  // 削除
  const deletePhraseMutation = useMutation({
    mutationFn: async (id: string) => {
      const phrase = await phraseRepository.findById(id);
      if (!phrase) {
        throw new Error('フレーズが見つかりません');
      }
      await phraseRepository.delete(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: phraseKeys.lists() });
    },
  });

  return {
    phrases,
    loading: isLoading,
    refetch,
    searchText,
    setSearchText,
    selectedTagIds,
    setSelectedTagIds,
    createPhrase: createPhraseMutation.mutate,
    updatePhrase: updatePhraseMutation.mutate,
    deletePhrase: deletePhraseMutation.mutate,
    isCreating: createPhraseMutation.isPending,
    isUpdating: updatePhraseMutation.isPending,
    isDeleting: deletePhraseMutation.isPending,
  };
}
