import {
  collectionGroup,
  getDocs,
  limit,
  query,
  where,
  Timestamp,
  type CollectionReference,
  type DocumentReference,
} from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { getUserId, userCollection } from './firestorePaths';

export type SectionDocument = {
  id: string;
  userId: string;
  projectId: string;
  name: string;
  orderIndex: number;
  createdAt: Timestamp;
  updatedAt: Timestamp;
};

/**
 * Returns the sections collection under a specific project.
 */
export const projectSectionsCollection = (
  projectId: string
): CollectionReference<SectionDocument> =>
  userCollection<SectionDocument>('projects', projectId, 'sections');

/**
 * Resolves a section document across all projects for the current user.
 */
export const findSectionDocument = async (
  sectionId: string
): Promise<
  | {
      ref: DocumentReference<SectionDocument>;
      data: SectionDocument;
    }
  | null
> => {
  const userId = getUserId();

  const sectionsQuery = query(
    collectionGroup(db, 'sections'),
    where('userId', '==', userId),
    where('id', '==', sectionId),
    limit(1)
  );

  const snapshot = await getDocs(sectionsQuery);
  if (snapshot.empty) {
    return null;
  }

  const docSnap = snapshot.docs[0];
  return {
    ref: docSnap.ref as DocumentReference<SectionDocument>,
    data: docSnap.data() as SectionDocument,
  };
};
