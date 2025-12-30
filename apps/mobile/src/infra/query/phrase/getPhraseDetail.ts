/**
 * フレーズ詳細を取得するクエリサービス
 */
import { supabase } from '@/lib/supabase/client';
import type { PhraseDetail, PhraseWithTagsView } from './types';

/**
 * フレーズ詳細を取得
 */
export async function getPhraseDetail(
  phraseId: string
): Promise<PhraseDetail | null> {
  const { data: user } = await supabase.auth.getUser();
  if (!user.user) {
    throw new Error('User not authenticated');
  }

  const { data, error } = await supabase
    .from('phrases_with_tags')
    .select('*')
    .eq('id', phraseId)
    .eq('user_id', user.user.id)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      // Not found
      return null;
    }
    throw new Error(`Failed to fetch phrase detail: ${error.message}`);
  }

  const row = data as PhraseWithTagsView;

  return {
    id: row.id,
    text: row.text,
    note: row.note,
    tags: row.tags,
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at),
  };
}
