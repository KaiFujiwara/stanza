import { SectionName } from '../../../../src/domain/project/vo/SectionName';

describe('SectionName', () => {
  describe('validate', () => {
    it('有効なセクション名を返す', () => {
      expect(SectionName.validate('Aメロ')).toBe('Aメロ');
    });

    it('50文字ちょうどは許可', () => {
      const fiftyChars = 'あ'.repeat(50);
      expect(SectionName.validate(fiftyChars)).toBe(fiftyChars);
    });

    it('空文字はエラー', () => {
      expect(() => SectionName.validate('')).toThrow();
    });

    it('空白のみはエラー', () => {
      expect(() => SectionName.validate('   ')).toThrow();
    });

    it('51文字はエラー', () => {
      const fiftyOneChars = 'あ'.repeat(51);
      expect(() => SectionName.validate(fiftyOneChars)).toThrow();
    });
  });
});
