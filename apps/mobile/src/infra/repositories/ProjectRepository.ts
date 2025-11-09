// Repository implementation
import {
  Project,
  ProjectRepository as ProjectRepositoryPort,
} from '@lyrics-notes/core';
import {
  endAt,
  getDoc,
  getDocs,
  orderBy,
  query,
  setDoc,
  startAt,
  Timestamp,
  updateDoc,
  where,
} from 'firebase/firestore';
import { userCollection, userDoc } from './utils/firestorePaths';

type ProjectDocument = {
  id: string;
  title: string;
  titleLower: string;
  folderId?: string | null;
  genreId?: string | null;
  isDeleted: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  deletedAt?: Timestamp | null;
};

export class ProjectRepository implements ProjectRepositoryPort {
  private get collection() {
    return userCollection<ProjectDocument>('projects');
  }

  private docToEntity(data: ProjectDocument, id: string): Project {
    return new Project(
      id,
      data.title,
      data.folderId ?? undefined,
      data.genreId ?? undefined,
      data.createdAt.toDate(),
      data.updatedAt.toDate(),
      data.isDeleted
    );
  }

  async findAll(): Promise<Project[]> {
    const snapshot = await getDocs(
      query(
        this.collection,
        where('isDeleted', '==', false),
        orderBy('updatedAt', 'desc')
      )
    );
    return snapshot.docs.map(doc => this.docToEntity(doc.data(), doc.id));
  }

  async findById(id: string): Promise<Project | null> {
    const docRef = userDoc<ProjectDocument>('projects', id);
    const snapshot = await getDoc(docRef);
    if (!snapshot.exists()) {
      return null;
    }

    const data = snapshot.data();
    if (!data || data.isDeleted) {
      return null;
    }

    return this.docToEntity(data, snapshot.id);
  }

  async save(project: Project): Promise<void> {
    const docRef = userDoc<ProjectDocument>('projects', project.id);
    const payload: ProjectDocument = {
      id: project.id,
      title: project.title,
      titleLower: project.title.toLowerCase(),
      folderId: project.folderId ?? null,
      genreId: project.genreId ?? null,
      isDeleted: project.isDeleted,
      createdAt: Timestamp.fromDate(project.createdAt),
      updatedAt: Timestamp.fromDate(project.updatedAt),
      deletedAt: project.isDeleted ? Timestamp.fromDate(project.updatedAt) : null,
    };

    await setDoc(docRef, payload, { merge: true });
  }

  async delete(id: string): Promise<boolean> {
    const docRef = userDoc<ProjectDocument>('projects', id);
    const snapshot = await getDoc(docRef);
    if (!snapshot.exists()) {
      return false;
    }

    const now = Timestamp.fromDate(new Date());
    await updateDoc(docRef, {
      isDeleted: true,
      deletedAt: now,
      updatedAt: now,
    });
    return true;
  }

  async search(queryText: string): Promise<Project[]> {
    const normalized = queryText.trim().toLowerCase();
    if (!normalized) {
      return this.findAll();
    }

    const snapshot = await getDocs(
      query(
        this.collection,
        where('isDeleted', '==', false),
        orderBy('titleLower'),
        startAt(normalized),
        endAt(`${normalized}\uf8ff`)
      )
    );
    return snapshot.docs.map(doc => this.docToEntity(doc.data(), doc.id));
  }
}

// シングルトンインスタンス
export const projectRepository = new ProjectRepository();
