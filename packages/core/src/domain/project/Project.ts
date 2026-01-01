import { ProjectTitle, ProjectTitleValue } from './vo/ProjectTitle';
import { EntityId } from '../shared/EntityId';
import { Section } from './Section';
import { MAX_SECTIONS_PER_PROJECT } from '../../constants/limits';
import { DomainError } from '../shared/errors/DomainError';
import { ErrorCode } from '../shared/errors/ErrorCode';

export class Project {

  private _id: EntityId;
  private _title: ProjectTitleValue;
  private _folderId?: EntityId;
  private _genreId?: EntityId;
  private _orderIndex: number;
  private _sections: Section[];
  private _isDeleted: boolean;
  private _deletedAt: Date | null;

  private constructor(
    id: EntityId,
    title: string,
    folderId: EntityId | undefined,
    genreId: EntityId | undefined,
    orderIndex: number,
    sections: Section[],
    isDeleted: boolean = false,
    deletedAt: Date | null = null
  ) {
    this._id = id;
    this._title = ProjectTitle.validate(title);
    this._folderId = folderId;
    this._genreId = genreId;
    this._orderIndex = orderIndex;
    this._sections = sections;
    this._isDeleted = isDeleted;
    this._deletedAt = deletedAt;
  }

  get id(): EntityId {
    return this._id;
  }

  get title(): ProjectTitleValue {
    return this._title;
  }

  get folderId(): EntityId | undefined {
    return this._folderId;
  }

  get genreId(): EntityId | undefined {
    return this._genreId;
  }

  get orderIndex(): number {
    return this._orderIndex;
  }

  get sections(): readonly Section[] {
    return [...this._sections];
  }

  get isDeleted(): boolean {
    return this._isDeleted;
  }

  get deletedAt(): Date | null {
    return this._deletedAt;
  }

  static create(
    title: string,
    folderId?: EntityId,
    genreId?: EntityId,
    orderIndex: number = 0,
    sections: Section[] = []
  ): Project {
    if (sections.length > MAX_SECTIONS_PER_PROJECT) {
      throw new DomainError(
        ErrorCode.MAX_COUNT_EXCEEDED,
        `セクション数の上限を超えています（最大: ${MAX_SECTIONS_PER_PROJECT}）`,
        { maxCount: MAX_SECTIONS_PER_PROJECT, actualCount: sections.length }
      );
    }
    return new Project(
      EntityId.generate(),
      title,
      folderId,
      genreId,
      orderIndex,
      sections,
      false,
      null
    );
  }

  static reconstruct(
    id: EntityId,
    title: string,
    folderId: EntityId | undefined,
    genreId: EntityId | undefined,
    orderIndex: number,
    sections: Section[],
    isDeleted: boolean,
    deletedAt: Date | null
  ): Project {
    return new Project(
      id,
      title,
      folderId,
      genreId,
      orderIndex,
      sections,
      isDeleted,
      deletedAt
    );
  }

  updateTitle(title: string): void {
    this.ensureNotDeleted();
    this._title = ProjectTitle.validate(title);
  }

  moveToFolder(folderId?: EntityId): void {
    this.ensureNotDeleted();
    this._folderId = folderId;
  }

  setOrderIndex(orderIndex: number): void {
    this.ensureNotDeleted();
    this._orderIndex = orderIndex;
  }

  setGenre(genreId?: EntityId): void {
    this.ensureNotDeleted();
    this._genreId = genreId;
  }

  setSections(sections: Section[]): void {
    this.ensureNotDeleted();

    if (sections.length > MAX_SECTIONS_PER_PROJECT) {
      throw new DomainError(
        ErrorCode.MAX_COUNT_EXCEEDED,
        `セクション数の上限を超えています（最大: ${MAX_SECTIONS_PER_PROJECT}）`,
        { maxCount: MAX_SECTIONS_PER_PROJECT, actualCount: sections.length }
      );
    }

    this._sections = sections;
  }

  softDelete(): void {
    const now = new Date();
    this._isDeleted = true;
    this._deletedAt = now;
  }

  restore(): void {
    this._isDeleted = false;
    this._deletedAt = null;
  }

  private ensureNotDeleted(): void {
    if (this._isDeleted) {
      throw new DomainError(
        ErrorCode.ENTITY_NOT_FOUND,
        '削除済みのプロジェクトは変更できません',
        { entity: 'project', id: this._id, isDeleted: true }
      );
    }
  }
}
