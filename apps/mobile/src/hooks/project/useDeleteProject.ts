import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { deleteProjectUseCase } from '@/application/usecases/project/DeleteProjectUseCase';
import { projectKeys } from './useProjectDetail';

export function useDeleteProject() {
  const queryClient = useQueryClient();
  const [isDeleting, setIsDeleting] = useState(false);

  const mutation = useMutation({
    mutationFn: async (id: string) => {
      return await deleteProjectUseCase.execute({ id });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: projectKeys.lists() });
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
