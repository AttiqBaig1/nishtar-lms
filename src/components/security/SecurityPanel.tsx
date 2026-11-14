import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { storageService, checkPasswordStrength, maskEmail } from '../../services/storageService';
import { CodePurpose, VerificationCode } from '../../types';
import { Mail, Lock, ShieldCheck, Send, CheckCircle2, AlertCircle, X } from 'lucide-react';

const field = 'w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500';
const btn = 'px-4 py-2.5 rounded-xl text-xs font-bold transition disabled:opacity-50';

/** Send a code to `to`, let the user type it, hand back the verified record. */
const CodeStep: React.FC<{
  uid: string; purpose: CodePurpose; to: string; newValue?: string; label: string;
  onVerified: (r: VerificationCode) => void;
}> = ({ uid, purpose, to, newValue, label, onVerified }) => {
  const [sent, setSent] = useState(false);
  const [code, setCode] = useState('');
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [busy, setBusy] = useState(false);

  const send = async () => {
    setBusy(true);
    const r = await storageService.sendVerificationCode(uid, purpose, to, newValue);
    setBusy(false);
    setMsg({ ok: r.ok, text: r.message });
    if (r.ok) setSent(true);
  };
  const verify = async () => {
    setBusy(true);
    const r = await storageService.verifyCode(uid, purpose, code);
    setBusy(false);
    setMsg({ ok: r.ok, text: r.message });
    if (r.ok && r.record) onVerified(r.record);
  };

  return (
    <div className="space-y-2.5 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700" data-step={purpose}>
      <div className="text-xs text-slate-600 dark:text-slate-300">{label} <b>{maskEmail(to)}</b></div>
      {!sent ? (
        <button type="button" onClick={send} disabled={busy} className={btn + ' bg-teal-700 text-white hover:bg-teal-800 flex items-center gap-1.5'} data-action="send-code">
          <Send className="w-3.5 h-3.5" /> Send 6-digit code
        </button>
      ) : (
        <div className="flex gap-2">
          <input value={code} onChange={e => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))} inputMode="numeric" placeholder="123456"
            className={field + ' font-mono tracking-[0.4em] text-center max-w-40'} data-input="code" />
          <button type="button" onClick={verify} disabled={busy || code.length !== 6} className={btn + ' bg-slate-900 dark:bg-teal-700 text-white'} data-action="verify-code">Verify</button>
          <button type="button" onClick={send} disabled={busy} className={btn + ' text-teal-700 dark:text-teal-300'}>Resend</button>
        </div>
      )}
      {msg && <p className={`text-[11px] flex gap-1 ${msg.ok ? 'text-emerald-700 dark:text-emerald-400' : 'text-rose-600'}`}>{msg.ok ? <CheckCircle2 className="w-3.5 h-3.5" /> : <AlertCircle className="w-3.5 h-3.5" />}{msg.text}</p>}
    </div>
  );
};

type Flow = null | 'email' | 'password';

export const SecurityPanel: React.FC = () => {
  const { currentUser, refreshUser } = useAuth();
  const [flow, setFlow] = useState<Flow>(null);
  const [newEmail, setNewEmail] = useState('');
  const [emailStage, setEmailStage] = useState<'enter' | 'old' | 'new'>('enter');
  const [pwVerified, setPwVerified] = useState<VerificationCode | undefined>();
  const [pw1, setPw1] = useState('');
  const [pw2, setPw2] = useState('');
  const [done, setDone] = useState<{ ok: boolean; text: string } | null>(null);

  if (!currentUser) return null;
  const isStudent = currentUser.role === 'student';
  const hasEmail = Boolean(currentUser.email);

  const reset = () => { setFlow(null); setNewEmail(''); setEmailStage('enter'); setPwVerified(undefined); setPw1(''); setPw2(''); };

  const startEmail = () => {
    const e = newEmail.trim().toLowerCase();
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(e)) return setDone({ ok: false, text: 'Enter a valid email address.' });
    if (e === currentUser.email) return setDone({ ok: false, text: 'That is already your email.' });
    const taken = storageService.getUserByEmail(e);
    if (taken && taken.uid !== currentUser.uid) return setDone({ ok: false, text: 'This email is already used by another account.' });
    setDone(null);
    // With a current email: first prove it's you (code to the current inbox), then prove the new address.
    setEmailStage(hasEmail ? 'old' : 'new');
  };

  const finishEmail = (rec: VerificationCode) => {
    const r = storageService.applyVerifiedEmail(currentUser.uid, rec);
    setDone({ ok: r.ok, text: r.message });
    if (r.ok) { refreshUser(); reset(); }
  };

  const savePassword = async () => {
    if (pw1 !== pw2) return setDone({ ok: false, text: 'The two passwords do not match.' });
    const weak = checkPasswordStrength(pw1);
    if (weak) return setDone({ ok: false, text: weak });
    const r = await storageService.setPassword(currentUser.uid, pw1, pwVerified);
    setDone({ ok: r.ok, text: r.message });
    if (r.ok) reset();
  };

  return (
    <section className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 space-y-5" id="security-panel">
      <div className="flex items-center gap-2">
        <ShieldCheck className="w-5 h-5 text-teal-600" />
        <h2 className="font-extrabold text-slate-900 dark:text-white">Login &amp; Security</h2>
      </div>
      <p className="text-xs text-slate-500 dark:text-slate-400">
        {isStudent
          ? 'You sign in with your access key. Add a verified email so the academy can reach you; changing it needs a code sent to your email.'
          : 'Changing your login email or password needs a 6-digit code sent to your email.'}
      </p>

      {done && (
        <div className={`p-3 rounded-xl text-xs flex gap-2 ${done.ok ? 'bg-emerald-50 text-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-300' : 'bg-rose-50 text-rose-700 dark:bg-rose-950/30 dark:text-rose-300'}`} role="status" id="security-result">
          {done.ok ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}{done.text}
        </div>
      )}

      {/* Email row */}
      <div className="space-y-3">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-sm min-w-0">
            <Mail className="w-4 h-4 text-slate-400 shrink-0" />
            <span className="truncate font-semibold" id="current-email">{currentUser.email || 'No email added yet'}</span>
            {hasEmail && currentUser.emailVerified && <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 font-bold">Verified</span>}
          </div>
          {flow !== 'email' && (
            <button type="button" onClick={() => { reset(); setDone(null); setFlow('email'); }} className={btn + ' border border-slate-200 dark:border-slate-700'} id="btn-change-email">
              {hasEmail ? 'Change email' : 'Add email'}
            </button>
          )}
        </div>

        {flow === 'email' && (
          <div className="space-y-3">
            {emailStage === 'enter' && (
              <div className="flex gap-2">
                <input type="email" value={newEmail} onChange={e => setNewEmail(e.target.value)} placeholder="new@email.com" className={field} id="new-email" />
                <button type="button" onClick={startEmail} className={btn + ' bg-teal-700 text-white'} id="btn-email-next">Next</button>
                <button type="button" onClick={reset} className={btn} aria-label="Cancel"><X className="w-4 h-4" /></button>
              </div>
            )}
            {emailStage === 'old' && (
              <CodeStep uid={currentUser.uid} purpose="change_email" to={currentUser.email} newValue={newEmail.trim().toLowerCase()}
                label="Step 1 of 2: confirm it's you. We'll send a code to your current email" onVerified={() => setEmailStage('new')} />
            )}
            {emailStage === 'new' && (
              <CodeStep uid={currentUser.uid} purpose="link_email" to={newEmail.trim().toLowerCase()} newValue={newEmail.trim().toLowerCase()}
                label={hasEmail ? 'Step 2 of 2: confirm the new address. Code goes to' : 'Confirm your email. Code goes to'} onVerified={finishEmail} />
            )}
          </div>
        )}
      </div>

      {/* Password row (staff only) */}
      {!isStudent && (
        <div className="space-y-3 pt-4 border-t border-slate-100 dark:border-slate-800">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm"><Lock className="w-4 h-4 text-slate-400" /><span className="font-semibold">Password</span><span className="text-slate-400">••••••••</span></div>
            {flow !== 'password' && (
              <button type="button" onClick={() => { reset(); setDone(null); setFlow('password'); }} className={btn + ' border border-slate-200 dark:border-slate-700'} id="btn-change-password">Change password</button>
            )}
          </div>
          {flow === 'password' && !pwVerified && (
            <CodeStep uid={currentUser.uid} purpose="change_password" to={currentUser.email} label="We'll send a code to" onVerified={setPwVerified} />
          )}
          {flow === 'password' && pwVerified && (
            <div className="space-y-2">
              <input type="password" value={pw1} onChange={e => setPw1(e.target.value)} placeholder="New password (8+ characters, letters and numbers)" className={field} id="new-password" autoComplete="new-password" />
              <input type="password" value={pw2} onChange={e => setPw2(e.target.value)} placeholder="Repeat new password" className={field} id="new-password2" autoComplete="new-password" />
              <div className="flex gap-2">
                <button type="button" onClick={savePassword} className={btn + ' bg-teal-700 text-white'} id="btn-save-password">Save new password</button>
                <button type="button" onClick={reset} className={btn}>Cancel</button>
              </div>
            </div>
          )}
        </div>
      )}
    </section>
  );
};
