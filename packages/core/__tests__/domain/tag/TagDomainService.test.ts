import { TagDomainService } from '../../../src/domain/tag/TagDomainService';
import { TagName } from '../../../src/domain/tag/vo/TagName';
import { MAX_TAGS_PER_USER } from '../../../src/constants/limits';
import { DomainError } from '../../../src/domain/shared/errors/DomainError';
import { ErrorCode } from '../../../src/domain/shared/errors/ErrorCode';

describe('TagDomainService', () => {
  describe('canCreateTag', () => {
    it('タグ数が上限未満の場合true', () => {
      expect(TagDomainService.canCreateTag(0)).toBe(true);
      expect(TagDomainService.canCreateTag(1)).toBe(true);
      expect(TagDomainService.canCreateTag(MAX_TAGS_PER_USER - 1)).toBe(true);
    });

    it('タグ数が上限ちょうどの場合false', () => {
      expect(TagDomainService.canCreateTag(MAX_TAGS_PER_USER)).toBe(false);
    });

    it('タグ数が上限を超えている場合false', () => {
      expect(TagDomainService.canCreateTag(MAX_TAGS_PER_USER + 1)).toBe(false);
      expect(TagDomainService.canCreateTag(MAX_TAGS_PER_USER + 10)).toBe(false);
    });

    it('境界値: 上限-1はtrue', () => {
      expect(TagDomainService.canCreateTag(MAX_TAGS_PER_USER - 1)).toBe(true);
    });

    it('境界値: 上限はfalse', () => {
      expect(TagDomainService.canCreateTag(MAX_TAGS_PER_USER)).toBe(false);
    });
  });

  describe('ensureUniqueTagName', () => {
    it('タグ名が存在しない場合は何もしない', () => {
      const tagName = TagName.validate('新しいタグ');
      expect(() => TagDomainService.ensureUniqueTagName(tagName, false)).not.toThrow();
    });

    it('タグ名が既に存在する場合はエラー', () => {
      const tagName = TagName.validate('既存のタグ');
      expect(() => TagDomainService.ensureUniqueTagName(tagName, true)).toThrow(DomainError);
    });

    it('重複時のエラーコードが正しい', () => {
      const tagName = TagName.validate('既存のタグ');
      try {
        TagDomainService.ensureUniqueTagName(tagName, true);
        fail('エラーが発生するべき');
      } catch (error) {
        expect(error).toBeInstanceOf(DomainError);
        expect((error as DomainError).code).toBe(ErrorCode.DUPLICATE_NAME);
      }
    });

    it('重複時のエラーメッセージにタグ名が含まれる', () => {
      const tagName = TagName.validate('ラブソング');
      try {
        TagDomainService.ensureUniqueTagName(tagName, true);
        fail('エラーが発生するべき');
      } catch (error) {
        expect((error as DomainError).message).toContain('ラブソング');
      }
    });
  });
});
