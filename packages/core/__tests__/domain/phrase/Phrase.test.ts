import { Phrase } from '../../../src/domain/phrase/Phrase';
import { EntityId } from '../../../src/domain/shared/EntityId';
import { DomainError } from '../../../src/domain/shared/errors/DomainError';

describe('Phrase', () => {
  describe('create', () => {
    it('正常にフレーズを作成できる', () => {
      const phrase = Phrase.create('心に残る一言');

      expect(EntityId.isValid(phrase.id)).toBe(true);
      expect(phrase.text).toBe('心に残る一言');
      expect(phrase.note).toBeUndefined();
      expect(phrase.tagIds).toEqual([]);
    });

    it('メモ付きで作成できる', () => {
      const phrase = Phrase.create('心に残る一言', { note: 'サビに使えそう' });
      expect(phrase.note).toBe('サビに使えそう');
    });

    it('タグ付きで作成できる', () => {
      const phrase = Phrase.create('心に残る一言', { tagIds: ['tag-1', 'tag-2'] });
      expect(phrase.tagIds).toEqual(['tag-1', 'tag-2']);
    });

    it('メモとタグの両方を指定して作成できる', () => {
      const phrase = Phrase.create('心に残る一言', {
        note: 'サビに使えそう',
        tagIds: ['tag-1'],
      });

      expect(phrase.note).toBe('サビに使えそう');
      expect(phrase.tagIds).toEqual(['tag-1']);
    });

    it('無効なテキストの場合エラー', () => {
      expect(() => Phrase.create('')).toThrow(DomainError);
    });
  });

  describe('reconstruct', () => {
    it('既存データから正常に復元できる', () => {
      const id = EntityId.generate();
      const phrase = Phrase.reconstruct(id, 'テストフレーズ', 'メモ', ['tag-1']);

      expect(phrase.id).toBe(id);
      expect(phrase.text).toBe('テストフレーズ');
      expect(phrase.note).toBe('メモ');
      expect(phrase.tagIds).toEqual(['tag-1']);
    });

    it('メモなしで復元できる', () => {
      const phrase = Phrase.reconstruct(EntityId.generate(), 'テスト', undefined, []);
      expect(phrase.note).toBeUndefined();
    });

    it('タグなしで復元できる', () => {
      const phrase = Phrase.reconstruct(EntityId.generate(), 'テスト', 'メモ', []);
      expect(phrase.tagIds).toEqual([]);
    });

    it('無効なテキストでは復元できない', () => {
      expect(() => Phrase.reconstruct(EntityId.generate(), '', undefined, []))
        .toThrow(DomainError);
    });
  });

  describe('updateText', () => {
    it('テキストを更新できる', () => {
      const phrase = Phrase.create('元のテキスト');
      phrase.updateText('新しいテキスト');

      expect(phrase.text).toBe('新しいテキスト');
    });

    it('無効なテキストの場合エラー', () => {
      const phrase = Phrase.create('テスト');
      expect(() => phrase.updateText('')).toThrow(DomainError);
    });
  });

  describe('updateNote', () => {
    it('メモを更新できる', () => {
      const phrase = Phrase.create('テスト');
      phrase.updateNote('新しいメモ');

      expect(phrase.note).toBe('新しいメモ');
    });

    it('メモを削除できる（undefined）', () => {
      const phrase = Phrase.create('テスト', { note: 'メモ' });
      phrase.updateNote(undefined);

      expect(phrase.note).toBeUndefined();
    });

    it('メモを削除できる（空文字）', () => {
      const phrase = Phrase.create('テスト', { note: 'メモ' });
      phrase.updateNote('');

      expect(phrase.note).toBeUndefined();
    });
  });

  describe('tagIds の正規化', () => {
    it('重複・空文字除去・trim を行う', () => {
      const phrase = Phrase.create('テスト', {
        tagIds: ['tag-1', 'tag-1', '', '  ', '  tag-2  ', 'tag-3'],
      });

      expect(phrase.tagIds).toEqual(['tag-1', 'tag-2', 'tag-3']);
    });
  });

  describe('setTags', () => {
    it('タグ配列を置き換えられる', () => {
      const phrase = Phrase.create('テスト', { tagIds: ['tag-1'] });
      phrase.setTags(['tag-2', 'tag-3']);

      expect(phrase.tagIds).toEqual(['tag-2', 'tag-3']);
    });

    it('setTags でも正規化される', () => {
      const phrase = Phrase.create('テスト');
      phrase.setTags(['tag-1', 'tag-1', '', '  tag-2  ']);

      expect(phrase.tagIds).toEqual(['tag-1', 'tag-2']);
    });

    it('タグを空にできる', () => {
      const phrase = Phrase.create('テスト', { tagIds: ['tag-1', 'tag-2'] });
      phrase.setTags([]);

      expect(phrase.tagIds).toEqual([]);
    });
  });

  describe('tagIds getter', () => {
    it('タグIDの配列コピーを返す（不変性）', () => {
      const tagIds = ['tag-1', 'tag-2'];
      const phrase = Phrase.create('テスト', { tagIds });

      const returnedTagIds = phrase.tagIds;
      expect(returnedTagIds).toEqual(tagIds);
      expect(returnedTagIds).not.toBe(tagIds); // 異なる配列インスタンス
    });
  });
});
