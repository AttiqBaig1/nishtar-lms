import React, { useState } from 'react';
import { storageService } from '../../services/storageService';
import { youtubeId } from '../../lib/crypto';
import { Course, CourseModule, Lesson, CourseLevel, CourseLanguage } from '../../types';
import {
  BookOpen,
  Plus,
  Edit,
  Trash2,
  Layers,
  Clock,
  Eye,
  CheckCircle2,
  AlertTriangle,
  Upload,
  FileText,
  X,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Link2
} from 'lucide-react';

export const AdminCourses: React.FC = () => {
  const [courses, setCourses] = useState<Course[]>(() => storageService.getCourses());
  const [modalCourse, setModalCourse] = useState<Course | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [activeCourseId, setActiveCourseId] = useState<string | null>(null);
  const [deleteWarning, setDeleteWarning] = useState<string | null>(null);

  // Lesson Editor Modal
  const [lessonModal, setLessonModal] = useState<{
    courseId: string;
    moduleId: string;
    lesson: Lesson | null;
  } | null>(null);

  const [linkError, setLinkError] = useState<string | null>(null);

  const refreshCourses = () => {
    setCourses(storageService.getCourses());
  };

  const handleTogglePublish = (course: Course) => {
    const updated = { ...course, published: !course.published };
    storageService.saveCourse(updated);
    refreshCourses();
  };

  const handleDeleteCourse = (courseId: string) => {
    const res = storageService.deleteCourse(courseId);
    if (!res.success) {
      setDeleteWarning(res.error || 'Cannot delete course with active enrollments.');
      setTimeout(() => setDeleteWarning(null), 5000);
    } else {
      refreshCourses();
    }
  };

  const handleOpenCreateCourse = () => {
    const newCourse: Course = {
      id: `course-${Date.now().toString(36)}`,
      title: '',
      slug: '',
      shortDescription: '',
      description: '',
      thumbnailUrl: 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&w=800&q=80',
      category: 'Clinical Surgery & Procedures',
      instructor: 'Prof. Dr. Tariq Mahmood',
      instructorTitle: 'FCPS, FRCS Glasgow',
      level: 'Intermediate',
      language: 'English',
      published: true,
      order: courses.length + 1,
      totalLessons: 0,
      totalDuration: 0,
      pricePkr: 7500,
      featured: true,
      createdAt: new Date().toISOString(),
      modules: [
        {
          id: `mod-${Date.now()}-1`,
          courseId: `course-${Date.now().toString(36)}`,
          title: 'Module 1: Clinical Fundamentals & Anatomy',
          order: 1,
          lessons: []
        }
      ]
    };
    setModalCourse(newCourse);
    setIsEditing(false);
  };

  const handleSaveCourseForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!modalCourse || !modalCourse.title.trim()) return;

    // Recalculate totals
    const allLessons = modalCourse.modules.flatMap(m => m.lessons);
    modalCourse.totalLessons = allLessons.length;
    modalCourse.totalDuration = Math.round(
      allLessons.reduce((acc, l) => acc + (l.duration || 0), 0) / 60
    );

    storageService.saveCourse(modalCourse);
    setModalCourse(null);
    refreshCourses();
  };

  // Add Module to modal course
  const handleAddModule = () => {
    if (!modalCourse) return;
    const newModule: CourseModule = {
      id: `mod-${Date.now()}`,
      courseId: modalCourse.id,
      title: `Module ${modalCourse.modules.length + 1}: Practical Skills`,
      order: modalCourse.modules.length + 1,
      lessons: []
    };
    setModalCourse({
      ...modalCourse,
      modules: [...modalCourse.modules, newModule]
    });
  };

  // Open Lesson Editor
  const handleOpenAddLesson = (courseId: string, moduleId: string, existingLesson: Lesson | null = null) => {
    const defaultLesson: Lesson = existingLesson || {
      id: `les-${Date.now()}`,
      moduleId,
      courseId,
      title: '',
      description: '',
      videoUrl: '',
      duration: 1200,
      durationFormatted: '20:00',
      attachments: [],
      isFreePreview: false,
      order: 1,
    };
    setLessonModal({ courseId, moduleId, lesson: defaultLesson });
  };

  const handleSaveLessonModal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!lessonModal || !lessonModal.lesson || !lessonModal.lesson.title.trim()) return;
    const vid = youtubeId(lessonModal.lesson.videoUrl);
    if (!vid) {
      setLinkError('Paste a YouTube link, e.g. https://youtu.be/AbCdEfGhIjK (set the video to Unlisted on YouTube).');
      return;
    }
    lessonModal.lesson.videoUrl = `https://youtu.be/${vid}`;
    setLinkError(null);

    const targetCourse = storageService.getCourseById(lessonModal.courseId);
    if (!targetCourse) return;

    const moduleIndex = targetCourse.modules.findIndex(m => m.id === lessonModal.moduleId);
    if (moduleIndex >= 0) {
      const lessons = targetCourse.modules[moduleIndex].lessons;
      const lessonIndex = lessons.findIndex(l => l.id === lessonModal.lesson!.id);

      if (lessonIndex >= 0) {
        lessons[lessonIndex] = lessonModal.lesson;
      } else {
        lessonModal.lesson.order = lessons.length + 1;
        lessons.push(lessonModal.lesson);
      }

      // Format duration
      const mins = Math.floor(lessonModal.lesson.duration / 60);
      const secs = lessonModal.lesson.duration % 60;
      lessonModal.lesson.durationFormatted = `${mins}:${secs.toString().padStart(2, '0')}`;

      // Update course total stats
      const allLessons = targetCourse.modules.flatMap(m => m.lessons);
      targetCourse.totalLessons = allLessons.length;
      targetCourse.totalDuration = Math.round(
        allLessons.reduce((acc, l) => acc + (l.duration || 0), 0) / 60
      );

      storageService.saveCourse(targetCourse);
      refreshCourses();
    }

    setLessonModal(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
            Course Curriculum & Lessons Builder
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Build procedural medical courses, configure modules, upload video streams, and set free preview lessons.
          </p>
        </div>

        <button
          onClick={handleOpenCreateCourse}
          className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-teal-700 hover:bg-teal-800 text-white font-bold text-xs shadow-md shadow-teal-700/20 transition"
        >
          <Plus className="w-4 h-4" />
          <span>Create New Course</span>
        </button>
      </div>

      {deleteWarning && (
        <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-200 text-xs flex items-center gap-2.5">
          <AlertTriangle className="w-5 h-5 shrink-0 text-amber-600" />
          <span>{deleteWarning}</span>
        </div>
      )}

      {/* Courses Cards List */}
      <div className="space-y-6">
        {courses.map((course) => {
          const isExpanded = activeCourseId === course.id;

          return (
            <div
              key={course.id}
              className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden"
            >
              {/* Main Course Summary Header */}
              <div className="p-5 sm:p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                <div className="flex items-start gap-4">
                  <img
                    src={course.thumbnailUrl}
                    alt={course.title}
                    className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl object-cover shrink-0 bg-slate-100"
                  />
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-teal-100 dark:bg-teal-950 text-teal-800 dark:text-teal-300">
                        {course.category}
                      </span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          course.published
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                            : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                        }`}
                      >
                        {course.published ? 'Published' : 'Draft'}
                      </span>
                    </div>

                    <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                      {course.title}
                    </h3>

                    <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500">
                      <span>{course.instructor}</span>
                      <span>•</span>
                      <span>{course.modules.length} Modules</span>
                      <span>•</span>
                      <span>{course.totalLessons} Lessons ({course.totalDuration} mins)</span>
                      <span>•</span>
                      <span className="font-bold text-slate-800 dark:text-slate-200">
                        PKR {course.pricePkr.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-wrap items-center gap-2 w-full md:w-auto justify-end">
                  <button
                    onClick={() => handleTogglePublish(course)}
                    className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 transition"
                  >
                    {course.published ? 'Unpublish' : 'Publish'}
                  </button>

                  <button
                    onClick={() => {
                      setModalCourse({ ...course });
                      setIsEditing(true);
                    }}
                    className="p-2 rounded-xl text-slate-500 hover:text-teal-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                    title="Edit Course Details"
                  >
                    <Edit className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => handleDeleteCourse(course.id)}
                    className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/20 transition"
                    title="Delete Course"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => setActiveCourseId(isExpanded ? null : course.id)}
                    className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 font-bold text-xs hover:bg-teal-100 transition"
                  >
                    <span>{isExpanded ? 'Hide Curriculum' : 'Manage Curriculum'}</span>
                    {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Collapsible Curriculum Manager */}
              {isExpanded && (
                <div className="border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 p-5 sm:p-6 space-y-6">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                      <Layers className="w-4 h-4 text-teal-600" />
                      <span>Modules & Lesson Structure</span>
                    </h4>
                  </div>

                  <div className="space-y-4">
                    {course.modules.map((mod, modIdx) => (
                      <div
                        key={mod.id}
                        className="bg-white dark:bg-slate-800/80 rounded-2xl border border-slate-200 dark:border-slate-700/60 p-4 space-y-3"
                      >
                        <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-700">
                          <div>
                            <span className="text-[10px] font-bold uppercase text-teal-700 dark:text-teal-400">
                              Module {modIdx + 1}
                            </span>
                            <h5 className="font-bold text-sm text-slate-900 dark:text-white">
                              {mod.title}
                            </h5>
                          </div>

                          <button
                            onClick={() => handleOpenAddLesson(course.id, mod.id)}
                            className="flex items-center gap-1 px-3 py-1 rounded-xl bg-teal-700 text-white font-semibold text-xs hover:bg-teal-800 shadow-2xs"
                          >
                            <Plus className="w-3.5 h-3.5" />
                            <span>Add Lecture</span>
                          </button>
                        </div>

                        {/* Lessons in module */}
                        <div className="divide-y divide-slate-100 dark:divide-slate-700/40">
                          {mod.lessons.map((les) => (
                            <div key={les.id} className="py-2.5 flex items-center justify-between text-xs">
                              <div className="space-y-0.5 max-w-lg">
                                <div className="flex items-center gap-2">
                                  <span className="font-bold text-slate-800 dark:text-slate-200 truncate">
                                    {les.title}
                                  </span>
                                  {les.isFreePreview && (
                                    <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                                      Free Preview
                                    </span>
                                  )}
                                </div>
                                <div className="text-[11px] text-slate-400 flex items-center gap-3">
                                  <span>{les.durationFormatted || '20 min'}</span>
                                  <span>•</span>
                                  <span className="truncate">{les.videoUrl}</span>
                                </div>
                              </div>

                              <div className="flex items-center gap-1">
                                <button
                                  onClick={() => handleOpenAddLesson(course.id, mod.id, les)}
                                  className="p-1.5 rounded-lg text-slate-400 hover:text-teal-600 hover:bg-slate-100 dark:hover:bg-slate-700"
                                  title="Edit Lesson"
                                >
                                  <Edit className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* ================= COURSE CREATE / EDIT MODAL ================= */}
      {modalCourse && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
          <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-5 max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setModalCourse(null)}
              className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-slate-600"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-xl font-bold text-slate-900 dark:text-white">
              {isEditing ? 'Edit Course Details' : 'Create New Medical Course'}
            </h3>

            <form onSubmit={handleSaveCourseForm} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                  Course Title
                </label>
                <input
                  type="text"
                  required
                  value={modalCourse.title}
                  onChange={(e) => setModalCourse({ ...modalCourse, title: e.target.value })}
                  placeholder="e.g. Mastering Point-of-Care Ultrasound (POCUS)"
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border dark:border-slate-700 text-sm font-semibold"
                />
              </div>



              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                    Specialty Category
                  </label>
                  <input
                    type="text"
                    value={modalCourse.category}
                    onChange={(e) => setModalCourse({ ...modalCourse, category: e.target.value })}
                    className="w-full p-2 rounded-xl bg-slate-50 dark:bg-slate-800 border dark:border-slate-700"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                    Course Fee (PKR)
                  </label>
                  <input
                    type="number"
                    value={modalCourse.pricePkr}
                    onChange={(e) => setModalCourse({ ...modalCourse, pricePkr: parseInt(e.target.value) || 0 })}
                    className="w-full p-2 rounded-xl bg-slate-50 dark:bg-slate-800 border dark:border-slate-700 font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                  Thumbnail Image URL
                </label>
                <input
                  type="text"
                  value={modalCourse.thumbnailUrl}
                  onChange={(e) => setModalCourse({ ...modalCourse, thumbnailUrl: e.target.value })}
                  className="w-full p-2 rounded-xl bg-slate-50 dark:bg-slate-800 border dark:border-slate-700"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                  Full Course Description
                </label>
                <textarea
                  rows={3}
                  value={modalCourse.description}
                  onChange={(e) => setModalCourse({ ...modalCourse, description: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border dark:border-slate-700 leading-relaxed"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setModalCourse(null)}
                  className="px-4 py-2 rounded-xl border text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-teal-700 text-white font-bold text-xs"
                >
                  Save Course
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= LESSON EDITOR MODAL ================= */}
      {lessonModal && lessonModal.lesson && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="relative w-full max-w-xl bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4 max-h-[90vh] overflow-y-auto text-xs">
            <button
              onClick={() => setLessonModal(null)}
              className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-slate-600"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              Lesson Editor
            </h3>

            <form onSubmit={handleSaveLessonModal} className="space-y-4">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                  Lesson Title
                </label>
                <input
                  type="text"
                  required
                  value={lessonModal.lesson.title}
                  onChange={(e) =>
                    setLessonModal({
                      ...lessonModal,
                      lesson: { ...lessonModal.lesson!, title: e.target.value }
                    })
                  }
                  placeholder="e.g. 1. Acoustic Windows of Trauma FAST Exam"
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border dark:border-slate-700 font-semibold text-sm"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 uppercase mb-1" htmlFor="lesson-youtube">
                  YouTube link (Unlisted video)
                </label>
                <div className="space-y-2">
                  <input
                    id="lesson-youtube"
                    type="text"
                    required
                    value={lessonModal.lesson.videoUrl}
                    onChange={(e) => {
                      setLinkError(null);
                      setLessonModal({ ...lessonModal, lesson: { ...lessonModal.lesson!, videoUrl: e.target.value } });
                    }}
                    placeholder="https://youtu.be/AbCdEfGhIjK"
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border dark:border-slate-700 font-mono text-xs"
                  />
                  {linkError && <p className="text-[11px] text-rose-600" id="lesson-link-error">{linkError}</p>}
                  {youtubeId(lessonModal.lesson.videoUrl) ? (
                    <div className="flex items-center gap-3 p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900">
                      <img src={`https://i.ytimg.com/vi/${youtubeId(lessonModal.lesson.videoUrl)}/mqdefault.jpg`} alt="" className="w-28 rounded-lg" />
                      <div className="text-[11px] text-emerald-800 dark:text-emerald-300">
                        <b>Video found.</b> ID: <span className="font-mono">{youtubeId(lessonModal.lesson.videoUrl)}</span><br />
                        Only students with an active key for this course can open it here.
                      </div>
                    </div>
                  ) : (
                    <p className="text-[11px] text-slate-500">
                      On YouTube: upload the lecture, set visibility to <b>Unlisted</b>, then copy the Share link and paste it here.
                    </p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                    Duration (minutes)
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={Math.round(lessonModal.lesson.duration / 60)}
                    onChange={(e) =>
                      setLessonModal({
                        ...lessonModal,
                        lesson: { ...lessonModal.lesson!, duration: (parseInt(e.target.value) || 10) * 60 }
                      })
                    }
                    className="w-full p-2 rounded-xl bg-slate-50 dark:bg-slate-800 border dark:border-slate-700"
                  />
                </div>

                <div className="flex items-center pt-5">
                  <label className="flex items-center gap-2 font-bold text-emerald-700 dark:text-emerald-400 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={lessonModal.lesson.isFreePreview}
                      onChange={(e) =>
                        setLessonModal({
                          ...lessonModal,
                          lesson: { ...lessonModal.lesson!, isFreePreview: e.target.checked }
                        })
                      }
                      className="rounded text-emerald-600"
                    />
                    <span>Free Preview (Playable without Key)</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                  Lesson Clinical Notes & Description
                </label>
                <textarea
                  rows={3}
                  value={lessonModal.lesson.description}
                  onChange={(e) =>
                    setLessonModal({
                      ...lessonModal,
                      lesson: { ...lessonModal.lesson!, description: e.target.value }
                    })
                  }
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border dark:border-slate-700 leading-relaxed"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setLessonModal(null)}
                  className="px-4 py-2 rounded-xl border text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-teal-700 text-white font-bold text-xs"
                >
                  Save Lesson
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
