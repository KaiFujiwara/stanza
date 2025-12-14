import { v4 as uuidv4, validate as uuidValidate } from 'uuid';

/**
 * エンティティIDの型
 * Opaque Typeパターンでブランド化することで、stringとの混在を防ぐ
 */
declare const entityIdBrand: unique symbol;
export type EntityId = string & { [entityIdBrand]: never };

/**
 * 型安全なID生成・検証ヘルパー
 */
export const EntityId = {
  /**
   * 新しいIDを生成
   */
  generate: (): EntityId => {
    return uuidv4() as EntityId;
  },

  /**
   * 既存の文字列からIDを作成（検証付き）
   */
  from: (value: string): EntityId => {
    const normalized = value.trim();
    if (!normalized) {
      throw new Error('IDを指定してください');
    }
    if (!uuidValidate(normalized)) {
      throw new Error('UUID形式で指定してください');
    }
    return normalized as EntityId;
  },

  /**
   * 値がUUID形式か検証
   */
  isValid: (value: unknown): value is EntityId => {
    if (typeof value !== 'string') {
      return false;
    }
    const normalized = value.trim();
    return normalized !== '' && uuidValidate(normalized);
  },
};
