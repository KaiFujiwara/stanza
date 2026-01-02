import { Genre, MAX_GENRES_PER_USER, DomainError, ErrorCode, GenreRepository } from '@stanza/core';
import { toUserMessage } from '@/lib/errors';

export type CreateGenreInput = {
  name: string;
  description?: string;
  sectionNames?: string[];
};

export type CreateGenreOutput = {
  genre: Genre;
};

export class CreateGenreUseCase {
  constructor(private readonly genreRepository: GenreRepository) {}

  async execute(input: CreateGenreInput): Promise<CreateGenreOutput> {
    try {
      // 作成上限チェック
      const currentCount = await this.genreRepository.countByUser();
      if (currentCount >= MAX_GENRES_PER_USER) {
        throw new DomainError(
          ErrorCode.MAX_COUNT_EXCEEDED,
          'Genre count limit exceeded',
          { entity: 'genre', maxCount: MAX_GENRES_PER_USER, currentCount }
        );
      }

      const genre = Genre.create(input.name, {
        description: input.description,
        sectionNames: input.sectionNames || [],
      });

      await this.genreRepository.save(genre);

      return { genre };
    } catch (error) {
      const { userMessage, devMessage, stack, details } = toUserMessage(error);
      console.error('[CreateGenreUseCase] Error:', { devMessage, stack, details });
      throw new Error(userMessage);
    }
  }
}
