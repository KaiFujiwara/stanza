import { SectionName } from './vo/SectionName';
import { EntityId } from '../shared/EntityId';
import { Line } from './Line';

// ドメインエンティティ：Section
export class Section {
  private static readonly MAX_LINES = 100;

  private _id: EntityId;
  private _projectId: EntityId;
  private _name: string;
  private _orderIndex: number;
  private _lines: Line[];

  private constructor(
    id: EntityId,
    projectId: EntityId,
    name: string,
    orderIndex: number,
    lines: Line[]
  ) {
    this._id = id;
    this._projectId = projectId;
    this._name = SectionName.validate(name);
    this._orderIndex = orderIndex;
    this._lines = lines;
  }

  get id(): EntityId {
    return this._id;
  }

  get projectId(): EntityId {
    return this._projectId;
  }

  get name(): string {
    return this._name;
  }

  get orderIndex(): number {
    return this._orderIndex;
  }

  get lines(): readonly Line[] {
    return [...this._lines];
  }

  static create(
    projectId: EntityId,
    name: string,
    orderIndex: number = 0
  ): Section {
    return new Section(
      EntityId.generate(),
      projectId,
      name,
      orderIndex,
      []
    );
  }

  static reconstruct(
    id: EntityId,
    projectId: EntityId,
    name: string,
    orderIndex: number,
    lines: Line[]
  ): Section {
    return new Section(id, projectId, name, orderIndex, lines);
  }

  updateName(name: string): void {
    const validatedName = SectionName.validate(name);
    this._name = validatedName;
  }

  reorder(newIndex: number): void {
    this._orderIndex = newIndex;
  }

  // 行追加
  addLine(text: string): Line {
    if (this._lines.length >= Section.MAX_LINES) {
      throw new Error(
        `行数の上限を超えています（最大: ${Section.MAX_LINES}）`
      );
    }

    const line = Line.create(
      this._id,
      text,
      this._lines.length
    );

    this._lines.push(line);
    return line;
  }

  // 行更新
  updateLineText(lineId: string, text: string): void {
    const line = this._lines.find(l => l.id === lineId);
    if (!line) {
      throw new Error(`行が見つかりません: ${lineId}`);
    }
    line.updateText(text);
  }

  // 行削除
  removeLine(lineId: string): void {
    const index = this._lines.findIndex(l => l.id === lineId);
    if (index === -1) {
      throw new Error(`行が見つかりません: ${lineId}`);
    }

    this._lines.splice(index, 1);

    // lineIndex を振り直し
    this._lines.forEach((line, idx) => {
      line.reorder(idx);
    });
  }

  // 行並び替え
  reorderLines(orderedIds: string[]): void {
    if (orderedIds.length !== this._lines.length) {
      throw new Error('並び替え対象の行数が一致しません');
    }

    const reordered = orderedIds.map(id => {
      const line = this._lines.find(l => l.id === id);
      if (!line) {
        throw new Error(`行が見つかりません: ${id}`);
      }
      return line;
    });

    reordered.forEach((line, index) => {
      line.reorder(index);
    });

    this._lines = reordered;
  }
}
