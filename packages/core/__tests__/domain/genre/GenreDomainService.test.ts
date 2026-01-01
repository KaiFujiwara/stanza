import { GenreDomainService } from '../../../src/domain/genre/GenreDomainService';
import { MAX_GENRES_PER_USER } from '../../../src/constants/limits';

describe('GenreDomainService', () => {
  describe('canCreateGenre', () => {
    it('ジャンル数が上限未満の場合true', () => {
      expect(GenreDomainService.canCreateGenre(0)).toBe(true);
      expect(GenreDomainService.canCreateGenre(1)).toBe(true);
      expect(GenreDomainService.canCreateGenre(MAX_GENRES_PER_USER - 1)).toBe(true);
    });

    it('ジャンル数が上限ちょうどの場合false', () => {
      expect(GenreDomainService.canCreateGenre(MAX_GENRES_PER_USER)).toBe(false);
    });

    it('ジャンル数が上限を超えている場合false', () => {
      expect(GenreDomainService.canCreateGenre(MAX_GENRES_PER_USER + 1)).toBe(false);
      expect(GenreDomainService.canCreateGenre(MAX_GENRES_PER_USER + 20)).toBe(false);
    });

    it('境界値: 上限-1はtrue', () => {
      expect(GenreDomainService.canCreateGenre(MAX_GENRES_PER_USER - 1)).toBe(true);
    });

    it('境界値: 上限はfalse', () => {
      expect(GenreDomainService.canCreateGenre(MAX_GENRES_PER_USER)).toBe(false);
    });
  });
});
