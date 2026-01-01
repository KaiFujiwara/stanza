import { TagColor } from '../../../../src/domain/tag/vo/TagColor';
import { DomainError } from '../../../../src/domain/shared/errors/DomainError';

describe('TagColor', () => {
  describe('validate', () => {
    it('6桁形式を大文字に変換', () => {
      expect(TagColor.validate('#ff0000')).toBe('#FF0000');
    });

    it('大文字もそのまま受け入れる', () => {
      expect(TagColor.validate('#FF0000')).toBe('#FF0000');
    });

    it('undefinedはundefinedを返す', () => {
      expect(TagColor.validate(undefined)).toBeUndefined();
    });

    it('空文字はundefinedを返す', () => {
      expect(TagColor.validate('')).toBeUndefined();
    });

    it('空白のみはundefinedを返す', () => {
      expect(TagColor.validate('   ')).toBeUndefined();
    });

    it('#なしはエラー', () => {
      expect(() => TagColor.validate('FF0000')).toThrow(DomainError);
    });

    it('不正な文字はエラー', () => {
      expect(() => TagColor.validate('#GGGGGG')).toThrow(DomainError);
    });

    it('3桁形式はエラー', () => {
      expect(() => TagColor.validate('#F00')).toThrow(DomainError);
    });

    it('4桁形式はエラー', () => {
      expect(() => TagColor.validate('#F000')).toThrow(DomainError);
    });

    it('7桁形式はエラー', () => {
      expect(() => TagColor.validate('#FF00000')).toThrow(DomainError);
    });
  });
});
