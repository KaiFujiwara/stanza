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

export type UpdateProjectInput = {
  id: string;
  title?: string;
  folderId?: string | null;
  genreId?: string | null;
  sections?: Array<{ id?: string; name: string; content?: string }>;
};

export type UpdateProjectOutput = {
  project: Project;
};

export class UpdateProjectUseCase {
  async execute(input: UpdateProjectInput): Promise<UpdateProjectOutput> {
    try {
      const projectId = EntityId.from(input.id);
      const project = await projectRepository.findById(projectId);

      if (!project) {
        throw new DomainError(ErrorCode.ENTITY_NOT_FOUND, 'Project not found', {
          entity: 'project',
          id: input.id,
        });
      }

      // タイトル更新
      if (input.title !== undefined) {
        if (!input.title.trim()) {
          throw new DomainError(ErrorCode.EMPTY_VALUE, 'Empty project title', {
            field: 'projectTitle',
          });
        }
        project.updateTitle(input.title.trim());
      }

      // フォルダ移動
      if (input.folderId !== undefined) {
        const folderId = input.folderId ? EntityId.from(input.folderId) : undefined;
        project.moveToFolder(folderId);
      }

      // ジャンル設定（nullまたは文字列が指定された場合のみ更新）
      if (input.genreId !== undefined) {
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

        project.setGenre(genreId);
      }

      // セクション更新（指定された場合のみ）
      if (input.sections !== undefined) {
        // セクションを作成または再構築して一括置き換え
        const sections = input.sections.map((sectionInput, index) => {
          if (sectionInput.id) {
            // 既存のセクション（IDがある場合）は再構築
            return Section.reconstruct(
              EntityId.from(sectionInput.id),
              projectId,
              sectionInput.name,
              index,
              sectionInput.content || ''
            );
          } else {
            // 新規セクション（IDがない場合）は作成
            const section = Section.create(projectId, sectionInput.name, index);
            if (sectionInput.content) {
              section.updateContent(sectionInput.content);
            }
            return section;
          }
        });
        project.setSections(sections);
      }

      await projectRepository.save(project);

      return { project };
    } catch (error) {
      const { userMessage, devMessage, stack, details } = toUserMessage(error);
      console.error('[UpdateProjectUseCase] Error:', {
        devMessage,
        stack,
        details,
      });
      throw new Error(userMessage);
    }
  }
}

export const updateProjectUseCase = new UpdateProjectUseCase();
