import {
  Project,
  Section,
  EntityId,
  DomainError,
  ErrorCode,
} from '@lyrics-notes/core';
import { projectRepository } from '@/infra/repositories/ProjectRepository';
import { genreRepository } from '@/infra/repositories/GenreRepository';
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
        const genre = await genreRepository.findById(genreId);
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

      // Projectエンティティを作成（orderIndex=0で新規作成を示す）
      const project = Project.reconstruct(
        projectId,
        input.title.trim(),
        folderId,
        genreId,
        0, // PostgreSQL関数がorder_indexを自動採番
        sections,
        false,
        null
      );

      await projectRepository.save(project);

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

export const createProjectUseCase = new CreateProjectUseCase();
