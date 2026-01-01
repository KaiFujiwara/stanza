import { Tag } from '../../../src/domain/tag/Tag';
import { EntityId } from '../../../src/domain/shared/EntityId';
import { DomainError } from '../../../src/domain/shared/errors/DomainError';

describe('Tag', () => {
  describe('create', () => {
    it('正常にタグを作成できる', () => {
      const tag = Tag.create('ラブソング');

      expect(EntityId.isValid(tag.id)).toBe(true);
      expect(tag.name).toBe('ラブソング');
      expect(tag.color).toBeUndefined();
    });

    it('色付きでタグを作成できる', () => {
      const tag = Tag.create('ラブソング', '#FF0000');
      expect(tag.color).toBe('#FF0000');
    });

    it('色コードは小文字でも大文字でもOK', () => {
      const tagLower = Tag.create('タグA', '#ff0000');
      const tagUpper = Tag.create('タグB', '#FF0000');

      expect(tagLower.color).toBe('#FF0000');
      expect(tagUpper.color).toBe('#FF0000');
    });

    it('前後の空白はトリムされる', () => {
      const tag = Tag.create('  ラブソング  ');
      expect(tag.name).toBe('ラブソング');
    });

    it('無効なタグ名の場合エラー', () => {
      expect(() => Tag.create('')).toThrow(DomainError);
    });

    it('無効な色コードの場合エラー', () => {
      expect(() => Tag.create('タグ', 'red')).toThrow(DomainError);
      expect(() => Tag.create('タグ', '#GGGGGG')).toThrow(DomainError);
      expect(() => Tag.create('タグ', '#FFF')).toThrow(DomainError);
    });
  });

  describe('reconstruct', () => {
    it('既存データから正常に復元できる', () => {
      const id = EntityId.generate();
      const tag = Tag.reconstruct(id, 'バラード', '#00FF00');

      expect(tag.id).toBe(id);
      expect(tag.name).toBe('バラード');
      expect(tag.color).toBe('#00FF00');
    });

    it('色なしで復元できる', () => {
      const tag = Tag.reconstruct(EntityId.generate(), 'アップテンポ', undefined);
      expect(tag.color).toBeUndefined();
    });

    it('無効なタグ名では復元できない', () => {
      expect(() => Tag.reconstruct(EntityId.generate(), '', undefined)).toThrow(DomainError);
    });

    it('無効な色コードでは復元できない', () => {
      expect(() => Tag.reconstruct(EntityId.generate(), 'タグ', 'invalid'))
        .toThrow(DomainError);
    });
  });

  describe('updateName', () => {
    it('タグ名を更新できる', () => {
      const tag = Tag.create('ラブソング');
      tag.updateName('バラード');

      expect(tag.name).toBe('バラード');
    });

    it('前後の空白はトリムされる', () => {
      const tag = Tag.create('ラブソング');
      tag.updateName('  アップテンポ  ');

      expect(tag.name).toBe('アップテンポ');
    });

    it('無効なタグ名の場合エラー', () => {
      const tag = Tag.create('ラブソング');
      expect(() => tag.updateName('')).toThrow(DomainError);
    });
  });

  describe('updateColor', () => {
    it('色を更新できる', () => {
      const tag = Tag.create('ラブソング');
      tag.updateColor('#FF0000');

      expect(tag.color).toBe('#FF0000');
    });

    it('色を削除できる（undefined）', () => {
      const tag = Tag.create('ラブソング', '#FF0000');
      tag.updateColor(undefined);

      expect(tag.color).toBeUndefined();
    });

    it('色を削除できる（空文字）', () => {
      const tag = Tag.create('ラブソング', '#FF0000');
      tag.updateColor('');

      expect(tag.color).toBeUndefined();
    });

    it('無効な色コードの場合エラー', () => {
      const tag = Tag.create('ラブソング');
      expect(() => tag.updateColor('red')).toThrow(DomainError);
      expect(() => tag.updateColor('#GGGGGG')).toThrow(DomainError);
    });
  });
});
