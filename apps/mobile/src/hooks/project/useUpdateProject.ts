import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateProjectUseCase } from '@/application/usecases/project/UpdateProjectUseCase';
import { SectionItem } from '@/components/shared/SectionManager';
import { projectKeys } from './useProjectDetail';

export interface SectionWithContent extends SectionItem {
  content?: string;
}

export function useUpdateProject() {
  const queryClient = useQueryClient();
  const [isUpdating, setIsUpdating] = useState(false);

  const mutation = useMutation({
    mutationFn: async (input: {
      id: string;
      title?: string;
      folderId?: string | null;
      genreId?: string | null;
      sections?: Array<SectionWithContent>;
    }) => {
      return await updateProjectUseCase.execute(input);
    },
    onSuccess: (_, variables) => {
      // プロジェクト一覧を再フェッチ（タイトルやフォルダが変更される可能性があるため）
      queryClient.invalidateQueries({ queryKey: ['projects', 'overview'] });
      // プロジェクト詳細も再フェッチ
      queryClient.invalidateQueries({ queryKey: projectKeys.detail(variables.id) });
    },
  });

  const updateProject = async (input: {
    id: string;
    title?: string;
    folderId?: string | null;
    genreId?: string | null;
    sections?: Array<SectionWithContent>;
  }) => {
    setIsUpdating(true);
    try {
      const result = await mutation.mutateAsync(input);
      return result;
    } catch (error) {
      throw error;
    } finally {
      setIsUpdating(false);
    }
  };

  return {
    updateProject,
    isUpdating,
  };
}
