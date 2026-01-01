import { EntityId } from '@lyrics-notes/core';
import { genreRepository } from '@/infra/repositories/GenreRepository';
import { toUserMessage } from '@/lib/errors';

export type DeleteGenreInput = {
  id: string;
};

export type DeleteGenreOutput = void;

export class DeleteGenreUseCase {
  async execute(input: DeleteGenreInput): Promise<DeleteGenreOutput> {
    try {
      await genreRepository.delete(EntityId.from(input.id));
    } catch (error) {
      const { userMessage, devMessage, stack, details } = toUserMessage(error);
      console.error('[DeleteGenreUseCase] Error:', { devMessage, stack, details });
      throw new Error(userMessage);
    }
  }
}

export const deleteGenreUseCase = new DeleteGenreUseCase();
