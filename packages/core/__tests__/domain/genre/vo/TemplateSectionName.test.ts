import { TemplateSectionName } from '../../../../src/domain/genre/vo/TemplateSectionName';
import { MAX_TEMPLATE_SECTION_NAME_LENGTH } from '../../../../src/constants/validation';
import { DomainError } from '../../../../src/domain/shared/errors/DomainError';
import { ErrorCode } from '../../../../src/domain/shared/errors/ErrorCode';

describe('TemplateSectionName', () => {
  describe('validate', () => {
    it('有効なテンプレートセクション名を返す', () => {
      const name = 'Aメロ';
      expect(TemplateSectionName.validate(name)).toBe(name);
    });

    it('前後の空白をトリムして返す', () => {
      expect(TemplateSectionName.validate('  Bメロ  ')).toBe('Bメロ');
    });

    it('最大文字数ちょうどは許可', () => {
      const maxName = 'あ'.repeat(MAX_TEMPLATE_SECTION_NAME_LENGTH);
      expect(TemplateSectionName.validate(maxName)).toBe(maxName);
    });

    it('空文字列はエラー', () => {
      expect(() => TemplateSectionName.validate('')).toThrow(DomainError);
      expect(() => TemplateSectionName.validate('')).toThrow(
        expect.objectContaining({
          code: ErrorCode.EMPTY_VALUE,
        })
      );
    });

    it('空白のみの文字列はエラー', () => {
      expect(() => TemplateSectionName.validate('   ')).toThrow(DomainError);
      expect(() => TemplateSectionName.validate('   ')).toThrow(
        expect.objectContaining({
          code: ErrorCode.EMPTY_VALUE,
        })
      );
    });

    it('undefinedはエラー', () => {
      expect(() => TemplateSectionName.validate(undefined)).toThrow(DomainError);
    });

    it('nullはエラー', () => {
      expect(() => TemplateSectionName.validate(null)).toThrow(DomainError);
    });

    it('最大文字数を超えるとエラー', () => {
      const tooLongName = 'あ'.repeat(MAX_TEMPLATE_SECTION_NAME_LENGTH + 1);
      expect(() => TemplateSectionName.validate(tooLongName)).toThrow(DomainError);
      expect(() => TemplateSectionName.validate(tooLongName)).toThrow(
        expect.objectContaining({
          code: ErrorCode.MAX_LENGTH_EXCEEDED,
        })
      );
    });

    it('境界値: 最大文字数-1は許可', () => {
      const name = 'あ'.repeat(MAX_TEMPLATE_SECTION_NAME_LENGTH - 1);
      expect(() => TemplateSectionName.validate(name)).not.toThrow();
    });

    it('境界値: 最大文字数+1はエラー', () => {
      const name = 'あ'.repeat(MAX_TEMPLATE_SECTION_NAME_LENGTH + 1);
      expect(() => TemplateSectionName.validate(name)).toThrow();
    });
  });
});
