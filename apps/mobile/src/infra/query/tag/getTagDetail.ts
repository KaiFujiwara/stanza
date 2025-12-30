/**
 * タグ詳細を取得するクエリサービス
 */
import { supabase } from '@/lib/supabase/client';
import type { Tag, TagRow } from './types';

/**
 * タグ詳細を取得
 */
export async function getTagDetail(tagId: string): Promise<Tag | null> {
  const { data: user } = await supabase.auth.getUser();
  if (!user.user) {
    throw new Error('User not authenticated');
  }

  const { data, error } = await supabase
    .from('tags')
    .select('*')
    .eq('id', tagId)
    .eq('user_id', user.user.id)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      // Not found
      return null;
    }
    throw new Error(`Failed to fetch tag detail: ${error.message}`);
  }

  const row = data as TagRow;

  return {
    id: row.id,
    name: row.name,
    color: row.color,
  };
}
