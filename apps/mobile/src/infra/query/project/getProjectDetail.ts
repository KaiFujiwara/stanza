/**
 * getProjectDetail - プロジェクト詳細取得（セクション込み）
 */

import { supabase } from '@/lib/supabase/client';
import { getCurrentUserId } from '@/lib/supabase/auth';
import { EntityId, Project, Section } from '@stanza/core';
import type { ProjectRow, SectionRow } from './types';

export async function getProjectDetail(projectId: string): Promise<Project | null> {
  // ユーザーID取得
  const userId = await getCurrentUserId();

  // プロジェクト取得
  const { data: projectData, error: projectError } = await supabase
    .from('projects')
    .select('*')
    .eq('id', projectId)
    .eq('user_id', userId)
    .single();

  if (projectError) {
    if (projectError.code === 'PGRST116') {
      return null; // 見つからない
    }
    throw new Error(`プロジェクトの取得に失敗しました: ${projectError.message}`);
  }

  const project = projectData as ProjectRow;

  // セクション取得
  const { data: sectionsData, error: sectionsError } = await supabase
    .from('sections')
    .select('*')
    .eq('project_id', projectId)
    .order('order_index', { ascending: true });

  if (sectionsError) {
    throw new Error(`セクションの取得に失敗しました: ${sectionsError.message}`);
  }

  const sectionRows = (sectionsData || []) as SectionRow[];

  // Sectionエンティティを復元
  const sections = sectionRows.map((row) =>
    Section.reconstruct(
      EntityId.from(row.id),
      EntityId.from(row.project_id),
      row.name,
      row.order_index,
      row.content
    )
  );

  // Projectエンティティを復元
  return Project.reconstruct(
    EntityId.from(project.id),
    project.title,
    project.folder_id ? EntityId.from(project.folder_id) : undefined,
    project.genre_id ? EntityId.from(project.genre_id) : undefined,
    project.order_index,
    sections,
    project.is_deleted,
    project.deleted_at ? new Date(project.deleted_at) : null
  );
}
