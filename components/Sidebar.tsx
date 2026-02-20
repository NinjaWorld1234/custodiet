import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import { useAppStore } from '../store';
import { NAVIGATION_ITEMS, TRANSLATIONS } from '../constants';
import { Shield, ChevronLeft, ChevronRight, LogOut } from 'lucide-react';
import clsx from 'clsx';

const Sidebar: React.FC = () => {
  const { language, sidebarCollapsed, toggleSidebar, direction } = useAppStore();
  const location = useLocation();
  const t = TRANSLATIONS[language];

  return (
    <aside 
      className={clsx(
        "bg-slate-900 text-slate-300 flex flex-col h-full transition-all duration-300 ease-in-out border-slate-700 border-e",
        sidebarCollapsed ? "w-16" : "w-64"
      )}
    >
      {/* Brand */}
      <div className="h-16 flex items-center px-4 border-b border-slate-800 shrink-0">
        <Shield className="w-8 h-8 text-primary-500 shrink-0" />
        <span className={clsx("font-bold text-white text-lg mx-3 tracking-wide whitespace-nowrap overflow-hidden transition-all duration-300", sidebarCollapsed && "w-0 opacity-0 px-0 mx-0")}>
          CUSTODIET
        </span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 space-y-1">
        {NAVIGATION_ITEMS.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.id}
              to={item.path}
              className={clsx(
                "flex items-center px-4 py-3 mx-2 rounded-lg transition-colors group relative",
                isActive ? "bg-primary-600/10 text-primary-400" : "hover:bg-slate-800 hover:text-white"
              )}
            >
              <item.icon className={clsx("w-5 h-5 shrink-0", isActive ? "text-primary-500" : "text-slate-400 group-hover:text-white")} />
              <span 
                className={clsx(
                  "mx-3 text-sm font-medium whitespace-nowrap overflow-hidden transition-all duration-300",
                  sidebarCollapsed ? "w-0 opacity-0" : "w-auto opacity-100"
                )}
              >
                {t[item.id as keyof typeof t]}
              </span>
              
              {/* Tooltip for collapsed state */}
              {sidebarCollapsed && (
                <div className={clsx(
                  "absolute top-1/2 -translate-y-1/2 z-50 bg-slate-900 text-white text-xs px-2 py-1 rounded border border-slate-700 whitespace-nowrap pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity",
                  direction === 'rtl' ? "right-full mr-2" : "left-full ml-2"
                )}>
                   {t[item.id as keyof typeof t]}
                </div>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer / Toggle */}
      <div className="p-4 border-t border-slate-800">
        <button 
          onClick={toggleSidebar}
          className="flex items-center justify-center w-full p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 transition-colors"
        >
          {direction === 'rtl' 
            ? (sidebarCollapsed ? <ChevronLeft className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />)
            : (sidebarCollapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />)
          }
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;