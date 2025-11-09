// Repository implementation
import { Phrase } from '@lyrics-notes/core';
import {
  deleteDoc,
  doc,
  documentId,
  getDoc,
  getDocs,
  orderBy,
  query,
  setDoc,
  Timestamp,
  where,
  writeBatch,
  type CollectionReference,
} from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { userCollection, userDoc } from './utils/firestorePaths';

type PhraseDocument = {
  id: string;
  text: string;
  note?: string | null;
  createdAt: Timestamp;
  updatedAt: Timestamp;
};

type PhraseTagRefDocument = {
  tagId: string;
  userId: string;
  assignedAt: Timestamp;
};

export class PhraseRepository {
  private get collection() {
    return userCollection<PhraseDocument>('phrases');
  }

  private phraseTagRefsCollection(
    phraseId: string
  ): CollectionReference<PhraseTagRefDocument> {
    return userCollection<PhraseTagRefDocument>('phrases', phraseId, 'tagRefs');
  }

  private docToEntity(data: PhraseDocument, id: string): Phrase {
    return new Phrase(
      id,
      data.text,
      data.note ?? undefined,
      data.createdAt.toDate(),
      data.updatedAt.toDate()
    );
  }

  private async fetchPhrasesByIds(ids: string[]): Promise<Phrase[]> {
    if (ids.length === 0) {
      return [];
    }

    const chunks: string[][] = [];
    for (let i = 0; i < ids.length; i += 10) {
      chunks.push(ids.slice(i, i + 10));
    }

    const results: Phrase[] = [];
    for (const chunk of chunks) {
      const snapshot = await getDocs(
        query(this.collection, where(documentId(), 'in', chunk))
      );
      snapshot.forEach(doc => {
        results.push(this.docToEntity(doc.data(), doc.id));
      });
    }

    return results.sort(
      (a, b) => b.updatedAt.getTime() - a.updatedAt.getTime()
    );
  }

  async findAll(): Promise<Phrase[]> {
    const snapshot = await getDocs(
      query(this.collection, orderBy('updatedAt', 'desc'))
    );
    return snapshot.docs.map(doc => this.docToEntity(doc.data(), doc.id));
  }

  async findById(id: string): Promise<Phrase | null> {
    const docRef = userDoc<PhraseDocument>('phrases', id);
    const snapshot = await getDoc(docRef);
    if (!snapshot.exists()) {
      return null;
    }
    return this.docToEntity(snapshot.data() as PhraseDocument, snapshot.id);
  }

  async save(phrase: Phrase): Promise<void> {
    const docRef = userDoc<PhraseDocument>('phrases', phrase.id);
    const payload: PhraseDocument = {
      id: phrase.id,
      text: phrase.text,
      note: phrase.note ?? null,
      createdAt: Timestamp.fromDate(phrase.createdAt),
      updatedAt: Timestamp.fromDate(phrase.updatedAt),
    };
    await setDoc(docRef, payload, { merge: true });
  }

  async delete(id: string): Promise<boolean> {
    const docRef = userDoc<PhraseDocument>('phrases', id);
    const snapshot = await getDoc(docRef);
    if (!snapshot.exists()) {
      return false;
    }

    const batch = writeBatch(db);
    batch.delete(docRef);

    const tagRefsSnapshot = await getDocs(this.phraseTagRefsCollection(id));
    tagRefsSnapshot.forEach(refDoc => {
      batch.delete(refDoc.ref);
      batch.delete(userDoc('tags', refDoc.id, 'phraseRefs', id));
    });

    await batch.commit();
    return true;
  }

  async search(queryText: string): Promise<Phrase[]> {
    const normalized = queryText.trim().toLowerCase();
    if (!normalized) {
      return this.findAll();
    }

    const snapshot = await getDocs(
      query(this.collection, orderBy('updatedAt', 'desc'))
    );
    return snapshot.docs
      .map(doc => this.docToEntity(doc.data(), doc.id))
      .filter(phrase => {
        const note = phrase.note ?? '';
        return (
          phrase.text.toLowerCase().includes(normalized) ||
          note.toLowerCase().includes(normalized)
        );
      });
  }

  async findByTagId(tagId: string): Promise<Phrase[]> {
    const phraseRefs = await getDocs(userCollection('tags', tagId, 'phraseRefs'));
    const phraseIds = phraseRefs.docs.map(doc => doc.id);
    return this.fetchPhrasesByIds(phraseIds);
  }
}

// シングルトンインスタンス
export const phraseRepository = new PhraseRepository();
