import { ReorderFoldersUseCase } from '@/application/usecases/folder/ReorderFoldersUseCase';
import { EntityId, FolderRepository } from '@stanza/core';

describe('ReorderFoldersUseCase', () => {
  let useCase: ReorderFoldersUseCase;
  let mockFolderRepository: jest.Mocked<FolderRepository>;

  beforeEach(() => {
    mockFolderRepository = {
      save: jest.fn(),
      findById: jest.fn(),
      reorder: jest.fn().mockResolvedValue(undefined),
      delete: jest.fn(),
      countByUser: jest.fn(),
    } as jest.Mocked<FolderRepository>;

    useCase = new ReorderFoldersUseCase(mockFolderRepository);

    jest.clearAllMocks();
  });

  describe('execute', () => {
    it('正常にフォルダを並び替えできる', async () => {
      const folderId1 = EntityId.generate();
      const folderId2 = EntityId.generate();
      const folderId3 = EntityId.generate();

      await useCase.execute({
        folderIds: [folderId1, folderId2, folderId3],
      });

      expect(mockFolderRepository.reorder).toHaveBeenCalledTimes(1);
      expect(mockFolderRepository.reorder).toHaveBeenCalledWith([
        folderId1,
        folderId2,
        folderId3,
      ]);
    });

    it('空の配列でも実行できる', async () => {
      await useCase.execute({ folderIds: [] });

      expect(mockFolderRepository.reorder).toHaveBeenCalledTimes(1);
      expect(mockFolderRepository.reorder).toHaveBeenCalledWith([]);
    });

    it('無効なIDが含まれる場合エラー', async () => {
      await expect(
        useCase.execute({ folderIds: ['invalid-id'] })
      ).rejects.toThrow();
      expect(mockFolderRepository.reorder).not.toHaveBeenCalled();
    });
  });
});
