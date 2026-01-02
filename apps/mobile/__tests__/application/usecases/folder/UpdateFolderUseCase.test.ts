import { UpdateFolderUseCase } from '@/application/usecases/folder/UpdateFolderUseCase';
import { EntityId, Folder, FolderRepository } from '@stanza/core';

describe('UpdateFolderUseCase', () => {
  let useCase: UpdateFolderUseCase;
  let mockFolderRepository: jest.Mocked<FolderRepository>;

  beforeEach(() => {
    mockFolderRepository = {
      save: jest.fn().mockResolvedValue(undefined),
      findById: jest.fn(),
      reorder: jest.fn(),
      delete: jest.fn(),
      countByUser: jest.fn(),
    } as jest.Mocked<FolderRepository>;

    useCase = new UpdateFolderUseCase(mockFolderRepository);

    jest.clearAllMocks();
  });

  describe('execute', () => {
    it('フォルダ名を更新できる', async () => {
      const folderId = EntityId.generate();
      const folder = Folder.reconstruct(folderId, '元のフォルダ名', 1);
      mockFolderRepository.findById = jest.fn().mockResolvedValue(folder);

      await useCase.execute({ id: folderId, name: '新しいフォルダ名' });

      expect(mockFolderRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({ _name: '新しいフォルダ名' })
      );
    });

    it('フォルダが存在しない場合エラー', async () => {
      mockFolderRepository.findById = jest.fn().mockResolvedValue(null);

      await expect(
        useCase.execute({ id: EntityId.generate(), name: '新しいフォルダ名' })
      ).rejects.toThrow();
      expect(mockFolderRepository.save).not.toHaveBeenCalled();
    });

    it('無効なフォルダ名の場合エラー', async () => {
      const folderId = EntityId.generate();
      const folder = Folder.reconstruct(folderId, '元のフォルダ名', 1);
      mockFolderRepository.findById = jest.fn().mockResolvedValue(folder);

      await expect(useCase.execute({ id: folderId, name: '' })).rejects.toThrow();
      expect(mockFolderRepository.save).not.toHaveBeenCalled();
    });
  });
});
