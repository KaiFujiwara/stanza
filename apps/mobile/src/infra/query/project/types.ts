/**
 * ProjectQueryService - 型定義
 */

// ============================================================================
// DTOs (Data Transfer Objects)
// ============================================================================

export interface ProjectListItem {
  id: string;
  title: string;
  folderId: string | null;
  folderName: string | null;
  genreId: string | null;
  genreName: string | null;
  orderIndex: number;
  updatedAt: Date;
}

export interface ProjectsOverview {
  folders: Array<{
    id: string;
    name: string;
    orderIndex: number;
    projectCount: number;
  }>;
  projects: ProjectListItem[];
}

export interface ProjectDetail {
  id: string;
  title: string;
  folderId: string | null;
  genreId: string | null;
  orderIndex: number;
  sections: Array<{
    id: string;
    name: string;
    orderIndex: number;
    content: string;
  }>;
  isDeleted: boolean;
  deletedAt: Date | null;
  updatedAt: Date;
  createdAt: Date;
}

// ============================================================================
// Internal Types (DB Row Types)
// ============================================================================

export type ProjectRow = {
  id: string;
  user_id: string;
  title: string;
  folder_id: string | null;
  genre_id: string | null;
  order_index: number;
  is_deleted: boolean;
  deleted_at: string | null;
  created_at: string;
  updated_at: string;
};

export type SectionRow = {
  id: string;
  project_id: string;
  name: string;
  order_index: number;
  content: string;
};

export type FolderRow = {
  id: string;
  user_id: string;
  name: string;
  order_index: number;
  created_at: string;
  updated_at: string;
};

export type ProjectWithJoins = {
  id: string;
  title: string;
  folder_id: string | null;
  genre_id: string | null;
  order_index: number;
  updated_at: string;
  folders: { name: string }[] | null;
  genres: { name: string }[] | null;
};
