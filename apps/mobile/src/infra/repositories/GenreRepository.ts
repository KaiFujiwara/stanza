// Repository implementation
import { supabase } from '@/lib/supabase/client';
import { getCurrentUserId } from '@/lib/supabase/auth';
import {
  EntityId,
  Genre,
  GenreRepository as GenreRepositoryPort,
} from '@stanza/core';

type GenreRow = {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  section_names: string[];
  created_at: string;
  updated_at: string;
};

export class GenreRepository implements GenreRepositoryPort {
  private readonly tableName = 'genres';

  private rowToEntity(row: GenreRow): Genre {
    return Genre.reconstruct(
      EntityId.from(row.id),
      row.name,
      row.description ?? undefined,
      row.section_names
    );
  }

  async findById(id: EntityId): Promise<Genre | null> {
    const userId = await getCurrentUserId();

    const { data, error } = await supabase
      .from(this.tableName)
      .select('*')
      .eq('id', id as string)
      .eq('user_id', userId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // Not found
        return null;
      }
      throw new Error('Failed to fetch genre', { cause: error });
    }

    return this.rowToEntity(data as GenreRow);
  }

  async save(genre: Genre): Promise<void> {
    const userId = await getCurrentUserId();

    const payload = {
      id: genre.id as string,
      user_id: userId,
      name: genre.name as string,
      description: genre.description ?? null,
      section_names: [...genre.sectionNames],
      // created_at, updated_at はDBトリガーで自動管理
    };

    const { error } = await supabase
      .from(this.tableName)
      .upsert(payload);

    if (error) {
      throw new Error('Failed to save genre', { cause: error });
    }
  }

  async delete(id: EntityId): Promise<void> {
    const userId = await getCurrentUserId();

    const { error } = await supabase
      .from(this.tableName)
      .delete()
      .eq('id', id as string)
      .eq('user_id', userId);

    if (error) {
      throw new Error('Failed to delete genre', { cause: error });
    }
  }

  async countByUser(): Promise<number> {
    const userId = await getCurrentUserId();

    const { count, error } = await supabase
      .from(this.tableName)
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId);

    if (error) {
      throw new Error('Failed to count genres', { cause: error });
    }

    return count ?? 0;
  }
}

// シングルトンインスタンス
export const genreRepository = new GenreRepository();
