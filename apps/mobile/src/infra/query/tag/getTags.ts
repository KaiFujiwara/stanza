/**
 * タグ一覧を取得するクエリサービス
 */
import { supabase } from '@/lib/supabase/client';
import type { Tag, TagRow } from './types';

/**
 * タグ一覧を取得（作成日時順）
 */
export async function getTags(): Promise<Tag[]> {
  const { data: user } = await supabase.auth.getUser();
  if (!user.user) {
    throw new Error('User not authenticated');
  }

  const { data, error } = await supabase
    .from('tags')
    .select('*')
    .eq('user_id', user.user.id)
    .order('created_at', { ascending: true });

  if (error) {
    throw new Error(`Failed to fetch tags: ${error.message}`);
  }

  const tags = data as TagRow[];

  return tags.map((tag) => ({
    id: tag.id,
    name: tag.name,
    color: tag.color,
  }));
}
