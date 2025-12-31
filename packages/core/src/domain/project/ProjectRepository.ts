import { Project } from './Project';
import { EntityId } from '../shared/EntityId';

export interface ProjectRepository {
  findById(id: EntityId): Promise<Project | null>;
  save(project: Project): Promise<void>;
  reorder(projectIds: EntityId[]): Promise<void>;
  delete(id: EntityId): Promise<void>;
}
