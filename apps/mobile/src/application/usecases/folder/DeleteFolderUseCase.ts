import { EntityId, DomainError, ErrorCode, FolderRepository } from '@stanza/core';
import { toUserMessage } from '@/lib/errors';

export type DeleteFolderInput = {
  id: string;
};

export type DeleteFolderOutput = void;

export class DeleteFolderUseCase {
  constructor(private readonly folderRepository: FolderRepository) {}

  async execute(input: DeleteFolderInput): Promise<DeleteFolderOutput> {
    try {
      const folder = await this.folderRepository.findById(EntityId.from(input.id));
      if (!folder) {
        throw new DomainError(ErrorCode.ENTITY_NOT_FOUND, 'Folder not found', { entity: 'folder', folderId: input.id });
      }

      await this.folderRepository.delete(EntityId.from(input.id));
    } catch (error) {
      const { userMessage, devMessage, stack, details } = toUserMessage(error);
      console.error('[DeleteFolderUseCase] Error:', { devMessage, stack, details });
      throw new Error(userMessage);
    }
  }
}
