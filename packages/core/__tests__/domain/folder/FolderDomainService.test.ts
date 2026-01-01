import { FolderDomainService } from '../../../src/domain/folder/FolderDomainService';
import { MAX_FOLDERS_PER_USER } from '../../../src/constants/limits';

describe('FolderDomainService', () => {
  describe('canCreateFolder', () => {
    it('フォルダ数が上限未満の場合true', () => {
      expect(FolderDomainService.canCreateFolder(0)).toBe(true);
      expect(FolderDomainService.canCreateFolder(1)).toBe(true);
      expect(FolderDomainService.canCreateFolder(MAX_FOLDERS_PER_USER - 1)).toBe(true);
    });

    it('フォルダ数が上限ちょうどの場合false', () => {
      expect(FolderDomainService.canCreateFolder(MAX_FOLDERS_PER_USER)).toBe(false);
    });

    it('フォルダ数が上限を超えている場合false', () => {
      expect(FolderDomainService.canCreateFolder(MAX_FOLDERS_PER_USER + 1)).toBe(false);
      expect(FolderDomainService.canCreateFolder(MAX_FOLDERS_PER_USER + 10)).toBe(false);
    });

    it('境界値: 上限-1はtrue', () => {
      expect(FolderDomainService.canCreateFolder(MAX_FOLDERS_PER_USER - 1)).toBe(true);
    });

    it('境界値: 上限はfalse', () => {
      expect(FolderDomainService.canCreateFolder(MAX_FOLDERS_PER_USER)).toBe(false);
    });
  });
});
