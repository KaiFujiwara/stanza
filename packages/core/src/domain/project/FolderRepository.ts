import { Folder } from './Folder';

export interface FolderRepository {
  findAll(): Promise<Folder[]>;
  findById(id: string): Promise<Folder | null>;
  save(folder: Folder): Promise<void>;
  delete(id: string): Promise<boolean>;
  reorder(folderIds: string[]): Promise<void>;
}
