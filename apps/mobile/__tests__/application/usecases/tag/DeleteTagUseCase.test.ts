import { DeleteTagUseCase } from '@/application/usecases/tag/DeleteTagUseCase';
import { EntityId, Tag, TagRepository } from '@stanza/core';

describe('DeleteTagUseCase', () => {
  let useCase: DeleteTagUseCase;
  let mockTagRepository: jest.Mocked<TagRepository>;

  beforeEach(() => {
    mockTagRepository = {
      save: jest.fn(),
      findById: jest.fn(),
      delete: jest.fn().mockResolvedValue(undefined),
      countByUser: jest.fn(),
      existsByName: jest.fn(),
    } as jest.Mocked<TagRepository>;

    useCase = new DeleteTagUseCase(mockTagRepository);

    jest.clearAllMocks();
  });

  describe('execute', () => {
    it('正常にタグを削除できる', async () => {
      const tagId = EntityId.generate();
      const tag = Tag.create('テストタグ', '#FF0000');
      mockTagRepository.findById = jest.fn().mockResolvedValue(tag);

      await useCase.execute({ id: tagId });

      expect(mockTagRepository.delete).toHaveBeenCalledTimes(1);
      expect(mockTagRepository.delete).toHaveBeenCalledWith(tagId);
    });

    it('タグが存在しない場合エラー', async () => {
      mockTagRepository.findById = jest.fn().mockResolvedValue(null);

      await expect(useCase.execute({ id: EntityId.generate() })).rejects.toThrow();
      expect(mockTagRepository.delete).not.toHaveBeenCalled();
    });

    it('無効なIDの場合エラー', async () => {
      await expect(useCase.execute({ id: 'invalid-id' })).rejects.toThrow();
      expect(mockTagRepository.delete).not.toHaveBeenCalled();
    });
  });
});
