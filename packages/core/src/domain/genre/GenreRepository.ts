import { Genre } from './Genre';

export interface GenreRepository {
  findById(id: string): Promise<Genre | null>;
  save(genre: Genre): Promise<void>;
  delete(id: string): Promise<void>;
}
