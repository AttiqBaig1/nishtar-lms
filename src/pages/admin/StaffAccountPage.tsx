import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { SecurityPanel } from '../../components/security/SecurityPanel';
import { UserCircle2 } from 'lucide-react';

export const StaffAccountPage: React.FC = () => {
  const { currentUser } = useAuth();
  if (!currentUser) return null;
  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-black text-slate-900 dark:text-white">My Account</h1>
        <p className="text-xs text-slate-500">Your profile, login email and password.</p>
      </div>
      <section className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 flex items-center gap-4">
        <div className="w-14 h-14 rounded-2xl bg-teal-100 dark:bg-teal-950 text-teal-700 dark:text-teal-300 flex items-center justify-center"><UserCircle2 className="w-8 h-8" /></div>
        <div>
          <div className="font-extrabold text-slate-900 dark:text-white">{currentUser.name}</div>
          <div className="text-xs text-slate-500">{currentUser.phone}</div>
          <span className={`inline-block mt-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${currentUser.role === 'admin' ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300' : 'bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300'}`}>
            {currentUser.role}
          </span>
        </div>
      </section>
      <SecurityPanel />
    </div>
  );
};
