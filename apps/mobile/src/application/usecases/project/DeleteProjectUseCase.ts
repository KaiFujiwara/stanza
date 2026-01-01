import { EntityId, DomainError, ErrorCode, ProjectRepository } from '@lyrics-notes/core';
import { toUserMessage } from '@/lib/errors';

export type DeleteProjectInput = {
  id: string;
};

export type DeleteProjectOutput = {
  success: boolean;
};

export class DeleteProjectUseCase {
  constructor(private readonly projectRepository: ProjectRepository) {}

  async execute(input: DeleteProjectInput): Promise<DeleteProjectOutput> {
    try {
      const projectId = EntityId.from(input.id);
      const project = await this.projectRepository.findById(projectId);

      if (!project) {
        throw new DomainError(ErrorCode.ENTITY_NOT_FOUND, 'Project not found', {
          entity: 'project',
          id: input.id,
        });
      }

      project.softDelete();
      await this.projectRepository.save(project);

      return { success: true };
    } catch (error) {
      const { userMessage, devMessage, stack, details } = toUserMessage(error);
      console.error('[DeleteProjectUseCase] Error:', {
        devMessage,
        stack,
        details,
      });
      throw new Error(userMessage);
    }
  }
}
