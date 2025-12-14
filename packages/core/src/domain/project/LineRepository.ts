import { Line } from './Line';

export interface LineRepository {
  findBySectionId(sectionId: string): Promise<Line[]>;
  findById(id: string): Promise<Line | null>;
  save(line: Line): Promise<void>;
  delete(id: string): Promise<boolean>;
  reorder(sectionId: string, lineIds: string[]): Promise<void>;
  deleteBySectionId(sectionId: string): Promise<void>;
}
