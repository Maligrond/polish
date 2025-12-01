
export interface VocabularyItem {
  polish: string;
  russian: string;
  example: string;
}

export interface MistakeCorrection {
  incorrect: string;
  correct: string;
  explanation: string;
}

export interface Exercise {
  type: string;
  instruction: string;
  questions: string[];
}

export interface LessonData {
  summary: string;
  vocabulary: VocabularyItem[];
  mistakes: MistakeCorrection[];
  exercises: Exercise[];
  nextLessonIdeas: string[];
}

export interface Student {
  id: string;
  name: string;
  password: string;
  notes: string;
  createdAt: number;
}

export interface Lesson {
  id: string;
  studentId: string;
  date: number;
  data: LessonData;
}

export enum AppState {
  AUTH = 'AUTH',
  API_KEY_SETUP = 'API_KEY_SETUP', // New state for entering API Key
  DASHBOARD = 'DASHBOARD',
  STUDENT_PROFILE = 'STUDENT_PROFILE',
  RECORDING_FLOW = 'RECORDING_FLOW',
  LESSON_VIEW = 'LESSON_VIEW',
  PUBLIC_STUDENT_VIEW = 'PUBLIC_STUDENT_VIEW'
}
