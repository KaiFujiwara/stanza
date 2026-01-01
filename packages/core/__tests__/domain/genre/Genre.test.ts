import { Genre } from '../../../src/domain/genre/Genre';
import { EntityId } from '../../../src/domain/shared/EntityId';
import { DomainError } from '../../../src/domain/shared/errors/DomainError';
import { ErrorCode } from '../../../src/domain/shared/errors/ErrorCode';
import { MAX_SECTIONS_PER_GENRE } from '../../../src/constants/limits';

describe('Genre', () => {
  describe('create', () => {
    it('正常にジャンルを作成できる', () => {
      const genre = Genre.create('ポップス');

      expect(EntityId.isValid(genre.id)).toBe(true);
      expect(genre.name).toBe('ポップス');
      expect(genre.description).toBeUndefined();
      expect(genre.sectionNames).toEqual([]);
    });

    it('説明付きで作成できる', () => {
      const genre = Genre.create('ポップス', { description: 'ポップな曲のテンプレート' });
      expect(genre.description).toBe('ポップな曲のテンプレート');
    });

    it('セクション名付きで作成できる', () => {
      const sectionNames = ['イントロ', 'Aメロ', 'サビ'];
      const genre = Genre.create('ポップス', { sectionNames });

      expect(genre.sectionNames.length).toBe(3);
      expect(genre.sectionNames).toEqual(['イントロ', 'Aメロ', 'サビ']);
    });

    it('説明とセクション名の両方を指定して作成できる', () => {
      const genre = Genre.create('ロック', {
        description: 'ロックの定番構成',
        sectionNames: ['イントロ', 'Aメロ', 'Bメロ', 'サビ'],
      });

      expect(genre.description).toBe('ロックの定番構成');
      expect(genre.sectionNames.length).toBe(4);
    });

    it('セクション数の上限ちょうどは作成できる', () => {
      const sectionNames = Array.from({ length: MAX_SECTIONS_PER_GENRE }, (_, i) => `セクション${i + 1}`);
      const genre = Genre.create('ポップス', { sectionNames });

      expect(genre.sectionNames.length).toBe(MAX_SECTIONS_PER_GENRE);
    });

    it('セクション数の上限を超えるとエラー', () => {
      const sectionNames = Array.from({ length: MAX_SECTIONS_PER_GENRE + 1 }, (_, i) => `セクション${i + 1}`);

      expect(() => Genre.create('ポップス', { sectionNames })).toThrow(DomainError);
      expect(() => Genre.create('ポップス', { sectionNames }))
        .toThrow(expect.objectContaining({ code: ErrorCode.MAX_COUNT_EXCEEDED }));
    });

    it('無効なジャンル名の場合エラー', () => {
      expect(() => Genre.create('')).toThrow(DomainError);
    });

    it('無効なセクション名が含まれる場合エラー', () => {
      const sectionNames = ['Aメロ', '', 'サビ'];
      expect(() => Genre.create('ポップス', { sectionNames })).toThrow(DomainError);
    });
  });

  describe('reconstruct', () => {
    it('既存データから正常に復元できる', () => {
      const id = EntityId.generate();
      const sectionNames = ['イントロ', 'Aメロ', 'サビ'];

      const genre = Genre.reconstruct(id, 'ポップス', 'ポップな曲', sectionNames);

      expect(genre.id).toBe(id);
      expect(genre.name).toBe('ポップス');
      expect(genre.description).toBe('ポップな曲');
      expect(genre.sectionNames).toEqual(['イントロ', 'Aメロ', 'サビ']);
    });

    it('説明なしで復元できる', () => {
      const genre = Genre.reconstruct(EntityId.generate(), 'ロック', undefined, ['Aメロ']);
      expect(genre.description).toBeUndefined();
    });

    it('セクション名なしで復元できる', () => {
      const genre = Genre.reconstruct(EntityId.generate(), 'ポップス', 'ポップな曲', []);
      expect(genre.sectionNames).toEqual([]);
    });

    it('無効なジャンル名では復元できない', () => {
      expect(() => Genre.reconstruct(EntityId.generate(), '', undefined, [])).toThrow(DomainError);
    });
  });

  describe('updateName', () => {
    it('ジャンル名を更新できる', () => {
      const genre = Genre.create('ポップス');
      genre.updateName('ロック');

      expect(genre.name).toBe('ロック');
    });

    it('前後の空白はトリムされる', () => {
      const genre = Genre.create('ポップス');
      genre.updateName('  バラード  ');

      expect(genre.name).toBe('バラード');
    });

    it('無効なジャンル名の場合エラー', () => {
      const genre = Genre.create('ポップス');
      expect(() => genre.updateName('')).toThrow(DomainError);
    });
  });

  describe('updateDescription', () => {
    it('説明を更新できる', () => {
      const genre = Genre.create('ポップス');
      genre.updateDescription('ポップな曲のテンプレート');

      expect(genre.description).toBe('ポップな曲のテンプレート');
    });

    it('説明を削除できる（undefined）', () => {
      const genre = Genre.create('ポップス', { description: '説明' });
      genre.updateDescription(undefined);

      expect(genre.description).toBeUndefined();
    });

    it('説明を削除できる（null）', () => {
      const genre = Genre.create('ポップス', { description: '説明' });
      genre.updateDescription(null);

      expect(genre.description).toBeUndefined();
    });

    it('空文字列で説明を削除できる', () => {
      const genre = Genre.create('ポップス', { description: '説明' });
      genre.updateDescription('');

      expect(genre.description).toBeUndefined();
    });
  });

  describe('setSectionNames', () => {
    it('セクション名を設定できる', () => {
      const genre = Genre.create('ポップス');
      const sectionNames = ['イントロ', 'Aメロ', 'サビ'];

      genre.setSectionNames(sectionNames);
      expect(genre.sectionNames).toEqual(['イントロ', 'Aメロ', 'サビ']);
    });

    it('セクション名を空にできる', () => {
      const genre = Genre.create('ポップス', { sectionNames: ['Aメロ', 'サビ'] });
      genre.setSectionNames([]);

      expect(genre.sectionNames).toEqual([]);
    });

    it('セクション名を上書きできる', () => {
      const genre = Genre.create('ポップス', { sectionNames: ['Aメロ', 'サビ'] });
      genre.setSectionNames(['イントロ', 'Aメロ', 'Bメロ', 'サビ']);

      expect(genre.sectionNames.length).toBe(4);
      expect(genre.sectionNames).toEqual(['イントロ', 'Aメロ', 'Bメロ', 'サビ']);
    });

    it('セクション数の上限ちょうどは設定できる', () => {
      const genre = Genre.create('ポップス');
      const sectionNames = Array.from({ length: MAX_SECTIONS_PER_GENRE }, (_, i) => `セクション${i + 1}`);

      expect(() => genre.setSectionNames(sectionNames)).not.toThrow();
      expect(genre.sectionNames.length).toBe(MAX_SECTIONS_PER_GENRE);
    });

    it('セクション数の上限を超えるとエラー', () => {
      const genre = Genre.create('ポップス');
      const sectionNames = Array.from({ length: MAX_SECTIONS_PER_GENRE + 1 }, (_, i) => `セクション${i + 1}`);

      expect(() => genre.setSectionNames(sectionNames)).toThrow(DomainError);
      expect(() => genre.setSectionNames(sectionNames))
        .toThrow(expect.objectContaining({ code: ErrorCode.MAX_COUNT_EXCEEDED }));
    });

    it('無効なセクション名が含まれる場合エラー', () => {
      const genre = Genre.create('ポップス');
      const sectionNames = ['Aメロ', '', 'サビ'];

      expect(() => genre.setSectionNames(sectionNames)).toThrow(DomainError);
    });
  });

  describe('sectionNames getter', () => {
    it('セクション名の配列コピーを返す（不変性）', () => {
      const sectionNames = ['イントロ', 'Aメロ', 'サビ'];
      const genre = Genre.create('ポップス', { sectionNames });

      const returnedSectionNames = genre.sectionNames;
      expect(returnedSectionNames).toEqual(sectionNames);
      expect(returnedSectionNames).not.toBe(sectionNames); // 異なる配列インスタンス
    });
  });
});
