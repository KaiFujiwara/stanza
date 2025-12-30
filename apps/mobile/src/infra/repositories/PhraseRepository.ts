// Repository implementation
import { supabase } from '@/lib/supabase/client';
import {
  EntityId,
  Phrase,
  PhraseRepository as PhraseRepositoryPort,
} from '@lyrics-notes/core';

type PhraseRow = {
  id: string;
  user_id: string;
  text: string;
  note: string | null;
  created_at: string;
  updated_at: string;
};

type PhraseTagRow = {
  id: string;
  phrase_id: string;
  tag_id: string;
  created_at: string;
};

export class PhraseRepository implements PhraseRepositoryPort {
  private readonly tableName = 'phrases';
  private readonly phraseTagsTableName = 'phrase_tags';

  /**
   * フレーズIDに紐づくタグIDを取得
   */
  private async getTagIds(phraseId: string): Promise<string[]> {
    const { data, error } = await supabase
      .from(this.phraseTagsTableName)
      .select('tag_id')
      .eq('phrase_id', phraseId);

    if (error) {
      throw new Error(`フレーズのタグ取得に失敗しました: ${error.message}`);
    }

    return (data as { tag_id: string }[]).map((row) => row.tag_id);
  }

  /**
   * DBレコード → エンティティ変換
   */
  private rowToEntity(row: PhraseRow, tagIds: string[]): Phrase {
    return Phrase.reconstruct(
      EntityId.from(row.id),
      row.text,
      row.note ?? undefined,
      tagIds
    );
  }

  async findById(id: string): Promise<Phrase | null> {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) {
      throw new Error('認証されていません');
    }

    const { data, error } = await supabase
      .from(this.tableName)
      .select('*')
      .eq('id', id)
      .eq('user_id', user.user.id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // Not found
        return null;
      }
      throw new Error(`フレーズの取得に失敗しました: ${error.message}`);
    }

    const tagIds = await this.getTagIds(id);
    return this.rowToEntity(data as PhraseRow, tagIds);
  }

  async save(phrase: Phrase): Promise<void> {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) {
      throw new Error('認証されていません');
    }

    // トランザクション内で実行
    const { error } = await supabase.rpc('save_phrase_with_tags', {
      p_note: phrase.note ?? null,
      p_phrase_id: phrase.id,
      p_tag_ids: phrase.tagIds,
      p_text: phrase.text,
      p_user_id: user.user.id,
    });

    if (error) {
      throw new Error(`フレーズの保存に失敗しました: ${error.message}`);
    }
  }


  async delete(id: string): Promise<void> {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) {
      throw new Error('認証されていません');
    }

    // phrase_tagsのON DELETE CASCADEにより、phrasesレコード削除時に自動削除される
    const { error } = await supabase
      .from(this.tableName)
      .delete()
      .eq('id', id)
      .eq('user_id', user.user.id);

    if (error) {
      throw new Error(`フレーズの削除に失敗しました: ${error.message}`);
    }
  }
}

// シングルトンインスタンス
export const phraseRepository = new PhraseRepository();
