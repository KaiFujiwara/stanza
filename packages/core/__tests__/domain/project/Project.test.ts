import { Project } from '../../../src/domain/project/Project';
import { Section } from '../../../src/domain/project/Section';
import { EntityId } from '../../../src/domain/shared/EntityId';
import { DomainError } from '../../../src/domain/shared/errors/DomainError';
import { ErrorCode } from '../../../src/domain/shared/errors/ErrorCode';
import { MAX_SECTIONS_PER_PROJECT } from '../../../src/constants/limits';

describe('Project', () => {
  describe('create', () => {
    it('正常にプロジェクトを作成できる', () => {
      const project = Project.create('テストプロジェクト');

      expect(EntityId.isValid(project.id)).toBe(true);
      expect(project.title).toBe('テストプロジェクト');
      expect(project.folderId).toBeUndefined();
      expect(project.genreId).toBeUndefined();
      expect(project.orderIndex).toBe(0);
      expect(project.sections).toEqual([]);
      expect(project.isDeleted).toBe(false);
      expect(project.deletedAt).toBeNull();
    });

    it('フォルダIDとジャンルIDを指定して作成できる', () => {
      const folderId = EntityId.generate();
      const genreId = EntityId.generate();
      const project = Project.create('テストプロジェクト', folderId, genreId);

      expect(project.folderId).toBe(folderId);
      expect(project.genreId).toBe(genreId);
    });

    it('orderIndexを指定して作成できる', () => {
      const project = Project.create('テストプロジェクト', undefined, undefined, 5);
      expect(project.orderIndex).toBe(5);
    });

    it('セクション付きで作成できる', () => {
      const sections = [
        Section.create(EntityId.generate(), 'Aメロ', 0),
        Section.create(EntityId.generate(), 'Bメロ', 1),
      ];
      const project = Project.create('テストプロジェクト', undefined, undefined, 0, sections);

      expect(project.sections.length).toBe(2);
      expect(project.sections[0].name).toBe('Aメロ');
      expect(project.sections[1].name).toBe('Bメロ');
    });

    it('セクション数の上限を超えて作成するとエラー', () => {
      const sections = Array.from({ length: MAX_SECTIONS_PER_PROJECT + 1 }, (_, i) =>
        Section.create(EntityId.generate(), `セクション${i}`, i)
      );

      expect(() => Project.create('テストプロジェクト', undefined, undefined, 0, sections))
        .toThrow(DomainError);
      expect(() => Project.create('テストプロジェクト', undefined, undefined, 0, sections))
        .toThrow(expect.objectContaining({ code: ErrorCode.MAX_COUNT_EXCEEDED }));
    });

    it('境界値: 最大セクション数ちょうどは作成できる', () => {
      const sections = Array.from({ length: MAX_SECTIONS_PER_PROJECT }, (_, i) =>
        Section.create(EntityId.generate(), `セクション${i}`, i)
      );

      expect(() => Project.create('テストプロジェクト', undefined, undefined, 0, sections))
        .not.toThrow();
    });

    it('無効なタイトルの場合エラー', () => {
      expect(() => Project.create('')).toThrow(DomainError);
    });
  });

  describe('reconstruct', () => {
    it('既存データから正常に復元できる', () => {
      const id = EntityId.generate();
      const folderId = EntityId.generate();
      const genreId = EntityId.generate();
      const sections = [Section.create(EntityId.generate(), 'Aメロ', 0)];

      const project = Project.reconstruct(
        id,
        '復元プロジェクト',
        folderId,
        genreId,
        3,
        sections,
        false,
        null
      );

      expect(project.id).toBe(id);
      expect(project.title).toBe('復元プロジェクト');
      expect(project.folderId).toBe(folderId);
      expect(project.genreId).toBe(genreId);
      expect(project.orderIndex).toBe(3);
      expect(project.sections.length).toBe(1);
      expect(project.isDeleted).toBe(false);
      expect(project.deletedAt).toBeNull();
    });

    it('削除済みデータも復元できる', () => {
      const deletedAt = new Date();
      const project = Project.reconstruct(
        EntityId.generate(),
        '削除済みプロジェクト',
        undefined,
        undefined,
        0,
        [],
        true,
        deletedAt
      );

      expect(project.isDeleted).toBe(true);
      expect(project.deletedAt).toBe(deletedAt);
    });
  });

  describe('updateTitle', () => {
    it('タイトルを更新できる', () => {
      const project = Project.create('元のタイトル');
      project.updateTitle('新しいタイトル');

      expect(project.title).toBe('新しいタイトル');
    });

    it('削除済みプロジェクトのタイトルは更新できない', () => {
      const project = Project.create('テストプロジェクト');
      project.softDelete();

      expect(() => project.updateTitle('新しいタイトル')).toThrow(DomainError);
      expect(() => project.updateTitle('新しいタイトル'))
        .toThrow(expect.objectContaining({ code: ErrorCode.ENTITY_NOT_FOUND }));
    });

    it('無効なタイトルの場合エラー', () => {
      const project = Project.create('テストプロジェクト');
      expect(() => project.updateTitle('')).toThrow(DomainError);
    });
  });

  describe('moveToFolder', () => {
    it('フォルダに移動できる', () => {
      const project = Project.create('テストプロジェクト');
      const folderId = EntityId.generate();

      project.moveToFolder(folderId);
      expect(project.folderId).toBe(folderId);
    });

    it('フォルダから取り出せる（undefined設定）', () => {
      const folderId = EntityId.generate();
      const project = Project.create('テストプロジェクト', folderId);

      project.moveToFolder(undefined);
      expect(project.folderId).toBeUndefined();
    });

    it('削除済みプロジェクトは移動できない', () => {
      const project = Project.create('テストプロジェクト');
      project.softDelete();

      expect(() => project.moveToFolder(EntityId.generate())).toThrow(DomainError);
    });
  });

  describe('setGenre', () => {
    it('ジャンルを設定できる', () => {
      const project = Project.create('テストプロジェクト');
      const genreId = EntityId.generate();

      project.setGenre(genreId);
      expect(project.genreId).toBe(genreId);
    });

    it('ジャンルを解除できる（undefined設定）', () => {
      const genreId = EntityId.generate();
      const project = Project.create('テストプロジェクト', undefined, genreId);

      project.setGenre(undefined);
      expect(project.genreId).toBeUndefined();
    });

    it('削除済みプロジェクトはジャンル設定できない', () => {
      const project = Project.create('テストプロジェクト');
      project.softDelete();

      expect(() => project.setGenre(EntityId.generate())).toThrow(DomainError);
    });
  });

  describe('setSections', () => {
    it('セクションを設定できる', () => {
      const project = Project.create('テストプロジェクト');
      const sections = [
        Section.create(project.id, 'Aメロ', 0),
        Section.create(project.id, 'サビ', 1),
      ];

      project.setSections(sections);
      expect(project.sections.length).toBe(2);
      expect(project.sections[0].name).toBe('Aメロ');
      expect(project.sections[1].name).toBe('サビ');
    });

    it('セクションを空にできる', () => {
      const sections = [Section.create(EntityId.generate(), 'Aメロ', 0)];
      const project = Project.create('テストプロジェクト', undefined, undefined, 0, sections);

      project.setSections([]);
      expect(project.sections.length).toBe(0);
    });

    it('セクション数の上限を超えて設定するとエラー', () => {
      const project = Project.create('テストプロジェクト');
      const sections = Array.from({ length: MAX_SECTIONS_PER_PROJECT + 1 }, (_, i) =>
        Section.create(project.id, `セクション${i}`, i)
      );

      expect(() => project.setSections(sections)).toThrow(DomainError);
      expect(() => project.setSections(sections))
        .toThrow(expect.objectContaining({ code: ErrorCode.MAX_COUNT_EXCEEDED }));
    });

    it('削除済みプロジェクトはセクション設定できない', () => {
      const project = Project.create('テストプロジェクト');
      project.softDelete();

      expect(() => project.setSections([])).toThrow(DomainError);
    });
  });

  describe('softDelete', () => {
    it('論理削除できる', () => {
      const project = Project.create('テストプロジェクト');
      const beforeDelete = new Date();

      project.softDelete();

      expect(project.isDeleted).toBe(true);
      expect(project.deletedAt).not.toBeNull();
      expect(project.deletedAt!.getTime()).toBeGreaterThanOrEqual(beforeDelete.getTime());
    });

    it('既に削除済みのプロジェクトも削除できる', () => {
      const project = Project.create('テストプロジェクト');
      project.softDelete();
      const firstDeletedAt = project.deletedAt;

      project.softDelete();

      expect(project.isDeleted).toBe(true);
      // 削除日時は更新される
      expect(project.deletedAt).not.toBe(firstDeletedAt);
    });
  });

  describe('restore', () => {
    it('削除済みプロジェクトを復元できる', () => {
      const project = Project.create('テストプロジェクト');
      project.softDelete();

      project.restore();

      expect(project.isDeleted).toBe(false);
      expect(project.deletedAt).toBeNull();
    });

    it('復元後は通常通り操作できる', () => {
      const project = Project.create('テストプロジェクト');
      project.softDelete();
      project.restore();

      expect(() => project.updateTitle('新しいタイトル')).not.toThrow();
      expect(project.title).toBe('新しいタイトル');
    });
  });

  describe('sections getter', () => {
    it('セクションの配列コピーを返す（不変性）', () => {
      const sections = [Section.create(EntityId.generate(), 'Aメロ', 0)];
      const project = Project.create('テストプロジェクト', undefined, undefined, 0, sections);

      const returnedSections = project.sections;
      expect(returnedSections).toEqual(sections);
      expect(returnedSections).not.toBe(sections); // 異なる配列インスタンス
    });
  });
});
