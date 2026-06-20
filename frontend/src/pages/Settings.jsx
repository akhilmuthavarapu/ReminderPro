import React from 'react';
import { User, Shield, Moon, LogOut, Key } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import toast from 'react-hot-toast';

export const Settings = () => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <div>
          <h2 className="text-xl font-semibold text-slate-900 dark:text-white">Profile</h2>
          <p className="text-xs text-slate-500 font-medium">Manage preferences</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-lg bg-gradient-to-tr from-primary-500 to-primary-700 flex items-center justify-center text-white text-xl font-bold border-2 border-white dark:border-slate-800 shadow-sm">
                {user?.name?.charAt(0).toUpperCase()}
              </div>
              <div>
                <h3 className="text-base font-semibold text-slate-900 dark:text-white capitalize leading-tight">{user?.name}</h3>
                <p className="text-xs text-slate-500 font-medium">{user?.email}</p>
                <div className="mt-2 flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-widest text-primary-600">
                  <Shield className="w-3 h-3" />
                  <span>{user?.role}</span>
                </div>
              </div>
            </div>
          </div>
          <div className="p-6 space-y-4 text-xs">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-0.5">
                <p className="text-[10px] uppercase text-slate-400 italic font-bold">Session Status</p>
                <p className="font-semibold text-emerald-500 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Active
                </p>
              </div>
              <div className="space-y-0.5">
                <p className="text-[10px] uppercase text-slate-400 italic font-bold">Organization</p>
                <p className="font-semibold text-slate-800 dark:text-slate-200">Default Group</p>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="card p-5 space-y-5">
             <div className="flex items-center gap-2 mb-2 pb-2 border-b border-slate-100 dark:border-slate-800">
               <Moon className="w-4 h-4 text-slate-500" />
               <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">Preferences</h4>
             </div>
             <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/40 rounded-lg border border-slate-200 dark:border-slate-700 transition-colors">
                <div>
                  <p className="text-xs font-semibold text-slate-900 dark:text-white">Dark Mode UI</p>
                  <p className="text-[10px] text-slate-500">Change application surface theme</p>
                </div>
                <button 
                  onClick={toggleTheme}
                  className={`w-10 h-6 rounded-full transition-all relative ${theme === 'dark' ? 'bg-primary-600' : 'bg-slate-300 dark:bg-slate-600'}`}
                >
                  <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${theme === 'dark' ? 'left-5' : 'left-1'}`}></div>
                </button>
             </div>
          </div>

          <div className="card p-5 space-y-3">
             <button onClick={() => toast.success('Password link sent')} className="btn btn-secondary w-full justify-start gap-2 h-10 text-[11px] font-semibold border-slate-200 dark:border-slate-700">
               <Key className="w-3.5 h-3.5" /> Modify Password
             </button>
             <button onClick={logout} className="btn btn-primary w-full justify-start gap-2 h-10 text-[11px] font-semibold bg-red-600 hover:bg-red-700 border-none">
               <LogOut className="w-3.5 h-3.5" /> Terminate Session
             </button>
          </div>
        </div>
      </div>
    </div>
  );
};
