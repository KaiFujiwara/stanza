// Repository implementation
import {
  Project,
  ProjectRepository as ProjectRepositoryPort,
  EntityId,
} from '@lyrics-notes/core';
import { supabase } from '@/lib/supabase/client';

type ProjectRow = {
  id: string;
  user_id: string;
  title: string;
  folder_id: string | null;
  genre_id: string | null;
  order_index: number;
  is_deleted: boolean;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
};

export class ProjectRepository implements ProjectRepositoryPort {
  private readonly tableName = 'projects';

  private rowToEntity(row: ProjectRow): Project {
    return Project.reconstruct(
      EntityId.from(row.id),
      row.title,
      row.folder_id ? EntityId.from(row.folder_id) : undefined,
      row.genre_id ? EntityId.from(row.genre_id) : undefined,
      row.order_index,
      [], // sections - 別途取得
      row.is_deleted,
      row.deleted_at ? new Date(row.deleted_at) : null
    );
  }

  async findById(id: EntityId): Promise<Project | null> {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) {
      throw new Error('User not authenticated');
    }

    const { data, error } = await supabase
      .from(this.tableName)
      .select('*')
      .eq('id', id as string)
      .eq('user_id', user.user.id)
      .eq('is_deleted', false)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // Not found
        return null;
      }
      throw new Error('Failed to fetch project', { cause: error });
    }

    return this.rowToEntity(data as ProjectRow);
  }

  async save(project: Project): Promise<void> {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) {
      throw new Error('User not authenticated');
    }

    // セクションのペイロードを作成
    const sections = project.sections.map((section) => ({
      id: section.id as string,
      name: section.name as string,
      order_index: section.orderIndex,
      content: section.content as string,
    }));

    // orderIndex が 0 の場合は新規作成として PostgreSQL 関数を使用
    if (project.orderIndex === 0) {
      const { error } = await supabase.rpc('create_project_with_sections', {
        p_project_id: project.id as string,
        p_user_id: user.user.id,
        p_title: project.title as string,
        p_folder_id: project.folderId ? (project.folderId as string) : null,
        p_genre_id: project.genreId ? (project.genreId as string) : null,
        p_sections: sections,
      });

      if (error) {
        throw new Error('Failed to create project with sections', { cause: error });
      }
      return;
    }

    // orderIndex が 0 以外の場合は既存プロジェクトの更新（トランザクション内でセクションも保存）
    const { error } = await supabase.rpc('save_project_with_sections', {
      p_project_id: project.id as string,
      p_user_id: user.user.id,
      p_title: project.title as string,
      p_folder_id: project.folderId ? (project.folderId as string) : null,
      p_genre_id: project.genreId ? (project.genreId as string) : null,
      p_order_index: project.orderIndex,
      p_is_deleted: project.isDeleted,
      p_deleted_at: project.deletedAt?.toISOString() ?? null,
      p_sections: sections,
    });

    if (error) {
      throw new Error('Failed to save project with sections', { cause: error });
    }
  }

  async reorder(projectIds: EntityId[], folderId?: EntityId): Promise<void> {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) {
      throw new Error('User not authenticated');
    }

    // 各プロジェクトのorder_indexを個別に更新
    const updates = projectIds.map((projectId, index) => {
      let query = supabase
        .from(this.tableName)
        .update({
          order_index: index,
          // updated_at はDBトリガーで自動更新
        })
        .eq('id', projectId as string)
        .eq('user_id', user.user.id);

      // folder_idでフィルタリング
      if (folderId) {
        query = query.eq('folder_id', folderId as string);
      } else {
        query = query.is('folder_id', null);
      }

      return query;
    });

    const results = await Promise.all(updates);

    // いずれかの更新でエラーが発生した場合
    const errors = results.filter((result) => result.error);
    if (errors.length > 0) {
      throw new Error('Failed to reorder projects', { cause: errors });
    }
  }

  async delete(id: EntityId): Promise<void> {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) {
      throw new Error('User not authenticated');
    }

    const { error } = await supabase
      .from(this.tableName)
      .update({
        is_deleted: true,
        deleted_at: new Date().toISOString(),
        // updated_at はDBトリガーで自動更新
      })
      .eq('id', id as string)
      .eq('user_id', user.user.id);

    if (error) {
      throw new Error('Failed to delete project', { cause: error });
    }
  }
}

// シングルトンインスタンス
export const projectRepository = new ProjectRepository();
