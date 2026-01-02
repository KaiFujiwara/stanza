import { CreateFolderUseCase } from '@/application/usecases/folder/CreateFolderUseCase';
import { FolderRepository } from '@stanza/core';

describe('CreateFolderUseCase', () => {
  let useCase: CreateFolderUseCase;
  let mockFolderRepository: jest.Mocked<FolderRepository>;

  beforeEach(() => {
    mockFolderRepository = {
      save: jest.fn().mockResolvedValue(undefined),
      findById: jest.fn(),
      reorder: jest.fn(),
      delete: jest.fn(),
      countByUser: jest.fn(),
    } as jest.Mocked<FolderRepository>;

    useCase = new CreateFolderUseCase(mockFolderRepository);

    jest.clearAllMocks();
  });

  describe('execute', () => {
    it('正常にフォルダを作成できる', async () => {
      const input = { name: 'マイフォルダ' };
      const result = await useCase.execute(input);

      expect(result.folder.name).toBe('マイフォルダ');
      expect(result.folder.orderIndex).toBe(0); // 新規作成時は0
      expect(mockFolderRepository.save).toHaveBeenCalledTimes(1);
    });

    it('無効なフォルダ名の場合エラー', async () => {
      const input = { name: '' };

      await expect(useCase.execute(input)).rejects.toThrow();
      expect(mockFolderRepository.save).not.toHaveBeenCalled();
    });
  });
});
