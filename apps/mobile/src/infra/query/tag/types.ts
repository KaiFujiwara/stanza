/**
 * TagQueryService - 型定義
 */

// ============================================================================
// DTOs (Data Transfer Objects)
// ============================================================================

export interface Tag {
  id: string;
  name: string;
  color: string | null;
}

// ============================================================================
// Internal Types (DB Row Types)
// ============================================================================

export type TagRow = {
  id: string;
  user_id: string;
  name: string;
  color: string | null;
  created_at: string;
  updated_at: string;
};
