import { Section } from '../../../src/domain/project/Section';
import { EntityId } from '../../../src/domain/shared/EntityId';
import { DomainError } from '../../../src/domain/shared/errors/DomainError';
import { MAX_SECTION_CONTENT_LENGTH } from '../../../src/constants/limits';

describe('Section', () => {
  const projectId = EntityId.generate();

  describe('create', () => {
    it('正常にセクションを作成できる', () => {
      const section = Section.create(projectId, 'Aメロ', 0);

      expect(EntityId.isValid(section.id)).toBe(true);
      expect(section.projectId).toBe(projectId);
      expect(section.name).toBe('Aメロ');
      expect(section.orderIndex).toBe(0);
      expect(section.content).toBe('');
    });

    it('orderIndexのデフォルトは0', () => {
      const section = Section.create(projectId, 'サビ');
      expect(section.orderIndex).toBe(0);
    });

    it('orderIndexを指定して作成できる', () => {
      const section = Section.create(projectId, 'Bメロ', 5);
      expect(section.orderIndex).toBe(5);
    });

    it('無効なセクション名の場合エラー', () => {
      expect(() => Section.create(projectId, '')).toThrow(DomainError);
    });
  });

  describe('reconstruct', () => {
    it('既存データから正常に復元できる', () => {
      const id = EntityId.generate();
      const content = '歌詞の内容\n複数行';

      const section = Section.reconstruct(id, projectId, 'Aメロ', 2, content);

      expect(section.id).toBe(id);
      expect(section.projectId).toBe(projectId);
      expect(section.name).toBe('Aメロ');
      expect(section.orderIndex).toBe(2);
      expect(section.content).toBe(content);
    });

    it('空のコンテンツで復元できる', () => {
      const section = Section.reconstruct(EntityId.generate(), projectId, 'サビ', 0, '');
      expect(section.content).toBe('');
    });

    it('無効なセクション名では復元できない', () => {
      expect(() => Section.reconstruct(EntityId.generate(), projectId, '', 0, '')).toThrow(DomainError);
    });

    it('無効なコンテンツでは復元できない', () => {
      const tooLongContent = 'あ'.repeat(MAX_SECTION_CONTENT_LENGTH + 1);
      expect(() => Section.reconstruct(EntityId.generate(), projectId, 'Aメロ', 0, tooLongContent))
        .toThrow(DomainError);
    });
  });

  describe('updateName', () => {
    it('セクション名を更新できる', () => {
      const section = Section.create(projectId, 'Aメロ');
      section.updateName('イントロ');

      expect(section.name).toBe('イントロ');
    });

    it('前後の空白はトリムされる', () => {
      const section = Section.create(projectId, 'Aメロ');
      section.updateName('  サビ  ');

      expect(section.name).toBe('サビ');
    });

    it('無効なセクション名の場合エラー', () => {
      const section = Section.create(projectId, 'Aメロ');
      expect(() => section.updateName('')).toThrow(DomainError);
    });
  });

  describe('updateContent', () => {
    it('コンテンツを更新できる', () => {
      const section = Section.create(projectId, 'Aメロ');
      const content = '歌詞の内容\n複数行もOK';

      section.updateContent(content);
      expect(section.content).toBe(content);
    });

    it('空文字列で更新できる', () => {
      const section = Section.create(projectId, 'Aメロ');
      section.updateContent('最初の内容');
      section.updateContent('');

      expect(section.content).toBe('');
    });

    it('最大文字数ちょうどは許可', () => {
      const section = Section.create(projectId, 'Aメロ');
      const maxContent = 'あ'.repeat(MAX_SECTION_CONTENT_LENGTH);

      expect(() => section.updateContent(maxContent)).not.toThrow();
      expect(section.content).toBe(maxContent);
    });

    it('最大文字数を超えるとエラー', () => {
      const section = Section.create(projectId, 'Aメロ');
      const tooLongContent = 'あ'.repeat(MAX_SECTION_CONTENT_LENGTH + 1);

      expect(() => section.updateContent(tooLongContent)).toThrow(DomainError);
    });
  });

  describe('reorder', () => {
    it('並び順を変更できる', () => {
      const section = Section.create(projectId, 'Aメロ', 0);
      section.reorder(3);

      expect(section.orderIndex).toBe(3);
    });

    it('0に変更できる', () => {
      const section = Section.create(projectId, 'Aメロ', 5);
      section.reorder(0);

      expect(section.orderIndex).toBe(0);
    });

    it('負の値も許可される（ビジネスルールによる）', () => {
      const section = Section.create(projectId, 'Aメロ', 0);
      section.reorder(-1);

      expect(section.orderIndex).toBe(-1);
    });
  });
});
