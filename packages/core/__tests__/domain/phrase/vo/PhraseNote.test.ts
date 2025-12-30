import { PhraseNote } from '../../../../src/domain/phrase/vo/PhraseNote';

describe('PhraseNote', () => {
  describe('validate', () => {
    it('有効なメモを返す', () => {
      expect(PhraseNote.validate('サビで使いたい')).toBe('サビで使いたい');
    });

    it('500文字ちょうどは許可', () => {
      const fiveHundredChars = 'あ'.repeat(500);
      expect(PhraseNote.validate(fiveHundredChars)).toBe(fiveHundredChars);
    });

    it('undefinedはundefinedを返す', () => {
      expect(PhraseNote.validate(undefined)).toBeUndefined();
    });

    it('nullはundefinedを返す', () => {
      expect(PhraseNote.validate(null)).toBeUndefined();
    });

    it('空文字はundefinedを返す', () => {
      expect(PhraseNote.validate('')).toBeUndefined();
    });

    it('空白のみはundefinedを返す', () => {
      expect(PhraseNote.validate('   ')).toBeUndefined();
    });

    it('501文字はエラー', () => {
      const fiveHundredOneChars = 'あ'.repeat(501);
      expect(() => PhraseNote.validate(fiveHundredOneChars)).toThrow();
    });
  });
});
