import { UpdateGenreUseCase } from '@/application/usecases/genre/UpdateGenreUseCase';
import { EntityId, Genre, GenreRepository } from '@stanza/core';

describe('UpdateGenreUseCase', () => {
  let useCase: UpdateGenreUseCase;
  let mockGenreRepository: jest.Mocked<GenreRepository>;

  beforeEach(() => {
    mockGenreRepository = {
      save: jest.fn().mockResolvedValue(undefined),
      findById: jest.fn(),
      delete: jest.fn(),
      countByUser: jest.fn(),
    } as jest.Mocked<GenreRepository>;

    useCase = new UpdateGenreUseCase(mockGenreRepository);

    jest.clearAllMocks();
  });

  describe('execute', () => {
    it('ジャンル名を更新できる', async () => {
      const genreId = EntityId.generate();
      const genre = Genre.create('元の名前');
      mockGenreRepository.findById = jest.fn().mockResolvedValue(genre);

      await useCase.execute({ id: genreId, name: '新しい名前' });

      expect(mockGenreRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({ _name: '新しい名前' })
      );
    });

    it('説明を更新できる', async () => {
      const genreId = EntityId.generate();
      const genre = Genre.create('ポップス');
      mockGenreRepository.findById = jest.fn().mockResolvedValue(genre);

      await useCase.execute({ id: genreId, description: '新しい説明' });

      expect(mockGenreRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({ _description: '新しい説明' })
      );
    });

    it('説明を削除できる（null指定）', async () => {
      const genreId = EntityId.generate();
      const genre = Genre.create('ポップス', { description: '元の説明' });
      mockGenreRepository.findById = jest.fn().mockResolvedValue(genre);

      await useCase.execute({ id: genreId, description: null });

      expect(mockGenreRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({ _description: undefined })
      );
    });

    it('セクション名を更新できる', async () => {
      const genreId = EntityId.generate();
      const genre = Genre.create('ポップス');
      mockGenreRepository.findById = jest.fn().mockResolvedValue(genre);

      await useCase.execute({
        id: genreId,
        sectionNames: ['イントロ', 'Aメロ', 'サビ'],
      });

      expect(mockGenreRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          _sectionNames: ['イントロ', 'Aメロ', 'サビ'],
        })
      );
    });

    it('複数の項目を同時に更新できる', async () => {
      const genreId = EntityId.generate();
      const genre = Genre.create('元の名前');
      mockGenreRepository.findById = jest.fn().mockResolvedValue(genre);

      await useCase.execute({
        id: genreId,
        name: '新しい名前',
        description: '新しい説明',
        sectionNames: ['Aメロ', 'サビ'],
      });

      expect(mockGenreRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          _name: '新しい名前',
          _description: '新しい説明',
          _sectionNames: ['Aメロ', 'サビ'],
        })
      );
    });

    it('ジャンルが存在しない場合エラー', async () => {
      mockGenreRepository.findById = jest.fn().mockResolvedValue(null);

      await expect(
        useCase.execute({ id: EntityId.generate(), name: '新しい名前' })
      ).rejects.toThrow();
      expect(mockGenreRepository.save).not.toHaveBeenCalled();
    });

    it('undefinedの項目は更新されない', async () => {
      const genreId = EntityId.generate();
      const genre = Genre.create('元の名前', { description: '元の説明' });
      mockGenreRepository.findById = jest.fn().mockResolvedValue(genre);

      await useCase.execute({ id: genreId, name: '新しい名前' });

      expect(mockGenreRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          _name: '新しい名前',
          _description: '元の説明', // 変わっていない
        })
      );
    });
  });
});
