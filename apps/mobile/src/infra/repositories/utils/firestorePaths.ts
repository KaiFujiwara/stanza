import {
  collection,
  doc,
  type CollectionReference,
  type DocumentData,
  type DocumentReference,
} from 'firebase/firestore';
import { db, getCurrentUserId } from '@/lib/firebase/config';

/**
 * Returns a user-scoped collection reference under `users/{uid}`.
 */
export const userCollection = <T = DocumentData>(
  ...segments: string[]
): CollectionReference<T> => {
  const userId = getCurrentUserId();
  return collection(db, 'users', userId, ...segments) as CollectionReference<T>;
};

/**
 * Returns a user-scoped document reference under `users/{uid}`.
 */
export const userDoc = <T = DocumentData>(
  ...segments: string[]
): DocumentReference<T> => {
  const userId = getCurrentUserId();
  return doc(db, 'users', userId, ...segments) as DocumentReference<T>;
};

/**
 * Convenience accessor for the currently authenticated user ID.
 */
export const getUserId = (): string => getCurrentUserId();
