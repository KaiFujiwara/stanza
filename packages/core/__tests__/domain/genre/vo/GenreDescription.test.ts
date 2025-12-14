import { GenreDescription } from '../../../../src/domain/genre/vo/GenreDescription';

describe('GenreDescription', () => {
  describe('validate', () => {
    it('有効な説明文を返す', () => {
      expect(GenreDescription.validate('リズミカルな音楽')).toBe('リズミカルな音楽');
    });

    it('500文字ちょうどは許可', () => {
      const fiveHundredChars = 'あ'.repeat(500);
      expect(GenreDescription.validate(fiveHundredChars)).toBe(fiveHundredChars);
    });

    it('undefinedはundefinedを返す', () => {
      expect(GenreDescription.validate(undefined)).toBeUndefined();
    });

    it('空文字はundefinedを返す', () => {
      expect(GenreDescription.validate('')).toBeUndefined();
    });

    it('501文字はエラー', () => {
      const fiveHundredOneChars = 'あ'.repeat(501);
      expect(() => GenreDescription.validate(fiveHundredOneChars)).toThrow();
    });
  });
});
