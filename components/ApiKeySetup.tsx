
import React, { useState } from 'react';

interface ApiKeySetupProps {
  onSave: (key: string) => void;
  onCancel?: () => void;
  isInitialSetup?: boolean;
}

export const ApiKeySetup: React.FC<ApiKeySetupProps> = ({ onSave, onCancel, isInitialSetup = true }) => {
  const [key, setKey] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (key.trim().length > 10) {
      onSave(key.trim());
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-2xl shadow-xl border border-slate-200 w-full max-w-lg animate-fade-in">
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"></path></svg>
          </div>
        </div>
        
        <h2 className="text-2xl font-bold text-slate-900 text-center mb-2">
          {isInitialSetup ? 'Настройка AI' : 'Обновить API Ключ'}
        </h2>
        <p className="text-slate-500 text-center mb-6">
          {isInitialSetup 
            ? 'Для работы приложения требуется бесплатный ключ Gemini API. Он будет сохранен только в вашем браузере.' 
            : 'Введите новый ключ API. Старый будет заменен.'}
        </p>

        <div className="bg-blue-50 border border-blue-100 p-4 rounded-lg mb-6 text-sm text-blue-800">
          <p className="font-semibold mb-1">Как получить ключ?</p>
          <ol className="list-decimal pl-4 space-y-1 mb-3">
            <li>Перейдите в <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noreferrer" className="underline font-bold hover:text-blue-600">Google AI Studio</a>.</li>
            <li>Нажмите "Create API Key".</li>
            <li>Скопируйте ключ и вставьте его ниже.</li>
          </ol>
          <p className="text-xs text-blue-600/80 pt-2 border-t border-blue-200">
            * Gemini API предоставляет <strong>бесплатный тариф</strong> (Free Tier), который не требует привязки карты.
            <a href="https://ai.google.dev/pricing" target="_blank" rel="noreferrer" className="underline ml-1 hover:text-blue-800">Подробнее о тарифах</a>
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">API Key</label>
            <input
              type="text"
              value={key}
              onChange={(e) => setKey(e.target.value)}
              className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none font-mono text-sm"
              placeholder="AIzaSy..."
              autoFocus
              required
            />
          </div>

          <div className="flex gap-3">
            {!isInitialSetup && onCancel && (
               <button
                type="button"
                onClick={onCancel}
                className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition-colors"
              >
                Отмена
              </button>
            )}
            <button
              type="submit"
              disabled={key.length < 10}
              className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded-xl transition-colors shadow-lg shadow-blue-500/30"
            >
              Сохранить
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
