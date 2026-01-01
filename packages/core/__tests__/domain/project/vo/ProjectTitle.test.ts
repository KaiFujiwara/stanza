import { ProjectTitle } from '../../../../src/domain/project/vo/ProjectTitle';
import { MAX_PROJECT_TITLE_LENGTH } from '../../../../src/constants/validation';

describe('ProjectTitle', () => {
  describe('validate', () => {
    it('有効なタイトルを返す', () => {
      expect(ProjectTitle.validate('新曲のデモ')).toBe('新曲のデモ');
    });

    it('最大文字数ちょうどは許可', () => {
      const maxChars = 'あ'.repeat(MAX_PROJECT_TITLE_LENGTH);
      expect(ProjectTitle.validate(maxChars)).toBe(maxChars);
    });

    it('空文字はエラー', () => {
      expect(() => ProjectTitle.validate('')).toThrow();
    });

    it('空白のみはエラー', () => {
      expect(() => ProjectTitle.validate('   ')).toThrow();
    });

    it('最大文字数+1はエラー', () => {
      const tooLong = 'あ'.repeat(MAX_PROJECT_TITLE_LENGTH + 1);
      expect(() => ProjectTitle.validate(tooLong)).toThrow();
    });
  });
});
