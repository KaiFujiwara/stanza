import { Phrase, MAX_PHRASES_PER_USER, DomainError, ErrorCode, PhraseRepository } from '@stanza/core';
import { toUserMessage } from '@/lib/errors';

export type CreatePhraseInput = {
  text: string;
  note?: string;
  tagIds?: string[];
};

export type CreatePhraseOutput = {
  phrase: Phrase;
};

export class CreatePhraseUseCase {
  constructor(private readonly phraseRepository: PhraseRepository) {}

  async execute(input: CreatePhraseInput): Promise<CreatePhraseOutput> {
    try {
      // 作成上限チェック
      const currentCount = await this.phraseRepository.countByUser();
      if (currentCount >= MAX_PHRASES_PER_USER) {
        throw new DomainError(
          ErrorCode.MAX_COUNT_EXCEEDED,
          'Phrase count limit exceeded',
          { entity: 'phrase', maxCount: MAX_PHRASES_PER_USER, currentCount }
        );
      }

      const phrase = Phrase.create(input.text, {
        note: input.note,
        tagIds: input.tagIds,
      });
      await this.phraseRepository.save(phrase);

      return { phrase };
    } catch (error) {
      const { userMessage, devMessage, stack, details } = toUserMessage(error);
      console.error('[CreatePhraseUseCase] Error:', { devMessage, stack, details });
      throw new Error(userMessage);
    }
  }
}
