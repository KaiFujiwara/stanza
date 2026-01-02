import { DeleteFolderUseCase } from '@/application/usecases/folder/DeleteFolderUseCase';
import { EntityId, Folder, FolderRepository } from '@stanza/core';

describe('DeleteFolderUseCase', () => {
  let useCase: DeleteFolderUseCase;
  let mockFolderRepository: jest.Mocked<FolderRepository>;

  beforeEach(() => {
    mockFolderRepository = {
      save: jest.fn(),
      findById: jest.fn(),
      reorder: jest.fn(),
      delete: jest.fn().mockResolvedValue(undefined),
      countByUser: jest.fn(),
    } as jest.Mocked<FolderRepository>;

    useCase = new DeleteFolderUseCase(mockFolderRepository);

    jest.clearAllMocks();
  });

  describe('execute', () => {
    it('正常にフォルダを削除できる', async () => {
      const folderId = EntityId.generate();
      const folder = Folder.reconstruct(folderId, 'テストフォルダ', 1);
      mockFolderRepository.findById = jest.fn().mockResolvedValue(folder);

      await useCase.execute({ id: folderId });

      expect(mockFolderRepository.delete).toHaveBeenCalledTimes(1);
      expect(mockFolderRepository.delete).toHaveBeenCalledWith(folderId);
    });

    it('フォルダが存在しない場合エラー', async () => {
      mockFolderRepository.findById = jest.fn().mockResolvedValue(null);

      await expect(useCase.execute({ id: EntityId.generate() })).rejects.toThrow();
      expect(mockFolderRepository.delete).not.toHaveBeenCalled();
    });

    it('無効なIDの場合エラー', async () => {
      await expect(useCase.execute({ id: 'invalid-id' })).rejects.toThrow();
      expect(mockFolderRepository.delete).not.toHaveBeenCalled();
    });
  });
});
