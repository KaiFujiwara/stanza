import { TagName } from '../../../../src/domain/tag/vo/TagName';

describe('TagName', () => {
  describe('validate', () => {
    it('有効なタグ名を返す', () => {
      expect(TagName.validate('ラップ')).toBe('ラップ');
    });

    it('30文字ちょうどは許可', () => {
      const thirtyChars = 'あ'.repeat(30);
      expect(TagName.validate(thirtyChars)).toBe(thirtyChars);
    });

    it('空文字はエラー', () => {
      expect(() => TagName.validate('')).toThrow();
    });

    it('空白のみはエラー', () => {
      expect(() => TagName.validate('   ')).toThrow();
    });

    it('31文字はエラー', () => {
      const thirtyOneChars = 'あ'.repeat(31);
      expect(() => TagName.validate(thirtyOneChars)).toThrow();
    });
  });
});
