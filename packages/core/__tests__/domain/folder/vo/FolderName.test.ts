import { FolderName } from '../../../../src/domain/folder/vo/FolderName';
import { MAX_FOLDER_NAME_LENGTH } from '../../../../src/constants/validation';

describe('FolderName', () => {
  describe('validate', () => {
    it('有効なフォルダ名を返す', () => {
      expect(FolderName.validate('2024年制作')).toBe('2024年制作');
    });

    it('最大文字数ちょうどは許可', () => {
      const maxChars = 'あ'.repeat(MAX_FOLDER_NAME_LENGTH);
      expect(FolderName.validate(maxChars)).toBe(maxChars);
    });

    it('空文字はエラー', () => {
      expect(() => FolderName.validate('')).toThrow();
    });

    it('空白のみはエラー', () => {
      expect(() => FolderName.validate('   ')).toThrow();
    });

    it('最大文字数+1はエラー', () => {
      const tooLong = 'あ'.repeat(MAX_FOLDER_NAME_LENGTH + 1);
      expect(() => FolderName.validate(tooLong)).toThrow();
    });
  });
});
