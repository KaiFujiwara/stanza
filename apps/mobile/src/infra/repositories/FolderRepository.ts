import { Folder, FolderRepository as IFolderRepository, EntityId } from '@lyrics-notes/core';
import { supabase } from '@/lib/supabase/client';
import { getCurrentUserId } from '@/lib/supabase/auth';

type FolderRow = {
  id: string;
  user_id: string;
  name: string;
  order_index: number;
  created_at: string;
  updated_at: string;
};

export class FolderRepository implements IFolderRepository {
  private docToEntity(row: FolderRow): Folder {
    return Folder.reconstruct(
      EntityId.from(row.id),
      row.name,
      row.order_index
    );
  }

  async findById(id: EntityId): Promise<Folder | null> {
    const userId = await getCurrentUserId();

    const { data, error } = await supabase
      .from('folders')
      .select('*')
      .eq('id', id as string)
      .eq('user_id', userId)
      .single();

    if (error || !data) {
      return null;
    }

    return this.docToEntity(data);
  }

  async save(folder: Folder): Promise<void> {
    const userId = await getCurrentUserId();

    // orderIndex が 0 の場合は新規作成として PostgreSQL 関数を使用
    if (folder.orderIndex === 0) {
      const { error } = await supabase.rpc('create_folder', {
        p_user_id: userId,
        p_name: folder.name,
      });

      if (error) {
        throw new Error('Failed to create folder', { cause: error });
      }
      return;
    }

    // orderIndex が 0 以外の場合は既存フォルダの更新
    const now = new Date().toISOString();

    // 既存のフォルダかチェック
    const { data: existing } = await supabase
      .from('folders')
      .select('created_at')
      .eq('id', folder.id as string)
      .eq('user_id', userId)
      .single();

    const payload = {
      id: folder.id as string,
      user_id: userId,
      name: folder.name,
      order_index: folder.orderIndex,
      created_at: existing?.created_at || now,
      updated_at: now,
    };

    const { error } = await supabase
      .from('folders')
      .upsert(payload);

    if (error) {
      throw new Error('Failed to update folder', { cause: error });
    }
  }

  async reorder(folderIds: EntityId[]): Promise<void> {
    const userId = await getCurrentUserId();
    const now = new Date().toISOString();

    // Supabaseではバッチ更新の代わりに個別に更新
    const updates = folderIds.map((folderId, index) =>
      supabase
        .from('folders')
        .update({
          order_index: index + 1, // 1から開始
          updated_at: now
        })
        .eq('id', folderId as string)
        .eq('user_id', userId)
    );

    const results = await Promise.all(updates);

    // いずれかの更新でエラーが発生した場合
    const errors = results.filter(result => result.error);
    if (errors.length > 0) {
      throw new Error('Failed to reorder folders', { cause: errors });
    }
  }

  async delete(id: EntityId): Promise<void> {
    const userId = await getCurrentUserId();

    // PostgreSQL関数を呼び出し（トランザクション内で実行される）
    const { error } = await supabase.rpc('delete_folder_with_projects', {
      p_folder_id: id as string,
      p_user_id: userId,
    });

    if (error) {
      throw new Error('Failed to delete folder', { cause: error });
    }
  }

  async countByUser(): Promise<number> {
    const userId = await getCurrentUserId();

    const { count, error } = await supabase
      .from('folders')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId);

    if (error) {
      throw new Error('Failed to count folders', { cause: error });
    }

    return count ?? 0;
  }
}

// シングルトンインスタンス
export const folderRepository = new FolderRepository();
