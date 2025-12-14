import { ProjectTitle } from './vo/ProjectTitle';
import { EntityId } from '../shared/EntityId';

export class Project {
  constructor(
    public readonly id: string,
    public title: string,
    public folderId?: string,
    public genreId?: string,
    public readonly createdAt: Date = new Date(),
    public updatedAt: Date = new Date(),
    public isDeleted: boolean = false,
    public deletedAt: Date | null = null
  ) {
    ProjectTitle.validate(title);
  }

  static create(title: string, folderId?: string, genreId?: string): Project {
    const validatedTitle = ProjectTitle.validate(title);
    const now = new Date();
    return new Project(
      EntityId.generate(),
      validatedTitle,
      folderId,
      genreId,
      now,
      now,
      false,
      null
    );
  }

  updateTitle(title: string): void {
    const validatedTitle = ProjectTitle.validate(title);
    this.title = validatedTitle;
    this.updatedAt = new Date();
  }

  softDelete(): void {
    const now = new Date();
    this.isDeleted = true;
    this.deletedAt = now;
    this.updatedAt = now;
  }

  restore(): void {
    this.isDeleted = false;
    this.deletedAt = null;
    this.updatedAt = new Date();
  }

  moveToFolder(folderId?: string): void {
    this.folderId = folderId;
    this.updatedAt = new Date();
  }

  setGenre(genreId?: string): void {
    this.genreId = genreId;
    this.updatedAt = new Date();
  }
}
