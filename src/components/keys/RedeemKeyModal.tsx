import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { formatKeyInput, normalizeKey } from '../../lib/crypto';
import { storageService } from '../../services/storageService';
import { useAuth } from '../../contexts/AuthContext';
import {
  KeyRound,
  CheckCircle2,
  AlertCircle,
  Clock,
  MessageCircle,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  X
} from 'lucide-react';
import { Course } from '../../types';

interface RedeemKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (courses: Course[]) => void;
  title?: string;
  subtitle?: string;
}

export const RedeemKeyModal: React.FC<RedeemKeyModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  title = 'Activate Course Access Key',
  subtitle = 'Enter the 16-character access key provided by the clinic administrator',
}) => {
  const { currentUser, refreshUser } = useAuth();
  const settings = storageService.getClinicSettings();

  const [inputVal, setInputVal] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successInfo, setSuccessInfo] = useState<{
    message: string;
    unlockedCourses: Course[];
  } | null>(null);

  if (!isOpen) return null;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatKeyInput(e.target.value, settings.keyPrefix.length || 4);
    setInputVal(formatted);
    if (errorMsg) setErrorMsg(null);
  };

  const handleRedeem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;

    if (!inputVal.trim()) {
      setErrorMsg('Please enter your access key.');
      return;
    }

    setLoading(true);
    setErrorMsg(null);

    try {
      const res = await storageService.redeemAccessKey(currentUser.uid, inputVal);
      if (res.success) {
        // Trigger celebratory confetti!
        try {
          confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 }
          });
        } catch {}

        refreshUser();
        setSuccessInfo({
          message: res.message,
          unlockedCourses: res.unlockedCourses || (res.extendedCourse ? [res.extendedCourse] : []),
        });
        if (onSuccess && res.unlockedCourses) {
          onSuccess(res.unlockedCourses);
        }
      } else {
        setErrorMsg(res.message);
      }
    } catch (err: unknown) {
      setErrorMsg((err as Error).message || 'An error occurred during verification.');
    } finally {
      setLoading(false);
    }
  };

  // Pre-fill a demo key for testing with one click
  const handleInsertDemoKey = (key: string) => {
    setInputVal(key);
    setErrorMsg(null);
  };

  const clinicWaUrl = `https://wa.me/${settings.whatsappNumber}?text=${encodeURIComponent(
    `Assalam o Alaikum, I need an access key for Nishtar Clinical Academy courses. My registered name is ${currentUser?.name || ''} and phone is ${currentUser?.phone || ''}.`
  )}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 overflow-hidden">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
        >
          <X className="w-5 h-5" />
        </button>

        {successInfo ? (
          /* Success Screen */
          <div className="text-center py-4 space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto shadow-md">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <div className="space-y-1">
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white">
                Access Activated!
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-300">
                {successInfo.message}
              </p>
            </div>

            {successInfo.unlockedCourses.length > 0 && (
              <div className="bg-slate-50 dark:bg-slate-800/60 rounded-2xl p-4 text-left border border-slate-200 dark:border-slate-700/60 space-y-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-teal-700 dark:text-teal-400">
                  Unlocked Courses
                </span>
                {successInfo.unlockedCourses.map((c) => (
                  <div key={c.id} className="flex items-center gap-3">
                    <img
                      src={c.thumbnailUrl}
                      alt={c.title}
                      className="w-12 h-12 rounded-xl object-cover shrink-0"
                    />
                    <div>
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white line-clamp-1">
                        {c.title}
                      </h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        {c.instructor} • {c.totalLessons} Lessons
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="pt-2">
              <button
                onClick={() => {
                  onClose();
                  window.location.reload();
                }}
                className="w-full py-3.5 px-6 rounded-2xl bg-teal-700 hover:bg-teal-800 text-white font-semibold text-sm shadow-lg shadow-teal-700/20 transition flex items-center justify-center gap-2"
              >
                <span>Continue to My Courses</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        ) : (
          /* Key Entry Form */
          <div className="space-y-6">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 flex items-center justify-center shrink-0 border border-teal-200 dark:border-teal-800/40">
                <KeyRound className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white leading-tight">
                  {title}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  {subtitle}
                </p>
              </div>
            </div>

            <form onSubmit={handleRedeem} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                  Access Key Code
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={inputVal}
                    onChange={handleInputChange}
                    placeholder={`${settings.keyPrefix}-XXXX-XXXX-XXXX`}
                    maxLength={20}
                    autoFocus
                    className="w-full font-mono text-center text-lg sm:text-xl font-bold tracking-widest uppercase px-4 py-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border-2 border-slate-200 dark:border-slate-700 focus:border-teal-600 focus:ring-4 focus:ring-teal-600/10 dark:text-white transition"
                  />
                </div>
                <p className="text-[11px] text-slate-400 mt-1.5 flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-teal-600" />
                  <span>Case-insensitive, dashes are automatically placed.</span>
                </p>
              </div>

              {/* Error Message */}
              {errorMsg && (
                <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs flex items-start gap-2.5 animate-in shake">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
                  <div className="leading-relaxed">{errorMsg}</div>
                </div>
              )}

              {/* Quick Demo Keys Helper */}
              <div className="p-3 rounded-2xl bg-amber-50/80 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-800/40 text-xs">
                <div className="flex items-center justify-between font-semibold text-amber-900 dark:text-amber-200 mb-1.5">
                  <span className="flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                    <span>Demo Mode: Click to Test Key</span>
                  </span>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => handleInsertDemoKey('NMA-7F3K-9Q2M-XW4P')}
                    className="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-mono text-[11px] font-bold border border-slate-200 dark:border-slate-700 hover:border-teal-500 shadow-2xs transition"
                  >
                    NMA-7F3K-9Q2M-XW4P (Cataract Phaco)
                  </button>
                  <button
                    type="button"
                    onClick={() => handleInsertDemoKey('NMA-8A2D-4B9X-K7Y1')}
                    className="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-mono text-[11px] font-bold border border-slate-200 dark:border-slate-700 hover:border-teal-500 shadow-2xs transition"
                  >
                    NMA-8A2D-4B9X-K7Y1 (All Eye Courses)
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading || !inputVal.trim()}
                className="w-full py-3.5 rounded-2xl bg-teal-700 hover:bg-teal-800 disabled:opacity-50 text-white font-bold text-sm shadow-md shadow-teal-700/20 transition flex items-center justify-center gap-2 cursor-pointer"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <span>Activate Access</span>
                    <KeyRound className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            {/* Offline Payment & WhatsApp Assistance */}
            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 text-center space-y-2">
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Haven't received your key yet? Contact the Multan clinic office:
              </p>
              <a
                href={clinicWaUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 font-semibold text-xs hover:bg-emerald-100 dark:hover:bg-emerald-900/50 transition border border-emerald-200 dark:border-emerald-800/40"
              >
                <MessageCircle className="w-4 h-4 fill-emerald-600 text-emerald-600 dark:text-emerald-300" />
                <span>Contact Clinic Admin on WhatsApp</span>
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
