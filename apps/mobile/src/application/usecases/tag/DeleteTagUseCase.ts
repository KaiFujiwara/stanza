import { EntityId, DomainError, ErrorCode } from '@lyrics-notes/core';
import { tagRepository } from '@/infra/repositories/TagRepository';
import { toUserMessage } from '@/lib/errors';

export type DeleteTagInput = {
  id: string;
};

export type DeleteTagOutput = void;

export class DeleteTagUseCase {
  async execute(input: DeleteTagInput): Promise<DeleteTagOutput> {
    try {
      const tag = await tagRepository.findById(EntityId.from(input.id));
      if (!tag) {
        throw new DomainError(ErrorCode.ENTITY_NOT_FOUND, 'Tag not found', { entity: 'tag', tagId: input.id });
      }

      await tagRepository.delete(EntityId.from(input.id));
    } catch (error) {
      const { userMessage, devMessage, stack, details } = toUserMessage(error);
      console.error('[DeleteTagUseCase] Error:', { devMessage, stack, details });
      throw new Error(userMessage);
    }
  }
}

export const deleteTagUseCase = new DeleteTagUseCase();
