import { EntityId, DomainError, ErrorCode } from '@lyrics-notes/core';
import { projectRepository } from '@/infra/repositories/ProjectRepository';
import { toUserMessage } from '@/lib/errors';

export type DeleteProjectInput = {
  id: string;
};

export type DeleteProjectOutput = {
  success: boolean;
};

export class DeleteProjectUseCase {
  async execute(input: DeleteProjectInput): Promise<DeleteProjectOutput> {
    try {
      const projectId = EntityId.from(input.id);
      const project = await projectRepository.findById(projectId);

      if (!project) {
        throw new DomainError(ErrorCode.ENTITY_NOT_FOUND, 'Project not found', {
          entity: 'project',
          id: input.id,
        });
      }

      project.softDelete();
      await projectRepository.save(project);

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

export const deleteProjectUseCase = new DeleteProjectUseCase();
