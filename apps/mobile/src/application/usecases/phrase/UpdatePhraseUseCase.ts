import { EntityId, DomainError, ErrorCode, PhraseRepository } from '@stanza/core';
import { toUserMessage } from '@/lib/errors';

export type UpdatePhraseInput = {
  id: string;
  text?: string;
  note?: string;
  tagIds?: string[];
};

export type UpdatePhraseOutput = void;

export class UpdatePhraseUseCase {
  constructor(private readonly phraseRepository: PhraseRepository) {}

  async execute(input: UpdatePhraseInput): Promise<UpdatePhraseOutput> {
    try {
      const existing = await this.phraseRepository.findById(EntityId.from(input.id));
      if (!existing) {
        throw new DomainError(ErrorCode.ENTITY_NOT_FOUND, 'Phrase not found', { entity: 'phrase', phraseId: input.id });
      }

      if (input.text !== undefined) {
        existing.updateText(input.text);
      }
      if (input.note !== undefined) {
        existing.updateNote(input.note);
      }
      if (input.tagIds !== undefined) {
        existing.setTags(input.tagIds);
      }

      await this.phraseRepository.save(existing);
    } catch (error) {
      const { userMessage, devMessage, stack, details } = toUserMessage(error);
      console.error('[UpdatePhraseUseCase] Error:', { devMessage, stack, details });
      throw new Error(userMessage);
    }
  }
}
