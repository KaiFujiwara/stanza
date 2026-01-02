import { EntityId, DomainError, ErrorCode, TagRepository } from '@stanza/core';
import { toUserMessage } from '@/lib/errors';

export type UpdateTagInput = {
  id: string;
  name?: string;
  color?: string;
};

export type UpdateTagOutput = void;

export class UpdateTagUseCase {
  constructor(private readonly tagRepository: TagRepository) {}

  async execute(input: UpdateTagInput): Promise<UpdateTagOutput> {
    try {
      const tag = await this.tagRepository.findById(EntityId.from(input.id));
      if (!tag) {
        throw new DomainError(ErrorCode.ENTITY_NOT_FOUND, 'Tag not found', { entity: 'tag', tagId: input.id });
      }

      if (input.name !== undefined) {
        tag.updateName(input.name);
      }
      if (input.color !== undefined) {
        tag.updateColor(input.color);
      }

      await this.tagRepository.save(tag);
    } catch (error) {
      const { userMessage, devMessage, stack, details } = toUserMessage(error);
      console.error('[UpdateTagUseCase] Error:', { devMessage, stack, details });
      throw new Error(userMessage);
    }
  }
}
