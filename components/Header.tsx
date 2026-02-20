import React from 'react';
import { useAppStore } from '../store';
import { TRANSLATIONS } from '../constants';
import LanguageSwitcher from './LanguageSwitcher';
import { Search, Bell, Menu } from 'lucide-react';

const Header: React.FC = () => {
  const { language, toggleSidebar } = useAppStore();
  const t = TRANSLATIONS[language];

  return (
    <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 sticky top-0 z-30 shadow-sm">
      <div className="flex items-center gap-4 flex-1">
        <button onClick={toggleSidebar} className="lg:hidden text-slate-500">
          <Menu className="w-6 h-6" />
        </button>
        
        <div className="relative w-full max-w-md hidden md:block">
          <Search className="absolute top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 ltr:left-3 rtl:right-3" />
          <input 
            type="text" 
            placeholder={t.search_placeholder}
            className="w-full bg-slate-50 border border-slate-200 rounded-lg ltr:pl-10 rtl:pr-10 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all placeholder:text-slate-400"
          />
        </div>
      </div>

      <div className="flex items-center gap-4">
        <LanguageSwitcher />
        
        <button className="relative p-2 text-slate-500 hover:bg-slate-100 rounded-full transition-colors">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white"></span>
        </button>
        
        <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-primary-600 to-primary-400 flex items-center justify-center text-white text-xs font-bold ring-2 ring-white shadow-sm">
          AD
        </div>
      </div>
    </header>
  );
};

export default Header;