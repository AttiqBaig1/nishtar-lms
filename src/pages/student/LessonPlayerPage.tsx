import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { storageService } from '../../services/storageService';
import { useAuth } from '../../contexts/AuthContext';
import { CustomVideoPlayer } from '../../components/player/CustomVideoPlayer';
import { YouTubePlayer } from '../../components/player/YouTubePlayer';
import { youtubeId } from '../../lib/crypto';
import {
  BookOpen,
  CheckCircle2,
  Lock,
  Download,
  FileText,
  Save,
  MessageCircle,
  Menu,
  X,
  ChevronRight,
  ChevronLeft,
  Share2,
  Clock,
  Sparkles,
  AlertTriangle,
  KeyRound
} from 'lucide-react';
import { RedeemKeyModal } from '../../components/keys/RedeemKeyModal';

export const LessonPlayerPage: React.FC = () => {
  const { courseId, lessonId } = useParams<{ courseId: string; lessonId: string }>();
  const { currentUser, refreshUser } = useAuth();
  const navigate = useNavigate();
  const settings = storageService.getClinicSettings();

  const [activeTab, setActiveTab] = useState<'overview' | 'resources' | 'notes'>('overview');
  const [noteText, setNoteText] = useState('');
  const [noteSaved, setNoteSaved] = useState(false);
  const [autoPlayNext, setAutoPlayNext] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [redeemModalOpen, setRedeemModalOpen] = useState(false);

  const course = storageService.getCourseById(courseId || '');

  // Flatten all lessons in order
  const allLessons = course ? course.modules.flatMap(m => m.lessons) : [];
  const currentLessonIndex = allLessons.findIndex(l => l.id === lessonId);
  const currentLesson = allLessons[currentLessonIndex] || allLessons[0];

  // Access validation: student must be logged in and enrolled OR lesson must be free preview
  const hasCourseAccess = currentUser && course ? storageService.checkUserAccessToCourse(currentUser.uid, course.id) : false;
  const isAuthorized = hasCourseAccess || currentLesson?.isFreePreview;

  // Load existing progress & note for this lesson
  useEffect(() => {
    if (currentUser && currentLesson) {
      const savedNote = storageService.getNoteForLesson(currentUser.uid, currentLesson.id);
      setNoteText(savedNote ? savedNote.text : '');
      setNoteSaved(false);
    }
  }, [currentUser, currentLesson]);

  if (!course || !currentLesson) {
    return (
      <div className="max-w-4xl mx-auto py-16 px-4 text-center">
        <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">Lesson not found</h2>
        <Link to="/courses" className="mt-4 inline-block text-teal-600 hover:underline">
          Return to Courses
        </Link>
      </div>
    );
  }

  // If unauthorized to view this lesson:
  if (!isAuthorized) {
    return (
      <div className="max-w-3xl mx-auto my-12 px-4">
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-8 sm:p-12 text-center space-y-6 shadow-xl">
          <div className="w-16 h-16 rounded-2xl bg-amber-100 dark:bg-amber-950/60 text-amber-600 flex items-center justify-center mx-auto">
            <Lock className="w-8 h-8" />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
              Lesson Locked
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-400 max-w-md mx-auto">
              This clinical video requires an active access key for <strong>{course.title}</strong>.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <button
              onClick={() => setRedeemModalOpen(true)}
              className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-teal-700 hover:bg-teal-800 text-white font-bold text-sm shadow-md transition flex items-center justify-center gap-2"
            >
              <KeyRound className="w-4 h-4" />
              <span>Enter Access Key to Unlock</span>
            </button>

            <a
              href={`https://wa.me/${settings.whatsappNumber}?text=${encodeURIComponent(
                `Assalam o Alaikum, I would like to purchase an access key for "${course.title}".`
              )}`}
              target="_blank"
              rel="noreferrer"
              className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-md transition flex items-center justify-center gap-2"
            >
              <MessageCircle className="w-4 h-4 fill-white" />
              <span>Contact Clinic on WhatsApp</span>
            </a>
          </div>
        </div>

        <RedeemKeyModal
          isOpen={redeemModalOpen}
          onClose={() => setRedeemModalOpen(false)}
          onSuccess={() => refreshUser()}
        />
      </div>
    );
  }

  // Get user progress for current lesson to resume playback
  const userProgress = currentUser ? storageService.getProgress(currentUser.uid) : [];
  const currentProgress = userProgress.find(p => p.lessonId === currentLesson.id);
  const initialTime = currentProgress ? currentProgress.watchedSeconds : 0;
  const isLessonCompleted = currentProgress?.completed || false;

  const nextLesson = currentLessonIndex < allLessons.length - 1 ? allLessons[currentLessonIndex + 1] : null;
  const prevLesson = currentLessonIndex > 0 ? allLessons[currentLessonIndex - 1] : null;

  const handleNextLesson = () => {
    if (nextLesson) {
      navigate(`/courses/${course.id}/lesson/${nextLesson.id}`);
    }
  };

  const handlePrevLesson = () => {
    if (prevLesson) {
      navigate(`/courses/${course.id}/lesson/${prevLesson.id}`);
    }
  };

  const handleTimeUpdate = (seconds: number, duration: number) => {
    if (currentUser) {
      storageService.updateLessonProgress(
        currentUser.uid,
        course.id,
        currentLesson.id,
        Math.floor(seconds),
        Math.floor(duration)
      );
    }
  };

  const handleManualComplete = () => {
    if (currentUser) {
      storageService.updateLessonProgress(
        currentUser.uid,
        course.id,
        currentLesson.id,
        currentLesson.duration,
        currentLesson.duration,
        true
      );
      refreshUser();
    }
  };

  const handleSaveNote = () => {
    if (currentUser && currentLesson) {
      storageService.saveNote(currentUser.uid, course.id, currentLesson.id, noteText);
      setNoteSaved(true);
      setTimeout(() => setNoteSaved(false), 2500);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col">
      {/* Top Breadcrumb Bar */}
      <div className="bg-slate-950/80 border-b border-slate-800 px-4 py-2.5 flex items-center justify-between text-xs">
        <div className="flex items-center gap-2 truncate">
          <Link to="/dashboard" className="text-teal-400 hover:underline">
            Dashboard
          </Link>
          <span className="text-slate-600">/</span>
          <Link to={`/courses/${course.id}`} className="text-slate-300 hover:text-white truncate">
            {course.title}
          </Link>
          <span className="text-slate-600">/</span>
          <span className="text-teal-200 font-semibold truncate">{currentLesson.title}</span>
        </div>

        {/* Mobile Sidebar Toggle */}
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="lg:hidden flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-800 text-teal-400 font-semibold"
        >
          <Menu className="w-4 h-4" />
          <span>Curriculum</span>
        </button>
      </div>

      {/* Main Workspace Layout */}
      <div className="flex-1 flex flex-col lg:flex-row max-w-[1700px] w-full mx-auto">
        {/* Left / Center: Video and Tabs */}
        <div className="flex-1 p-3 sm:p-6 space-y-5 overflow-y-auto">
          {/* Custom Video Player with Dynamic Anti-Piracy Watermark */}
          {youtubeId(currentLesson.videoUrl) ? (
          <YouTubePlayer
              videoUrl={currentLesson.videoUrl}
              title={currentLesson.title}
              studentName={currentUser?.name || 'Multan Medical Trainee'}
              studentPhone={currentUser?.phone || '+92 300 0000000'}
              watermarkEnabled={settings.watermarkEnabled}
              pauseOnTabBlur={settings.pauseOnTabBlur}
              initialTime={initialTime}
              onTimeUpdate={handleTimeUpdate}
              onComplete={() => refreshUser()}
              onNextLesson={handleNextLesson}
              onPrevLesson={handlePrevLesson}
              hasNext={Boolean(nextLesson)}
              hasPrev={Boolean(prevLesson)}
              autoPlayNext={autoPlayNext}
              onToggleAutoPlayNext={() => setAutoPlayNext(!autoPlayNext)}
            />
          ) : (
          <CustomVideoPlayer
              videoUrl={currentLesson.videoUrl}
              title={currentLesson.title}
              studentName={currentUser?.name || 'Multan Medical Trainee'}
              studentPhone={currentUser?.phone || '+92 300 0000000'}
              watermarkEnabled={settings.watermarkEnabled}
              pauseOnTabBlur={settings.pauseOnTabBlur}
              initialTime={initialTime}
              duration={currentLesson.duration}
              onTimeUpdate={handleTimeUpdate}
              onComplete={() => refreshUser()}
              onNextLesson={handleNextLesson}
              onPrevLesson={handlePrevLesson}
              hasNext={Boolean(nextLesson)}
              hasPrev={Boolean(prevLesson)}
              autoPlayNext={autoPlayNext}
              onToggleAutoPlayNext={() => setAutoPlayNext(!autoPlayNext)}
            />
          )}

          {/* Lesson Title & Completion Action Bar */}
          <div className="bg-slate-800/80 rounded-2xl p-4 sm:p-5 border border-slate-700/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-teal-500/20 text-teal-300">
                  Lesson {currentLessonIndex + 1} of {allLessons.length}
                </span>
                {currentLesson.isFreePreview && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300">
                    Free Preview
                  </span>
                )}
              </div>
              <h1 className="text-lg sm:text-xl font-bold text-white">
                {currentLesson.title}
              </h1>
              <p className="text-xs text-slate-400">
                Instructor: {course.instructor} • {currentLesson.durationFormatted || '20 min'}
              </p>
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
              <button
                onClick={handleManualComplete}
                className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold transition shadow-sm ${
                  isLessonCompleted
                    ? 'bg-emerald-600/30 text-emerald-300 border border-emerald-500/50'
                    : 'bg-teal-700 hover:bg-teal-800 text-white'
                }`}
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>{isLessonCompleted ? 'Completed' : 'Mark as Complete'}</span>
              </button>

              {nextLesson && (
                <button
                  onClick={handleNextLesson}
                  className="flex items-center gap-1 px-4 py-2.5 rounded-xl bg-slate-700 hover:bg-slate-600 text-white text-xs font-bold transition"
                  title="Next Lesson"
                >
                  <span>Next</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* Tabs: Overview, Resources, Private Notes */}
          <div className="bg-slate-800/60 rounded-2xl border border-slate-700/60 overflow-hidden">
            {/* Tabs Header */}
            <div className="flex border-b border-slate-700/60 px-4">
              <button
                onClick={() => setActiveTab('overview')}
                className={`py-3.5 px-4 text-xs font-bold border-b-2 transition ${
                  activeTab === 'overview'
                    ? 'border-teal-400 text-teal-300'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                Overview & Summary
              </button>
              <button
                onClick={() => setActiveTab('resources')}
                className={`py-3.5 px-4 text-xs font-bold border-b-2 flex items-center gap-1.5 transition ${
                  activeTab === 'resources'
                    ? 'border-teal-400 text-teal-300'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <span>Resources</span>
                <span className="text-[10px] bg-slate-700 text-slate-300 px-1.5 py-0.2 rounded-full">
                  {currentLesson.attachments.length}
                </span>
              </button>
              <button
                onClick={() => setActiveTab('notes')}
                className={`py-3.5 px-4 text-xs font-bold border-b-2 flex items-center gap-1.5 transition ${
                  activeTab === 'notes'
                    ? 'border-teal-400 text-teal-300'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <span>My Notes</span>
                {noteText.trim() && <span className="w-1.5 h-1.5 rounded-full bg-teal-400" />}
              </button>
            </div>

            {/* Tab Contents */}
            <div className="p-5 text-sm text-slate-300 leading-relaxed">
              {activeTab === 'overview' && (
                <div className="space-y-4">
                  <p>{currentLesson.description}</p>
                  <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-700/40 space-y-2">
                    <h4 className="text-xs font-bold text-teal-300 uppercase tracking-wider flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Key Clinical Takeaways (Multan Hospital Protocol)</span>
                    </h4>
                    <ul className="text-xs text-slate-400 space-y-1.5 list-disc pl-4">
                      <li>Maintain strict sterile field before beginning invasive needle insertion.</li>
                      <li>Double-check local anesthetic maximum safe volume based on patient body weight.</li>
                      <li>Observe dynamic real-time needle visualization to prevent arterial injury.</li>
                    </ul>
                  </div>
                </div>
              )}

              {activeTab === 'resources' && (
                <div className="space-y-3">
                  {currentLesson.attachments.length > 0 ? (
                    currentLesson.attachments.map((att) => (
                      <div
                        key={att.id}
                        className="flex items-center justify-between p-3.5 rounded-xl bg-slate-900/80 border border-slate-700/50 hover:border-teal-500/50 transition"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-lg bg-teal-900/60 text-teal-300 flex items-center justify-center">
                            <FileText className="w-5 h-5" />
                          </div>
                          <div>
                            <div className="font-bold text-xs text-white">{att.name}</div>
                            <div className="text-[10px] text-slate-400">{att.size || 'PDF Guide'}</div>
                          </div>
                        </div>
                        <a
                          href={att.url}
                          download={att.name}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-teal-700 hover:bg-teal-800 text-white text-xs font-semibold shadow-xs"
                        >
                          <Download className="w-3.5 h-3.5" />
                          <span>Download PDF</span>
                        </a>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-slate-500 py-4 text-center">
                      No downloadable attachments for this lesson.
                    </p>
                  )}
                </div>
              )}

              {activeTab === 'notes' && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-400">
                      Private personal notes for this lesson (saved automatically):
                    </span>
                    {noteSaved && (
                      <span className="text-xs text-emerald-400 font-bold flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Saved!</span>
                      </span>
                    )}
                  </div>
                  <textarea
                    value={noteText}
                    onChange={(e) => setNoteText(e.target.value)}
                    rows={4}
                    placeholder="Type your clinical study notes here (e.g. key dosage, anatomical landmarks, patient counseling tips)..."
                    className="w-full p-3.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs font-mono focus:border-teal-500 focus:outline-none"
                  />
                  <button
                    onClick={handleSaveNote}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-teal-700 hover:bg-teal-800 text-white text-xs font-bold shadow-xs transition"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>Save Note</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Sidebar: Module & Lessons Playlist */}
        <div
          className={`lg:w-80 xl:w-96 bg-slate-950 border-l border-slate-800 flex flex-col fixed lg:static inset-y-0 right-0 z-40 transition-transform duration-200 ${
            sidebarOpen ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'
          }`}
        >
          {/* Sidebar Header */}
          <div className="p-4 border-b border-slate-800 flex items-center justify-between">
            <div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-teal-400">
                Course Syllabus
              </div>
              <h3 className="font-bold text-sm text-white truncate max-w-[220px]">
                {course.title}
              </h3>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Playlist Scroll Area */}
          <div className="flex-1 overflow-y-auto divide-y divide-slate-900 p-2 space-y-3">
            {course.modules.map((mod, modIdx) => (
              <div key={mod.id} className="space-y-1">
                <div className="px-2 py-1 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  Module {modIdx + 1}: {mod.title}
                </div>

                <div className="space-y-0.5">
                  {mod.lessons.map((les) => {
                    const isActive = les.id === currentLesson.id;
                    const isCompleted = userProgress.some(p => p.lessonId === les.id && p.completed);
                    const canPlay = hasCourseAccess || les.isFreePreview;

                    return (
                      <button
                        key={les.id}
                        disabled={!canPlay}
                        onClick={() => {
                          navigate(`/courses/${course.id}/lesson/${les.id}`);
                          setSidebarOpen(false);
                        }}
                        className={`w-full text-left p-2.5 rounded-xl flex items-start gap-2.5 transition ${
                          isActive
                            ? 'bg-teal-900/60 text-white font-bold border border-teal-500/40 shadow-xs'
                            : canPlay
                            ? 'hover:bg-slate-900 text-slate-300'
                            : 'opacity-40 text-slate-500 cursor-not-allowed'
                        }`}
                      >
                        <div className="mt-0.5 shrink-0">
                          {isCompleted ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                          ) : canPlay ? (
                            <div className="w-4 h-4 rounded-full border border-teal-500 flex items-center justify-center">
                              {isActive && <div className="w-1.5 h-1.5 rounded-full bg-teal-400" />}
                            </div>
                          ) : (
                            <Lock className="w-4 h-4 text-slate-500" />
                          )}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="text-xs truncate">{les.title}</div>
                          <div className="text-[10px] text-slate-500 mt-0.5 flex items-center gap-2">
                            <span>{les.durationFormatted || '20 min'}</span>
                            {les.isFreePreview && (
                              <span className="text-emerald-400 font-semibold">Preview</span>
                            )}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
