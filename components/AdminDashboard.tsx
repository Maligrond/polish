
import React, { useState, useEffect } from 'react';
import { Student } from '../types';
import { storage } from '../services/storage';

interface AdminDashboardProps {
  onSelectStudent: (student: Student) => void;
  onOpenSettings: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onSelectStudent, onOpenSettings }) => {
  const [students, setStudents] = useState<Student[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [newStudentName, setNewStudentName] = useState('');
  const [newStudentPassword, setNewStudentPassword] = useState('');

  useEffect(() => {
    setStudents(storage.getStudents());
  }, []);

  const handleAddStudent = (e: React.FormEvent) => {
    e.preventDefault();
    if (newStudentName.trim() && newStudentPassword.trim()) {
      const newStudent = storage.addStudent(newStudentName.trim(), newStudentPassword.trim());
      setStudents([...students, newStudent]);
      setNewStudentName('');
      setNewStudentPassword('');
      setIsAdding(false);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Панель учителя</h1>
          <p className="text-slate-500">Управление студентами и уроками</p>
        </div>
        <div className="flex gap-3">
            <button
                onClick={onOpenSettings}
                className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors shadow-sm"
                title="Настройки API"
            >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
            </button>
            <button
            onClick={() => setIsAdding(true)}
            className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors shadow-sm"
            >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
            Добавить студента
            </button>
        </div>
      </div>

      {isAdding && (
        <form onSubmit={handleAddStudent} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-4 items-end">
          <div className="flex-1 w-full">
            <label className="block text-sm font-medium text-slate-700 mb-1">Имя студента</label>
            <input
              type="text"
              value={newStudentName}
              onChange={(e) => setNewStudentName(e.target.value)}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none"
              placeholder="Например: Иван Петров"
              autoFocus
              required
            />
          </div>
          <div className="flex-1 w-full">
            <label className="block text-sm font-medium text-slate-700 mb-1">Пароль студента</label>
            <input
              type="text"
              value={newStudentPassword}
              onChange={(e) => setNewStudentPassword(e.target.value)}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none font-mono"
              placeholder="Задайте пароль"
              required
            />
          </div>
          <div className="flex gap-2 w-full md:w-auto">
            <button type="submit" className="flex-1 md:flex-none px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium">
              Создать
            </button>
            <button 
                type="button" 
                onClick={() => setIsAdding(false)}
                className="flex-1 md:flex-none px-6 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 font-medium"
            >
                Отмена
            </button>
          </div>
        </form>
      )}

      {students.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-slate-300">
          <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
          </div>
          <h3 className="text-lg font-medium text-slate-900">Пока нет студентов</h3>
          <p className="text-slate-500">Добавьте первого студента, чтобы начать урок.</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {students.map(student => (
            <div 
              key={student.id}
              className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow-md hover:border-red-200 transition-all group relative"
            >
              <div 
                className="cursor-pointer"
                onClick={() => onSelectStudent(student)}
              >
                <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center text-xl font-bold text-slate-600 group-hover:bg-red-50 group-hover:text-red-600 transition-colors">
                    {student.name.charAt(0).toUpperCase()}
                    </div>
                    <svg className="w-5 h-5 text-slate-300 group-hover:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-1">{student.name}</h3>
                <p className="text-sm text-slate-500 mb-4">Регистрация: {new Date(student.createdAt).toLocaleDateString('ru-RU')}</p>
              </div>
              
              <div className="mt-4 pt-4 border-t border-slate-100 flex items-center gap-2 text-sm text-slate-400 bg-slate-50 -mx-6 -mb-6 p-4 rounded-b-xl">
                 <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"></path></svg>
                 <span className="font-mono select-all">Пароль: {student.password}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
