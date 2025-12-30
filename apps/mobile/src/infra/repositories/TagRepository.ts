// Repository implementation
import {
  Tag,
  TagRepository as TagRepositoryPort,
  EntityId,
} from '@lyrics-notes/core';
import { supabase } from '@/lib/supabase/client';

type TagRow = {
  id: string;
  user_id: string;
  name: string;
  color: string | null;
  created_at: string;
  updated_at: string;
};

export class TagRepository implements TagRepositoryPort {
  private readonly tableName = 'tags';

  private rowToEntity(row: TagRow): Tag {
    return Tag.reconstruct(
      EntityId.from(row.id),
      row.name,
      row.color ?? undefined
    );
  }

  async findById(id: EntityId): Promise<Tag | null> {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) {
      throw new Error('User not authenticated');
    }

    const { data, error } = await supabase
      .from(this.tableName)
      .select('*')
      .eq('id', id as string)
      .eq('user_id', user.user.id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // Not found
        return null;
      }
      throw new Error(`Failed to fetch tag: ${error.message}`);
    }

    return this.rowToEntity(data as TagRow);
  }

  async save(tag: Tag): Promise<void> {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) {
      throw new Error('User not authenticated');
    }

    const payload = {
      id: tag.id as string,
      user_id: user.user.id,
      name: tag.name,
      color: tag.color ?? null,
      // created_at, updated_at はDBトリガーで自動管理
    };

    const { error } = await supabase
      .from(this.tableName)
      .upsert(payload);

    if (error) {
      throw new Error(`Failed to save tag: ${error.message}`);
    }
  }

  async delete(id: EntityId): Promise<void> {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) {
      throw new Error('User not authenticated');
    }

    // phrase_tagsのON DELETE CASCADEにより、tagsレコード削除時に自動削除される
    const { error } = await supabase
      .from(this.tableName)
      .delete()
      .eq('id', id as string)
      .eq('user_id', user.user.id);

    if (error) {
      throw new Error(`Failed to delete tag: ${error.message}`);
    }
  }
}

// シングルトンインスタンス
export const tagRepository = new TagRepository();
