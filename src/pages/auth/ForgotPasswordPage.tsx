import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { storageService, checkPasswordStrength } from '../../services/storageService';
import { VerificationCode } from '../../types';
import { KeyRound, Mail, ArrowLeft, CheckCircle2, AlertCircle } from 'lucide-react';

const field = 'w-full px-3 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500';

/** Staff password reset: email -> 6-digit code -> new password. */
export const ForgotPasswordPage: React.FC = () => {
  const navigate = useNavigate();
  const [stage, setStage] = useState<'email' | 'code' | 'password' | 'done'>('email');
  const [email, setEmail] = useState('');
  const [uid, setUid] = useState<string | undefined>();
  const [code, setCode] = useState('');
  const [rec, setRec] = useState<VerificationCode | undefined>();
  const [pw1, setPw1] = useState('');
  const [pw2, setPw2] = useState('');
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [busy, setBusy] = useState(false);

  const sendCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    const r = await storageService.requestPasswordReset(email);
    setBusy(false);
    setMsg({ ok: r.ok, text: r.message });
    if (r.ok) { setUid(r.uid); setStage('code'); }
  };

  const verify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uid) return setMsg({ ok: false, text: 'Wrong code. Check the email and try again.' });
    setBusy(true);
    const r = await storageService.verifyCode(uid, 'reset_password', code);
    setBusy(false);
    setMsg({ ok: r.ok, text: r.message });
    if (r.ok) { setRec(r.record); setStage('password'); }
  };

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    if (pw1 !== pw2) return setMsg({ ok: false, text: 'The two passwords do not match.' });
    const weak = checkPasswordStrength(pw1);
    if (weak) return setMsg({ ok: false, text: weak });
    const r = await storageService.setPassword(uid!, pw1, rec);
    setMsg({ ok: r.ok, text: r.message });
    if (r.ok) setStage('done');
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4 py-12">
      <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-xl space-y-5">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-teal-700 text-white flex items-center justify-center mx-auto"><KeyRound className="w-6 h-6" /></div>
          <h1 className="text-xl font-black text-slate-900 dark:text-white">Reset staff password</h1>
          <p className="text-xs text-slate-500">For admin and supervisor accounts. Students sign in with their access key.</p>
        </div>

        {msg && (
          <div className={`p-3 rounded-xl text-xs flex gap-2 ${msg.ok ? 'bg-emerald-50 text-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-300' : 'bg-rose-50 text-rose-700 dark:bg-rose-950/30 dark:text-rose-300'}`} role="status">
            {msg.ok ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}{msg.text}
          </div>
        )}

        {stage === 'email' && (
          <form onSubmit={sendCode} className="space-y-3">
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input type="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder="Your staff email" className={field + ' pl-10'} id="reset-email" />
            </div>
            <button disabled={busy} className="w-full py-3 rounded-xl bg-teal-700 text-white font-bold text-sm disabled:opacity-60" id="reset-send">Send reset code</button>
          </form>
        )}
        {stage === 'code' && (
          <form onSubmit={verify} className="space-y-3">
            <input value={code} onChange={e => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))} inputMode="numeric" placeholder="6-digit code"
              className={field + ' font-mono tracking-[0.4em] text-center'} id="reset-code" />
            <button disabled={busy || code.length !== 6} className="w-full py-3 rounded-xl bg-teal-700 text-white font-bold text-sm disabled:opacity-60" id="reset-verify">Verify code</button>
          </form>
        )}
        {stage === 'password' && (
          <form onSubmit={save} className="space-y-3">
            <input type="password" value={pw1} onChange={e => setPw1(e.target.value)} placeholder="New password (8+ letters and numbers)" className={field} id="reset-pw1" autoComplete="new-password" />
            <input type="password" value={pw2} onChange={e => setPw2(e.target.value)} placeholder="Repeat new password" className={field} id="reset-pw2" autoComplete="new-password" />
            <button className="w-full py-3 rounded-xl bg-teal-700 text-white font-bold text-sm" id="reset-save">Save new password</button>
          </form>
        )}
        {stage === 'done' && (
          <button onClick={() => navigate('/login')} className="w-full py-3 rounded-xl bg-slate-900 dark:bg-teal-700 text-white font-bold text-sm">Go to sign in</button>
        )}

        <Link to="/login" className="flex items-center justify-center gap-1 text-xs font-semibold text-slate-500 hover:text-teal-700"><ArrowLeft className="w-3.5 h-3.5" />Back to sign in</Link>
      </div>
    </div>
  );
};
