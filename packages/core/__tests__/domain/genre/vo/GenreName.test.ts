import { GenreName } from '../../../../src/domain/genre/vo/GenreName';

describe('GenreName', () => {
  describe('validate', () => {
    it('有効なジャンル名を返す', () => {
      expect(GenreName.validate('ヒップホップ')).toBe('ヒップホップ');
    });

    it('50文字ちょうどは許可', () => {
      const fiftyChars = 'あ'.repeat(50);
      expect(GenreName.validate(fiftyChars)).toBe(fiftyChars);
    });

    it('空文字はエラー', () => {
      expect(() => GenreName.validate('')).toThrow();
    });

    it('空白のみはエラー', () => {
      expect(() => GenreName.validate('   ')).toThrow();
    });

    it('51文字はエラー', () => {
      const fiftyOneChars = 'あ'.repeat(51);
      expect(() => GenreName.validate(fiftyOneChars)).toThrow();
    });
  });
});
