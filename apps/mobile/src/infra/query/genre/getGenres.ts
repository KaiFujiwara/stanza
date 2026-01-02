/**
 * ジャンル一覧を取得するクエリサービス
 */
import { supabase } from '@/lib/supabase/client';
import type { GenreListItem, GenreRow } from './types';

/**
 * ジャンル一覧を取得（作成日時順）
 */
export async function getGenres(): Promise<GenreListItem[]> {
  const { data: user } = await supabase.auth.getUser();
  if (!user.user) {
    throw new Error('User not authenticated');
  }

  const { data, error } = await supabase
    .from('genres')
    .select('*')
    .eq('user_id', user.user.id)
    .order('created_at', { ascending: true });

  if (error) {
    throw new Error(`Failed to fetch genres: ${error.message}`);
  }

  const genres = data as GenreRow[];

  return genres.map((genre) => ({
    id: genre.id,
    name: genre.name,
    description: genre.description,
    sectionCount: genre.section_names.length,
    sectionNames: genre.section_names,
  }));
}
