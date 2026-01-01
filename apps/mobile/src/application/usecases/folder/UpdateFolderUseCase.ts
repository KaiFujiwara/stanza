import { EntityId, DomainError, ErrorCode, FolderRepository } from '@lyrics-notes/core';
import { toUserMessage } from '@/lib/errors';

export type UpdateFolderInput = {
  id: string;
  name: string;
};

export type UpdateFolderOutput = void;

export class UpdateFolderUseCase {
  constructor(private readonly folderRepository: FolderRepository) {}

  async execute(input: UpdateFolderInput): Promise<UpdateFolderOutput> {
    try {
      const folder = await this.folderRepository.findById(EntityId.from(input.id));
      if (!folder) {
        throw new DomainError(ErrorCode.ENTITY_NOT_FOUND, 'Folder not found', { entity: 'folder', folderId: input.id });
      }

      folder.updateName(input.name);
      await this.folderRepository.save(folder);
    } catch (error) {
      const { userMessage, devMessage, stack, details } = toUserMessage(error);
      console.error('[UpdateFolderUseCase] Error:', { devMessage, stack, details });
      throw new Error(userMessage);
    }
  }
}
