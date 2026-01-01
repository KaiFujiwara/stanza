import { Folder } from '../../../src/domain/folder/Folder';
import { EntityId } from '../../../src/domain/shared/EntityId';
import { DomainError } from '../../../src/domain/shared/errors/DomainError';

describe('Folder', () => {
  describe('create', () => {
    it('正常にフォルダを作成できる', () => {
      const folder = Folder.create('未完成');

      expect(EntityId.isValid(folder.id)).toBe(true);
      expect(folder.name).toBe('未完成');
      expect(folder.orderIndex).toBe(0);
    });

    it('orderIndexを指定して作成できる', () => {
      const folder = Folder.create('完成', 5);
      expect(folder.orderIndex).toBe(5);
    });

    it('orderIndexのデフォルトは0', () => {
      const folder = Folder.create('アイデア');
      expect(folder.orderIndex).toBe(0);
    });

    it('前後の空白はトリムされる', () => {
      const folder = Folder.create('  未完成  ');
      expect(folder.name).toBe('未完成');
    });

    it('無効なフォルダ名の場合エラー', () => {
      expect(() => Folder.create('')).toThrow(DomainError);
    });
  });

  describe('reconstruct', () => {
    it('既存データから正常に復元できる', () => {
      const id = EntityId.generate();
      const folder = Folder.reconstruct(id, 'アーカイブ', 3);

      expect(folder.id).toBe(id);
      expect(folder.name).toBe('アーカイブ');
      expect(folder.orderIndex).toBe(3);
    });

    it('orderIndex 0で復元できる', () => {
      const folder = Folder.reconstruct(EntityId.generate(), 'フォルダA', 0);
      expect(folder.orderIndex).toBe(0);
    });

    it('無効なフォルダ名では復元できない', () => {
      expect(() => Folder.reconstruct(EntityId.generate(), '', 0)).toThrow(DomainError);
    });
  });

  describe('updateName', () => {
    it('フォルダ名を更新できる', () => {
      const folder = Folder.create('未完成');
      folder.updateName('完成');

      expect(folder.name).toBe('完成');
    });

    it('前後の空白はトリムされる', () => {
      const folder = Folder.create('未完成');
      folder.updateName('  アーカイブ  ');

      expect(folder.name).toBe('アーカイブ');
    });

    it('無効なフォルダ名の場合エラー', () => {
      const folder = Folder.create('未完成');
      expect(() => folder.updateName('')).toThrow(DomainError);
    });

    it('空白のみの場合エラー', () => {
      const folder = Folder.create('未完成');
      expect(() => folder.updateName('   ')).toThrow(DomainError);
    });
  });
});
