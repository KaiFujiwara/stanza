import { Project } from './Project';

export interface ProjectRepository {
  findAll(): Promise<Project[]>;
  findById(id: string): Promise<Project | null>;
  search(query: string): Promise<Project[]>;
  save(project: Project): Promise<void>;
  delete(id: string): Promise<boolean>;
}
