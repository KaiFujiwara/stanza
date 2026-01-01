/**
 * ジャンル詳細を取得するクエリサービス
 */
import { supabase } from '@/lib/supabase/client';
import type { GenreDetail, GenreRow } from './types';

/**
 * ジャンル詳細を取得
 */
export async function getGenreDetail(id: string): Promise<GenreDetail | null> {
  const { data: user } = await supabase.auth.getUser();
  if (!user.user) {
    throw new Error('User not authenticated');
  }

  const { data, error } = await supabase
    .from('genres')
    .select('*')
    .eq('id', id)
    .eq('user_id', user.user.id)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      // Not found
      return null;
    }
    throw new Error(`Failed to fetch genre: ${error.message}`);
  }

  const genre = data as GenreRow;

  return {
    id: genre.id,
    name: genre.name,
    description: genre.description,
    sectionNames: genre.section_names,
    createdAt: genre.created_at,
    updatedAt: genre.updated_at,
  };
}
