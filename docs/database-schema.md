# Firestore データモデル設計

SQLite 時代のテーブル設計を置き換え、アプリ要件（プロジェクト管理 / セクション構造 / タグ付け / フレーズストック / 将来の解析機能）を満たす Firestore スキーマを定義する。

## デザイン原則

- **1ユーザー = 1ツリー**: ルート `users/{userId}` 配下にすべてのデータを収め、マルチテナントを Firestore ルールで制御する。
- **階層 = 実世界の所有関係**: プロジェクト > セクション > 行の階層はサブコレクションで表現。フォルダ・タグなど横断的エンティティはユーザー直下のコレクションでフラット管理。
- **検索性能の担保**: `isDeleted`, `folderId`, `updatedAt` など頻出フィルタを単一フィールドで保持し、必要箇所にコンポジットインデックスを追加する。
- **オフラインと同期待ち**: 1ドキュメントが 10KB 以内に収まるよう、行データは細かく分割。多対多は `tagIds` 配列 + インデックスサブコレクションで両立。
- **将来の解析・共同編集に備える**: `lines` ドキュメントに `analysis` マップを事前に確保し、`activity` や `collaborators` などの拡張フィールドを許容。

## コレクションツリー概要

```
users/{userId}
 ├─ profile                # 表示名・設定
 ├─ folders/{folderId}
 ├─ tags/{tagId}
 ├─ genres/{genreId}
 ├─ phrases/{phraseId}
 │    └─ tagRefs/{tagId}   # 逆引き用 (任意)
 └─ projects/{projectId}
      ├─ sections/{sectionId}
      │    └─ lines/{lineId}
      ├─ tagRefs/{tagId}   # プロジェクト×タグの多対多
      └─ activity/{logId}  # 変更履歴・将来拡張
```

## ドキュメント仕様

### users/{userId}
| フィールド | 型 | 必須 | 説明 |
|------------|----|------|------|
| `email` | string | ✓ | Firebase Auth と同期 |
| `displayName` | string |  | 表示名 |
| `plan` | string |  | `free` / `pro` 等、将来の課金判定 |
| `createdAt` | Timestamp | ✓ | 作成日時 |
| `updatedAt` | Timestamp | ✓ | 最終更新 |

### folders コレクション
| フィールド | 型 | 必須 | 説明 |
|------------|----|------|------|
| `name` | string | ✓ | 1〜100文字 |
| `orderIndex` | number | ✓ | 並び順 |
| `color` | string |  | UI 用カラー |
| `projectCount` | number |  | 集計キャッシュ |
| `createdAt` / `updatedAt` | Timestamp | ✓ | タイムスタンプ |

### tags コレクション
| フィールド | 型 | 必須 | 説明 |
|------------|----|------|------|
| `name` | string | ✓ | ユニーク。Cloud Function で正規化 |
| `color` | string |  | HEX |
| `usage` | map |  | `projects`, `phrases` の件数カウンタ |
| `createdAt` / `updatedAt` | Timestamp | ✓ | |

### genres コレクション
| フィールド | 型 | 必須 | 説明 |
|------------|----|------|------|
| `name` | string | ✓ | 表示名 |
| `templateSections` | array<string> | ✓ | 例: `["intro","verse","chorus"]` |
| `isPreset` | boolean | ✓ | 既定テンプレか |
| `createdAt` / `updatedAt` | Timestamp | ✓ | |

### phrases コレクション
| フィールド | 型 | 必須 | 説明 |
|------------|----|------|------|
| `text` | string | ✓ | 1〜500文字 |
| `note` | string |  | 補足メモ |
| `tagIds` | array<string> |  | 関連タグ（最大 20） |
| `favorite` | boolean |  | お気に入りフラグ |
| `createdAt` / `updatedAt` | Timestamp | ✓ | |

補助サブコレクション `phrases/{phraseId}/tagRefs/{tagId}` を作ると、タグ別一覧や通知を安価に実装できる。必要に応じて Cloud Function で双方向同期。

### projects コレクション
| フィールド | 型 | 必須 | 説明 |
|------------|----|------|------|
| `title` | string | ✓ | 1〜200文字 |
| `folderId` | string |  | `folders` ドキュメントID |
| `genreId` | string |  | `genres` ドキュメントID |
| `tagIds` | array<string> |  | 包含検索用（最大 10） |
| `status` | string |  | `draft` / `in_progress` / `done` |
| `isDeleted` | boolean | ✓ | 論理削除 |
| `sectionCount` | number |  | キャッシュ |
| `createdAt` / `updatedAt` / `deletedAt` | Timestamp | `deletedAt` は削除時のみ |
| `titleLower` | string | ✓ | 単純検索用に小文字で保持 |

#### projects/{projectId}/sections サブコレクション
| フィールド | 型 | 必須 | 説明 |
|------------|----|------|------|
| `name` | string | ✓ | 表示名（例: "Aメロ1"） |
| `type` | string | ✓ | `verse` など SectionType |
| `orderIndex` | number | ✓ | 並び替え |
| `createdAt` / `updatedAt` | Timestamp | ✓ | |

#### sections/{sectionId}/lines サブコレクション
| フィールド | 型 | 必須 | 説明 |
|------------|----|------|------|
| `text` | string | ✓ | 歌詞本文 |
| `lineIndex` | number | ✓ | セクション内の並び |
| `analysis` | map |  | `{ moraCount: number, rhymeTail: string, phonemes: string[] }` |
| `annotations` | array<Map> |  | コメントやTODO |
| `createdAt` / `updatedAt` | Timestamp | ✓ | |

#### projects/{projectId}/tagRefs サブコレクション
| フィールド | 型 | 必須 | 説明 |
|------------|----|------|------|
| `name` | string | ✓ | デノーマライズ済み |
| `color` | string |  | 表示色 |
| `createdAt` | Timestamp | ✓ | 紐付け日時 |

Subcollection を持つことで「タグに付いたプロジェクトを最新順で表示」など複合クエリを安価に実現できる（`users/{userId}/tags/{tagId}/projectRefs/{projectId}` を用意するオプションも可）。

### 補助サブコレクション案
- `projects/{projectId}/activity/{logId}`: 変更履歴・将来のコラボ機能で利用。
- `projects/{projectId}/collaborators/{uid}`: 共有機能追加時に利用。

## クエリ & インデックス

| 用途 | コレクション | フィルタ / 並び替え | 必須インデックス |
|------|--------------|----------------------|------------------|
| プロジェクト一覧 | projects | `where("isDeleted","==",false).orderBy("updatedAt","desc")` | `isDeleted ASC, updatedAt DESC` |
| フォルダ別プロジェクト | projects | `where("folderId","==",X).where("isDeleted","==",false)` | `folderId ASC, isDeleted ASC` |
| タグ別一覧 | `tags/{tagId}/projectRefs` | `orderBy("createdAt","desc")` | 単一フィールドで OK |
| プロジェクト検索 | projects | `where("titleLower", ">=", key).where("titleLower", "<", key+'\uf8ff')` | `titleLower ASC` |
| フレーズ検索 | phrases | `orderBy("updatedAt","desc")` | 既定インデックス |
| ゴミ箱ビュー | projects | `where("isDeleted","==",true).orderBy("deletedAt","desc")` | `isDeleted ASC, deletedAt DESC` |

※ Index は Firebase Console で作成し、`firestore.indexes.json` にエクスポートして共有する。

## セキュリティルール（骨子）

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId}/{document=**} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }

    // 公開情報を将来追加する場合は例外ルールを別途定義
  }
}
```

追加ルール案:
- `request.resource.data.keys().hasOnly([...])` で不要なフィールドを防ぐ。
- `resource.data.tagIds.size() <= 10` など、配列制限をルールで保証。
- `request.time == request.resource.data.createdAt` を用いて作成・更新時の整合性を確保。

## マイグレーションメモ

1. SQLite から `projects`, `sections`, `lines`, `tags`, `phrases` を抽出し、ユーザー単位の JSON を作成。
2. Admin SDK で `users/{uid}` 以下へバルク書き込み（バッチ 500 件以内を厳守）。
3. Firestore Emulator でインデックス生成と整合性検証を実施。
4. アプリ側 Repository を逐次 Firestore 実装に置き換え、SQLite 依存を削除。

これにより、クライアントは Firebase SDK のみで CRUD が可能となり、オフライン永続化も標準機能で扱える。
