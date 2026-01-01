import { PhraseDomainService } from '../../../src/domain/phrase/PhraseDomainService';
import { MAX_PHRASES_PER_USER } from '../../../src/constants/limits';

describe('PhraseDomainService', () => {
  describe('canCreatePhrase', () => {
    it('フレーズ数が上限未満の場合true', () => {
      expect(PhraseDomainService.canCreatePhrase(0)).toBe(true);
      expect(PhraseDomainService.canCreatePhrase(1)).toBe(true);
      expect(PhraseDomainService.canCreatePhrase(MAX_PHRASES_PER_USER - 1)).toBe(true);
    });

    it('フレーズ数が上限ちょうどの場合false', () => {
      expect(PhraseDomainService.canCreatePhrase(MAX_PHRASES_PER_USER)).toBe(false);
    });

    it('フレーズ数が上限を超えている場合false', () => {
      expect(PhraseDomainService.canCreatePhrase(MAX_PHRASES_PER_USER + 1)).toBe(false);
      expect(PhraseDomainService.canCreatePhrase(MAX_PHRASES_PER_USER + 50)).toBe(false);
    });

    it('境界値: 上限-1はtrue', () => {
      expect(PhraseDomainService.canCreatePhrase(MAX_PHRASES_PER_USER - 1)).toBe(true);
    });

    it('境界値: 上限はfalse', () => {
      expect(PhraseDomainService.canCreatePhrase(MAX_PHRASES_PER_USER)).toBe(false);
    });
  });
});
