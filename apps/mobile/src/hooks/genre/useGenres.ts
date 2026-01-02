import { getGenreDetail, getGenres } from '@/infra/query/genre';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Alert } from 'react-native';
import {
  createGenreUseCase,
  updateGenreUseCase,
  deleteGenreUseCase,
} from '@/application/usecases';
import { GenreDomainService, MAX_GENRES_PER_USER } from '@stanza/core';

export const genreKeys = {
  all: ['genres'] as const,
  lists: () => [...genreKeys.all, 'list'] as const,
  detail: (id: string) => [...genreKeys.all, 'detail', id] as const,
};

/**
 * ジャンル一覧取得用フック
 */
export function useGenres() {
  const { data: genres, isLoading, refetch } = useQuery({
    queryKey: genreKeys.lists(),
    queryFn: getGenres,
  });

  const currentCount = genres?.length ?? 0;
  const maxCount = MAX_GENRES_PER_USER;
  const canCreate = GenreDomainService.canCreateGenre(currentCount);

  return {
    genres: genres ?? [],
    loading: isLoading,
    refetch,
    currentCount,
    maxCount,
    canCreate,
  };
}

/**
 * ジャンル詳細取得用フック
 */
export function useGenreDetail(id: string | undefined) {
  const { data: genre, isLoading, refetch } = useQuery({
    queryKey: genreKeys.detail(id!),
    queryFn: () => getGenreDetail(id!),
    enabled: !!id,
  });

  return {
    genre,
    loading: isLoading,
    refetch,
  };
}

/**
 * ジャンル作成用フック
 */
export function useCreateGenre() {
  const queryClient = useQueryClient();

  const createGenreMutation = useMutation({
    mutationFn: async (params: { name: string; description?: string; sectionNames?: string[] }) => {
      const { genre } = await createGenreUseCase.execute(params);
      return genre;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: genreKeys.lists() });
      await queryClient.refetchQueries({ queryKey: genreKeys.lists() });
    },
    onError: (error: Error) => {
      Alert.alert('エラー', error.message);
    },
  });

  return {
    createGenre: createGenreMutation.mutateAsync,
    isCreating: createGenreMutation.isPending,
  };
}

/**
 * ジャンル更新用フック
 */
export function useUpdateGenre() {
  const queryClient = useQueryClient();

  const updateGenreMutation = useMutation({
    mutationFn: async (params: { id: string; name?: string; description?: string | null; sectionNames?: string[] }) => {
      await updateGenreUseCase.execute(params);
    },
    onSuccess: async (_, variables) => {
      await queryClient.invalidateQueries({ queryKey: genreKeys.lists() });
      await queryClient.invalidateQueries({ queryKey: genreKeys.detail(variables.id) });
      await queryClient.refetchQueries({ queryKey: genreKeys.lists() });
    },
    onError: (error: Error) => {
      Alert.alert('エラー', error.message);
    },
  });

  return {
    updateGenre: updateGenreMutation.mutateAsync,
    isUpdating: updateGenreMutation.isPending,
  };
}

/**
 * ジャンル削除用フック
 */
export function useDeleteGenre() {
  const queryClient = useQueryClient();

  const deleteGenreMutation = useMutation({
    mutationFn: async (id: string) => {
      await deleteGenreUseCase.execute({ id });
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: genreKeys.lists() });
      await queryClient.refetchQueries({ queryKey: genreKeys.lists() });
    },
    onError: (error: Error) => {
      Alert.alert('エラー', error.message);
    },
  });

  return {
    deleteGenre: deleteGenreMutation.mutateAsync,
    isDeleting: deleteGenreMutation.isPending,
  };
}
