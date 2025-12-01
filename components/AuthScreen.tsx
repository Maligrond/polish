
import React, { useState } from 'react';

interface AuthScreenProps {
  title: string;
  description: string;
  onLogin: (password: string) => boolean;
}

export const AuthScreen: React.FC<AuthScreenProps> = ({ title, description, onLogin }) => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const success = onLogin(password);
    if (!success) {
      setError(true);
      setPassword('');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-2xl shadow-xl border border-slate-200 w-full max-w-md animate-fade-in">
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
          </div>
        </div>
        
        <h2 className="text-2xl font-bold text-slate-900 text-center mb-2">{title}</h2>
        <p className="text-slate-500 text-center mb-8">{description}</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Пароль</label>
            <input
              type="password"
              value={password}
              onChange={(e) => { setPassword(e.target.value); setError(false); }}
              className={`w-full px-4 py-3 border rounded-xl focus:ring-2 outline-none transition-all ${
                error 
                  ? 'border-red-300 focus:border-red-500 focus:ring-red-200 bg-red-50' 
                  : 'border-slate-300 focus:border-red-500 focus:ring-red-200'
              }`}
              placeholder="Введите пароль"
              autoFocus
            />
          </div>
          
          {error && (
            <p className="text-sm text-red-600 flex items-center gap-1 animate-pulse">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
              Неверный пароль
            </p>
          )}

          <button
            type="submit"
            className="w-full py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl transition-colors shadow-lg shadow-red-500/30"
          >
            Войти
          </button>
        </form>
      </div>
    </div>
  );
};
