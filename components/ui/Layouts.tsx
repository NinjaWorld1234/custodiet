import React, { useState } from 'react';
import clsx from 'clsx';

// --- CARD ---
export const Card: React.FC<{ children: React.ReactNode; className?: string; noPadding?: boolean }> = ({ 
  children, 
  className, 
  noPadding 
}) => {
  return (
    <div className={clsx("bg-white rounded-xl border border-slate-200 shadow-sm", className)}>
      <div className={clsx(noPadding ? "" : "p-5")}>
        {children}
      </div>
    </div>
  );
};

export const CardHeader: React.FC<{ title: React.ReactNode; action?: React.ReactNode; className?: string }> = ({ 
  title, 
  action, 
  className 
}) => (
  <div className={clsx("flex items-center justify-between mb-4", className)}>
    <div className="font-bold text-slate-800 text-sm flex items-center gap-2">{title}</div>
    {action && <div>{action}</div>}
  </div>
);

// --- TABS ---
interface Tab {
  id: string;
  label: string;
  icon?: React.ReactNode;
}

export const Tabs: React.FC<{ 
  tabs: Tab[]; 
  activeTab: string; 
  onChange: (id: string) => void;
  className?: string;
}> = ({ tabs, activeTab, onChange, className }) => {
  return (
    <div className={clsx("flex space-x-1 rtl:space-x-reverse border-b border-slate-200", className)}>
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            className={clsx(
              "flex items-center gap-2 px-4 py-2 text-xs font-medium border-b-2 transition-all duration-200 ease-in-out",
              isActive 
                ? "border-primary-500 text-primary-600" 
                : "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300"
            )}
          >
            {tab.icon && <span className="w-3.5 h-3.5">{tab.icon}</span>}
            {tab.label}
          </button>
        );
      })}
    </div>
  );
};