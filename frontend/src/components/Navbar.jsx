import React from 'react';
import { Sun, Moon, Bell, Search, ChevronDown } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';

export const Navbar = ({ title }) => {
  const { theme, toggleTheme } = useTheme();
  const { user } = useAuth();

  return (
    <header className="sticky top-0 right-0 h-14 bg-white/70 dark:bg-slate-900/70 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 z-30 transition-colors flex items-center justify-between px-6">
      <h1 className="text-sm font-semibold text-slate-900 dark:text-white transition-all">
        {title}
      </h1>

      <div className="flex items-center gap-3">
        <div className="relative group hidden sm:block">
          <label className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400">
            <Search className="w-3 h-3" />
          </label>
          <input
            type="text"
            placeholder="Search..."
            className="input pl-8 h-8 w-48 text-[11px] font-medium"
          />
        </div>

        <button
          onClick={toggleTheme}
          className="p-1.5 rounded-md border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 transition-colors"
        >
          {theme === 'light' ? <Moon className="w-3.5 h-3.5" /> : <Sun className="w-3.5 h-3.5" />}
        </button>

        <button className="p-1.5 rounded-md border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 transition-colors relative">
          <Bell className="w-3.5 h-3.5" />
          <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-red-500 rounded-full border border-white dark:border-slate-900"></span>
        </button>

        <div className="h-6 w-px bg-slate-200 dark:bg-slate-800 mx-1"></div>

        {/* User profile with background div */}
        <div className="flex items-center gap-2 p-1.5 px-3 bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700/50 rounded-md shadow-sm">
          <div className="w-7 h-7 rounded bg-primary-500 flex items-center justify-center text-white text-[10px] font-bold uppercase ring-2 ring-white dark:ring-slate-800">
            {user?.name?.charAt(0)}
          </div>
          <div className="hidden md:block">
            <div className="flex items-center gap-1">
              <p className="text-[10px] font-bold text-slate-900 dark:text-white capitalize leading-none">{user?.name}</p>
              <ChevronDown className="w-2.5 h-2.5 text-slate-400" />
            </div>
            <p className="text-[9px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-tight">{user?.role}</p>
          </div>
        </div>
      </div>
    </header>
  );
};
