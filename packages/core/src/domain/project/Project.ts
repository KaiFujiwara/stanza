import { ProjectTitle } from './vo/ProjectTitle';
import { EntityId } from '../shared/EntityId';

export class Project {
  private _id: EntityId;
  private _title: string;
  private _folderId?: string;
  private _genreId?: string;
  private _isDeleted: boolean;
  private _deletedAt: Date | null;
  private _createdAt: Date;
  private _updatedAt: Date;

  private constructor(
    id: EntityId,
    title: string,
    folderId: string | undefined,
    genreId: string | undefined,
    createdAt: Date = new Date(),
    updatedAt: Date = new Date(),
    isDeleted: boolean = false,
    deletedAt: Date | null = null
  ) {
    this._id = id;
    this._title = ProjectTitle.validate(title);
    this._folderId = folderId;
    this._genreId = genreId;
    this._isDeleted = isDeleted;
    this._deletedAt = deletedAt;
    this._createdAt = createdAt;
    this._updatedAt = updatedAt;
  }

  get id(): EntityId {
    return this._id;
  }

  get title(): string {
    return this._title;
  }

  get folderId(): string | undefined {
    return this._folderId;
  }

  get genreId(): string | undefined {
    return this._genreId;
  }

  get isDeleted(): boolean {
    return this._isDeleted;
  }

  get deletedAt(): Date | null {
    return this._deletedAt;
  }

  get createdAt(): Date {
    return this._createdAt;
  }

  get updatedAt(): Date {
    return this._updatedAt;
  }

  static create(title: string, folderId?: string, genreId?: string): Project {
    const now = new Date();
    return new Project(
      EntityId.generate(),
      title,
      folderId,
      genreId,
      now,
      now,
      false,
      null
    );
  }

  static reconstruct(
    id: EntityId,
    title: string,
    folderId: string | undefined,
    genreId: string | undefined,
    createdAt: Date,
    updatedAt: Date,
    isDeleted: boolean,
    deletedAt: Date | null
  ): Project {
    return new Project(
      id,
      title,
      folderId,
      genreId,
      createdAt,
      updatedAt,
      isDeleted,
      deletedAt
    );
  }

  updateTitle(title: string): void {
    const validatedTitle = ProjectTitle.validate(title);
    this._title = validatedTitle;
    this._updatedAt = new Date();
  }

  softDelete(): void {
    const now = new Date();
    this._isDeleted = true;
    this._deletedAt = now;
    this._updatedAt = now;
  }

  restore(): void {
    this._isDeleted = false;
    this._deletedAt = null;
    this._updatedAt = new Date();
  }

  moveToFolder(folderId?: string): void {
    this._folderId = folderId;
    this._updatedAt = new Date();
  }

  setGenre(genreId?: string): void {
    this._genreId = genreId;
    this._updatedAt = new Date();
  }
}
