import { Phrase } from './Phrase';

export interface PhraseRepository {
  findById(id: string): Promise<Phrase | null>;
  save(phrase: Phrase): Promise<void>;
  delete(id: string): Promise<void>;
}
