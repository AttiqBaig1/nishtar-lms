import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { storageService } from '../../services/storageService';
import { RedeemKeyModal } from '../../components/keys/RedeemKeyModal';
import { formatKeyInput } from '../../lib/crypto';
import confetti from 'canvas-confetti';
import {
  Lock,
  KeyRound,
  Play,
  Clock,
  BookOpen,
  CheckCircle2,
  Calendar,
  AlertTriangle,
  Bell,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  MessageCircle,
  PlusCircle,
  GraduationCap
} from 'lucide-react';

export const StudentDashboard: React.FC = () => {
  const { currentUser, refreshUser } = useAuth();
  const navigate = useNavigate();
  const settings = storageService.getClinicSettings();

  const [redeemModalOpen, setRedeemModalOpen] = useState(false);
  const [inlineKey, setInlineKey] = useState(() => {
    return sessionStorage.getItem('hec_auto_key') || '';
  });
  const [inlineLoading, setInlineLoading] = useState(false);
  const [inlineError, setInlineError] = useState<string | null>(null);

  React.useEffect(() => {
    const saved = sessionStorage.getItem('hec_auto_key');
    if (saved) {
      setInlineKey(saved);
      sessionStorage.removeItem('hec_auto_key');
    }
  }, []);

  if (!currentUser) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center p-4">
        <div className="text-center space-y-4">
          <p className="text-slate-600 dark:text-slate-300">Please sign in to access your dashboard.</p>
          <Link
            to="/login"
            className="px-6 py-2.5 rounded-xl bg-teal-700 text-white font-semibold text-sm"
          >
            Go to Login
          </Link>
        </div>
      </div>
    );
  }

  // Account suspended screen
  if (currentUser.status === 'suspended') {
    return (
      <div className="max-w-2xl mx-auto my-16 px-4">
        <div className="bg-rose-50 dark:bg-rose-950/40 border-2 border-rose-200 dark:border-rose-800 rounded-3xl p-8 text-center space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
            <AlertTriangle className="w-10 h-10" />
          </div>
          <h2 className="text-2xl font-bold text-rose-900 dark:text-rose-200">
            Account Access Suspended
          </h2>
          <p className="text-sm text-rose-700 dark:text-rose-300 max-w-md mx-auto">
            Your student account ({currentUser.name}) has been placed on administrative hold.
            Please reach out directly to the clinic director on WhatsApp to resolve this matter.
          </p>
          <div className="pt-2">
            <a
              href={`https://wa.me/${settings.whatsappNumber}?text=${encodeURIComponent(
                `Assalam o Alaikum, my Nishtar Academy account (${currentUser.name}, ${currentUser.phone}) is suspended. Please assist.`
              )}`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-md transition"
            >
              <MessageCircle className="w-5 h-5" />
              <span>Contact Clinic Administration on WhatsApp</span>
            </a>
          </div>
        </div>
      </div>
    );
  }

  const allCourses = storageService.getCourses();
  const enrollments = storageService.getEnrollmentsForUser(currentUser.uid);
  const userProgress = storageService.getProgress(currentUser.uid);
  const announcements = storageService.getAnnouncements();

  // Find enrolled courses
  const enrolledCourses = allCourses.filter(c =>
    enrollments.some(e => e.courseId === c.id || e.courseId === '*')
  );

  // Compute days remaining for each course enrollment
  const getDaysRemaining = (courseId: string): { text: string; urgent: boolean } => {
    const enr = enrollments.find(e => e.courseId === courseId || e.courseId === '*');
    if (!enr || !enr.expiresAt) return { text: 'Lifetime Access', urgent: false };

    const diffMs = new Date(enr.expiresAt).getTime() - Date.now();
    const days = Math.ceil(diffMs / 86400000);
    if (days <= 0) return { text: 'Expired', urgent: true };
    if (days <= 7) return { text: `${days} days remaining (Renew Soon)`, urgent: true };
    return { text: `${days} days remaining`, urgent: false };
  };

  // Find most recent in-progress lesson for "Continue Watching" card
  let continueLessonInfo: {
    course: typeof allCourses[0];
    lesson: typeof allCourses[0]['modules'][0]['lessons'][0];
    progressSeconds: number;
    percent: number;
  } | null = null;

  for (const course of enrolledCourses) {
    for (const mod of course.modules) {
      for (const les of mod.lessons) {
        const prog = userProgress.find(p => p.lessonId === les.id);
        if (prog && !prog.completed && prog.watchedSeconds > 0) {
          continueLessonInfo = {
            course,
            lesson: les,
            progressSeconds: prog.watchedSeconds,
            percent: Math.min(100, Math.round((prog.watchedSeconds / les.duration) * 100)),
          };
          break;
        }
      }
      if (continueLessonInfo) break;
    }
    if (continueLessonInfo) break;
  }

  // If no in-progress lesson found, pick first lesson of first course
  if (!continueLessonInfo && enrolledCourses.length > 0) {
    const firstCourse = enrolledCourses[0];
    if (firstCourse.modules.length > 0 && firstCourse.modules[0].lessons.length > 0) {
      const firstLes = firstCourse.modules[0].lessons[0];
      continueLessonInfo = {
        course: firstCourse,
        lesson: firstLes,
        progressSeconds: 0,
        percent: 0,
      };
    }
  }

  // Inline redemption on locked dashboard
  const handleInlineRedeem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inlineKey.trim()) return;

    setInlineLoading(true);
    setInlineError(null);

    const res = await storageService.redeemAccessKey(currentUser.uid, inlineKey);
    if (res.success) {
      try {
        confetti({ particleCount: 90, spread: 60, origin: { y: 0.6 } });
      } catch {}
      refreshUser();
      setInlineKey('');
    } else {
      setInlineError(res.message);
    }
    setInlineLoading(false);
  };

  // ================= LOCKED DASHBOARD STATE =================
  // If student has 0 active courses:
  if (enrolledCourses.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8 sm:py-12">
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden">
          {/* Header Banner */}
          <div className="bg-gradient-to-r from-teal-800 via-teal-700 to-teal-900 px-6 py-10 sm:p-12 text-center text-white relative">
            <div className="w-20 h-20 rounded-3xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center mx-auto mb-4 shadow-inner">
              <Lock className="w-10 h-10 text-teal-200" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Welcome, {currentUser.name}
            </h1>
            <p className="mt-2 text-teal-100 text-sm sm:text-base max-w-xl mx-auto leading-relaxed">
              Your dashboard is locked. Enter your 16-character access key provided by the clinic administrator to unlock your medical training courses.
            </p>
          </div>

          {/* Key Input Section */}
          <div className="p-6 sm:p-10 max-w-xl mx-auto space-y-6">
            <form onSubmit={handleInlineRedeem} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                  Enter Your Access Key
                </label>
                <input
                  type="text"
                  value={inlineKey}
                  onChange={(e) => {
                    setInlineKey(formatKeyInput(e.target.value, settings.keyPrefix.length || 4));
                    if (inlineError) setInlineError(null);
                  }}
                  placeholder={`${settings.keyPrefix}-XXXX-XXXX-XXXX`}
                  maxLength={20}
                  className="w-full font-mono text-center text-xl sm:text-2xl font-bold tracking-widest uppercase px-4 py-4 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border-2 border-slate-300 dark:border-slate-700 focus:border-teal-600 focus:ring-4 focus:ring-teal-600/10 dark:text-white transition"
                />
              </div>

              {inlineError && (
                <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs flex items-start gap-2.5">
                  <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                  <div>{inlineError}</div>
                </div>
              )}

              {/* Demo 1-Click Test Keys */}
              <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/60 text-xs space-y-2.5">
                <div className="flex items-center gap-1.5 font-bold text-amber-900 dark:text-amber-200">
                  <Sparkles className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>Demo Mode: One-Click Test Keys</span>
                </div>
                <p className="text-[11px] text-amber-800 dark:text-amber-300 leading-relaxed">
                  Select a pre-generated access key below to instantly test course activation:
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setInlineKey('NMA-7F3K-9Q2M-XW4P')}
                    className="p-2.5 rounded-xl bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-left font-mono text-xs font-bold border-2 border-amber-300 dark:border-slate-700 hover:border-teal-600 transition shadow-2xs"
                  >
                    <div className="text-teal-700 dark:text-teal-400">NMA-7F3K-9Q2M-XW4P</div>
                    <div className="text-[10px] text-slate-500 font-sans font-normal">Cataract Phaco (180 Days)</div>
                  </button>
                  <button
                    type="button"
                    onClick={() => setInlineKey('NMA-8A2D-4B9X-K7Y1')}
                    className="p-2.5 rounded-xl bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-left font-mono text-xs font-bold border-2 border-amber-300 dark:border-slate-700 hover:border-teal-600 transition shadow-2xs"
                  >
                    <div className="text-teal-700 dark:text-teal-400">NMA-8A2D-4B9X-K7Y1</div>
                    <div className="text-[10px] text-slate-500 font-sans font-normal">All Eye Courses Bundle (365 Days)</div>
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={inlineLoading || !inlineKey.trim()}
                className="w-full py-4 rounded-2xl bg-teal-700 hover:bg-teal-800 disabled:opacity-50 text-white font-bold text-base shadow-lg shadow-teal-700/20 transition flex items-center justify-center gap-2"
              >
                {inlineLoading ? (
                  <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <KeyRound className="w-5 h-5" />
                    <span>Activate Access Key</span>
                  </>
                )}
              </button>
            </form>

            {/* Offline Payment Instructions & WhatsApp Button */}
            <div className="pt-6 border-t border-slate-200 dark:border-slate-800 text-center space-y-4">
              <div className="space-y-1">
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                  Don’t have an access key?
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto">
                  Pay course fee via JazzCash, EasyPaisa, or direct bank transfer. The clinic admin will verify your payment and message your access key within 15 minutes.
                </p>
              </div>

              <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-2xl text-xs text-left grid grid-cols-1 sm:grid-cols-2 gap-3 border border-slate-200 dark:border-slate-700/60">
                <div>
                  <span className="font-semibold text-slate-700 dark:text-slate-300">JazzCash / EasyPaisa:</span>
                  <div className="font-mono font-bold text-teal-700 dark:text-teal-400 mt-0.5">{settings.jazzCashAccount}</div>
                  <div className="text-[11px] text-slate-500">{settings.jazzCashTitle}</div>
                </div>
                <div>
                  <span className="font-semibold text-slate-700 dark:text-slate-300">Multan Clinic Location:</span>
                  <div className="text-slate-600 dark:text-slate-400 mt-0.5">{settings.address}</div>
                </div>
              </div>

              <a
                href={`https://wa.me/${settings.whatsappNumber}?text=${encodeURIComponent(
                  `Assalam o Alaikum, I am ${currentUser.name} (Phone: ${currentUser.phone}). I would like to purchase an access key for your clinical video courses.`
                )}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-md transition"
              >
                <MessageCircle className="w-5 h-5 fill-white" />
                <span>Contact Clinic on WhatsApp (+92 300 7312345)</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ================= ACTIVE DASHBOARD STATE =================
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 space-y-8">
      {/* Welcome & Quick Action Banner */}
      <div className="bg-gradient-to-r from-teal-900 via-teal-800 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative overflow-hidden">
        <div className="space-y-2 max-w-2xl relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/20 text-teal-200 text-xs font-semibold border border-teal-400/30">
            <ShieldCheck className="w-3.5 h-3.5 text-teal-400" />
            <span>Active Student Account • {currentUser.city}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Welcome back, {currentUser.name}!
          </h1>
          <p className="text-sm text-teal-100/90 leading-relaxed">
            Continue advancing your clinical procedures and surgical skills. Watch lessons, download clinical guides, and take private notes.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 relative z-10">
          <button
            onClick={() => setRedeemModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-white text-teal-900 hover:bg-teal-50 font-bold text-xs shadow-md transition"
          >
            <PlusCircle className="w-4 h-4 text-teal-700" />
            <span>Add Another Access Key</span>
          </button>
        </div>

        {/* Subtle decorative background circle */}
        <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-teal-500/10 rounded-full blur-2xl pointer-events-none" />
      </div>

      {/* Announcements Notice (if any) */}
      {announcements.length > 0 && (
        <div className="bg-teal-50/80 dark:bg-teal-950/30 border border-teal-200 dark:border-teal-800/60 rounded-2xl p-4 sm:p-5 flex items-start gap-3.5">
          <div className="w-9 h-9 rounded-xl bg-teal-600 text-white flex items-center justify-center shrink-0">
            <Bell className="w-5 h-5" />
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-teal-200 dark:bg-teal-900 text-teal-800 dark:text-teal-200">
                Clinic Announcement
              </span>
              <span className="text-xs text-slate-400">
                {new Date(announcements[0].createdAt).toLocaleDateString()}
              </span>
            </div>
            <h4 className="text-sm font-bold text-slate-900 dark:text-white">
              {announcements[0].title}
            </h4>
            <p className="text-xs text-slate-600 dark:text-slate-300">
              {announcements[0].body}
            </p>
          </div>
        </div>
      )}

      {/* Continue Watching Section */}
      {continueLessonInfo && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Play className="w-5 h-5 text-teal-600 fill-teal-600" />
              <span>Continue Watching</span>
            </h2>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-5 sm:p-6 shadow-sm hover:shadow-md transition flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4 w-full md:w-auto">
              <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-2xl overflow-hidden shrink-0 bg-slate-100">
                <img
                  src={continueLessonInfo.course.thumbnailUrl}
                  alt={continueLessonInfo.course.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                  <div className="w-10 h-10 rounded-full bg-teal-600/90 text-white flex items-center justify-center shadow-md">
                    <Play className="w-5 h-5 fill-white ml-0.5" />
                  </div>
                </div>
              </div>

              <div className="space-y-1.5 flex-1 min-w-0">
                <div className="text-[11px] font-semibold text-teal-700 dark:text-teal-400 uppercase tracking-wider">
                  {continueLessonInfo.course.title}
                </div>
                <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white truncate">
                  {continueLessonInfo.lesson.title}
                </h3>
                <div className="flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{continueLessonInfo.lesson.durationFormatted || '20 min'}</span>
                  </span>
                  <span>•</span>
                  <span>{continueLessonInfo.percent}% completed</span>
                </div>

                {/* Mini progress bar */}
                <div className="w-full max-w-xs bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden mt-2">
                  <div
                    className="bg-teal-600 h-full rounded-full transition-all duration-300"
                    style={{ width: `${continueLessonInfo.percent}%` }}
                  />
                </div>
              </div>
            </div>

            <Link
              to={`/courses/${continueLessonInfo.course.id}/lesson/${continueLessonInfo.lesson.id}`}
              className="w-full md:w-auto px-6 py-3.5 rounded-2xl bg-teal-700 hover:bg-teal-800 text-white font-bold text-sm shadow-md transition flex items-center justify-center gap-2 shrink-0"
            >
              <Play className="w-4 h-4 fill-white" />
              <span>Resume Lesson</span>
            </Link>
          </div>
        </div>
      )}

      {/* Enrolled Courses Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
              My Enrolled Courses
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {enrolledCourses.length} active course enrollment(s) unlocked
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {enrolledCourses.map((course) => {
            const courseLessons = course.modules.flatMap(m => m.lessons);
            const completedCount = courseLessons.filter(l =>
              userProgress.some(p => p.lessonId === l.id && p.completed)
            ).length;
            const progressPercent = courseLessons.length > 0
              ? Math.round((completedCount / courseLessons.length) * 100)
              : 0;
            const validity = getDaysRemaining(course.id);

            return (
              <div
                key={course.id}
                className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs hover:shadow-lg transition-all duration-200 overflow-hidden flex flex-col"
              >
                {/* Thumbnail */}
                <div className="relative aspect-video bg-slate-100">
                  <img
                    src={course.thumbnailUrl}
                    alt={course.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-3 right-3">
                    <span
                      className={`text-[11px] font-bold px-2.5 py-1 rounded-full backdrop-blur-md shadow-xs ${
                        validity.urgent
                          ? 'bg-amber-500/90 text-white'
                          : 'bg-black/60 text-white'
                      }`}
                    >
                      {validity.text}
                    </span>
                  </div>
                  <div className="absolute bottom-3 left-3">
                    <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-md bg-teal-800/80 text-white backdrop-blur-xs">
                      {course.category}
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  <div className="space-y-2">
                    <h3 className="font-bold text-base text-slate-900 dark:text-white line-clamp-2 leading-snug">
                      {course.title}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2">
                      {course.shortDescription}
                    </p>
                  </div>

                  {/* Progress & Stats */}
                  <div className="space-y-2.5 pt-2 border-t border-slate-100 dark:border-slate-800">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-500 dark:text-slate-400 font-medium">
                        Progress: {completedCount}/{courseLessons.length} lessons
                      </span>
                      <span className="font-bold text-teal-700 dark:text-teal-400">
                        {progressPercent}%
                      </span>
                    </div>
                    <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-teal-600 h-full rounded-full transition-all duration-300"
                        style={{ width: `${progressPercent}%` }}
                      />
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="pt-2 flex items-center justify-between">
                    <span className="text-xs text-slate-500 font-medium">
                      {course.instructor}
                    </span>
                    <Link
                      to={`/courses/${course.id}`}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-teal-50 dark:bg-teal-950/40 text-teal-700 dark:text-teal-300 hover:bg-teal-100 font-bold text-xs transition"
                    >
                      <span>View Course</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Redeem Key Modal */}
      <RedeemKeyModal
        isOpen={redeemModalOpen}
        onClose={() => setRedeemModalOpen(false)}
        onSuccess={() => refreshUser()}
      />
    </div>
  );
};
