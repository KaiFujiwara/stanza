/**
 * getProjectsOverview - プロジェクト画面の初期表示用データ一括取得
 */

import { supabase } from '@/lib/supabase/client';
import { getCurrentUserId } from '@/lib/supabase/auth';
import type {
  ProjectsOverview,
  ProjectListItem,
  FolderRow,
  ProjectWithJoins,
} from './types';

export async function getProjectsOverview(): Promise<ProjectsOverview> {
  // ユーザーID取得
  const userId = await getCurrentUserId();

  // フォルダ一覧を取得
  const { data: foldersData, error: foldersError } = await supabase
    .from('folders')
    .select('*')
    .eq('user_id', userId)
    .order('order_index', { ascending: true });

  if (foldersError) {
    throw new Error(`フォルダの取得に失敗しました: ${foldersError.message}`);
  }

  const folders = foldersData as FolderRow[];

  // プロジェクト一覧を取得（フォルダ名・ジャンル名を含む）
  const { data: projectsData, error: projectsError } = await supabase
    .from('projects')
    .select(`
      id,
      title,
      folder_id,
      genre_id,
      order_index,
      updated_at,
      folders:folder_id (name),
      genres:genre_id (name)
    `)
    .eq('user_id', userId)
    .eq('is_deleted', false);

  if (projectsError) {
    throw new Error(`プロジェクトの取得に失敗しました: ${projectsError.message}`);
  }

  const projectsWithJoins = projectsData as ProjectWithJoins[];

  // フォルダごとのプロジェクト数を計算
  const projectCountByFolder = new Map<string, number>();
  for (const project of projectsWithJoins) {
    if (project.folder_id) {
      const count = projectCountByFolder.get(project.folder_id) || 0;
      projectCountByFolder.set(project.folder_id, count + 1);
    }
  }

  // DTOに変換
  const projects: ProjectListItem[] = projectsWithJoins.map(p => ({
    id: p.id,
    title: p.title,
    folderId: p.folder_id,
    folderName: (p.folders && p.folders.length > 0) ? p.folders[0].name : null,
    genreId: p.genre_id,
    genreName: (p.genres && p.genres.length > 0) ? p.genres[0].name : null,
    orderIndex: p.order_index,
    updatedAt: new Date(p.updated_at),
  }));

  return {
    folders: folders.map(f => ({
      id: f.id,
      name: f.name,
      orderIndex: f.order_index,
      projectCount: projectCountByFolder.get(f.id) || 0,
    })),
    projects,
  };
}
