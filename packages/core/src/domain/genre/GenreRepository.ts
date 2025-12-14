import { Genre } from './Genre';

export interface GenreRepository {
  findAll(): Promise<Genre[]>;
  findById(id: string): Promise<Genre | null>;
  search(query: string): Promise<Genre[]>;
  save(genre: Genre): Promise<void>;
  delete(id: string): Promise<boolean>;
}
