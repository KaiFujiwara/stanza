import { SectionContent } from '../../../../src/domain/project/vo/SectionContent';
import { MAX_SECTION_CONTENT_LENGTH } from '../../../../src/constants/limits';
import { DomainError } from '../../../../src/domain/shared/errors/DomainError';
import { ErrorCode } from '../../../../src/domain/shared/errors/ErrorCode';

describe('SectionContent', () => {
  describe('validate', () => {
    it('有効なセクションコンテンツを返す', () => {
      const content = '歌詞の内容\n複数行もOK';
      expect(SectionContent.validate(content)).toBe(content);
    });

    it('空文字列は許可される', () => {
      expect(SectionContent.validate('')).toBe('');
    });

    it('改行を含む長いテキストも許可', () => {
      const multiLineContent = '一行目\n二行目\n三行目\n四行目';
      expect(SectionContent.validate(multiLineContent)).toBe(multiLineContent);
    });

    it('最大文字数ちょうどは許可', () => {
      const maxContent = 'あ'.repeat(MAX_SECTION_CONTENT_LENGTH);
      expect(SectionContent.validate(maxContent)).toBe(maxContent);
    });

    it('最大文字数を超えるとエラー', () => {
      const tooLongContent = 'あ'.repeat(MAX_SECTION_CONTENT_LENGTH + 1);
      expect(() => SectionContent.validate(tooLongContent)).toThrow(DomainError);
      expect(() => SectionContent.validate(tooLongContent)).toThrow(
        expect.objectContaining({
          code: ErrorCode.MAX_LENGTH_EXCEEDED,
        })
      );
    });

    it('境界値: 最大文字数-1は許可', () => {
      const content = 'あ'.repeat(MAX_SECTION_CONTENT_LENGTH - 1);
      expect(() => SectionContent.validate(content)).not.toThrow();
    });

    it('境界値: 最大文字数+1はエラー', () => {
      const content = 'あ'.repeat(MAX_SECTION_CONTENT_LENGTH + 1);
      expect(() => SectionContent.validate(content)).toThrow();
    });
  });
});
