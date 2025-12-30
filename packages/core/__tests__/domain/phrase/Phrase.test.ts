import { Phrase } from '../../../src/domain/phrase/Phrase';

describe('Phrase - タグ操作', () => {
  describe('tagIds の正規化', () => {
    it('重複・空文字除去・trim を行う', () => {
      const phrase = Phrase.create('テスト', {
        tagIds: ['tag-1', 'tag-1', '', '  ', '  tag-2  ', 'tag-3'],
      });

      expect(phrase.tagIds).toEqual(['tag-1', 'tag-2', 'tag-3']);
    });
  });

  describe('setTags', () => {
    it('タグ配列を置き換えられる', () => {
      const phrase = Phrase.create('テスト', { tagIds: ['tag-1'] });
      phrase.setTags(['tag-2', 'tag-3']);

      expect(phrase.tagIds).toEqual(['tag-2', 'tag-3']);
    });

    it('setTags でも正規化される', () => {
      const phrase = Phrase.create('テスト');
      phrase.setTags(['tag-1', 'tag-1', '', '  tag-2  ']);

      expect(phrase.tagIds).toEqual(['tag-1', 'tag-2']);
    });
  });
});
