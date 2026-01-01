import { LineText } from '../../../../src/domain/project/vo/LineText';
import { MAX_LINE_TEXT_LENGTH } from '../../../../src/constants/validation';
import { DomainError } from '../../../../src/domain/shared/errors/DomainError';
import { ErrorCode } from '../../../../src/domain/shared/errors/ErrorCode';

describe('LineText', () => {
  describe('validate', () => {
    it('有効な歌詞行テキストを返す', () => {
      const text = 'この歌詞の一行目';
      expect(LineText.validate(text)).toBe(text);
    });

    it('空文字列は許可される', () => {
      expect(LineText.validate('')).toBe('');
    });

    it('最大文字数ちょうどは許可', () => {
      const maxText = 'あ'.repeat(MAX_LINE_TEXT_LENGTH);
      expect(LineText.validate(maxText)).toBe(maxText);
    });

    it('最大文字数を超えるとエラー', () => {
      const tooLongText = 'あ'.repeat(MAX_LINE_TEXT_LENGTH + 1);
      expect(() => LineText.validate(tooLongText)).toThrow(DomainError);
      expect(() => LineText.validate(tooLongText)).toThrow(
        expect.objectContaining({
          code: ErrorCode.MAX_LENGTH_EXCEEDED,
        })
      );
    });

    it('境界値: 最大文字数-1は許可', () => {
      const text = 'あ'.repeat(MAX_LINE_TEXT_LENGTH - 1);
      expect(() => LineText.validate(text)).not.toThrow();
    });

    it('境界値: 最大文字数+1はエラー', () => {
      const text = 'あ'.repeat(MAX_LINE_TEXT_LENGTH + 1);
      expect(() => LineText.validate(text)).toThrow();
    });
  });
});
