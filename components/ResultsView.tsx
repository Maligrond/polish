import React, { useState } from 'react';
import { LessonData } from '../types';

interface ResultsViewProps {
  data: LessonData;
  onBack: () => void;
  isReadOnly?: boolean;
}

type Tab = 'summary' | 'vocab' | 'mistakes' | 'exercises';

export const ResultsView: React.FC<ResultsViewProps> = ({ data, onBack, isReadOnly = false }) => {
  const [activeTab, setActiveTab] = useState<Tab>('summary');
  const [copyFeedback, setCopyFeedback] = useState<string | null>(null);

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopyFeedback(label);
    setTimeout(() => setCopyFeedback(null), 2000);
  };

  const getCopyableText = () => {
    let text = `Конспект урока:\n${data.summary}\n\nСловарь:\n`;
    data.vocabulary.forEach(v => text += `- ${v.polish} (${v.russian}): ${v.example}\n`);
    text += `\nРабота над ошибками:\n`;
    data.mistakes.forEach(m => text += `- Ошибка: ${m.incorrect} -> Верно: ${m.correct} (${m.explanation})\n`);
    text += `\nДомашнее задание:\n`;
    data.exercises.forEach((e, i) => {
        text += `${i+1}. ${e.instruction}\n`;
        e.questions.forEach(q => text += `   - ${q}\n`);
    });
    return text;
  };

  const TabButton = ({ id, label, icon }: { id: Tab, label: string, icon: React.ReactNode }) => (
    <button
      onClick={() => setActiveTab(id)}
      className={`flex items-center gap-2 px-4 py-3 text-sm font-medium rounded-lg transition-colors duration-200 ${
        activeTab === id
          ? 'bg-red-50 text-red-700 border border-red-100'
          : 'text-slate-600 hover:bg-slate-50'
      }`}
    >
      {icon}
      {label}
    </button>
  );

  return (
    <div className="w-full max-w-4xl mx-auto bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
      {/* Header */}
      <div className="bg-slate-900 p-6 flex justify-between items-center text-white">
        <div className="flex items-center gap-4">
             <button 
                onClick={onBack}
                className="p-2 bg-slate-800 hover:bg-slate-700 rounded-full transition-colors"
            >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
            </button>
            <div>
                <h2 className="text-2xl font-bold">Материалы урока</h2>
                <p className="text-slate-400 text-sm">Создано ИИ-ассистентом</p>
            </div>
        </div>
        <div className="flex gap-2">
            <button
                onClick={() => handleCopy(getCopyableText(), 'full')}
                className="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-sm font-medium transition-colors"
            >
                {copyFeedback === 'full' ? 'Скопировано!' : 'Скопировать'}
            </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-100 p-2 gap-2 overflow-x-auto">
        <TabButton id="summary" label="Конспект" icon={
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
        } />
        <TabButton id="vocab" label="Словарь" icon={
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129"></path></svg>
        } />
        <TabButton id="mistakes" label="Ошибки" icon={
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
        } />
        <TabButton id="exercises" label="Домашка" icon={
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path></svg>
        } />
      </div>

      {/* Content */}
      <div className="p-6 min-h-[400px]">
        {activeTab === 'summary' && (
          <div className="space-y-6">
            <section>
              <h3 className="text-lg font-bold text-slate-800 mb-2">Краткое содержание урока</h3>
              <p className="text-slate-600 leading-relaxed bg-slate-50 p-4 rounded-xl">{data.summary}</p>
            </section>
            
            {!isReadOnly && (
                <section>
                    <h3 className="text-lg font-bold text-slate-800 mb-2">Идеи для следующего урока</h3>
                    <ul className="list-disc pl-5 space-y-2 text-slate-600">
                        {data.nextLessonIdeas.map((idea, i) => (
                            <li key={i}>{idea}</li>
                        ))}
                    </ul>
                </section>
            )}
          </div>
        )}

        {activeTab === 'vocab' && (
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-slate-800 mb-2">Новая лексика</h3>
            <div className="grid gap-4 md:grid-cols-2">
              {data.vocabulary.map((item, idx) => (
                <div key={idx} className="bg-white border border-slate-200 p-4 rounded-xl shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-lg font-semibold text-red-600">{item.polish}</span>
                    <span className="text-sm text-slate-500 italic">{item.russian}</span>
                  </div>
                  <p className="text-slate-600 text-sm bg-slate-50 p-2 rounded-md border border-slate-100">
                    "{item.example}"
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'mistakes' && (
          <div className="space-y-4">
             <h3 className="text-lg font-bold text-slate-800 mb-2">Разбор ошибок</h3>
            {data.mistakes.map((item, idx) => (
              <div key={idx} className="flex gap-4 p-4 bg-slate-50 rounded-xl border-l-4 border-red-400">
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-2 text-red-700 line-through text-sm">
                     <span className="font-semibold">Неверно:</span> {item.incorrect}
                  </div>
                  <div className="flex items-center gap-2 text-green-700 font-medium">
                     <span className="font-semibold">Верно:</span> {item.correct}
                  </div>
                  <p className="text-slate-500 text-sm mt-2">{item.explanation}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'exercises' && (
          <div className="space-y-8">
            {data.exercises.map((ex, idx) => (
              <div key={idx} className="bg-white border border-slate-200 rounded-xl overflow-hidden">
                <div className="bg-slate-100 px-4 py-3 border-b border-slate-200 flex justify-between items-center">
                    <h4 className="font-semibold text-slate-800">Упражнение {idx + 1}: {ex.type}</h4>
                    <span className="text-xs font-mono text-slate-500 uppercase tracking-wider">Д/З</span>
                </div>
                <div className="p-4">
                  <p className="text-slate-600 mb-4 font-medium italic">{ex.instruction}</p>
                  <ul className="space-y-3">
                    {ex.questions.map((q, qIdx) => (
                      <li key={qIdx} className="flex gap-3 text-slate-700">
                        <span className="text-slate-400 font-mono select-none">{qIdx + 1}.</span>
                        <span>{q}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};