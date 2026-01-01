import { TagName } from '../../../../src/domain/tag/vo/TagName';
import { MAX_TAG_NAME_LENGTH } from '../../../../src/constants/validation';

describe('TagName', () => {
  describe('validate', () => {
    it('有効なタグ名を返す', () => {
      expect(TagName.validate('ラップ')).toBe('ラップ');
    });

    it('最大文字数ちょうどは許可', () => {
      const maxChars = 'あ'.repeat(MAX_TAG_NAME_LENGTH);
      expect(TagName.validate(maxChars)).toBe(maxChars);
    });

    it('空文字はエラー', () => {
      expect(() => TagName.validate('')).toThrow();
    });

    it('空白のみはエラー', () => {
      expect(() => TagName.validate('   ')).toThrow();
    });

    it('最大文字数+1はエラー', () => {
      const tooLong = 'あ'.repeat(MAX_TAG_NAME_LENGTH + 1);
      expect(() => TagName.validate(tooLong)).toThrow();
    });
  });
});
