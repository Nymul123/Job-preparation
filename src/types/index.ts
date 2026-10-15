export type JobCategory = string;

export type MediaType = 'Text' | 'Image' | 'PDF';

export interface QuestionSubItem {
  id: string;
  questionNumber: number;
  subject?: string; // e.g. "English", "Quantitative Aptitude", "General Knowledge", "Bangla"
  questionText: string;
  options?: string[]; // e.g. ["A) 65°", "B) 70°", "C) 75°", "D) 80°"]
  correctOption?: number; // 0 for A, 1 for B, etc.
  answerExplanation: string;
  marks?: number;
}

export interface JobQuestionPost {
  id: string;
  organization: string; // e.g. "BPSC (Bangladesh Public Service Commission)"
  postName: string; // e.g. "46th BCS Preliminary Examination"
  category: JobCategory;
  examYear: number; // e.g. 2026, 2025
  examDate: string; // e.g. "2026-02-18"
  examType: 'Preliminary (MCQ)' | 'Written' | 'Technical/Viva';
  durationMinutes: number;
  totalMarks: number;
  summary: string;
  plainTextContent?: string; // Plain text question paper content (questions, answers, solutions)
  questions: QuestionSubItem[];
  images: Array<{
    id: string;
    url: string;
    caption: string;
  }>;
  hasPdf: boolean;
  pdfFileName?: string;
  pdfFileSize?: string;
  pdfDataUrl?: string; // Uploaded PDF base64 data URL
  pdfDownloadUrl?: string; // or dynamic generator
  uploadDate: string;
  featured?: boolean;
  viewsCount?: number;
}

export interface FilterState {
  searchQuery: string;
  category: string;
  organization: string;
  examYear: string;
  mediaType: string;
}

export interface AdminStats {
  totalQuestions: number;
  activePdfs: number;
  totalCategories: number;
  totalOrganizations: number;
  totalMcqsCount: number;
}

export interface JobCircular {
  id: string;
  organization: string; // e.g. "Petrobangla", "BCIC", "Bangladesh Computer Council"
  designation: string; // e.g. "Assistant Manager (CSE/IT)-25"
  category: string; // e.g. "Govt Job Circulars", "Teacher Circulars", "M.Sc Circulars", "Bank Circulars"
  circularStartDate: string; // e.g. "18 Oct, 2026"
  circularEndDate: string; // e.g. "17 Nov, 2026"
  applyUrl: string; // e.g. "http://petrobangla.teletalk.com.bd"
  circularPdfDataUrl?: string; // Uploaded circular PDF file
  circularPdfFileName?: string;
  description?: string;
  vacancyCount?: string;
  uploadDate: string;
}

export interface ExamSyllabus {
  id: string;
  title: string; // e.g. "47th BCS Preliminary Exam Syllabus & Marks Distribution"
  organization: string; // e.g. "BPSC"
  category: string; // e.g. "BCS", "Govt Job", "Bank", "Teacher Recruitment", "IT/CSE"
  examType: 'Preliminary' | 'Written' | 'Special' | 'General';
  totalMarks: number;
  markBreakdown?: Array<{ subject: string; marks: number; topics?: string }>;
  plainTextContent?: string;
  pdfDataUrl?: string;
  pdfFileName?: string;
  uploadDate: string;
}
