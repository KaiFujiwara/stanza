import {
  Project,
  Section,
  EntityId,
  DomainError,
  ErrorCode,
  ProjectRepository,
  GenreRepository,
} from '@stanza/core';
import { toUserMessage } from '@/lib/errors';

export type CreateProjectInput = {
  title: string;
  folderId?: string;
  genreId?: string;
  sections: Array<{ name: string }>;
};

export type CreateProjectOutput = {
  project: Project;
};

export class CreateProjectUseCase {
  constructor(
    private readonly projectRepository: ProjectRepository,
    private readonly genreRepository: GenreRepository
  ) {}

  async execute(input: CreateProjectInput): Promise<CreateProjectOutput> {
    try {
      if (!input.title.trim()) {
        throw new DomainError(ErrorCode.EMPTY_VALUE, 'Empty project title', {
          field: 'projectTitle',
        });
      }

      const folderId = input.folderId ? EntityId.from(input.folderId) : undefined;
      const genreId = input.genreId ? EntityId.from(input.genreId) : undefined;

      // ジャンルが指定されている場合、ジャンルの存在確認
      if (genreId) {
        const genre = await this.genreRepository.findById(genreId);
        if (!genre) {
          throw new DomainError(ErrorCode.ENTITY_NOT_FOUND, 'Genre not found', {
            entity: 'genre',
            id: genreId,
          });
        }
      }

      // 新しいプロジェクトのIDを生成（Sectionで必要）
      const projectId = EntityId.generate();

      // Sectionを作成
      const sections = input.sections.map((sectionInput, index) =>
        Section.create(projectId, sectionInput.name, index)
      );

      // Projectエンティティを作成
      const project = Project.create(
        input.title.trim(),
        folderId,
        genreId,
        0, // PostgreSQL関数がorder_indexを自動採番
        sections
      );

      await this.projectRepository.save(project);

      return { project };
    } catch (error) {
      const { userMessage, devMessage, stack, details } = toUserMessage(error);
      console.error('[CreateProjectUseCase] Error:', {
        devMessage,
        stack,
        details,
      });
      throw new Error(userMessage);
    }
  }
}
