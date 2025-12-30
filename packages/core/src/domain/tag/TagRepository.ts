import { Tag } from './Tag';

export interface TagRepository {
  findById(id: string): Promise<Tag | null>;
  save(tag: Tag): Promise<void>;
  delete(id: string): Promise<void>;
}
