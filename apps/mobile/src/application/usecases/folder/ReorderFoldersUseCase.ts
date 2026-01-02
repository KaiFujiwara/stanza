import { EntityId, FolderRepository } from '@stanza/core';
import { toUserMessage } from '@/lib/errors';

export type ReorderFoldersInput = {
  folderIds: string[];
};

export type ReorderFoldersOutput = void;

export class ReorderFoldersUseCase {
  constructor(private readonly folderRepository: FolderRepository) {}

  async execute(input: ReorderFoldersInput): Promise<ReorderFoldersOutput> {
    try {
      await this.folderRepository.reorder(input.folderIds.map(id => EntityId.from(id)));
    } catch (error) {
      const { userMessage, devMessage, stack, details } = toUserMessage(error);
      console.error('[ReorderFoldersUseCase] Error:', { devMessage, stack, details });
      throw new Error(userMessage);
    }
  }
}
