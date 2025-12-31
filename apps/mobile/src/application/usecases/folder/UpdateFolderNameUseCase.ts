import { EntityId, DomainError, ErrorCode } from '@lyrics-notes/core';
import { folderRepository } from '@/infra/repositories/FolderRepository';
import { toUserMessage } from '@/lib/errors';

export type UpdateFolderNameInput = {
  id: string;
  name: string;
};

export type UpdateFolderNameOutput = void;

export class UpdateFolderNameUseCase {
  async execute(input: UpdateFolderNameInput): Promise<UpdateFolderNameOutput> {
    try {
      const folder = await folderRepository.findById(EntityId.from(input.id));
      if (!folder) {
        throw new DomainError(ErrorCode.ENTITY_NOT_FOUND, 'Folder not found', { entity: 'folder', folderId: input.id });
      }

      folder.updateName(input.name);
      await folderRepository.save(folder);
    } catch (error) {
      const { userMessage, devMessage, stack, details } = toUserMessage(error);
      console.error('[UpdateFolderNameUseCase] Error:', { devMessage, stack, details });
      throw new Error(userMessage);
    }
  }
}

export const updateFolderNameUseCase = new UpdateFolderNameUseCase();
