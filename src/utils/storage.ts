import { JobQuestionPost, JobCircular, ExamSyllabus } from '../types';
import { INITIAL_JOB_QUESTIONS } from '../data/seedQuestions';
import { INITIAL_JOB_CIRCULARS } from '../data/seedCirculars';
import { INITIAL_EXAM_SYLLABUSES } from '../data/seedSyllabus';

const QUESTIONS_STORAGE_KEY = 'exam_archive_clean_questions_v1';
const LEGACY_STORAGE_KEYS = [
  'exam_archive_job_questions_master',
  'exam_archive_job_questions_v2',
  'exam_archive_job_questions_v1',
  'exam_archive_job_questions',
  'exam_archive_job_questions_backup',
];

const BOOKMARKS_KEY = 'exam_archive_bookmarks_master';
const PREV_BOOKMARKS_KEYS = [
  'exam_archive_bookmarks_v2',
  'exam_archive_bookmarks_v1',
  'exam_archive_bookmarks',
];

// Helper to identify and purge any old default seed questions
function isDefaultSeedQuestion(q: JobQuestionPost): boolean {
  if (!q || !q.id) return false;
  const id = q.id.toLowerCase();
  if (
    id.startsWith('seed-') ||
    id.startsWith('post-') ||
    id === 'bcs-45-preli' ||
    id === 'bb-ad-2023' ||
    id === 'audit-officer-2022' ||
    id === 'primary-teacher-2023' ||
    id === 'agrani-bank-so-2023'
  ) {
    return true;
  }
  if (
    q.organization === 'Bangladesh Public Service Commission' &&
    (q.postName.includes('45th BCS Preliminary') || q.postName.includes('44th BCS'))
  ) {
    return true;
  }
  return false;
}

// In-memory runtime cache to ensure persistence even across hot updates
let inMemoryQuestionsCache: JobQuestionPost[] | null = null;

export function getJobQuestions(): JobQuestionPost[] {
  try {
    // 1. Check in-memory cache first if initialized
    if (inMemoryQuestionsCache !== null) {
      return inMemoryQuestionsCache;
    }

    // 2. Clear out legacy storage keys that held default seed questions
    for (const key of LEGACY_STORAGE_KEYS) {
      try {
        localStorage.removeItem(key);
      } catch {
        // ignore
      }
    }

    // 3. Check clean user storage key
    const raw = localStorage.getItem(QUESTIONS_STORAGE_KEY);
    if (raw !== null) {
      try {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          const userOnly = parsed.filter(q => !isDefaultSeedQuestion(q));
          inMemoryQuestionsCache = userOnly;
          return userOnly;
        }
      } catch {
        // ignore JSON parse error
      }
    }

    // 4. Default: completely empty list (no default questions)
    inMemoryQuestionsCache = [];
    localStorage.setItem(QUESTIONS_STORAGE_KEY, JSON.stringify([]));
    return [];
  } catch (err) {
    console.error('Failed reading questions from localStorage', err);
    return inMemoryQuestionsCache || [];
  }
}

export function saveJobQuestions(questions: JobQuestionPost[]): void {
  try {
    const userOnly = questions.filter(q => !isDefaultSeedQuestion(q));
    inMemoryQuestionsCache = userOnly;
    const jsonStr = JSON.stringify(userOnly);
    localStorage.setItem(QUESTIONS_STORAGE_KEY, jsonStr);
  } catch (err) {
    console.error('Failed saving questions to localStorage', err);
  }
}

export function addJobQuestion(post: JobQuestionPost): JobQuestionPost[] {
  const current = getJobQuestions();
  // Filter out any accidental duplicate with same id
  const withoutDuplicate = current.filter(q => q.id !== post.id);
  const updated = [post, ...withoutDuplicate];
  saveJobQuestions(updated);
  return updated;
}

export function updateJobQuestion(updatedPost: JobQuestionPost): JobQuestionPost[] {
  const current = getJobQuestions();
  const index = current.findIndex(p => p.id === updatedPost.id);
  let updated: JobQuestionPost[];
  if (index !== -1) {
    updated = [...current];
    updated[index] = updatedPost;
  } else {
    updated = [updatedPost, ...current];
  }
  saveJobQuestions(updated);
  return updated;
}

export function deleteJobQuestion(id: string): JobQuestionPost[] {
  const current = getJobQuestions();
  const updated = current.filter(p => p.id !== id);
  saveJobQuestions(updated);
  return updated;
}

export function getBookmarks(): string[] {
  try {
    const raw = localStorage.getItem(BOOKMARKS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }

    for (const key of PREV_BOOKMARKS_KEYS) {
      const prev = localStorage.getItem(key);
      if (prev) {
        const parsed = JSON.parse(prev);
        if (Array.isArray(parsed)) {
          localStorage.setItem(BOOKMARKS_KEY, prev);
          return parsed;
        }
      }
    }

    return [];
  } catch {
    return [];
  }
}

export function toggleBookmark(id: string): string[] {
  const current = getBookmarks();
  let updated: string[];
  if (current.includes(id)) {
    updated = current.filter(item => item !== id);
  } else {
    updated = [...current, id];
  }
  try {
    localStorage.setItem(BOOKMARKS_KEY, JSON.stringify(updated));
  } catch (err) {
    console.error('Failed to save bookmark', err);
  }
  return updated;
}

// ==========================================
// JOB CIRCULARS PERSISTENCE & STORAGE
// ==========================================
const CIRCULARS_STORAGE_KEY = 'exam_archive_job_circulars_v2';
let inMemoryCircularsCache: JobCircular[] | null = null;

export function getJobCirculars(): JobCircular[] {
  try {
    if (inMemoryCircularsCache !== null) {
      return inMemoryCircularsCache;
    }
    const raw = localStorage.getItem(CIRCULARS_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        // Filter out any previous mock seed circular IDs if any
        const filtered = parsed.filter(c => !c.id.startsWith('circ-seed-'));
        inMemoryCircularsCache = filtered;
        return filtered;
      }
    }
    // By default: start empty as requested
    inMemoryCircularsCache = [];
    return [];
  } catch (err) {
    console.error('Failed reading circulars', err);
    return inMemoryCircularsCache || [];
  }
}

export function saveJobCirculars(circulars: JobCircular[]): void {
  try {
    inMemoryCircularsCache = circulars;
    localStorage.setItem(CIRCULARS_STORAGE_KEY, JSON.stringify(circulars));
  } catch (err) {
    console.error('Failed saving circulars', err);
  }
}

export function addJobCircular(circular: JobCircular): JobCircular[] {
  const current = getJobCirculars();
  const withoutDup = current.filter(c => c.id !== circular.id);
  const updated = [circular, ...withoutDup];
  saveJobCirculars(updated);
  return updated;
}

export function updateJobCircular(updatedCircular: JobCircular): JobCircular[] {
  const current = getJobCirculars();
  const index = current.findIndex(c => c.id === updatedCircular.id);
  let updated: JobCircular[];
  if (index !== -1) {
    updated = [...current];
    updated[index] = updatedCircular;
  } else {
    updated = [updatedCircular, ...current];
  }
  saveJobCirculars(updated);
  return updated;
}

export function deleteJobCircular(id: string): JobCircular[] {
  const current = getJobCirculars();
  const updated = current.filter(c => c.id !== id);
  saveJobCirculars(updated);
  return updated;
}

// ==========================================
// EXAM SYLLABUS PERSISTENCE & STORAGE
// ==========================================
const SYLLABUS_STORAGE_KEY = 'exam_archive_exam_syllabuses_v2';
let inMemorySyllabusCache: ExamSyllabus[] | null = null;

export function getExamSyllabuses(): ExamSyllabus[] {
  try {
    if (inMemorySyllabusCache !== null) {
      return inMemorySyllabusCache;
    }
    const raw = localStorage.getItem(SYLLABUS_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        // Filter out legacy default seed syllabuses
        const filtered = parsed.filter(s => s.id !== 'syl-bcs-prelim-47' && s.id !== 'syl-bb-ad-general');
        inMemorySyllabusCache = filtered;
        return filtered;
      }
    }
    // By default: start empty as requested
    inMemorySyllabusCache = [];
    return [];
  } catch (err) {
    console.error('Failed reading syllabuses', err);
    return inMemorySyllabusCache || [];
  }
}

export function saveExamSyllabuses(syllabuses: ExamSyllabus[]): void {
  try {
    inMemorySyllabusCache = syllabuses;
    localStorage.setItem(SYLLABUS_STORAGE_KEY, JSON.stringify(syllabuses));
  } catch (err) {
    console.error('Failed saving syllabuses', err);
  }
}

export function addExamSyllabus(syllabus: ExamSyllabus): ExamSyllabus[] {
  const current = getExamSyllabuses();
  const withoutDup = current.filter(s => s.id !== syllabus.id);
  const updated = [syllabus, ...withoutDup];
  saveExamSyllabuses(updated);
  return updated;
}

export function updateExamSyllabus(updatedSyllabus: ExamSyllabus): ExamSyllabus[] {
  const current = getExamSyllabuses();
  const index = current.findIndex(s => s.id === updatedSyllabus.id);
  let updated: ExamSyllabus[];
  if (index !== -1) {
    updated = [...current];
    updated[index] = updatedSyllabus;
  } else {
    updated = [updatedSyllabus, ...current];
  }
  saveExamSyllabuses(updated);
  return updated;
}

export function deleteExamSyllabus(id: string): ExamSyllabus[] {
  const current = getExamSyllabuses();
  const updated = current.filter(s => s.id !== id);
  saveExamSyllabuses(updated);
  return updated;
}

export function ensureLightMode(): void {
  try {
    document.documentElement.classList.remove('dark');
  } catch {
    // no-op
  }
}

// ==========================================
// ADMIN FIXED CREDENTIALS & AUTH STATE
// ==========================================
export const FIXED_ADMIN_CREDENTIALS = {
  userId: 'Admin_Master#2026',
  password: 'BD#ExamSecure!9826',
};

const ADMIN_AUTH_KEY = 'exam_archive_admin_auth_v1';

export function getIsAdminAuthenticated(): boolean {
  try {
    return localStorage.getItem(ADMIN_AUTH_KEY) === 'true';
  } catch {
    return false;
  }
}

export function saveAdminAuthenticated(isAuth: boolean): void {
  try {
    if (isAuth) {
      localStorage.setItem(ADMIN_AUTH_KEY, 'true');
    } else {
      localStorage.removeItem(ADMIN_AUTH_KEY);
    }
  } catch {
    // no-op
  }
}

