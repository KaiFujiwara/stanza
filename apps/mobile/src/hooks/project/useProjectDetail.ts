import { useQuery } from '@tanstack/react-query';
import { getProjectDetail } from '@/infra/query/project';

export const projectKeys = {
  all: ['projects'] as const,
  lists: () => [...projectKeys.all, 'list'] as const,
  detail: (id: string) => [...projectKeys.all, 'detail', id] as const,
};

export function useProjectDetail(id: string | undefined) {
  const { data: project, isLoading, refetch } = useQuery({
    queryKey: projectKeys.detail(id!),
    queryFn: () => getProjectDetail(id!),
    enabled: !!id,
  });

  return {
    project,
    loading: isLoading,
    refetch,
  };
}
