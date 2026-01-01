import { CreateGenreUseCase } from '@/application/usecases/genre/CreateGenreUseCase';
import { MAX_GENRES_PER_USER, GenreRepository } from '@lyrics-notes/core';

describe('CreateGenreUseCase', () => {
  let useCase: CreateGenreUseCase;
  let mockGenreRepository: jest.Mocked<GenreRepository>;

  beforeEach(() => {
    mockGenreRepository = {
      save: jest.fn().mockResolvedValue(undefined),
      findById: jest.fn(),
      delete: jest.fn(),
      countByUser: jest.fn().mockResolvedValue(0),
    } as jest.Mocked<GenreRepository>;

    useCase = new CreateGenreUseCase(mockGenreRepository);

    jest.clearAllMocks();
  });

  describe('execute', () => {
    it('正常にジャンルを作成できる', async () => {
      const input = { name: 'ポップス' };
      const result = await useCase.execute(input);

      expect(result.genre.name).toBe('ポップス');
      expect(mockGenreRepository.save).toHaveBeenCalledTimes(1);
    });

    it('説明付きで作成できる', async () => {
      const input = {
        name: 'ポップス',
        description: 'ポップな曲のテンプレート',
      };
      const result = await useCase.execute(input);

      expect(result.genre.description).toBe('ポップな曲のテンプレート');
    });

    it('セクション名付きで作成できる', async () => {
      const input = {
        name: 'ポップス',
        sectionNames: ['イントロ', 'Aメロ', 'サビ'],
      };
      const result = await useCase.execute(input);

      expect(result.genre.sectionNames).toEqual(['イントロ', 'Aメロ', 'サビ']);
    });

    it('上限に達していない場合は作成できる', async () => {
      mockGenreRepository.countByUser = jest.fn().mockResolvedValue(MAX_GENRES_PER_USER - 1);

      const input = { name: 'ロック' };
      const result = await useCase.execute(input);

      expect(result.genre).toBeDefined();
      expect(mockGenreRepository.save).toHaveBeenCalledTimes(1);
    });

    it('上限に達している場合はエラー', async () => {
      mockGenreRepository.countByUser = jest.fn().mockResolvedValue(MAX_GENRES_PER_USER);

      const input = { name: 'ポップス' };

      await expect(useCase.execute(input)).rejects.toThrow();
      expect(mockGenreRepository.save).not.toHaveBeenCalled();
    });

    it('無効なジャンル名の場合エラー', async () => {
      const input = { name: '' };

      await expect(useCase.execute(input)).rejects.toThrow();
      expect(mockGenreRepository.save).not.toHaveBeenCalled();
    });
  });
});
