import { Genre } from './Genre';

export interface GenrePresetRepository {
  findAll(): Promise<Genre[]>;
  findById(id: string): Promise<Genre | null>;
}
