import { EntityId, DomainError, ErrorCode, GenreRepository } from '@lyrics-notes/core';
import { toUserMessage } from '@/lib/errors';

export type UpdateGenreInput = {
  id: string;
  name?: string;
  description?: string | null;
  sectionNames?: string[];
};

export type UpdateGenreOutput = void;

export class UpdateGenreUseCase {
  constructor(private readonly genreRepository: GenreRepository) {}

  async execute(input: UpdateGenreInput): Promise<UpdateGenreOutput> {
    try {
      const genre = await this.genreRepository.findById(EntityId.from(input.id));
      if (!genre) {
        throw new DomainError(
          ErrorCode.ENTITY_NOT_FOUND,
          'Genre not found',
          { entity: 'genre', genreId: input.id }
        );
      }

      if (input.name !== undefined) {
        genre.updateName(input.name);
      }
      if (input.description !== undefined) {
        genre.updateDescription(input.description);
      }
      if (input.sectionNames !== undefined) {
        genre.setSectionNames(input.sectionNames);
      }

      await this.genreRepository.save(genre);
    } catch (error) {
      const { userMessage, devMessage, stack, details } = toUserMessage(error);
      console.error('[UpdateGenreUseCase] Error:', { devMessage, stack, details });
      throw new Error(userMessage);
    }
  }
}
