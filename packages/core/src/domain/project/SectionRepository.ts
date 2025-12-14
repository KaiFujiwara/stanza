import { Section } from './Section';

export interface SectionRepository {
  findByProjectId(projectId: string): Promise<Section[]>;
  findById(id: string): Promise<Section | null>;
  save(section: Section): Promise<void>;
  delete(id: string): Promise<boolean>;
  reorder(projectId: string, sectionIds: string[]): Promise<void>;
}
