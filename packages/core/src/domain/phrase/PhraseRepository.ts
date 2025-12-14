import { Phrase } from './Phrase';

export interface PhraseRepository {
  findAll(): Promise<Phrase[]>;
  findById(id: string): Promise<Phrase | null>;
  search(params: { text?: string; tagIds?: string[] }): Promise<Phrase[]>;
  findByTagId(tagId: string): Promise<Phrase[]>;
  save(phrase: Phrase): Promise<void>;
  delete(id: string): Promise<boolean>;
}
