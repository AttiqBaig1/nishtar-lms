import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { storageService } from '../../services/storageService';
import { useAuth } from '../../contexts/AuthContext';
import { RedeemKeyModal } from '../../components/keys/RedeemKeyModal';
import {
  BookOpen,
  Clock,
  CheckCircle2,
  Lock,
  Play,
  FileText,
  ChevronDown,
  ChevronUp,
  Award,
  ShieldCheck,
  Languages,
  Layers,
  Sparkles,
  MessageCircle,
  KeyRound
} from 'lucide-react';

export const CourseDetailPage: React.FC = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const { currentUser, refreshUser } = useAuth();
  const navigate = useNavigate();

  const [redeemModalOpen, setRedeemModalOpen] = useState(false);
  const [expandedModules, setExpandedModules] = useState<Record<string, boolean>>({});

  const course = storageService.getCourseById(courseId || '');
  const settings = storageService.getClinicSettings();

  if (!course) {
    return (
      <div className="max-w-4xl mx-auto py-16 px-4 text-center">
        <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Course Not Found</h2>
        <p className="text-sm text-slate-500 mt-2">The requested medical course does not exist.</p>
        <Link to="/" className="inline-block mt-4 text-teal-600 font-semibold hover:underline">
          Return to Home
        </Link>
      </div>
    );
  }

  const isEnrolled = currentUser ? storageService.checkUserAccessToCourse(currentUser.uid, course.id) : false;
  const userProgress = currentUser ? storageService.getProgressForCourse(currentUser.uid, course.id) : [];

  const toggleModule = (modId: string) => {
    setExpandedModules(prev => ({
      ...prev,
      [modId]: prev[modId] !== undefined ? !prev[modId] : false
    }));
  };

  const isModuleExpanded = (modId: string) => {
    return expandedModules[modId] !== undefined ? expandedModules[modId] : true;
  };

  const allLessons = course.modules.flatMap(m => m.lessons);
  const completedLessonsCount = allLessons.filter(l =>
    userProgress.some(p => p.lessonId === l.id && p.completed)
  ).length;

  const firstPlayableLesson = allLessons.find(l => isEnrolled || l.isFreePreview) || allLessons[0];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-20">
      {/* Course Hero Banner */}
      <div className="bg-gradient-to-b from-slate-900 via-teal-950 to-slate-900 text-white pt-10 pb-14 px-4 sm:px-6 lg:px-8 border-b border-teal-900/40">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8 items-center">
          <div className="lg:col-span-2 space-y-4">
            <div className="flex flex-wrap items-center gap-2 text-xs font-semibold">
              <span className="px-3 py-1 rounded-full bg-teal-500/20 text-teal-300 border border-teal-400/30">
                {course.category}
              </span>
              <span className="px-3 py-1 rounded-full bg-white/10 text-slate-300">
                {course.level}
              </span>
              <span className="px-3 py-1 rounded-full bg-white/10 text-slate-300">
                {course.language}
              </span>
            </div>

            <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight leading-tight">
              {course.title}
            </h1>

            <p className="text-slate-300 text-sm sm:text-base leading-relaxed max-w-3xl">
              {course.description}
            </p>

            <div className="flex flex-wrap items-center gap-6 pt-2 text-xs sm:text-sm text-slate-300">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-teal-600 flex items-center justify-center font-bold text-white text-xs">
                  {course.instructor.charAt(0)}
                </div>
                <div>
                  <div className="font-bold text-white">{course.instructor}</div>
                  <div className="text-[11px] text-teal-300">{course.instructorTitle || 'Consultant Specialist'}</div>
                </div>
              </div>
              <div className="flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-teal-400" />
                <span>{course.totalDuration} mins total</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-teal-400" />
                <span>{course.totalLessons} clinical lessons</span>
              </div>
            </div>
          </div>

          {/* Action / Enrollment Card */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 text-slate-900 dark:text-white shadow-2xl border border-slate-200 dark:border-slate-800 space-y-5">
            <div className="relative aspect-video rounded-2xl overflow-hidden bg-slate-100">
              <img
                src={course.thumbnailUrl}
                alt={course.title}
                className="w-full h-full object-cover"
              />
              {firstPlayableLesson?.isFreePreview && (
                <div className="absolute top-2 left-2 bg-emerald-600 text-white font-bold text-[10px] px-2 py-0.5 rounded-full uppercase tracking-wider">
                  Free Preview Available
                </div>
              )}
            </div>

            {isEnrolled ? (
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500 dark:text-slate-400">Course Progress:</span>
                  <span className="font-bold text-teal-700 dark:text-teal-400">
                    {completedLessonsCount}/{allLessons.length} Completed
                  </span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden">
                  <div
                    className="bg-teal-600 h-full rounded-full transition-all"
                    style={{
                      width: `${allLessons.length ? (completedLessonsCount / allLessons.length) * 100 : 0}%`,
                    }}
                  />
                </div>
                <Link
                  to={`/courses/${course.id}/lesson/${firstPlayableLesson?.id}`}
                  className="w-full py-3.5 rounded-2xl bg-teal-700 hover:bg-teal-800 text-white font-bold text-sm shadow-md transition flex items-center justify-center gap-2"
                >
                  <Play className="w-4 h-4 fill-white" />
                  <span>Continue Learning</span>
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-baseline justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                  <div>
                    <span className="text-2xl font-black text-slate-900 dark:text-white">
                      PKR {course.pricePkr.toLocaleString()}
                    </span>
                    <span className="text-xs text-slate-400 ml-1">/ offline fee</span>
                  </div>
                  <span className="text-xs px-2.5 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 font-bold">
                    Key Access
                  </span>
                </div>

                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  Pay offline via JazzCash, EasyPaisa, or HBL Bank, then enter your access key to unlock full video lectures and clinical protocols.
                </p>

                <div className="space-y-2">
                  <button
                    onClick={() => {
                      if (!currentUser) {
                        navigate('/login');
                      } else {
                        setRedeemModalOpen(true);
                      }
                    }}
                    className="w-full py-3.5 rounded-2xl bg-teal-700 hover:bg-teal-800 text-white font-bold text-sm shadow-md transition flex items-center justify-center gap-2"
                  >
                    <KeyRound className="w-4 h-4" />
                    <span>Enter Access Key to Unlock</span>
                  </button>

                  <a
                    href={`https://wa.me/${settings.whatsappNumber}?text=${encodeURIComponent(
                      `Assalam o Alaikum, I want to purchase an access key for "${course.title}". Please send payment details.`
                    )}`}
                    target="_blank"
                    rel="noreferrer"
                    className="w-full py-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 font-bold text-xs transition flex items-center justify-center gap-2 border border-emerald-200 dark:border-emerald-800/40"
                  >
                    <MessageCircle className="w-4 h-4 fill-current" />
                    <span>Buy Access Key via WhatsApp</span>
                  </a>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Curriculum Breakdown */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Syllabus Modules & Lessons */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                Course Curriculum ({course.modules.length} Modules, {allLessons.length} Lessons)
              </h2>
            </div>

            <div className="space-y-4">
              {course.modules.map((module, idx) => {
                const expanded = isModuleExpanded(module.id);
                return (
                  <div
                    key={module.id}
                    className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs"
                  >
                    {/* Module Header */}
                    <button
                      onClick={() => toggleModule(module.id)}
                      className="w-full p-4 sm:p-5 flex items-center justify-between text-left bg-slate-50/70 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                    >
                      <div className="space-y-0.5">
                        <span className="text-[11px] font-bold text-teal-700 dark:text-teal-400 uppercase tracking-wider">
                          Module {idx + 1}
                        </span>
                        <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
                          {module.title}
                        </h3>
                        <span className="text-xs text-slate-500">
                          {module.lessons.length} lessons
                        </span>
                      </div>
                      <div className="p-1 rounded-lg text-slate-400">
                        {expanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                      </div>
                    </button>

                    {/* Lessons List */}
                    {expanded && (
                      <div className="divide-y divide-slate-100 dark:divide-slate-800/60">
                        {module.lessons.map((lesson) => {
                          const isCompleted = userProgress.some(p => p.lessonId === lesson.id && p.completed);
                          const canPlay = isEnrolled || lesson.isFreePreview;

                          return (
                            <div
                              key={lesson.id}
                              className="p-4 sm:p-5 flex items-start justify-between gap-4 hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition"
                            >
                              <div className="flex items-start gap-3">
                                <div className="mt-0.5">
                                  {isCompleted ? (
                                    <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                                  ) : canPlay ? (
                                    <div className="w-5 h-5 rounded-full border-2 border-teal-600 flex items-center justify-center">
                                      <div className="w-2 h-2 rounded-full bg-teal-600" />
                                    </div>
                                  ) : (
                                    <Lock className="w-5 h-5 text-slate-400" />
                                  )}
                                </div>
                                <div className="space-y-1">
                                  <div className="flex items-center gap-2">
                                    <h4 className="text-sm font-semibold text-slate-900 dark:text-white">
                                      {lesson.title}
                                    </h4>
                                    {lesson.isFreePreview && (
                                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300">
                                        Free Preview
                                      </span>
                                    )}
                                  </div>
                                  <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2">
                                    {lesson.description}
                                  </p>
                                  <div className="flex items-center gap-3 text-[11px] text-slate-400 pt-1">
                                    <span className="flex items-center gap-1">
                                      <Clock className="w-3 h-3" />
                                      <span>{lesson.durationFormatted || '20 min'}</span>
                                    </span>
                                    {lesson.attachments.length > 0 && (
                                      <span className="flex items-center gap-1 text-teal-600 dark:text-teal-400">
                                        <FileText className="w-3 h-3" />
                                        <span>{lesson.attachments.length} Downloadable PDF(s)</span>
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>

                              {/* Play or Lock Action */}
                              <div>
                                {canPlay ? (
                                  <Link
                                    to={`/courses/${course.id}/lesson/${lesson.id}`}
                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-teal-700 hover:bg-teal-800 text-white font-semibold text-xs shadow-xs transition shrink-0"
                                  >
                                    <Play className="w-3.5 h-3.5 fill-white" />
                                    <span>Play</span>
                                  </Link>
                                ) : (
                                  <button
                                    onClick={() => setRedeemModalOpen(true)}
                                    className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
                                    title="Unlock course with access key"
                                  >
                                    <Lock className="w-4 h-4" />
                                  </button>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Instructor & Verification Info */}
          <div className="space-y-6">
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 space-y-4">
              <h3 className="font-bold text-slate-900 dark:text-white text-base">
                Lead Clinical Instructor
              </h3>
              <div className="flex items-center gap-3">
                <div className="w-14 h-14 rounded-2xl bg-teal-700 text-white flex items-center justify-center font-bold text-lg shadow-md">
                  {course.instructor.charAt(0)}
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 dark:text-white text-sm">
                    {course.instructor}
                  </h4>
                  <p className="text-xs text-teal-700 dark:text-teal-400 font-medium">
                    {course.instructorTitle || 'Consultant Specialist'}
                  </p>
                  <p className="text-[11px] text-slate-500">Nishtar Medical University & Hospital, Multan</p>
                </div>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed border-t border-slate-100 dark:border-slate-800 pt-3">
                {settings.doctorBio}
              </p>
            </div>

            <div className="bg-teal-50/70 dark:bg-teal-950/20 border border-teal-200/60 dark:border-teal-800/40 rounded-3xl p-6 space-y-3 text-xs">
              <div className="font-bold text-teal-900 dark:text-teal-200 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-teal-600" />
                <span>Certificate & Verification</span>
              </div>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                Upon 100% completion of this curriculum and clinical quizzes, students can request an official CPD-accredited completion certificate issued by Nishtar Clinical Academy Multan.
              </p>
            </div>
          </div>
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
