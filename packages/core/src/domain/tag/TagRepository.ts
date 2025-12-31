import { EntityId } from '../shared/EntityId';
import { Tag } from './Tag';
import { TagNameValue } from './vo/TagName';

export interface TagRepository {
  findById(id: EntityId): Promise<Tag | null>;
  save(tag: Tag): Promise<void>;
  delete(id: EntityId): Promise<void>;
  countByUser(): Promise<number>;
  existsByName(name: TagNameValue): Promise<boolean>;
}
