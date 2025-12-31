import { Folder } from '@lyrics-notes/core';
import { folderRepository } from '@/infra/repositories/FolderRepository';
import { toUserMessage } from '@/lib/errors';

export type CreateFolderInput = {
  name: string;
};

export type CreateFolderOutput = {
  folder: Folder;
};

export class CreateFolderUseCase {
  async execute(input: CreateFolderInput): Promise<CreateFolderOutput> {
    try {
      // orderIndex=0 でエンティティを作成すると、save メソッド内で PostgreSQL 関数が呼ばれる
      const folder = Folder.create(input.name);
      await folderRepository.save(folder);

      return { folder };
    } catch (error) {
      const { userMessage, devMessage, stack, details } = toUserMessage(error);
      console.error('[CreateFolderUseCase] Error:', { devMessage, stack, details });
      throw new Error(userMessage);
    }
  }
}

export const createFolderUseCase = new CreateFolderUseCase();
