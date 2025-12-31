import { Phrase } from './Phrase';
import { EntityId } from '../shared/EntityId';

export interface PhraseRepository {
  findById(id: EntityId): Promise<Phrase | null>;
  save(phrase: Phrase): Promise<void>;
  delete(id: EntityId): Promise<void>;
  countByUser(): Promise<number>;
}
