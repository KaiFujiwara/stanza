// Repository implementation
import { Line } from '@lyrics-notes/core';
import {
  collection,
  collectionGroup,
  deleteDoc,
  doc,
  getDocs,
  limit,
  orderBy,
  query,
  setDoc,
  Timestamp,
  where,
  writeBatch,
  type CollectionReference,
  type DocumentReference,
} from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { getUserId } from './utils/firestorePaths';
import {
  findSectionDocument,
  type SectionDocument,
} from './utils/sectionQueries';

type LineDocument = {
  id: string;
  userId: string;
  projectId: string;
  sectionId: string;
  text: string;
  lineIndex: number;
  moraCount?: number | null;
  rhymeTail?: string | null;
  createdAt: Timestamp;
  updatedAt: Timestamp;
};

export class LineRepository {
  private docToEntity(data: LineDocument): Line {
    return new Line(
      data.id,
      data.sectionId,
      data.text,
      data.lineIndex,
      data.moraCount ?? undefined,
      data.rhymeTail ?? undefined,
      data.createdAt.toDate(),
      data.updatedAt.toDate()
    );
  }

  private async getSectionContext(
    sectionId: string
  ): Promise<
    | {
        data: SectionDocument;
        ref: DocumentReference<SectionDocument>;
      }
    | null
  > {
    return findSectionDocument(sectionId);
  }

  private async findLineDocument(
    lineId: string
  ): Promise<
    | {
        data: LineDocument;
        ref: DocumentReference<LineDocument>;
      }
    | null
  > {
    const userId = getUserId();
    const lineQuery = query(
      collectionGroup(db, 'lines'),
      where('userId', '==', userId),
      where('id', '==', lineId),
      limit(1)
    );

    const snapshot = await getDocs(lineQuery);
    if (snapshot.empty) {
      return null;
    }

    const docSnap = snapshot.docs[0];
    return {
      ref: docSnap.ref as DocumentReference<LineDocument>,
      data: docSnap.data() as LineDocument,
    };
  }

  async findBySectionId(sectionId: string): Promise<Line[]> {
    const section = await this.getSectionContext(sectionId);
    if (!section) {
      return [];
    }

    const linesCollection = collection(
      section.ref,
      'lines'
    ) as CollectionReference<LineDocument>;
    const snapshot = await getDocs(
      query(linesCollection, orderBy('lineIndex', 'asc'))
    );
    return snapshot.docs.map(doc =>
      this.docToEntity(doc.data() as LineDocument)
    );
  }

  async findById(id: string): Promise<Line | null> {
    const lineDoc = await this.findLineDocument(id);
    if (!lineDoc) {
      return null;
    }

    return this.docToEntity(lineDoc.data);
  }

  async save(line: Line): Promise<void> {
    const section = await this.getSectionContext(line.sectionId);
    if (!section) {
      throw new Error(`Section not found: ${line.sectionId}`);
    }

    const linesCollection = collection(
      section.ref,
      'lines'
    ) as CollectionReference<LineDocument>;
    const docRef = doc(linesCollection, line.id);
    const payload: LineDocument = {
      id: line.id,
      userId: getUserId(),
      projectId: section.data.projectId,
      sectionId: line.sectionId,
      text: line.text,
      lineIndex: line.lineIndex,
      moraCount: line.moraCount ?? null,
      rhymeTail: line.rhymeTail ?? null,
      createdAt: Timestamp.fromDate(line.createdAt),
      updatedAt: Timestamp.fromDate(line.updatedAt),
    };

    await setDoc(docRef, payload, { merge: true });
  }

  async delete(id: string): Promise<boolean> {
    const lineDoc = await this.findLineDocument(id);
    if (!lineDoc) {
      return false;
    }

    await deleteDoc(lineDoc.ref);
    return true;
  }

  async reorderLines(sectionId: string, lineIds: string[]): Promise<void> {
    const section = await this.getSectionContext(sectionId);
    if (!section) {
      return;
    }

    const linesCollection = collection(
      section.ref,
      'lines'
    ) as CollectionReference<LineDocument>;
    const batch = writeBatch(db);
    lineIds.forEach((lineId, index) => {
      const lineRef = doc(linesCollection, lineId);
      batch.update(lineRef, {
        lineIndex: index,
        updatedAt: Timestamp.fromDate(new Date()),
      });
    });
    await batch.commit();
  }

  async deleteBySectionId(sectionId: string): Promise<void> {
    const section = await this.getSectionContext(sectionId);
    if (!section) {
      return;
    }

    const linesCollection = collection(section.ref, 'lines');
    const snapshot = await getDocs(linesCollection);
    const batch = writeBatch(db);
    snapshot.docs.forEach(docSnap => batch.delete(docSnap.ref));
    await batch.commit();
  }
}

// シングルトンインスタンス
export const lineRepository = new LineRepository();
