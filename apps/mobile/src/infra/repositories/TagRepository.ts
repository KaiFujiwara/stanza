// Repository implementation
import { supabase } from '@/lib/supabase/client';
import {
  EntityId,
  Tag,
  TagNameValue,
  TagRepository as TagRepositoryPort,
} from '@stanza/core';

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
      throw new Error('Failed to fetch tag', { cause: error });
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
      // UNIQUE制約違反（タグ名重複）
      if (error.code === '23505') {
        throw new Error(`Duplicate tag name: ${tag.name}`, { cause: error });
      }
      throw new Error('Failed to save tag', { cause: error });
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
      throw new Error('Failed to delete tag', { cause: error });
    }
  }

  async countByUser(): Promise<number> {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) {
      throw new Error('User not authenticated');
    }

    const { count, error } = await supabase
      .from(this.tableName)
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.user.id);

    if (error) {
      throw new Error('Failed to count tags', { cause: error });
    }

    return count ?? 0;
  }

  async existsByName(name: TagNameValue): Promise<boolean> {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) {
      throw new Error('User not authenticated');
    }

    // 完全一致で検索（大文字小文字を区別する）
    const { data, error } = await supabase
      .from(this.tableName)
      .select('id')
      .eq('user_id', user.user.id)
      .eq('name', name)
      .limit(1);

    if (error) {
      throw new Error('Failed to check tag name', { cause: error });
    }

    return (data?.length ?? 0) > 0;
  }
}

// シングルトンインスタンス
export const tagRepository = new TagRepository();
