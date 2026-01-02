import { EntityId, DomainError, ErrorCode, TagRepository } from '@stanza/core';
import { toUserMessage } from '@/lib/errors';

export type DeleteTagInput = {
  id: string;
};

export type DeleteTagOutput = void;

export class DeleteTagUseCase {
  constructor(private readonly tagRepository: TagRepository) {}

  async execute(input: DeleteTagInput): Promise<DeleteTagOutput> {
    try {
      const tag = await this.tagRepository.findById(EntityId.from(input.id));
      if (!tag) {
        throw new DomainError(ErrorCode.ENTITY_NOT_FOUND, 'Tag not found', { entity: 'tag', tagId: input.id });
      }

      await this.tagRepository.delete(EntityId.from(input.id));
    } catch (error) {
      const { userMessage, devMessage, stack, details } = toUserMessage(error);
      console.error('[DeleteTagUseCase] Error:', { devMessage, stack, details });
      throw new Error(userMessage);
    }
  }
}
