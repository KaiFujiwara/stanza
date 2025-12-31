import { EntityId, DomainError, ErrorCode } from '@lyrics-notes/core';
import { folderRepository } from '@/infra/repositories/FolderRepository';
import { toUserMessage } from '@/lib/errors';

export type DeleteFolderInput = {
  id: string;
};

export type DeleteFolderOutput = void;

export class DeleteFolderUseCase {
  async execute(input: DeleteFolderInput): Promise<DeleteFolderOutput> {
    try {
      const folder = await folderRepository.findById(EntityId.from(input.id));
      if (!folder) {
        throw new DomainError(ErrorCode.ENTITY_NOT_FOUND, 'Folder not found', { entity: 'folder', folderId: input.id });
      }

      await folderRepository.delete(EntityId.from(input.id));
    } catch (error) {
      const { userMessage, devMessage, stack, details } = toUserMessage(error);
      console.error('[DeleteFolderUseCase] Error:', { devMessage, stack, details });
      throw new Error(userMessage);
    }
  }
}

export const deleteFolderUseCase = new DeleteFolderUseCase();
