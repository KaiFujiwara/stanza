/**
 * PhraseQueryService - 型定義
 */

// ============================================================================
// DTOs (Data Transfer Objects)
// ============================================================================

export interface TagInfo {
  id: string;
  name: string;
  color: string | null;
}

export interface PhraseListItem {
  id: string;
  text: string;
  note: string | null;
  tags: TagInfo[];
  createdAt: Date;
  updatedAt: Date;
}

export interface PhraseDetail {
  id: string;
  text: string;
  note: string | null;
  tags: TagInfo[];
  createdAt: Date;
  updatedAt: Date;
}

// ============================================================================
// Internal Types (DB Row Types)
// ============================================================================

export type PhraseRow = {
  id: string;
  user_id: string;
  text: string;
  note: string | null;
  created_at: string;
  updated_at: string;
};

export type PhraseTagRow = {
  id: string;
  phrase_id: string;
  tag_id: string;
  created_at: string;
};

export type TagRow = {
  id: string;
  user_id: string;
  name: string;
  color: string | null;
  created_at: string;
  updated_at: string;
};

/**
 * phrases_with_tags ビューの型
 */
export type PhraseWithTagsView = {
  id: string;
  user_id: string;
  text: string;
  note: string | null;
  created_at: string;
  updated_at: string;
  tags: Array<{
    id: string;
    name: string;
    color: string | null;
  }>;
};
