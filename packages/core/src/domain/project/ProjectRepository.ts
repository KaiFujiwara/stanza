import { Project } from './Project';

export interface ProjectRepository {
  findById(id: string): Promise<Project | null>;
  save(project: Project): Promise<void>;
  reorder(projectIds: string[]): Promise<void>;
  delete(id: string): Promise<void>;
}
