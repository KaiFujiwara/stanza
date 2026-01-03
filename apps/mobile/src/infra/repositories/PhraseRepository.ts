// Repository implementation
import { supabase } from '@/lib/supabase/client';
import { getCurrentUserId } from '@/lib/supabase/auth';
import {
  EntityId,
  Phrase,
  PhraseRepository as PhraseRepositoryPort,
} from '@stanza/core';

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
      throw new Error('Failed to fetch phrase tags', { cause: error });
    }

    return (data as Pick<PhraseTagRow, 'tag_id'>[]).map((row) => row.tag_id);
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

  async findById(id: EntityId): Promise<Phrase | null> {
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
      throw new Error('Failed to fetch phrase', { cause: error });
    }

    const tagIds = await this.getTagIds(id as string);
    return this.rowToEntity(data as PhraseRow, tagIds);
  }

  async save(phrase: Phrase): Promise<void> {
    const userId = await getCurrentUserId();

    // トランザクション内で実行
    const { error } = await supabase.rpc('save_phrase_with_tags', {
      p_note: phrase.note ?? null,
      p_phrase_id: phrase.id,
      p_tag_ids: phrase.tagIds,
      p_text: phrase.text,
      p_user_id: userId,
    });

    if (error) {
      throw new Error('Failed to save phrase', { cause: error });
    }
  }


  async delete(id: EntityId): Promise<void> {
    const userId = await getCurrentUserId();

    // phrase_tagsのON DELETE CASCADEにより、phrasesレコード削除時に自動削除される
    const { error } = await supabase
      .from(this.tableName)
      .delete()
      .eq('id', id as string)
      .eq('user_id', userId);

    if (error) {
      throw new Error('Failed to delete phrase', { cause: error });
    }
  }

  async countByUser(): Promise<number> {
    const userId = await getCurrentUserId();

    const { count, error } = await supabase
      .from(this.tableName)
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId);

    if (error) {
      throw new Error('Failed to count phrases', { cause: error });
    }

    return count ?? 0;
  }
}

// シングルトンインスタンス
export const phraseRepository = new PhraseRepository();
