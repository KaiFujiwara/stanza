import { PhraseText, PhraseTextValue } from './vo/PhraseText';
import { PhraseNote, PhraseNoteValue } from './vo/PhraseNote';
import { EntityId } from '../shared/EntityId';

// ドメインエンティティ：Phrase
export class Phrase {
  private _id: EntityId;
  private _text: PhraseTextValue;
  private _note?: PhraseNoteValue;
  private _tagIds: string[];

  private constructor(
    id: EntityId,
    text: string,
    note: string | undefined,
    tagIds: string[]
  ) {
    this._id = id;
    this._text = PhraseText.validate(text);
    this._note = PhraseNote.validate(note);
    this._tagIds = Array.from(
      new Set(tagIds.map((id) => id.trim()).filter((id) => id))
    );
  }

  get id(): EntityId {
    return this._id;
  }

  get text(): PhraseTextValue {
    return this._text;
  }

  get note(): PhraseNoteValue | undefined {
    return this._note;
  }

  get tagIds(): string[] {
    return [...this._tagIds];
  }

  static create(
    text: string,
    options: { note?: string; tagIds?: string[] } = {}
  ): Phrase {
    return new Phrase(
      EntityId.generate(),
      text,
      options.note,
      options.tagIds ?? []
    );
  }

  static reconstruct(
    id: EntityId,
    text: string,
    note: string | undefined,
    tagIds: string[]
  ): Phrase {
    return new Phrase(id, text, note, tagIds);
  }

  updateText(text: string): void {
    const validatedText = PhraseText.validate(text);
    this._text = validatedText;
  }

  updateNote(note?: string): void {
    this._note = PhraseNote.validate(note);
  }

  setTags(tagIds: string[]): void {
    this._tagIds = Array.from(new Set(tagIds.map((id) => id.trim()).filter((id) => id)));
  }
}
