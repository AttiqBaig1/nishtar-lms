import React, { useEffect, useState } from 'react';
import { storageService } from '../../services/storageService';
import { OutboxEmail } from '../../types';
import { Inbox, X, Trash2 } from 'lucide-react';

/**
 * Demo build only: shows the emails the app "sent" (verification codes),
 * since no mail service is connected. In production these go to real inboxes.
 */
export const DemoInbox: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [mails, setMails] = useState<OutboxEmail[]>(() => storageService.getOutbox());
  const [unread, setUnread] = useState(0);

  useEffect(() => {
    const onMail = () => { setMails(storageService.getOutbox()); setUnread(n => n + 1); setOpen(true); };
    window.addEventListener('nma-mail', onMail);
    return () => window.removeEventListener('nma-mail', onMail);
  }, []);

  return (
    <div className="fixed bottom-20 md:bottom-5 right-4 z-[60] flex flex-col items-end gap-2" id="demo-inbox">
      {open && (
        <div className="w-80 max-w-[calc(100vw-2rem)] max-h-96 overflow-y-auto bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-2xl">
          <div className="sticky top-0 flex items-center justify-between px-4 py-3 bg-amber-50 dark:bg-amber-950/40 border-b border-amber-200 dark:border-amber-900">
            <div>
              <div className="text-xs font-extrabold text-amber-900 dark:text-amber-200">Demo email inbox</div>
              <div className="text-[10px] text-amber-800/80 dark:text-amber-300/80">Live version mein yeh asli email par jayega</div>
            </div>
            <div className="flex gap-1">
              <button onClick={() => { storageService.clearOutbox(); setMails([]); }} className="p-1.5 rounded-lg hover:bg-amber-100 dark:hover:bg-amber-900" aria-label="Clear"><Trash2 className="w-4 h-4 text-amber-800 dark:text-amber-300" /></button>
              <button onClick={() => setOpen(false)} className="p-1.5 rounded-lg hover:bg-amber-100 dark:hover:bg-amber-900" aria-label="Close"><X className="w-4 h-4 text-amber-800 dark:text-amber-300" /></button>
            </div>
          </div>
          {mails.length === 0 ? (
            <p className="p-4 text-xs text-slate-500">No emails yet. Codes for password/email changes appear here.</p>
          ) : mails.map(m => (
            <div key={m.id} className="px-4 py-3 border-b border-slate-100 dark:border-slate-800 text-xs space-y-1" data-mail-to={m.to}>
              <div className="text-slate-500">To: <b className="text-slate-800 dark:text-slate-200">{m.to}</b></div>
              <div className="font-semibold text-slate-900 dark:text-white">{m.subject}</div>
              <div className="text-slate-600 dark:text-slate-300">{m.body}</div>
              <div className="font-mono text-lg font-black tracking-[0.3em] text-teal-700 dark:text-teal-300" data-code={m.code}>{m.code}</div>
            </div>
          ))}
        </div>
      )}
      <button onClick={() => { setOpen(o => !o); setUnread(0); }} className="relative flex items-center gap-2 px-4 py-2.5 rounded-full bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-extrabold shadow-lg" id="demo-inbox-toggle">
        <Inbox className="w-4 h-4" /> Demo Inbox
        {unread > 0 && <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-rose-600 text-white text-[10px] flex items-center justify-center">{unread}</span>}
      </button>
    </div>
  );
};
