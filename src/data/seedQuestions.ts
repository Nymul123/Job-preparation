import { JobQuestionPost } from '../types';

// By default, no mock questions exist so users can upload and manage their own genuine exam question papers.
export const INITIAL_JOB_QUESTIONS: JobQuestionPost[] = [];

export const ALL_CATEGORIES = [
  'All',
  'BCS',
  'Govt Job',
  'Bank',
  'IT/CSE',
  'Teacher Recruitment',
  'Defence/NSI'
];

export const ALL_YEARS = [
  'All',
  '2026',
  '2025',
  '2024',
  '2023',
  '2022'
];

export const ALL_MEDIA_TYPES = [
  'All',
  'Text',
  'Image',
  'PDF'
];
