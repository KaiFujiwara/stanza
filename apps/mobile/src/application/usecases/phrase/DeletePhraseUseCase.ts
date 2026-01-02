import { EntityId, DomainError, ErrorCode, PhraseRepository } from '@stanza/core';
import { toUserMessage } from '@/lib/errors';

export type DeletePhraseInput = {
  id: string;
};

export type DeletePhraseOutput = void;

export class DeletePhraseUseCase {
  constructor(private readonly phraseRepository: PhraseRepository) {}

  async execute(input: DeletePhraseInput): Promise<DeletePhraseOutput> {
    try {
      const phrase = await this.phraseRepository.findById(EntityId.from(input.id));
      if (!phrase) {
        throw new DomainError(ErrorCode.ENTITY_NOT_FOUND, 'Phrase not found', { entity: 'phrase', phraseId: input.id });
      }

      await this.phraseRepository.delete(EntityId.from(input.id));
    } catch (error) {
      const { userMessage, devMessage, stack, details } = toUserMessage(error);
      console.error('[DeletePhraseUseCase] Error:', { devMessage, stack, details });
      throw new Error(userMessage);
    }
  }
}
