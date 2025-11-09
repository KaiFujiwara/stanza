// Repository implementation
import { Tag } from '@lyrics-notes/core';
import {
  collectionGroup,
  deleteDoc,
  documentId,
  doc,
  getDoc,
  getDocs,
  limit,
  orderBy,
  query,
  setDoc,
  startAt,
  endAt,
  Timestamp,
  where,
  writeBatch,
  type CollectionReference,
} from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { getUserId, userCollection, userDoc } from './utils/firestorePaths';

type TagDocument = {
  id: string;
  name: string;
  nameLower: string;
  color?: string | null;
  createdAt: Timestamp;
  updatedAt: Timestamp;
};

type TagRefDocument = {
  tagId: string;
  userId: string;
  assignedAt: Timestamp;
};

type PhraseRefDocument = {
  phraseId: string;
  userId: string;
  taggedAt: Timestamp;
};

type TagScope = 'folders' | 'projects' | 'phrases';

export class TagRepository {
  private get collection() {
    return userCollection<TagDocument>('tags');
  }

  private docToEntity(data: TagDocument, id: string): Tag {
    return new Tag(
      id,
      data.name,
      data.color ?? undefined,
      data.createdAt.toDate(),
      data.updatedAt.toDate()
    );
  }

  private tagRefsCollection(
    scope: TagScope,
    parentId: string
  ): CollectionReference<TagRefDocument> {
    return userCollection<TagRefDocument>(scope, parentId, 'tagRefs');
  }

  private phraseRefsCollection(
    tagId: string
  ): CollectionReference<PhraseRefDocument> {
    return userCollection<PhraseRefDocument>('tags', tagId, 'phraseRefs');
  }

  private async fetchTagsByIds(ids: string[]): Promise<Tag[]> {
    if (ids.length === 0) {
      return [];
    }

    const chunks: string[][] = [];
    for (let i = 0; i < ids.length; i += 10) {
      chunks.push(ids.slice(i, i + 10));
    }

    const results: Tag[] = [];
    for (const chunk of chunks) {
      const snapshot = await getDocs(
        query(this.collection, where(documentId(), 'in', chunk))
      );
      snapshot.forEach(doc => {
        results.push(this.docToEntity(doc.data(), doc.id));
      });
    }

    return results.sort((a, b) => a.name.localeCompare(b.name));
  }

  private async fetchLinkedTagIds(
    scope: TagScope,
    parentId: string
  ): Promise<string[]> {
    const snapshot = await getDocs(this.tagRefsCollection(scope, parentId));
    return snapshot.docs.map(doc => doc.id);
  }

  private async fetchLinkedTags(scope: TagScope, parentId: string) {
    const ids = await this.fetchLinkedTagIds(scope, parentId);
    return this.fetchTagsByIds(ids);
  }

  private async createTagRef(scope: TagScope, parentId: string, tagId: string) {
    const ref = this.tagRefsCollection(scope, parentId);
    await setDoc(doc(ref, tagId), {
      tagId,
      userId: getUserId(),
      assignedAt: Timestamp.fromDate(new Date()),
    });
  }

  private async removeTagRef(scope: TagScope, parentId: string, tagId: string) {
    const ref = this.tagRefsCollection(scope, parentId);
    await deleteDoc(doc(ref, tagId));
  }

  async findAll(): Promise<Tag[]> {
    const snapshot = await getDocs(
      query(this.collection, orderBy('nameLower', 'asc'))
    );
    return snapshot.docs.map(doc => this.docToEntity(doc.data(), doc.id));
  }

  async findById(id: string): Promise<Tag | null> {
    const docRef = userDoc<TagDocument>('tags', id);
    const snapshot = await getDoc(docRef);
    if (!snapshot.exists()) {
      return null;
    }
    return this.docToEntity(snapshot.data() as TagDocument, snapshot.id);
  }

  async findByName(name: string): Promise<Tag | null> {
    const normalized = name.trim().toLowerCase();
    const snapshot = await getDocs(
      query(this.collection, where('nameLower', '==', normalized), limit(1))
    );
    if (snapshot.empty) {
      return null;
    }
    const doc = snapshot.docs[0];
    return this.docToEntity(doc.data(), doc.id);
  }

  async save(tag: Tag): Promise<void> {
    const docRef = userDoc<TagDocument>('tags', tag.id);
    const payload: TagDocument = {
      id: tag.id,
      name: tag.name,
      nameLower: tag.name.toLowerCase(),
      color: tag.color ?? null,
      createdAt: Timestamp.fromDate(tag.createdAt),
      updatedAt: Timestamp.fromDate(tag.updatedAt),
    };
    await setDoc(docRef, payload, { merge: true });
  }

  async delete(id: string): Promise<boolean> {
    const docRef = userDoc<TagDocument>('tags', id);
    const snapshot = await getDoc(docRef);
    if (!snapshot.exists()) {
      return false;
    }

    const batch = writeBatch(db);
    batch.delete(docRef);

    const tagRefsSnapshot = await getDocs(
      query(
        collectionGroup(db, 'tagRefs'),
        where('tagId', '==', id),
        where('userId', '==', getUserId())
      )
    );
    tagRefsSnapshot.forEach(refDoc => batch.delete(refDoc.ref));

    const phraseRefsSnapshot = await getDocs(this.phraseRefsCollection(id));
    phraseRefsSnapshot.forEach(refDoc => batch.delete(refDoc.ref));

    await batch.commit();
    return true;
  }

  async search(queryText: string): Promise<Tag[]> {
    const normalized = queryText.trim().toLowerCase();
    if (!normalized) {
      return this.findAll();
    }

    const snapshot = await getDocs(
      query(
        this.collection,
        orderBy('nameLower'),
        startAt(normalized),
        endAt(`${normalized}\uf8ff`)
      )
    );
    return snapshot.docs.map(doc => this.docToEntity(doc.data(), doc.id));
  }

  async findByFolderId(folderId: string): Promise<Tag[]> {
    return this.fetchLinkedTags('folders', folderId);
  }

  async findByProjectId(projectId: string): Promise<Tag[]> {
    return this.fetchLinkedTags('projects', projectId);
  }

  async findByPhraseId(phraseId: string): Promise<Tag[]> {
    return this.fetchLinkedTags('phrases', phraseId);
  }

  async addToFolder(folderId: string, tagId: string): Promise<void> {
    await this.createTagRef('folders', folderId, tagId);
  }

  async addToProject(projectId: string, tagId: string): Promise<void> {
    await this.createTagRef('projects', projectId, tagId);
  }

  async addToPhrase(phraseId: string, tagId: string): Promise<void> {
    await this.createTagRef('phrases', phraseId, tagId);

    const phraseRefs = this.phraseRefsCollection(tagId);
    await setDoc(doc(phraseRefs, phraseId), {
      phraseId,
      userId: getUserId(),
      taggedAt: Timestamp.fromDate(new Date()),
    });
  }

  async removeFromFolder(folderId: string, tagId: string): Promise<void> {
    await this.removeTagRef('folders', folderId, tagId);
  }

  async removeFromProject(projectId: string, tagId: string): Promise<void> {
    await this.removeTagRef('projects', projectId, tagId);
  }

  async removeFromPhrase(phraseId: string, tagId: string): Promise<void> {
    await this.removeTagRef('phrases', phraseId, tagId);
    await deleteDoc(doc(this.phraseRefsCollection(tagId), phraseId));
  }
}

// シングルトンインスタンス
export const tagRepository = new TagRepository();
