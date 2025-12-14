import { TagColor } from '../../../../src/domain/tag/vo/TagColor';

describe('TagColor', () => {
  describe('validate', () => {
    it('6桁形式を大文字に変換', () => {
      expect(TagColor.validate('#ff0000')).toBe('#FF0000');
    });

    it('3桁形式を大文字に変換', () => {
      expect(TagColor.validate('#f00')).toBe('#F00');
    });

    it('undefinedはundefinedを返す', () => {
      expect(TagColor.validate(undefined)).toBeUndefined();
    });

    it('空文字はundefinedを返す', () => {
      expect(TagColor.validate('')).toBeUndefined();
    });

    it('#なしはエラー', () => {
      expect(() => TagColor.validate('FF0000')).toThrow();
    });

    it('不正な文字はエラー', () => {
      expect(() => TagColor.validate('#GGGGGG')).toThrow();
    });

    it('桁数不正はエラー', () => {
      expect(() => TagColor.validate('#F000')).toThrow();
    });
  });
});
