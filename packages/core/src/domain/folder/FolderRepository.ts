import { Folder } from './Folder';
import { EntityId } from '../shared/EntityId';

export interface FolderRepository {
  findById(id: EntityId): Promise<Folder | null>;
  save(folder: Folder): Promise<void>;
  reorder(folderIds: EntityId[]): Promise<void>;
  delete(id: EntityId): Promise<void>;
}
