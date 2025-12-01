
import React, { useState, useEffect } from 'react';
import { AudioRecorder } from './components/AudioRecorder';
import { ResultsView } from './components/ResultsView';
import { AdminDashboard } from './components/AdminDashboard';
import { StudentProfile } from './components/StudentProfile';
import { AuthScreen } from './components/AuthScreen';
import { ApiKeySetup } from './components/ApiKeySetup';
import { analyzeAudioLesson } from './services/geminiService';
import { blobToBase64 } from './utils/audioUtils';
import { storage } from './services/storage';
import { AppState, LessonData, Student, Lesson } from './types';

const ADMIN_PASSWORD = "228228228";

export default function App() {
  const [appState, setAppState] = useState<AppState>(AppState.AUTH);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false); 
  
  const [currentStudent, setCurrentStudent] = useState<Student | null>(null);
  const [currentLesson, setCurrentLesson] = useState<Lesson | null>(null);
  const [lessonData, setLessonData] = useState<LessonData | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Initialize Routing Logic
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const studentId = params.get('studentId');
    
    if (studentId) {
      const student = storage.getStudent(studentId);
      if (student) {
        setCurrentStudent(student);
      } else {
        setErrorMsg("Профиль студента не найден по ссылке. Пожалуйста, свяжитесь с преподавателем.");
      }
    }
  }, []);

  const handleLogin = (password: string): boolean => {
    // Case 1: Student Login
    if (currentStudent) {
        if (password === currentStudent.password) {
            setIsAuthenticated(true);
            setIsAdmin(false);
            setAppState(AppState.PUBLIC_STUDENT_VIEW);
            return true;
        }
        return false;
    } 
    
    // Case 2: Admin Login
    else {
        if (password === ADMIN_PASSWORD) {
            setIsAuthenticated(true);
            setIsAdmin(true);
            
            // Check if API key is set
            if (storage.hasApiKey()) {
              setAppState(AppState.DASHBOARD);
            } else {
              setAppState(AppState.API_KEY_SETUP);
            }
            return true;
        }
        return false;
    }
  };

  const handleApiKeySave = (key: string) => {
    storage.setApiKey(key);
    setAppState(AppState.DASHBOARD);
  };

  const handleSelectStudent = (student: Student) => {
    setCurrentStudent(student);
    setAppState(AppState.STUDENT_PROFILE);
  };

  const handleNewLessonStart = () => {
    setAppState(AppState.RECORDING_FLOW);
  };

  const handleViewLesson = (lesson: Lesson) => {
    setCurrentLesson(lesson);
    setLessonData(lesson.data);
    setAppState(AppState.LESSON_VIEW);
  };

  const handleAnalysisComplete = async (blob: Blob) => {
    if (!currentStudent) return;
    
    const loadingDiv = document.getElementById('processing-indicator');
    if(loadingDiv) loadingDiv.style.display = 'flex';

    try {
      const base64Audio = await blobToBase64(blob);
      const result = await analyzeAudioLesson(base64Audio, blob.type);
      
      const savedLesson = storage.addLesson(currentStudent.id, result);
      
      setCurrentLesson(savedLesson);
      setLessonData(result);
      setAppState(AppState.LESSON_VIEW);
    } catch (err: any) {
      console.error(err);
      setErrorMsg("Ошибка анализа урока. " + (err.message || ""));
    } finally {
        if(loadingDiv) loadingDiv.style.display = 'none';
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!currentStudent) return;
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('audio/')) {
        setErrorMsg("Пожалуйста, загрузите аудиофайл.");
        return;
    }

    const loadingDiv = document.getElementById('processing-indicator');
    if(loadingDiv) loadingDiv.style.display = 'flex';

    try {
      const base64Audio = await blobToBase64(file);
      const result = await analyzeAudioLesson(base64Audio, file.type);
      
      const savedLesson = storage.addLesson(currentStudent.id, result);
      setCurrentLesson(savedLesson);
      setLessonData(result);
      setAppState(AppState.LESSON_VIEW);
    } catch (err: any) {
      console.error(err);
      setErrorMsg("Ошибка анализа файла. " + (err.message || ""));
    } finally {
        if(loadingDiv) loadingDiv.style.display = 'none';
    }
  };

  const handleBackToProfile = () => {
    if (appState === AppState.PUBLIC_STUDENT_VIEW) {
      setAppState(AppState.PUBLIC_STUDENT_VIEW);
    } else {
      setAppState(AppState.STUDENT_PROFILE);
    }
    setCurrentLesson(null);
    setLessonData(null);
  };

  const handleBackToDashboard = () => {
    setAppState(AppState.DASHBOARD);
    setCurrentStudent(null);
  };

  const handleLogout = () => {
      setIsAuthenticated(false);
      setIsAdmin(false);
      setAppState(AppState.AUTH);
      setCurrentStudent(null);
      window.history.pushState({}, '', window.location.pathname);
  };

  // Render Logic
  if (!isAuthenticated || appState === AppState.AUTH) {
      const title = currentStudent ? `Привет, ${currentStudent.name}!` : "Lekcja Admin";
      const description = currentStudent 
        ? "Введите ваш пароль студента для доступа к материалам." 
        : "Введите пароль администратора для управления уроками.";
      
      if (errorMsg && !currentStudent && !isAuthenticated) {
          return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
                <div className="bg-white p-8 rounded-2xl shadow-xl text-center max-w-md">
                    <div className="text-red-500 mb-4">
                        <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
                    </div>
                    <h2 className="text-xl font-bold text-slate-900 mb-2">Ошибка доступа</h2>
                    <p className="text-slate-500 mb-6">{errorMsg}</p>
                    <button onClick={() => window.location.href = '/'} className="px-6 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800">
                        На главную
                    </button>
                </div>
            </div>
          );
      }

      return <AuthScreen title={title} description={description} onLogin={handleLogin} />;
  }

  // API Key Setup Screen
  if (appState === AppState.API_KEY_SETUP) {
    return <ApiKeySetup onSave={handleApiKeySave} isInitialSetup={true} />;
  }

  const renderContent = () => {
    // If user requests to update API key from Dashboard
    if (appState === 'API_KEY_UPDATE' as any) {
        return <ApiKeySetup onSave={handleApiKeySave} onCancel={() => setAppState(AppState.DASHBOARD)} isInitialSetup={false} />;
    }

    if (appState === AppState.PUBLIC_STUDENT_VIEW && currentStudent) {
        if (currentLesson && lessonData) {
            return (
                <ResultsView 
                    data={lessonData} 
                    onBack={() => { setCurrentLesson(null); setLessonData(null); }} 
                    isReadOnly={true}
                />
            );
        }
        return (
            <StudentProfile 
                student={currentStudent}
                onBack={() => {}} 
                onNewLesson={() => {}} 
                onViewLesson={(l) => { setCurrentLesson(l); setLessonData(l.data); }}
                readOnly={true}
            />
        );
    }

    switch (appState) {
      case AppState.DASHBOARD:
        return (
            <AdminDashboard 
                onSelectStudent={handleSelectStudent} 
                onOpenSettings={() => setAppState('API_KEY_UPDATE' as any)} 
            />
        );
      
      case AppState.STUDENT_PROFILE:
        return currentStudent ? (
          <StudentProfile 
            student={currentStudent} 
            onBack={handleBackToDashboard}
            onNewLesson={handleNewLessonStart}
            onViewLesson={handleViewLesson}
          />
        ) : null;

      case AppState.RECORDING_FLOW:
        return (
           <div className="max-w-4xl mx-auto space-y-8 animate-fade-in relative">
               <div className="flex items-center gap-4 mb-8">
                   <button onClick={() => setAppState(AppState.STUDENT_PROFILE)} className="text-slate-500 hover:text-slate-800">
                       <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
                   </button>
                   <div>
                       <h2 className="text-2xl font-bold text-slate-900">Новый урок: {currentStudent?.name}</h2>
                       <p className="text-slate-500">Запишите или загрузите занятие</p>
                   </div>
               </div>

                <div id="processing-indicator" className="hidden absolute inset-0 bg-white/80 z-50 flex-col items-center justify-center rounded-2xl backdrop-blur-sm">
                    <div className="w-16 h-16 border-4 border-slate-200 border-t-red-600 rounded-full animate-spin mb-4"></div>
                    <div className="text-xl font-bold text-slate-800">Анализ урока...</div>
                    <p className="text-slate-500">Извлечение лексики и создание упражнений.</p>
                </div>

               <div className="grid md:grid-cols-2 gap-8 items-start">
                   <div className="flex flex-col gap-4">
                        <div className="font-semibold text-slate-700">Вариант 1: Запись онлайн</div>
                        <AudioRecorder onRecordingComplete={handleAnalysisComplete} />
                   </div>
                   <div className="flex flex-col gap-4">
                        <div className="font-semibold text-slate-700">Вариант 2: Загрузить файл</div>
                        <div className="bg-white rounded-2xl border border-slate-200 border-dashed border-2 hover:border-red-300 transition-colors h-[320px] flex flex-col items-center justify-center p-8 text-center group relative">
                            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4 group-hover:bg-red-50 transition-colors">
                                <svg className="w-8 h-8 text-slate-400 group-hover:text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path></svg>
                            </div>
                            <label htmlFor="file-upload" className="cursor-pointer inset-0 absolute">
                                <input 
                                    id="file-upload" 
                                    type="file" 
                                    accept="audio/*" 
                                    className="hidden" 
                                    onChange={handleFileUpload}
                                />
                            </label>
                            <span className="block text-lg font-medium text-slate-700 mb-1 pointer-events-none">Нажмите для загрузки</span>
                            <span className="block text-sm text-slate-500 pointer-events-none">MP3, WAV, M4A (Макс. 20MB)</span>
                        </div>
                   </div>
               </div>
               
               {errorMsg && (
                    <div className="p-4 bg-red-50 text-red-700 rounded-lg flex items-center gap-2">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                        {errorMsg}
                    </div>
               )}
           </div>
        );

      case AppState.LESSON_VIEW:
        return lessonData ? (
          <ResultsView 
            data={lessonData} 
            onBack={handleBackToProfile}
            isReadOnly={false}
          />
        ) : null;

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-20 font-sans">
      <nav className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div 
            className="flex items-center gap-2 cursor-pointer"
            onClick={() => {
                if(isAdmin) {
                    setAppState(AppState.DASHBOARD);
                    setCurrentStudent(null);
                }
            }}
          >
            <div className="w-8 h-8 bg-red-600 rounded-md flex items-center justify-center text-white font-bold">L</div>
            <span className="text-xl font-bold text-slate-800 tracking-tight">Lekcja</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-sm text-slate-500 hidden sm:block">
                {isAdmin ? 'Панель преподавателя' : (currentStudent ? 'Портал студента' : '')}
            </div>
            <button 
                onClick={handleLogout}
                className="text-sm font-medium text-slate-600 hover:text-red-600 transition-colors"
            >
                Выйти
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-10">
        {renderContent()}
      </main>
    </div>
  );
}
