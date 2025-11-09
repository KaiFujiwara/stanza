import { GenreName } from '../../../../../src';

describe('GenreName', () => {
  describe('create', () => {
    it('正常なジャンル名で作成できる', () => {
      const genreName = GenreName.create('J-POP');

      expect(genreName.value).toBe('J-POP');
    });

    it('前後の空白は自動でトリムされる', () => {
      const genreName = GenreName.create('  ポップス  ');

      expect(genreName.value).toBe('ポップス');
    });

    it('空文字の場合はエラーをスローする', () => {
      expect(() => {
        GenreName.create('');
      }).toThrow('ジャンル名を入力してください');
    });

    it('空白のみの場合はエラーをスローする', () => {
      expect(() => {
        GenreName.create('   ');
      }).toThrow('ジャンル名を入力してください');
    });

    it('50文字を超える場合はエラーをスローする', () => {
      const longName = 'あ'.repeat(51);
      expect(() => {
        GenreName.create(longName);
      }).toThrow('ジャンル名は50文字以内で入力してください');
    });

    it('50文字の場合は作成できる', () => {
      const maxLengthName = 'あ'.repeat(50);
      const genreName = GenreName.create(maxLengthName);

      expect(genreName.value).toBe(maxLengthName);
    });
  });
});
