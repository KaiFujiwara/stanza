import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { deleteProjectUseCase } from '@/application/usecases';
import { projectKeys } from './useProjectDetail';

export function useDeleteProject() {
  const queryClient = useQueryClient();
  const [isDeleting, setIsDeleting] = useState(false);

  const mutation = useMutation({
    mutationFn: async (id: string) => {
      return await deleteProjectUseCase.execute({ id });
    },
    onSuccess: (_, id) => {
      // プロジェクト一覧を再フェッチ
      queryClient.invalidateQueries({ queryKey: ['projects', 'overview'] });
      // 削除したプロジェクトの詳細キャッシュも削除
      queryClient.removeQueries({ queryKey: projectKeys.detail(id) });
    },
  });

  const deleteProject = async (id: string) => {
    setIsDeleting(true);
    try {
      const result = await mutation.mutateAsync(id);
      return result;
    } catch (error) {
      throw error;
    } finally {
      setIsDeleting(false);
    }
  };

  return {
    deleteProject,
    isDeleting,
  };
}
