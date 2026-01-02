import { CreateProjectUseCase } from '@/application/usecases/project/CreateProjectUseCase';
import { EntityId, Genre, DomainError, ErrorCode, ProjectRepository, GenreRepository } from '@lyrics-notes/core';

describe('CreateProjectUseCase', () => {
  let useCase: CreateProjectUseCase;
  let mockProjectRepository: jest.Mocked<ProjectRepository>;
  let mockGenreRepository: jest.Mocked<GenreRepository>;

  beforeEach(() => {
    mockProjectRepository = {
      save: jest.fn().mockResolvedValue(undefined),
      findById: jest.fn(),
      delete: jest.fn(),
      reorder: jest.fn(),
      countByFolder: jest.fn(),
    } as jest.Mocked<ProjectRepository>;

    mockGenreRepository = {
      save: jest.fn(),
      findById: jest.fn().mockResolvedValue(null),
      delete: jest.fn(),
      countByUser: jest.fn(),
    } as jest.Mocked<GenreRepository>;

    useCase = new CreateProjectUseCase(mockProjectRepository, mockGenreRepository);

    jest.clearAllMocks();
  });

  describe('execute', () => {
    it('正常にプロジェクトを作成できる', async () => {
      const input = {
        title: 'テストプロジェクト',
        sections: [],
      };

      const result = await useCase.execute(input);

      expect(result.project).toBeDefined();
      expect(result.project.title).toBe('テストプロジェクト');
      expect(EntityId.isValid(result.project.id)).toBe(true);
      expect(mockProjectRepository.save).toHaveBeenCalledTimes(1);
      expect(mockProjectRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          _title: 'テストプロジェクト',
        })
      );
    });

    it('フォルダIDを指定して作成できる', async () => {
      const folderId = EntityId.generate();
      const input = {
        title: 'テストプロジェクト',
        folderId,
        sections: [],
      };

      const result = await useCase.execute(input);

      expect(result.project.folderId).toBe(folderId);
    });

    it('ジャンルIDを指定して作成できる', async () => {
      const genreId = EntityId.generate();
      const genre = Genre.create('ポップス');
      mockGenreRepository.findById = jest.fn().mockResolvedValue(genre);

      const input = {
        title: 'テストプロジェクト',
        genreId,
        sections: [],
      };

      const result = await useCase.execute(input);

      expect(result.project.genreId).toBe(genreId);
      expect(mockGenreRepository.findById).toHaveBeenCalledWith(genreId);
    });

    it('セクション付きで作成できる', async () => {
      const input = {
        title: 'テストプロジェクト',
        sections: [
          { name: 'Aメロ' },
          { name: 'Bメロ' },
          { name: 'サビ' },
        ],
      };

      const result = await useCase.execute(input);

      expect(result.project.sections.length).toBe(3);
      expect(result.project.sections[0].name).toBe('Aメロ');
      expect(result.project.sections[1].name).toBe('Bメロ');
      expect(result.project.sections[2].name).toBe('サビ');
    });

    it('タイトルが空文字の場合エラー', async () => {
      const input = {
        title: '',
        sections: [],
      };

      await expect(useCase.execute(input)).rejects.toThrow();
      expect(mockProjectRepository.save).not.toHaveBeenCalled();
    });

    it('タイトルが空白のみの場合エラー', async () => {
      const input = {
        title: '   ',
        sections: [],
      };

      await expect(useCase.execute(input)).rejects.toThrow();
      expect(mockProjectRepository.save).not.toHaveBeenCalled();
    });

    it('存在しないジャンルIDが指定された場合エラー', async () => {
      const genreId = EntityId.generate();
      mockGenreRepository.findById = jest.fn().mockResolvedValue(null);

      const input = {
        title: 'テストプロジェクト',
        genreId,
        sections: [],
      };

      await expect(useCase.execute(input)).rejects.toThrow();
      expect(mockProjectRepository.save).not.toHaveBeenCalled();
    });

    it('リポジトリのsaveが呼ばれた時のプロジェクトが正しい', async () => {
      const input = {
        title: '  タイトル  ',
        sections: [],
      };

      await useCase.execute(input);

      expect(mockProjectRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          _title: 'タイトル', // trimされている
          _isDeleted: false,
          _deletedAt: null,
        })
      );
    });

    it('セクションのorderIndexが正しく設定される', async () => {
      const input = {
        title: 'テストプロジェクト',
        sections: [
          { name: 'セクション1' },
          { name: 'セクション2' },
          { name: 'セクション3' },
        ],
      };

      const result = await useCase.execute(input);

      expect(result.project.sections[0].orderIndex).toBe(0);
      expect(result.project.sections[1].orderIndex).toBe(1);
      expect(result.project.sections[2].orderIndex).toBe(2);
    });
  });
});
