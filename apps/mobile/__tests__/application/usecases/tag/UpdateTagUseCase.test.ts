import { UpdateTagUseCase } from '@/application/usecases/tag/UpdateTagUseCase';
import { EntityId, Tag, TagRepository } from '@lyrics-notes/core';

describe('UpdateTagUseCase', () => {
  let useCase: UpdateTagUseCase;
  let mockTagRepository: jest.Mocked<TagRepository>;

  beforeEach(() => {
    mockTagRepository = {
      save: jest.fn().mockResolvedValue(undefined),
      findById: jest.fn(),
      delete: jest.fn(),
      countByUser: jest.fn(),
      existsByName: jest.fn(),
    } as jest.Mocked<TagRepository>;

    useCase = new UpdateTagUseCase(mockTagRepository);

    jest.clearAllMocks();
  });

  describe('execute', () => {
    it('タグ名を更新できる', async () => {
      const tagId = EntityId.generate();
      const tag = Tag.create('元の名前', '#FF0000');
      mockTagRepository.findById = jest.fn().mockResolvedValue(tag);

      await useCase.execute({ id: tagId, name: '新しい名前' });

      expect(mockTagRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({ _name: '新しい名前' })
      );
    });

    it('色を更新できる', async () => {
      const tagId = EntityId.generate();
      const tag = Tag.create('タグ1', '#FF0000');
      mockTagRepository.findById = jest.fn().mockResolvedValue(tag);

      await useCase.execute({ id: tagId, color: '#00FF00' });

      expect(mockTagRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({ _color: '#00FF00' })
      );
    });

    it('名前と色を同時に更新できる', async () => {
      const tagId = EntityId.generate();
      const tag = Tag.create('元の名前', '#FF0000');
      mockTagRepository.findById = jest.fn().mockResolvedValue(tag);

      await useCase.execute({ id: tagId, name: '新しい名前', color: '#00FF00' });

      expect(mockTagRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          _name: '新しい名前',
          _color: '#00FF00',
        })
      );
    });

    it('タグが存在しない場合エラー', async () => {
      mockTagRepository.findById = jest.fn().mockResolvedValue(null);

      await expect(
        useCase.execute({ id: EntityId.generate(), name: '新しい名前' })
      ).rejects.toThrow();
      expect(mockTagRepository.save).not.toHaveBeenCalled();
    });

    it('無効なタグ名の場合エラー', async () => {
      const tagId = EntityId.generate();
      const tag = Tag.create('元の名前', '#FF0000');
      mockTagRepository.findById = jest.fn().mockResolvedValue(tag);

      await expect(useCase.execute({ id: tagId, name: '' })).rejects.toThrow();
      expect(mockTagRepository.save).not.toHaveBeenCalled();
    });

    it('無効なカラーコードの場合エラー', async () => {
      const tagId = EntityId.generate();
      const tag = Tag.create('タグ1', '#FF0000');
      mockTagRepository.findById = jest.fn().mockResolvedValue(tag);

      await expect(
        useCase.execute({ id: tagId, color: 'invalid-color' })
      ).rejects.toThrow();
      expect(mockTagRepository.save).not.toHaveBeenCalled();
    });

    it('undefinedの項目は更新されない', async () => {
      const tagId = EntityId.generate();
      const tag = Tag.create('元の名前', '#FF0000');
      mockTagRepository.findById = jest.fn().mockResolvedValue(tag);

      await useCase.execute({ id: tagId, name: '新しい名前' });

      expect(mockTagRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          _name: '新しい名前',
          _color: '#FF0000', // 変わっていない
        })
      );
    });
  });
});
