
import { Student, Lesson, LessonData } from '../types';

const STUDENTS_KEY = 'lekcja_students';
const LESSONS_KEY = 'lekcja_lessons';
const API_KEY_STORAGE_KEY = 'lekcja_gemini_api_key';

const generateId = () => Math.random().toString(36).substr(2, 9);

export const storage = {
  getStudents: (): Student[] => {
    const data = localStorage.getItem(STUDENTS_KEY);
    return data ? JSON.parse(data) : [];
  },

  addStudent: (name: string, password: string): Student => {
    const students = storage.getStudents();
    const newStudent: Student = {
      id: generateId(),
      name,
      password,
      notes: '',
      createdAt: Date.now(),
    };
    localStorage.setItem(STUDENTS_KEY, JSON.stringify([...students, newStudent]));
    return newStudent;
  },

  getStudent: (id: string): Student | undefined => {
    return storage.getStudents().find(s => s.id === id);
  },

  updateStudentNotes: (id: string, notes: string) => {
    const students = storage.getStudents();
    const idx = students.findIndex(s => s.id === id);
    if (idx !== -1) {
      students[idx].notes = notes;
      localStorage.setItem(STUDENTS_KEY, JSON.stringify(students));
    }
  },

  getLessons: (studentId: string): Lesson[] => {
    const data = localStorage.getItem(LESSONS_KEY);
    const allLessons: Lesson[] = data ? JSON.parse(data) : [];
    return allLessons.filter(l => l.studentId === studentId).sort((a, b) => b.date - a.date);
  },

  addLesson: (studentId: string, data: LessonData): Lesson => {
    const stored = localStorage.getItem(LESSONS_KEY);
    const allLessons: Lesson[] = stored ? JSON.parse(stored) : [];
    
    const newLesson: Lesson = {
      id: generateId(),
      studentId,
      date: Date.now(),
      data
    };
    
    localStorage.setItem(LESSONS_KEY, JSON.stringify([...allLessons, newLesson]));
    return newLesson;
  },

  // API Key Management
  setApiKey: (key: string) => {
    localStorage.setItem(API_KEY_STORAGE_KEY, key);
  },

  getApiKey: (): string | null => {
    return localStorage.getItem(API_KEY_STORAGE_KEY);
  },
  
  hasApiKey: (): boolean => {
    return !!localStorage.getItem(API_KEY_STORAGE_KEY);
  }
};
