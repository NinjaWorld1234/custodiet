
import React from 'react';
import clsx from 'clsx';
import { Loader2 } from 'lucide-react';

// --- BUTTON ---
export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive' | 'link';
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'icon';
  isLoading?: boolean;
  icon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({ 
  className, 
  variant = 'primary', 
  size = 'sm', 
  isLoading, 
  children, 
  disabled,
  icon,
  ...props 
}) => {
  const baseStyles = "inline-flex items-center justify-center font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-1 disabled:opacity-50 disabled:pointer-events-none";
  
  const variants = {
    primary: "bg-primary-600 text-white hover:bg-primary-700 focus:ring-primary-500 border border-transparent shadow-sm",
    secondary: "bg-slate-100 text-slate-900 hover:bg-slate-200 focus:ring-slate-500 border border-slate-200",
    outline: "bg-transparent border border-slate-300 text-slate-700 hover:bg-slate-50 focus:ring-slate-500",
    ghost: "bg-transparent text-slate-600 hover:bg-slate-100 hover:text-slate-900 focus:ring-slate-500",
    destructive: "bg-rose-600 text-white hover:bg-rose-700 focus:ring-rose-500 shadow-sm",
    link: "text-primary-600 underline-offset-4 hover:underline p-0 h-auto",
  };

  const sizes = {
    xs: "h-7 px-2 text-xs",
    sm: "h-8 px-3 text-xs",
    md: "h-10 px-4 text-sm",
    lg: "h-12 px-6 text-base",
    icon: "h-9 w-9 p-0",
  };

  return (
    <button
      className={clsx(baseStyles, variants[variant], sizes[size], className)}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
      {!isLoading && icon && <span className={clsx(children ? "ltr:mr-2 rtl:ml-2" : "")}>{icon}</span>}
      {children}
    </button>
  );
};

// --- BADGE ---
export interface BadgeProps {
  variant?: 'default' | 'outline' | 'secondary' | 'destructive' | 'success' | 'warning' | 'info';
  children: React.ReactNode;
  className?: string;
  size?: 'sm' | 'md';
}

export const Badge: React.FC<BadgeProps> = ({ variant = 'default', children, className, size = 'sm' }) => {
  const baseStyles = "inline-flex items-center rounded-md font-medium border transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2";
  
  const variants = {
    default: "border-transparent bg-slate-900 text-slate-50 hover:bg-slate-900/80",
    secondary: "border-transparent bg-slate-100 text-slate-900 hover:bg-slate-100/80",
    outline: "text-slate-500 border-slate-200",
    destructive: "border-transparent bg-rose-100 text-rose-700 border-rose-200",
    success: "border-transparent bg-emerald-100 text-emerald-700 border-emerald-200",
    warning: "border-transparent bg-amber-100 text-amber-700 border-amber-200",
    info: "border-transparent bg-sky-100 text-sky-700 border-sky-200",
  };

  const sizes = {
    sm: "px-2 py-0.5 text-[10px]",
    md: "px-2.5 py-0.5 text-xs",
  };

  return (
    <div className={clsx(baseStyles, variants[variant], sizes[size], className)}>
      {children}
    </div>
  );
};

// --- SWITCH ---
export interface SwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
}

export const Switch: React.FC<SwitchProps> = ({ checked, onChange, disabled }) => {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => !disabled && onChange(!checked)}
      className={clsx(
        "relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2",
        checked ? "bg-primary-600" : "bg-slate-200",
        disabled && "opacity-50 cursor-not-allowed"
      )}
    >
      <span
        className={clsx(
          "pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out",
          checked ? "ltr:translate-x-5 rtl:-translate-x-5" : "translate-x-0"
        )}
      />
    </button>
  );
};

// --- SKELETON ---
export const Skeleton: React.FC<{ className?: string }> = ({ className }) => {
  return (
    <div className={clsx("animate-pulse rounded-md bg-slate-200/80", className)} />
  );
};
