import { supabase } from '@/lib/supabase/client';
import { getCurrentUserId } from '@/lib/supabase/auth';
import { FolderWithCount } from './types';

/**
 * フォルダ一覧をプロジェクト数と共に取得
 * order_index順にソートされる
 */
export async function getFoldersWithCount(): Promise<FolderWithCount[]> {
  const userId = await getCurrentUserId();

  // フォルダ一覧を取得
  const { data: foldersData, error: foldersError } = await supabase
    .from('folders')
    .select('id, name, order_index')
    .eq('user_id', userId)
    .order('order_index', { ascending: true });

  if (foldersError) {
    throw new Error(`フォルダ一覧の取得に失敗しました: ${foldersError.message}`);
  }

  if (!foldersData) {
    return [];
  }

  // 各フォルダのプロジェクト数を取得
  const foldersWithCount = await Promise.all(
    foldersData.map(async (folder) => {
      const { count, error: countError } = await supabase
        .from('projects')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('folder_id', folder.id)
        .eq('is_deleted', false);

      if (countError) {
        console.error(`[getFoldersWithCount] フォルダ ${folder.id} のプロジェクト数取得エラー:`, countError);
      }

      return {
        id: folder.id,
        name: folder.name,
        orderIndex: folder.order_index,
        projectCount: count || 0,
      };
    })
  );

  return foldersWithCount;
}
