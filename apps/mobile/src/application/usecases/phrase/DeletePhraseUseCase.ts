import { EntityId, DomainError, ErrorCode } from '@lyrics-notes/core';
import { phraseRepository } from '@/infra/repositories/PhraseRepository';
import { toUserMessage } from '@/lib/errors';

export type DeletePhraseInput = {
  id: string;
};

export type DeletePhraseOutput = void;

export class DeletePhraseUseCase {
  async execute(input: DeletePhraseInput): Promise<DeletePhraseOutput> {
    try {
      const phrase = await phraseRepository.findById(EntityId.from(input.id));
      if (!phrase) {
        throw new DomainError(ErrorCode.ENTITY_NOT_FOUND, 'Phrase not found', { entity: 'phrase', phraseId: input.id });
      }

      await phraseRepository.delete(EntityId.from(input.id));
    } catch (error) {
      const { userMessage, devMessage, stack, details } = toUserMessage(error);
      console.error('[DeletePhraseUseCase] Error:', { devMessage, stack, details });
      throw new Error(userMessage);
    }
  }
}

export const deletePhraseUseCase = new DeletePhraseUseCase();
