import { DeleteGenreUseCase } from '@/application/usecases/genre/DeleteGenreUseCase';
import { EntityId, GenreRepository } from '@stanza/core';

describe('DeleteGenreUseCase', () => {
  let useCase: DeleteGenreUseCase;
  let mockGenreRepository: jest.Mocked<GenreRepository>;

  beforeEach(() => {
    mockGenreRepository = {
      save: jest.fn(),
      findById: jest.fn(),
      delete: jest.fn().mockResolvedValue(undefined),
      countByUser: jest.fn(),
    } as jest.Mocked<GenreRepository>;

    useCase = new DeleteGenreUseCase(mockGenreRepository);

    jest.clearAllMocks();
  });

  describe('execute', () => {
    it('正常にジャンルを削除できる', async () => {
      const genreId = EntityId.generate();

      await useCase.execute({ id: genreId });

      expect(mockGenreRepository.delete).toHaveBeenCalledTimes(1);
      expect(mockGenreRepository.delete).toHaveBeenCalledWith(genreId);
    });

    it('無効なIDの場合エラー', async () => {
      await expect(useCase.execute({ id: 'invalid-id' })).rejects.toThrow();
      expect(mockGenreRepository.delete).not.toHaveBeenCalled();
    });
  });
});
