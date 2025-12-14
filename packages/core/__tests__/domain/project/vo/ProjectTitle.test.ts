import { ProjectTitle } from '../../../../src/domain/project/vo/ProjectTitle';

describe('ProjectTitle', () => {
  describe('validate', () => {
    it('有効なタイトルを返す', () => {
      expect(ProjectTitle.validate('新曲のデモ')).toBe('新曲のデモ');
    });

    it('200文字ちょうどは許可', () => {
      const twoHundredChars = 'あ'.repeat(200);
      expect(ProjectTitle.validate(twoHundredChars)).toBe(twoHundredChars);
    });

    it('空文字はエラー', () => {
      expect(() => ProjectTitle.validate('')).toThrow();
    });

    it('空白のみはエラー', () => {
      expect(() => ProjectTitle.validate('   ')).toThrow();
    });

    it('201文字はエラー', () => {
      const twoHundredOneChars = 'あ'.repeat(201);
      expect(() => ProjectTitle.validate(twoHundredOneChars)).toThrow();
    });
  });
});
