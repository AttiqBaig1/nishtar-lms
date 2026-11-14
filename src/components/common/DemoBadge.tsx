import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { ChevronDown, RefreshCw } from 'lucide-react';
import { storageService } from '../../services/storageService';

/** Demo-mode marker. No account switching: every role must sign in. */
export const DemoBadge: React.FC = () => {
  const { isDemo, logout } = useAuth();
  const [open, setOpen] = useState(false);
  if (!isDemo) return null;

  const resetData = () => {
    if (!window.confirm('Reset all demo data (courses, keys, students) to the starting state?')) return;
    storageService.initializeDefaults(true);
    logout();
    window.location.reload();
  };

  return (
    <div className="relative inline-block text-left">
      <button onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/30"
        title="Demo build: data is saved in this browser only.">
        <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
        <span>Demo</span>
        <ChevronDown className="w-3 h-3 opacity-60" />
      </button>
      {open && (
        <div className="absolute right-0 mt-2 w-64 rounded-2xl bg-white dark:bg-slate-900 shadow-2xl border border-slate-200 dark:border-slate-800 p-3 z-50 text-xs space-y-2" onMouseLeave={() => setOpen(false)}>
          <p className="text-slate-600 dark:text-slate-300">Demo build: courses, keys and students are saved in this browser only. Emails go to the Demo Inbox.</p>
          <button onClick={resetData} className="w-full flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 font-semibold hover:bg-slate-200 dark:hover:bg-slate-700">
            <RefreshCw className="w-3.5 h-3.5" /> Reset demo data
          </button>
        </div>
      )}
    </div>
  );
};
