import { 
  collection, 
  doc, 
  setDoc, 
  deleteDoc, 
  onSnapshot 
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType, testConnection } from '../firebase';
import { JobQuestionPost, JobCircular, ExamSyllabus } from '../types';
import { 
  saveJobQuestions, 
  saveJobCirculars, 
  saveExamSyllabuses,
  getJobQuestions,
  getJobCirculars,
  getExamSyllabuses
} from '../utils/storage';

// Strip undefined fields which Firestore rejects
function sanitizePayload<T extends Record<string, any>>(obj: T): Record<string, any> {
  const result: Record<string, any> = {};
  for (const [key, value] of Object.entries(obj)) {
    if (value !== undefined) {
      result[key] = value;
    }
  }
  return result;
}

// -------------------------------------------------------------
// Real-time synchronization for Questions across all devices
// -------------------------------------------------------------
export function subscribeToQuestions(
  onUpdate: (questions: JobQuestionPost[]) => void
): () => void {
  const path = 'questions';
  const collRef = collection(db, path);

  const unsubscribe = onSnapshot(
    collRef,
    (snapshot) => {
      const questionsList: JobQuestionPost[] = [];
      snapshot.forEach((docSnap) => {
        const data = docSnap.data() as JobQuestionPost;
        if (data && data.id) {
          questionsList.push(data);
        }
      });

      // Sort by uploadDate or examYear descending
      questionsList.sort((a, b) => (b.examYear || 0) - (a.examYear || 0));

      // Cache locally for instant offline/re-render
      saveJobQuestions(questionsList);
      onUpdate(questionsList);
    },
    (error) => {
      console.warn('Real-time questions snapshot fallback to local cache:', error);
      // Fallback to local cache so user never sees blank screen
      onUpdate(getJobQuestions());
      handleFirestoreError(error, OperationType.GET, path);
    }
  );

  return unsubscribe;
}

export async function syncAddOrUpdateQuestion(post: JobQuestionPost): Promise<void> {
  const path = `questions/${post.id}`;
  try {
    const clean = sanitizePayload(post);
    await setDoc(doc(db, 'questions', post.id), clean);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function syncDeleteQuestion(id: string): Promise<void> {
  const path = `questions/${id}`;
  try {
    await deleteDoc(doc(db, 'questions', id));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

// -------------------------------------------------------------
// Real-time synchronization for Circulars across all devices
// -------------------------------------------------------------
export function subscribeToCirculars(
  onUpdate: (circulars: JobCircular[]) => void
): () => void {
  const path = 'circulars';
  const collRef = collection(db, path);

  const unsubscribe = onSnapshot(
    collRef,
    (snapshot) => {
      const circularsList: JobCircular[] = [];
      snapshot.forEach((docSnap) => {
        const data = docSnap.data() as JobCircular;
        if (data && data.id) {
          circularsList.push(data);
        }
      });

      saveJobCirculars(circularsList);
      onUpdate(circularsList);
    },
    (error) => {
      console.warn('Real-time circulars snapshot fallback to local cache:', error);
      onUpdate(getJobCirculars());
      handleFirestoreError(error, OperationType.GET, path);
    }
  );

  return unsubscribe;
}

export async function syncAddOrUpdateCircular(circular: JobCircular): Promise<void> {
  const path = `circulars/${circular.id}`;
  try {
    const clean = sanitizePayload(circular);
    await setDoc(doc(db, 'circulars', circular.id), clean);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function syncDeleteCircular(id: string): Promise<void> {
  const path = `circulars/${id}`;
  try {
    await deleteDoc(doc(db, 'circulars', id));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

// -------------------------------------------------------------
// Real-time synchronization for Syllabuses across all devices
// -------------------------------------------------------------
export function subscribeToSyllabuses(
  onUpdate: (syllabuses: ExamSyllabus[]) => void
): () => void {
  const path = 'syllabuses';
  const collRef = collection(db, path);

  const unsubscribe = onSnapshot(
    collRef,
    (snapshot) => {
      const syllabusesList: ExamSyllabus[] = [];
      snapshot.forEach((docSnap) => {
        const data = docSnap.data() as ExamSyllabus;
        if (data && data.id) {
          syllabusesList.push(data);
        }
      });

      saveExamSyllabuses(syllabusesList);
      onUpdate(syllabusesList);
    },
    (error) => {
      console.warn('Real-time syllabuses snapshot fallback to local cache:', error);
      onUpdate(getExamSyllabuses());
      handleFirestoreError(error, OperationType.GET, path);
    }
  );

  return unsubscribe;
}

export async function syncAddOrUpdateSyllabus(syllabus: ExamSyllabus): Promise<void> {
  const path = `syllabuses/${syllabus.id}`;
  try {
    const clean = sanitizePayload(syllabus);
    await setDoc(doc(db, 'syllabuses', syllabus.id), clean);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function syncDeleteSyllabus(id: string): Promise<void> {
  const path = `syllabuses/${id}`;
  try {
    await deleteDoc(doc(db, 'syllabuses', id));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

export { testConnection };
