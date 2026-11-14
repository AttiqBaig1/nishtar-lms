import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { storageService } from '../../services/storageService';
import { UserProfile } from '../../types';
import { UserPlus, Trash2, ShieldCheck, Eye, CheckCircle2, AlertCircle } from 'lucide-react';

const field = 'w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500';

/** Admin only: create and remove supervisor / admin accounts. */
export const AdminStaff: React.FC = () => {
  const { currentUser } = useAuth();
  const [staff, setStaff] = useState<UserProfile[]>(() => storageService.getStaff());
  const [form, setForm] = useState({ name: '', email: '', phone: '', role: 'supervisor' as 'admin' | 'supervisor', password: '' });
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  const create = async (e: React.FormEvent) => {
    e.preventDefault();
    const r = await storageService.createStaff(form, currentUser!.uid);
    setMsg({ ok: r.ok, text: r.message });
    if (r.ok) { setForm({ name: '', email: '', phone: '', role: 'supervisor', password: '' }); setStaff(storageService.getStaff()); }
  };
  const remove = (u: UserProfile) => {
    if (!window.confirm(`Remove ${u.name}? They will no longer be able to sign in.`)) return;
    const r = storageService.deleteStaff(u.uid, currentUser!.uid);
    setMsg({ ok: r.ok, text: r.message });
    setStaff(storageService.getStaff());
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-black text-slate-900 dark:text-white">Staff Accounts</h1>
        <p className="text-xs text-slate-500">Supervisors can manage courses, access keys, students and announcements. Only admins can change clinic settings or staff accounts.</p>
      </div>

      {msg && (
        <div className={`p-3 rounded-xl text-xs flex gap-2 ${msg.ok ? 'bg-emerald-50 text-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-300' : 'bg-rose-50 text-rose-700 dark:bg-rose-950/30 dark:text-rose-300'}`} role="status" id="staff-msg">
          {msg.ok ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}{msg.text}
        </div>
      )}

      <form onSubmit={create} className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 space-y-4" id="staff-form">
        <div className="flex items-center gap-2 font-extrabold"><UserPlus className="w-5 h-5 text-teal-600" />Add a staff member</div>
        <div className="grid sm:grid-cols-2 gap-3">
          <input className={field} placeholder="Full name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} id="staff-name" />
          <input className={field} type="email" placeholder="Login email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} id="staff-new-email" />
          <input className={field} placeholder="Mobile (optional)" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} />
          <select className={field} value={form.role} onChange={e => setForm({ ...form, role: e.target.value as 'admin' | 'supervisor' })} id="staff-role">
            <option value="supervisor">Supervisor</option>
            <option value="admin">Admin</option>
          </select>
          <input className={field + ' sm:col-span-2'} type="text" placeholder="Temporary password (8+ letters and numbers)" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} id="staff-new-password" autoComplete="off" />
        </div>
        <p className="text-[11px] text-slate-500">Share the temporary password privately. They can change it from My Account (verified by an email code).</p>
        <button className="px-5 py-2.5 rounded-xl bg-teal-700 hover:bg-teal-800 text-white text-xs font-bold" id="staff-create">Create account</button>
      </form>

      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 dark:bg-slate-800/50 text-[11px] uppercase tracking-wider text-slate-500">
            <tr><th className="text-left p-3">Name</th><th className="text-left p-3">Email</th><th className="text-left p-3">Role</th><th className="p-3" /></tr>
          </thead>
          <tbody id="staff-table">
            {staff.map(u => (
              <tr key={u.uid} className="border-t border-slate-100 dark:border-slate-800">
                <td className="p-3 font-semibold">{u.name}{u.uid === currentUser?.uid && <span className="text-[10px] text-slate-400"> (you)</span>}</td>
                <td className="p-3 text-slate-600 dark:text-slate-300">{u.email}</td>
                <td className="p-3">
                  <span className={`inline-flex items-center gap-1 text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${u.role === 'admin' ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300' : 'bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300'}`}>
                    {u.role === 'admin' ? <ShieldCheck className="w-3 h-3" /> : <Eye className="w-3 h-3" />}{u.role}
                  </span>
                </td>
                <td className="p-3 text-right">
                  {u.uid !== currentUser?.uid && (
                    <button onClick={() => remove(u)} className="p-2 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30" aria-label={`Remove ${u.name}`}><Trash2 className="w-4 h-4" /></button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
