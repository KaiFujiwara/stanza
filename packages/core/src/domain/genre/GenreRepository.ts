import { Genre } from './Genre';
import { EntityId } from '../shared/EntityId';

export interface GenreRepository {
  findById(id: EntityId): Promise<Genre | null>;
  save(genre: Genre): Promise<void>;
  delete(id: EntityId): Promise<void>;
}
