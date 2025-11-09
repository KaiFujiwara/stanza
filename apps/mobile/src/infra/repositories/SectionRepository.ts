// Repository implementation
import { Section } from '@lyrics-notes/core';
import {
  deleteDoc,
  doc,
  getDocs,
  orderBy,
  query,
  setDoc,
  Timestamp,
  updateDoc,
  writeBatch,
} from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { getUserId, userDoc } from './utils/firestorePaths';
import {
  findSectionDocument,
  projectSectionsCollection,
  type SectionDocument,
} from './utils/sectionQueries';

export class SectionRepository {
  private docToEntity(data: SectionDocument): Section {
    return new Section(
      data.id,
      data.projectId,
      data.name,
      data.orderIndex,
      data.createdAt.toDate(),
      data.updatedAt.toDate()
    );
  }

  private async touchProject(projectId: string, date?: Date) {
    const timestamp = Timestamp.fromDate(date ?? new Date());
    await updateDoc(userDoc('projects', projectId), {
      updatedAt: timestamp,
    });
  }

  async findByProjectId(projectId: string): Promise<Section[]> {
    const snapshot = await getDocs(
      query(projectSectionsCollection(projectId), orderBy('orderIndex', 'asc'))
    );
    return snapshot.docs.map(doc => this.docToEntity(doc.data()));
  }

  async findById(id: string): Promise<Section | null> {
    const sectionDoc = await findSectionDocument(id);
    if (!sectionDoc) {
      return null;
    }
    return this.docToEntity(sectionDoc.data);
  }

  async save(section: Section): Promise<void> {
    const collectionRef = projectSectionsCollection(section.projectId);
    const docRef = doc(collectionRef, section.id);
    const payload: SectionDocument = {
      id: section.id,
      userId: getUserId(),
      projectId: section.projectId,
      name: section.name,
      orderIndex: section.orderIndex,
      createdAt: Timestamp.fromDate(section.createdAt),
      updatedAt: Timestamp.fromDate(section.updatedAt),
    };

    await setDoc(docRef, payload, { merge: true });
    await this.touchProject(section.projectId, section.updatedAt);
  }

  async delete(id: string): Promise<boolean> {
    const sectionDoc = await findSectionDocument(id);
    if (!sectionDoc) {
      return false;
    }

    await deleteDoc(sectionDoc.ref);
    await this.touchProject(sectionDoc.data.projectId);
    return true;
  }

  async reorder(projectId: string, sectionIds: string[]): Promise<void> {
    const batch = writeBatch(db);
    const now = Timestamp.fromDate(new Date());
    const collectionRef = projectSectionsCollection(projectId);

    sectionIds.forEach((sectionId, index) => {
      const sectionRef = doc(collectionRef, sectionId);
      batch.update(sectionRef, {
        orderIndex: index,
        updatedAt: now,
      });
    });

    const projectRef = userDoc('projects', projectId);
    batch.update(projectRef, { updatedAt: now });

    await batch.commit();
  }
}

// シングルトンインスタンス
export const sectionRepository = new SectionRepository();
