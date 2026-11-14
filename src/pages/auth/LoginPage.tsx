import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { formatKeyInput } from '../../lib/crypto';
import { storageService } from '../../services/storageService';
import { GraduationCap, Mail, Lock, ArrowRight, KeyRound, AlertCircle, Shield, User, Phone, Sparkles } from 'lucide-react';

type Tab = 'student' | 'staff';

export const LoginPage: React.FC = () => {
  const { login, loginWithKey, currentUser, isDemo } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState<Tab>('student');

  // student
  const [key, setKey] = useState('');
  const [needsProfile, setNeedsProfile] = useState(false);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  // staff
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (currentUser) navigate(currentUser.role === 'student' ? '/dashboard' : '/admin', { replace: true });
  }, [currentUser, navigate]);

  const switchTab = (t: Tab) => { setTab(t); setErrorMsg(null); };

  const submitKey = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setErrorMsg(null);
    const res = await loginWithKey(key, needsProfile ? { name, phone } : undefined);
    setLoading(false);
    if (res.success) return navigate('/dashboard');
    if (res.needsProfile) setNeedsProfile(true);
    setErrorMsg(res.message || 'Sign-in failed.');
  };

  const submitStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setErrorMsg(null);
    const res = await login(email, password);
    setLoading(false);
    if (res.success) return navigate('/admin');
    setErrorMsg(res.message || 'Sign-in failed.');
  };

  const input = 'w-full pl-10 pr-3 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500';

  return (
    <div className="min-h-[85vh] flex items-center justify-center p-4 py-12">
      <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-xl space-y-6">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-teal-700 text-white flex items-center justify-center mx-auto shadow-md">
            <GraduationCap className="w-7 h-7 text-teal-100" />
          </div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white">Sign In</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">Nishtar Medical Academy, Multan</p>
        </div>

        <div className="grid grid-cols-2 gap-1 p-1 rounded-2xl bg-slate-100 dark:bg-slate-800" role="tablist">
          {(['student', 'staff'] as Tab[]).map(t => (
            <button key={t} type="button" role="tab" aria-selected={tab === t} onClick={() => switchTab(t)}
              className={`py-2.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${tab === t ? 'bg-white dark:bg-slate-900 text-teal-700 dark:text-teal-300 shadow-sm' : 'text-slate-500'}`}>
              {t === 'student' ? <><KeyRound className="w-4 h-4" />Student</> : <><Shield className="w-4 h-4" />Admin / Supervisor</>}
            </button>
          ))}
        </div>

        {errorMsg && (
          <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 text-xs flex gap-2" role="alert">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" /><span>{errorMsg}</span>
          </div>
        )}

        {tab === 'student' ? (
          <form onSubmit={submitKey} className="space-y-4" id="student-login">
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Enter the access key the academy sent you on WhatsApp. Your key is your login: no password needed.
            </p>
            <label className="block space-y-1.5">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Access key</span>
              <div className="relative">
                <KeyRound className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input id="key-input" value={key} onChange={e => setKey(formatKeyInput(e.target.value, storageService.getClinicSettings().keyPrefix.length || 3))} placeholder="NMA-XXXX-XXXX-XXXX"
                  autoComplete="off" spellCheck={false} className={input + ' font-mono tracking-wider uppercase'} />
              </div>
            </label>

            {needsProfile && (
              <div className="space-y-3 p-3 rounded-2xl bg-teal-50 dark:bg-teal-950/30 border border-teal-200 dark:border-teal-900">
                <div className="text-xs font-bold text-teal-900 dark:text-teal-200">First sign-in: tell us who you are</div>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input id="first-name" value={name} onChange={e => setName(e.target.value)} placeholder="Full name" className={input} />
                </div>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input id="first-phone" value={phone} onChange={e => setPhone(e.target.value)} placeholder="Mobile, e.g. 0300 1234567" className={input} />
                </div>
              </div>
            )}

            <button type="submit" disabled={loading} id="key-submit"
              className="w-full py-3 rounded-xl bg-teal-700 hover:bg-teal-800 disabled:opacity-60 text-white font-bold text-sm flex items-center justify-center gap-2">
              {loading ? 'Checking key…' : <>Open my lectures <ArrowRight className="w-4 h-4" /></>}
            </button>
          </form>
        ) : (
          <form onSubmit={submitStaff} className="space-y-4" id="staff-login">
            <label className="block space-y-1.5">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Email</span>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input id="staff-email" type="email" value={email} onChange={e => setEmail(e.target.value)} autoComplete="username" placeholder="you@academy.pk" className={input} />
              </div>
            </label>
            <label className="block space-y-1.5">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Password</span>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input id="staff-password" type="password" value={password} onChange={e => setPassword(e.target.value)} autoComplete="current-password" className={input} />
              </div>
            </label>
            <div className="text-right">
              <Link to="/forgot-password" className="text-xs font-semibold text-teal-700 dark:text-teal-400 hover:underline">Forgot password?</Link>
            </div>
            <button type="submit" disabled={loading} id="staff-submit"
              className="w-full py-3 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-teal-700 disabled:opacity-60 text-white font-bold text-sm flex items-center justify-center gap-2">
              {loading ? 'Signing in…' : <>Sign in <ArrowRight className="w-4 h-4" /></>}
            </button>
          </form>
        )}

        {isDemo && (
          <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200/80 dark:border-amber-800/40 text-[11px] text-amber-900 dark:text-amber-200 space-y-1.5">
            <div className="flex items-center gap-1.5 font-bold"><Sparkles className="w-4 h-4 text-amber-600" />Demo logins</div>
            {tab === 'student' ? (
              <>
                <div>Active student: <button type="button" className="font-mono font-bold underline" onClick={() => setKey('NMA-AHM1-PHAC-2025')}>NMA-AHM1-PHAC-2025</button></div>
                <div>New key (first login): <button type="button" className="font-mono font-bold underline" onClick={() => setKey('NMA-7F3K-9Q2M-XW4P')}>NMA-7F3K-9Q2M-XW4P</button></div>
              </>
            ) : (
              <>
                <div>Admin: <button type="button" className="font-mono font-bold underline" onClick={() => { setEmail('admin@demo.com'); setPassword('Admin@123'); }}>admin@demo.com / Admin@123</button></div>
                <div>Supervisor: <button type="button" className="font-mono font-bold underline" onClick={() => { setEmail('supervisor@demo.com'); setPassword('Super@123'); }}>supervisor@demo.com / Super@123</button></div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
