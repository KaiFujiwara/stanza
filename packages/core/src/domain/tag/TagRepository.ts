import { Tag } from './Tag';

export interface TagRepository {
  findAll(): Promise<Tag[]>;
  findById(id: string): Promise<Tag | null>;
  findByName(name: string): Promise<Tag | null>;
  search(query: string): Promise<Tag[]>;
  findByPhraseId(phraseId: string): Promise<Tag[]>;
  addToPhrase(phraseId: string, tagId: string): Promise<void>;
  removeFromPhrase(phraseId: string, tagId: string): Promise<void>;
  save(tag: Tag): Promise<void>;
  delete(id: string): Promise<boolean>;
}
