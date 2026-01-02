import { DeleteProjectUseCase } from '@/application/usecases/project/DeleteProjectUseCase';
import { EntityId, Project, ProjectRepository } from '@stanza/core';

describe('DeleteProjectUseCase', () => {
  let useCase: DeleteProjectUseCase;
  let mockProjectRepository: jest.Mocked<ProjectRepository>;

  beforeEach(() => {
    mockProjectRepository = {
      save: jest.fn().mockResolvedValue(undefined),
      findById: jest.fn(),
      delete: jest.fn(),
      reorder: jest.fn(),
      countByFolder: jest.fn(),
    } as jest.Mocked<ProjectRepository>;

    useCase = new DeleteProjectUseCase(mockProjectRepository);

    jest.clearAllMocks();
  });

  describe('execute', () => {
    it('正常にプロジェクトを削除できる', async () => {
      const projectId = EntityId.generate();
      const project = Project.create('テストプロジェクト');
      mockProjectRepository.findById = jest.fn().mockResolvedValue(project);

      const input = { id: projectId };
      const result = await useCase.execute(input);

      expect(result.success).toBe(true);
      expect(mockProjectRepository.save).toHaveBeenCalledTimes(1);
      expect(mockProjectRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          _isDeleted: true,
        })
      );
    });

    it('削除時にdeletedAtが設定される', async () => {
      const projectId = EntityId.generate();
      const project = Project.create('テストプロジェクト');
      mockProjectRepository.findById = jest.fn().mockResolvedValue(project);

      const beforeDelete = new Date();
      await useCase.execute({ id: projectId });

      expect(mockProjectRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          _isDeleted: true,
          _deletedAt: expect.any(Date),
        })
      );

      const savedProject = (mockProjectRepository.save as jest.Mock).mock.calls[0][0];
      expect(savedProject._deletedAt.getTime()).toBeGreaterThanOrEqual(beforeDelete.getTime());
    });

    it('プロジェクトが存在しない場合エラー', async () => {
      const projectId = EntityId.generate();
      mockProjectRepository.findById = jest.fn().mockResolvedValue(null);

      const input = { id: projectId };

      await expect(useCase.execute(input)).rejects.toThrow();
      expect(mockProjectRepository.save).not.toHaveBeenCalled();
    });

    it('無効なIDの場合エラー', async () => {
      const input = { id: 'invalid-id' };

      await expect(useCase.execute(input)).rejects.toThrow();
      expect(mockProjectRepository.findById).not.toHaveBeenCalled();
      expect(mockProjectRepository.save).not.toHaveBeenCalled();
    });

    it('既に削除済みのプロジェクトも削除できる', async () => {
      const projectId = EntityId.generate();
      const project = Project.create('テストプロジェクト');
      project.softDelete(); // 既に削除済み
      mockProjectRepository.findById = jest.fn().mockResolvedValue(project);

      const result = await useCase.execute({ id: projectId });

      expect(result.success).toBe(true);
      expect(mockProjectRepository.save).toHaveBeenCalledTimes(1);
    });
  });
});
