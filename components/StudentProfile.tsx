import React, { useState, useEffect } from 'react';
import { Student, Lesson } from '../types';
import { storage } from '../services/storage';

interface StudentProfileProps {
  student: Student;
  onBack: () => void;
  onNewLesson: () => void;
  onViewLesson: (lesson: Lesson) => void;
  readOnly?: boolean;
}

export const StudentProfile: React.FC<StudentProfileProps> = ({ 
  student, 
  onBack, 
  onNewLesson, 
  onViewLesson,
  readOnly = false 
}) => {
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [notes, setNotes] = useState(student.notes);
  const [isSavingNotes, setIsSavingNotes] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);

  useEffect(() => {
    setLessons(storage.getLessons(student.id));
  }, [student.id]);

  const handleNoteChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newNotes = e.target.value;
    setNotes(newNotes);
    
    // Debounced save
    setIsSavingNotes(true);
    const timeoutId = setTimeout(() => {
      storage.updateStudentNotes(student.id, newNotes);
      setIsSavingNotes(false);
    }, 1000);
    return () => clearTimeout(timeoutId);
  };

  const handleCopyLink = () => {
    // Construct local-simulation link
    const url = `${window.location.origin}${window.location.pathname}?studentId=${student.id}`;
    navigator.clipboard.writeText(url);
    setLinkCopied(true);
    setTimeout(() => setLinkCopied(false), 2000);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center gap-4 mb-2">
        {!readOnly && (
          <button 
            onClick={onBack}
            className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-500"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
          </button>
        )}
        <div>
          <h1 className="text-3xl font-bold text-slate-900">{student.name}</h1>
          <p className="text-slate-500">{readOnly ? 'Ваш учебный портал' : 'Профиль студента'}</p>
        </div>
        <div className="flex-1"></div>
        
        {!readOnly && (
           <button
            onClick={handleCopyLink}
            className="flex items-center gap-2 px-3 py-2 bg-white border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-50 text-sm font-medium transition-colors"
          >
            {linkCopied ? (
              <>
                 <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                 Скопировано!
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"></path></svg>
                Поделиться
              </>
            )}
          </button>
        )}

        {!readOnly && (
          <button
            onClick={onNewLesson}
            className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium transition-colors shadow-sm"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
            Новый урок
          </button>
        )}
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {/* Main Content: Lessons */}
        <div className="md:col-span-2 space-y-4">
          <h2 className="text-xl font-bold text-slate-800">История уроков</h2>
          {lessons.length === 0 ? (
            <div className="bg-white p-8 rounded-xl border border-dashed border-slate-300 text-center">
              <p className="text-slate-500">Уроков пока нет.</p>
              {!readOnly && <p className="text-sm text-red-600 mt-2 cursor-pointer" onClick={onNewLesson}>Начать новый урок</p>}
            </div>
          ) : (
            <div className="space-y-3">
              {lessons.map(lesson => (
                <div 
                  key={lesson.id}
                  onClick={() => onViewLesson(lesson)}
                  className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm hover:shadow-md hover:border-red-200 transition-all cursor-pointer flex justify-between items-center group"
                >
                  <div>
                    <div className="font-semibold text-slate-800 mb-1">
                        {new Date(lesson.date).toLocaleDateString('ru-RU', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                    </div>
                    <p className="text-sm text-slate-500 line-clamp-1">{lesson.data.summary}</p>
                  </div>
                  <div className="text-slate-300 group-hover:text-red-500 transition-colors">
                     <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Sidebar: Notes */}
        {!readOnly && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-slate-800">Личные заметки</h2>
              {isSavingNotes && <span className="text-xs text-slate-400">Сохранение...</span>}
            </div>
            <div className="bg-yellow-50 p-4 rounded-xl border border-yellow-200 shadow-sm relative">
               <textarea
                value={notes}
                onChange={handleNoteChange}
                placeholder="Напишите личные заметки о прогрессе, слабых местах или интересах студента..."
                className="w-full h-64 bg-transparent border-none resize-none outline-none text-slate-700 text-sm leading-relaxed placeholder-slate-400"
               />
               <div className="absolute top-2 right-2 text-yellow-400/50">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z"></path></svg>
               </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};