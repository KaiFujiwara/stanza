// Repository implementation
import { Folder } from '@lyrics-notes/core';
import {
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  setDoc,
  Timestamp,
  where,
  writeBatch,
} from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { userCollection, userDoc } from './utils/firestorePaths';

type FolderDocument = {
  id: string;
  name: string;
  orderIndex: number;
  createdAt: Timestamp;
  updatedAt: Timestamp;
};

export class FolderRepository {
  private get collection() {
    return userCollection<FolderDocument>('folders');
  }

  private docToEntity(data: FolderDocument, id: string): Folder {
    return new Folder(
      id,
      data.name,
      data.orderIndex,
      data.createdAt.toDate(),
      data.updatedAt.toDate()
    );
  }

  async findAll(): Promise<Folder[]> {
    const snapshot = await getDocs(
      query(this.collection, orderBy('orderIndex', 'asc'))
    );
    return snapshot.docs.map(doc => this.docToEntity(doc.data(), doc.id));
  }

  async findById(id: string): Promise<Folder | null> {
    const docRef = userDoc<FolderDocument>('folders', id);
    const snapshot = await getDoc(docRef);
    if (!snapshot.exists()) {
      return null;
    }
    return this.docToEntity(snapshot.data() as FolderDocument, snapshot.id);
  }

  async save(folder: Folder): Promise<void> {
    const docRef = userDoc<FolderDocument>('folders', folder.id);
    const payload: FolderDocument = {
      id: folder.id,
      name: folder.name,
      orderIndex: folder.orderIndex,
      createdAt: Timestamp.fromDate(folder.createdAt),
      updatedAt: Timestamp.fromDate(folder.updatedAt),
    };
    await setDoc(docRef, payload, { merge: true });
  }

  async delete(id: string): Promise<boolean> {
    const docRef = userDoc<FolderDocument>('folders', id);
    const snapshot = await getDoc(docRef);
    if (!snapshot.exists()) {
      return false;
    }

    const batch = writeBatch(db);
    const projectsSnapshot = await getDocs(
      query(userCollection('projects'), where('folderId', '==', id))
    );

    const now = Timestamp.fromDate(new Date());
    projectsSnapshot.forEach(projectDoc => {
      batch.update(projectDoc.ref, { folderId: null, updatedAt: now });
    });

    batch.delete(docRef);
    await batch.commit();
    return true;
  }

  async reorder(folderIds: string[]): Promise<void> {
    const batch = writeBatch(db);
    const now = Timestamp.fromDate(new Date());

    folderIds.forEach((folderId, index) => {
      const folderRef = userDoc('folders', folderId);
      batch.update(folderRef, { orderIndex: index, updatedAt: now });
    });

    await batch.commit();
  }
}

// シングルトンインスタンス
export const folderRepository = new FolderRepository();
