/**
 * フレーズ一覧を取得するクエリサービス
 *
 * NOTE: フィルタリング・検索はクライアント側で実行する
 * （個人利用のため、データ量が少なくクライアント側処理の方が高速）
 */
import { supabase } from '@/lib/supabase/client';
import type { PhraseListItem, PhraseWithTagsView } from './types';

/**
 * フレーズ一覧を全件取得（タグ情報含む、更新日時降順）
 */
export async function getPhrases(): Promise<PhraseListItem[]> {
  const { data: user } = await supabase.auth.getUser();
  if (!user.user) {
    throw new Error('認証されていません');
  }

  const { data, error } = await supabase
    .from('phrases_with_tags')
    .select('*')
    .eq('user_id', user.user.id)
    .order('updated_at', { ascending: false });

  if (error) {
    throw new Error(`フレーズの取得に失敗しました: ${error.message}`);
  }

  return (data as PhraseWithTagsView[]).map((row) => ({
    id: row.id,
    text: row.text,
    note: row.note,
    tags: row.tags,
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at),
  }));
}

