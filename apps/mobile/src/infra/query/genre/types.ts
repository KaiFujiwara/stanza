/**
 * GenreQueryService - 型定義
 */

// ============================================================================
// DTOs (Data Transfer Objects)
// ============================================================================

export interface GenreListItem {
  id: string;
  name: string;
  description: string | null;
  sectionCount: number;
  sectionNames: string[];
}

export interface GenreDetail {
  id: string;
  name: string;
  description: string | null;
  sectionNames: string[];
  createdAt: string;
  updatedAt: string;
}

// ============================================================================
// Internal Types (DB Row Types)
// ============================================================================

export type GenreRow = {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  section_names: string[];
  created_at: string;
  updated_at: string;
};
