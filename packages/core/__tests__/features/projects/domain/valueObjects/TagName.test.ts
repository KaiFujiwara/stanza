import { TagName } from '../../../../../src';

describe('TagName', () => {
  describe('create', () => {
    it('正常なタグ名で作成できる', () => {
      const tagName = TagName.create('ロック');

      expect(tagName.value).toBe('ロック');
    });

    it('前後の空白は自動でトリムされる', () => {
      const tagName = TagName.create('  ロック  ');

      expect(tagName.value).toBe('ロック');
    });

    it('空文字の場合はエラーをスローする', () => {
      expect(() => {
        TagName.create('');
      }).toThrow('タグ名を入力してください');
    });

    it('空白のみの場合はエラーをスローする', () => {
      expect(() => {
        TagName.create('   ');
      }).toThrow('タグ名を入力してください');
    });

    it('30文字を超える場合はエラーをスローする', () => {
      const longName = 'あ'.repeat(31);
      expect(() => {
        TagName.create(longName);
      }).toThrow('タグ名は30文字以内で入力してください');
    });

    it('30文字の場合は作成できる', () => {
      const maxLengthName = 'あ'.repeat(30);
      const tagName = TagName.create(maxLengthName);

      expect(tagName.value).toBe(maxLengthName);
    });
  });
});
