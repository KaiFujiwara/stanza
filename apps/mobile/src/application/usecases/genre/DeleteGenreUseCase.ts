import { EntityId, GenreRepository } from '@stanza/core';
import { toUserMessage } from '@/lib/errors';

export type DeleteGenreInput = {
  id: string;
};

export type DeleteGenreOutput = void;

export class DeleteGenreUseCase {
  constructor(private readonly genreRepository: GenreRepository) {}

  async execute(input: DeleteGenreInput): Promise<DeleteGenreOutput> {
    try {
      await this.genreRepository.delete(EntityId.from(input.id));
    } catch (error) {
      const { userMessage, devMessage, stack, details } = toUserMessage(error);
      console.error('[DeleteGenreUseCase] Error:', { devMessage, stack, details });
      throw new Error(userMessage);
    }
  }
}
