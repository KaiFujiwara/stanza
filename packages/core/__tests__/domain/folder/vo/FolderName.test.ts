import { FolderName } from '../../../../src/domain/folder/vo/FolderName';

describe('FolderName', () => {
  describe('validate', () => {
    it('有効なフォルダ名を返す', () => {
      expect(FolderName.validate('2024年制作')).toBe('2024年制作');
    });

    it('100文字ちょうどは許可', () => {
      const hundredChars = 'あ'.repeat(100);
      expect(FolderName.validate(hundredChars)).toBe(hundredChars);
    });

    it('空文字はエラー', () => {
      expect(() => FolderName.validate('')).toThrow();
    });

    it('空白のみはエラー', () => {
      expect(() => FolderName.validate('   ')).toThrow();
    });

    it('101文字はエラー', () => {
      const hundredOneChars = 'あ'.repeat(101);
      expect(() => FolderName.validate(hundredOneChars)).toThrow();
    });
  });
});
