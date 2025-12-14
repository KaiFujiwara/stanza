import { PhraseText } from '../../../../src/domain/phrase/vo/PhraseText';

describe('PhraseText', () => {
  describe('validate', () => {
    it('有効なフレーズを返す', () => {
      expect(PhraseText.validate('輝く星のように')).toBe('輝く星のように');
    });

    it('500文字ちょうどは許可', () => {
      const fiveHundredChars = 'あ'.repeat(500);
      expect(PhraseText.validate(fiveHundredChars)).toBe(fiveHundredChars);
    });

    it('空文字はエラー', () => {
      expect(() => PhraseText.validate('')).toThrow();
    });

    it('空白のみはエラー', () => {
      expect(() => PhraseText.validate('   ')).toThrow();
    });

    it('501文字はエラー', () => {
      const fiveHundredOneChars = 'あ'.repeat(501);
      expect(() => PhraseText.validate(fiveHundredOneChars)).toThrow();
    });
  });
});
