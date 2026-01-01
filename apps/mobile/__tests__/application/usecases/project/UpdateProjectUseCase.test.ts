import { UpdateProjectUseCase } from '@/application/usecases/project/UpdateProjectUseCase';
import { EntityId, Project, Genre, Section, ProjectRepository, GenreRepository } from '@lyrics-notes/core';

describe('UpdateProjectUseCase', () => {
  let useCase: UpdateProjectUseCase;
  let mockProjectRepository: jest.Mocked<ProjectRepository>;
  let mockGenreRepository: jest.Mocked<GenreRepository>;

  beforeEach(() => {
    mockProjectRepository = {
      save: jest.fn().mockResolvedValue(undefined),
      findById: jest.fn(),
      delete: jest.fn(),
      reorder: jest.fn(),
      countByFolder: jest.fn().mockResolvedValue(0),
    } as jest.Mocked<ProjectRepository>;

    mockGenreRepository = {
      save: jest.fn(),
      findById: jest.fn(),
      delete: jest.fn(),
      countByUser: jest.fn(),
    } as jest.Mocked<GenreRepository>;

    useCase = new UpdateProjectUseCase(mockProjectRepository, mockGenreRepository);

    jest.clearAllMocks();
  });

  describe('execute', () => {
    it('プロジェクトのタイトルを更新できる', async () => {
      const projectId = EntityId.generate();
      const project = Project.create('元のタイトル');
      mockProjectRepository.findById = jest.fn().mockResolvedValue(project);

      const input = {
        id: projectId,
        title: '新しいタイトル',
      };

      const result = await useCase.execute(input);

      expect(result.project.title).toBe('新しいタイトル');
      expect(mockProjectRepository.save).toHaveBeenCalledTimes(1);
    });

    it('プロジェクトのフォルダを移動できる', async () => {
      const projectId = EntityId.generate();
      const folderId = EntityId.generate();
      const project = Project.create('テスト');
      mockProjectRepository.findById = jest.fn().mockResolvedValue(project);

      const input = {
        id: projectId,
        folderId,
      };

      const result = await useCase.execute(input);

      expect(result.project.folderId).toBe(folderId);
      expect(mockProjectRepository.save).toHaveBeenCalledTimes(1);
    });

    it('プロジェクトのフォルダを解除できる（null指定）', async () => {
      const projectId = EntityId.generate();
      const folderId = EntityId.generate();
      const project = Project.create('テスト', folderId);
      mockProjectRepository.findById = jest.fn().mockResolvedValue(project);

      const input = {
        id: projectId,
        folderId: null,
      };

      const result = await useCase.execute(input);

      expect(result.project.folderId).toBeUndefined();
    });

    it('プロジェクトのジャンルを設定できる', async () => {
      const projectId = EntityId.generate();
      const genreId = EntityId.generate();
      const project = Project.create('テスト');
      const genre = Genre.create('ポップス');
      mockProjectRepository.findById = jest.fn().mockResolvedValue(project);
      mockGenreRepository.findById = jest.fn().mockResolvedValue(genre);

      const input = {
        id: projectId,
        genreId,
      };

      const result = await useCase.execute(input);

      expect(result.project.genreId).toBe(genreId);
      expect(mockGenreRepository.findById).toHaveBeenCalledWith(genreId);
    });

    it('プロジェクトのジャンルを解除できる（null指定）', async () => {
      const projectId = EntityId.generate();
      const genreId = EntityId.generate();
      const project = Project.create('テスト', undefined, genreId);
      mockProjectRepository.findById = jest.fn().mockResolvedValue(project);

      const input = {
        id: projectId,
        genreId: null,
      };

      const result = await useCase.execute(input);

      expect(result.project.genreId).toBeUndefined();
    });

    it('プロジェクトのセクションを更新できる', async () => {
      const projectId = EntityId.generate();
      const project = Project.create('テスト');
      mockProjectRepository.findById = jest.fn().mockResolvedValue(project);

      const input = {
        id: projectId,
        sections: [
          { name: 'Aメロ' },
          { name: 'サビ' },
        ],
      };

      const result = await useCase.execute(input);

      expect(result.project.sections.length).toBe(2);
      expect(result.project.sections[0].name).toBe('Aメロ');
      expect(result.project.sections[1].name).toBe('サビ');
    });

    it('既存セクションと新規セクションを混在して更新できる', async () => {
      const projectId = EntityId.generate();
      const sectionId = EntityId.generate();
      const section = Section.create(projectId, '既存セクション', 0);
      const project = Project.create('テスト', undefined, undefined, 0, [section]);
      mockProjectRepository.findById = jest.fn().mockResolvedValue(project);

      const input = {
        id: projectId,
        sections: [
          { id: sectionId, name: '既存セクション', content: '内容あり' },
          { name: '新規セクション' },
        ],
      };

      const result = await useCase.execute(input);

      expect(result.project.sections.length).toBe(2);
    });

    it('複数の項目を同時に更新できる', async () => {
      const projectId = EntityId.generate();
      const folderId = EntityId.generate();
      const project = Project.create('元のタイトル');
      mockProjectRepository.findById = jest.fn().mockResolvedValue(project);

      const input = {
        id: projectId,
        title: '新しいタイトル',
        folderId,
        sections: [{ name: 'Aメロ' }],
      };

      const result = await useCase.execute(input);

      expect(result.project.title).toBe('新しいタイトル');
      expect(result.project.folderId).toBe(folderId);
      expect(result.project.sections.length).toBe(1);
    });

    it('プロジェクトが存在しない場合エラー', async () => {
      mockProjectRepository.findById = jest.fn().mockResolvedValue(null);

      const input = {
        id: EntityId.generate(),
        title: '新しいタイトル',
      };

      await expect(useCase.execute(input)).rejects.toThrow();
      expect(mockProjectRepository.save).not.toHaveBeenCalled();
    });

    it('タイトルが空文字の場合エラー', async () => {
      const projectId = EntityId.generate();
      const project = Project.create('元のタイトル');
      mockProjectRepository.findById = jest.fn().mockResolvedValue(project);

      const input = {
        id: projectId,
        title: '',
      };

      await expect(useCase.execute(input)).rejects.toThrow();
      expect(mockProjectRepository.save).not.toHaveBeenCalled();
    });

    it('存在しないジャンルIDが指定された場合エラー', async () => {
      const projectId = EntityId.generate();
      const genreId = EntityId.generate();
      const project = Project.create('テスト');
      mockProjectRepository.findById = jest.fn().mockResolvedValue(project);
      mockGenreRepository.findById = jest.fn().mockResolvedValue(null);

      const input = {
        id: projectId,
        genreId,
      };

      await expect(useCase.execute(input)).rejects.toThrow();
      expect(mockProjectRepository.save).not.toHaveBeenCalled();
    });

    it('undefinedの項目は更新されない', async () => {
      const projectId = EntityId.generate();
      const folderId = EntityId.generate();
      const project = Project.create('元のタイトル', folderId);
      mockProjectRepository.findById = jest.fn().mockResolvedValue(project);

      const input = {
        id: projectId,
        title: undefined, // 更新しない
      };

      const result = await useCase.execute(input);

      expect(result.project.title).toBe('元のタイトル'); // 変わっていない
      expect(result.project.folderId).toBe(folderId); // 変わっていない
    });
  });
});
