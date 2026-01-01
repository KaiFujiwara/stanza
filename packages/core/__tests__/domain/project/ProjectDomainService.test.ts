import { ProjectDomainService } from '../../../src/domain/project/ProjectDomainService';
import { MAX_PROJECTS_PER_USER } from '../../../src/constants/limits';

describe('ProjectDomainService', () => {
  describe('canCreateProject', () => {
    it('プロジェクト数が上限未満の場合true', () => {
      expect(ProjectDomainService.canCreateProject(0)).toBe(true);
      expect(ProjectDomainService.canCreateProject(1)).toBe(true);
      expect(ProjectDomainService.canCreateProject(MAX_PROJECTS_PER_USER - 1)).toBe(true);
    });

    it('プロジェクト数が上限ちょうどの場合false', () => {
      expect(ProjectDomainService.canCreateProject(MAX_PROJECTS_PER_USER)).toBe(false);
    });

    it('プロジェクト数が上限を超えている場合false', () => {
      expect(ProjectDomainService.canCreateProject(MAX_PROJECTS_PER_USER + 1)).toBe(false);
      expect(ProjectDomainService.canCreateProject(MAX_PROJECTS_PER_USER + 100)).toBe(false);
    });

    it('境界値: 上限-1はtrue', () => {
      expect(ProjectDomainService.canCreateProject(MAX_PROJECTS_PER_USER - 1)).toBe(true);
    });

    it('境界値: 上限はfalse', () => {
      expect(ProjectDomainService.canCreateProject(MAX_PROJECTS_PER_USER)).toBe(false);
    });
  });
});
