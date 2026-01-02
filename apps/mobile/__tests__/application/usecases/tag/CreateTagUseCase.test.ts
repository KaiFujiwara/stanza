import { CreateTagUseCase } from '@/application/usecases/tag/CreateTagUseCase';
import { MAX_TAGS_PER_USER, TagRepository } from '@stanza/core';

describe('CreateTagUseCase', () => {
  let useCase: CreateTagUseCase;
  let mockTagRepository: jest.Mocked<TagRepository>;

  beforeEach(() => {
    mockTagRepository = {
      save: jest.fn().mockResolvedValue(undefined),
      findById: jest.fn(),
      delete: jest.fn(),
      countByUser: jest.fn().mockResolvedValue(0),
      existsByName: jest.fn().mockResolvedValue(false),
    } as jest.Mocked<TagRepository>;

    useCase = new CreateTagUseCase(mockTagRepository);

    jest.clearAllMocks();
  });

  describe('execute', () => {
    it('正常にタグを作成できる', async () => {
      const input = { name: 'タグ1' };
      const result = await useCase.execute(input);

      expect(result.tag.name).toBe('タグ1');
      expect(mockTagRepository.save).toHaveBeenCalledTimes(1);
    });

    it('色付きで作成できる', async () => {
      const input = { name: 'タグ1', color: '#FF0000' };
      const result = await useCase.execute(input);

      expect(result.tag.name).toBe('タグ1');
      expect(result.tag.color).toBe('#FF0000');
      expect(mockTagRepository.save).toHaveBeenCalledTimes(1);
    });

    it('重複しない名前の場合は作成できる', async () => {
      mockTagRepository.existsByName = jest.fn().mockResolvedValue(false);

      const input = { name: 'タグ1' };
      const result = await useCase.execute(input);

      expect(result.tag).toBeDefined();
      expect(mockTagRepository.save).toHaveBeenCalledTimes(1);
    });

    it('重複する名前の場合はエラー', async () => {
      mockTagRepository.existsByName = jest.fn().mockResolvedValue(true);

      const input = { name: 'タグ1' };

      await expect(useCase.execute(input)).rejects.toThrow();
      expect(mockTagRepository.save).not.toHaveBeenCalled();
    });

    it('上限に達していない場合は作成できる', async () => {
      mockTagRepository.countByUser = jest.fn().mockResolvedValue(MAX_TAGS_PER_USER - 1);

      const input = { name: 'タグ1' };
      const result = await useCase.execute(input);

      expect(result.tag).toBeDefined();
      expect(mockTagRepository.save).toHaveBeenCalledTimes(1);
    });

    it('上限に達している場合はエラー', async () => {
      mockTagRepository.countByUser = jest.fn().mockResolvedValue(MAX_TAGS_PER_USER);

      const input = { name: 'タグ1' };

      await expect(useCase.execute(input)).rejects.toThrow();
      expect(mockTagRepository.save).not.toHaveBeenCalled();
    });

    it('無効なタグ名の場合エラー', async () => {
      const input = { name: '' };

      await expect(useCase.execute(input)).rejects.toThrow();
      expect(mockTagRepository.save).not.toHaveBeenCalled();
    });

    it('無効なカラーコードの場合エラー', async () => {
      const input = { name: 'タグ1', color: 'invalid-color' };

      await expect(useCase.execute(input)).rejects.toThrow();
      expect(mockTagRepository.save).not.toHaveBeenCalled();
    });
  });
});
