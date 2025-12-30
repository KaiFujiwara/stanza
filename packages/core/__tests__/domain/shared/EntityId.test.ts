import { resetMockUuidCounter } from '../../setup/mockUuid';
import { EntityId } from '../../../src/domain/shared/EntityId';

describe('EntityId', () => {
  beforeEach(() => {
    resetMockUuidCounter();
    jest.clearAllMocks();
  });

  describe('generate', () => {
    it('UUID形式の文字列を生成する', () => {
      const id = EntityId.generate();
      expect(EntityId.isValid(id)).toBe(true);
    });

    it('呼び出すたびに異なるIDを生成する', () => {
      const id1 = EntityId.generate();
      const id2 = EntityId.generate();
      expect(id1).not.toBe(id2);
    });

    it('生成されたIDはハイフン区切りのUUID v4形式', () => {
      const id = EntityId.generate();
      // UUID v4形式: xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx
      expect(id).toMatch(
        /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
      );
    });
  });

  describe('from', () => {
    it('有効なUUIDから変換できる', () => {
      const uuid = '550e8400-e29b-41d4-a716-446655440000';
      const id = EntityId.from(uuid);
      expect(id).toBe(uuid);
    });

    it('大文字のUUIDも受け入れる', () => {
      const uuid = '550E8400-E29B-41D4-A716-446655440000';
      expect(() => EntityId.from(uuid)).not.toThrow();
    });

    it('前後の空白をトリムする', () => {
      const uuid = '  550e8400-e29b-41d4-a716-446655440000  ';
      const id = EntityId.from(uuid);
      expect(id).toBe('550e8400-e29b-41d4-a716-446655440000');
    });

    it('空文字はエラー', () => {
      expect(() => EntityId.from('')).toThrow('IDを指定してください');
    });

    it('空白のみの文字列はエラー', () => {
      expect(() => EntityId.from('   ')).toThrow('IDを指定してください');
    });

    it('無効なUUIDはエラー', () => {
      expect(() => EntityId.from('invalid')).toThrow(
        'UUID形式で指定してください'
      );
    });

    it('ハイフンなしのUUIDはエラー', () => {
      expect(() => EntityId.from('550e8400e29b41d4a716446655440000')).toThrow(
        'UUID形式で指定してください'
      );
    });

    it('不完全なUUIDはエラー', () => {
      expect(() => EntityId.from('550e8400-e29b-41d4')).toThrow(
        'UUID形式で指定してください'
      );
    });
  });

  describe('isValid', () => {
    it('有効なUUIDはtrue', () => {
      expect(EntityId.isValid('550e8400-e29b-41d4-a716-446655440000')).toBe(
        true
      );
    });

    it('大文字のUUIDもtrue', () => {
      expect(EntityId.isValid('550E8400-E29B-41D4-A716-446655440000')).toBe(
        true
      );
    });

    it('generateで生成したIDはtrue', () => {
      const id = EntityId.generate();
      expect(EntityId.isValid(id)).toBe(true);
    });

    it('無効な文字列はfalse', () => {
      expect(EntityId.isValid('invalid')).toBe(false);
    });

    it('空文字はfalse', () => {
      expect(EntityId.isValid('')).toBe(false);
    });

    it('空白のみの文字列はfalse', () => {
      expect(EntityId.isValid('   ')).toBe(false);
    });

    it('ハイフンなしのUUIDはfalse', () => {
      expect(EntityId.isValid('550e8400e29b41d4a716446655440000')).toBe(false);
    });

    it('不完全なUUIDはfalse', () => {
      expect(EntityId.isValid('550e8400-e29b-41d4')).toBe(false);
    });

    it('非文字列（数値）はfalse', () => {
      expect(EntityId.isValid(123)).toBe(false);
    });

    it('非文字列（null）はfalse', () => {
      expect(EntityId.isValid(null)).toBe(false);
    });

    it('非文字列（undefined）はfalse', () => {
      expect(EntityId.isValid(undefined)).toBe(false);
    });

    it('非文字列（オブジェクト）はfalse', () => {
      expect(EntityId.isValid({})).toBe(false);
    });

    it('非文字列（配列）はfalse', () => {
      expect(EntityId.isValid([])).toBe(false);
    });
  });

  describe('型安全性', () => {
    it('fromで生成したIDはEntityId型として扱える', () => {
      const uuid = '550e8400-e29b-41d4-a716-446655440000';
      const id = EntityId.from(uuid);

      // 型チェック（実行時は何もしない）
      const acceptEntityId = (id: ReturnType<typeof EntityId.from>) => id;
      expect(acceptEntityId(id)).toBe(uuid);
    });

    it('generateで生成したIDはEntityId型として扱える', () => {
      const id = EntityId.generate();

      // 型チェック（実行時は何もしない）
      const acceptEntityId = (id: ReturnType<typeof EntityId.generate>) => id;
      expect(acceptEntityId(id)).toBe(id);
    });
  });
});
