import { EntityId } from '@lyrics-notes/core';
import { folderRepository } from '@/infra/repositories/FolderRepository';
import { toUserMessage } from '@/lib/errors';

export type ReorderFoldersInput = {
  folderIds: string[];
};

export type ReorderFoldersOutput = void;

export class ReorderFoldersUseCase {
  async execute(input: ReorderFoldersInput): Promise<ReorderFoldersOutput> {
    try {
      await folderRepository.reorder(input.folderIds.map(id => EntityId.from(id)));
    } catch (error) {
      const { userMessage, devMessage, stack, details } = toUserMessage(error);
      console.error('[ReorderFoldersUseCase] Error:', { devMessage, stack, details });
      throw new Error(userMessage);
    }
  }
}

export const reorderFoldersUseCase = new ReorderFoldersUseCase();
