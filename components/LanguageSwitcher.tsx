import React from 'react';
import { useAppStore } from '../store';
import { Language } from '../types';
import { Globe } from 'lucide-react';

const LanguageSwitcher: React.FC = () => {
  const { language, setLanguage } = useAppStore();

  const languages: { code: Language; label: string }[] = [
    { code: 'ar', label: 'العربية' },
    { code: 'en', label: 'English' },
    { code: 'de', label: 'Deutsch' },
  ];

  return (
    <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg border border-slate-200">
      <Globe className="w-4 h-4 text-slate-400 mx-1" />
      {languages.map((lang) => (
        <button
          key={lang.code}
          onClick={() => setLanguage(lang.code)}
          className={`
            px-3 py-1 text-xs font-medium rounded-md transition-all
            ${language === lang.code 
              ? 'bg-white text-primary-700 shadow-sm border border-slate-200' 
              : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'
            }
          `}
        >
          {lang.label}
        </button>
      ))}
    </div>
  );
};

export default LanguageSwitcher;