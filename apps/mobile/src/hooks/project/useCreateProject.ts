import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createProjectUseCase } from '@/application/usecases';
import { SectionItem } from '@/components/shared/SectionManager';

export function useCreateProject() {
  const queryClient = useQueryClient();
  const [isCreating, setIsCreating] = useState(false);

  const mutation = useMutation({
    mutationFn: async (input: {
      title: string;
      folderId?: string;
      genreId?: string;
      sections: SectionItem[];
    }) => {
      return await createProjectUseCase.execute(input);
    },
    onSuccess: () => {
      // プロジェクト一覧を再取得
      queryClient.invalidateQueries({ queryKey: ['projects', 'overview'] });
    },
  });

  const createProject = async (input: {
    title: string;
    folderId?: string;
    genreId?: string;
    sections: SectionItem[];
  }) => {
    setIsCreating(true);
    try {
      const result = await mutation.mutateAsync(input);
      return result;
    } catch (error) {
      throw error;
    } finally {
      setIsCreating(false);
    }
  };

  return {
    createProject,
    isCreating,
  };
}
