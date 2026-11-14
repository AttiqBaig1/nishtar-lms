import React, { useState } from 'react';
import { storageService } from '../../services/storageService';
import { Announcement } from '../../types';
import { Bell, Plus, Trash2, Send, CheckCircle2 } from 'lucide-react';

export const AdminAnnouncements: React.FC = () => {
  const [announcements, setAnnouncements] = useState<Announcement[]>(() =>
    storageService.getAnnouncements()
  );
  const courses = storageService.getCourses();

  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [targetCourseId, setTargetCourseId] = useState<string>('');
  const [postedSuccess, setPostedSuccess] = useState(false);

  const refreshAnnouncements = () => {
    setAnnouncements(storageService.getAnnouncements());
  };

  const handlePostAnnouncement = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !body.trim()) return;

    const courseObj = targetCourseId ? courses.find(c => c.id === targetCourseId) : null;

    const newAnn: Announcement = {
      id: `ann-${Date.now()}`,
      title: title.trim(),
      body: body.trim(),
      courseId: targetCourseId || undefined,
      courseName: courseObj?.title || undefined,
      createdAt: new Date().toISOString(),
      authorName: 'Prof. Dr. Tariq Mahmood',
    };

    storageService.saveAnnouncement(newAnn);
    setTitle('');
    setBody('');
    setTargetCourseId('');
    setPostedSuccess(true);
    setTimeout(() => setPostedSuccess(false), 3000);
    refreshAnnouncements();
  };

  const handleDeleteAnnouncement = (id: string) => {
    storageService.deleteAnnouncement(id);
    refreshAnnouncements();
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
          Broadcast Announcements
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
          Post notices, syllabus updates, exam dates, or payment verification reminders to your medical trainees.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Create Form */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
            <Plus className="w-4 h-4 text-teal-600" />
            <span>Create New Notice</span>
          </h3>

          {postedSuccess && (
            <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" />
              <span>Announcement broadcast successfully!</span>
            </div>
          )}

          <form onSubmit={handlePostAnnouncement} className="space-y-3.5 text-xs">
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                Notice Title
              </label>
              <input
                type="text"
                required
                placeholder="e.g. New Live Clinical Webinar Schedule"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border dark:border-slate-700 font-semibold"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                Target Audience
              </label>
              <select
                value={targetCourseId}
                onChange={(e) => setTargetCourseId(e.target.value)}
                className="w-full p-2 rounded-xl bg-slate-50 dark:bg-slate-800 border dark:border-slate-700 font-medium"
              >
                <option value="">All Students (Global Academy Broadcast)</option>
                {courses.map((c) => (
                  <option key={c.id} value={c.id}>
                    Only Students in: {c.title}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                Body Content
              </label>
              <textarea
                required
                rows={4}
                placeholder="Type the announcement details here..."
                value={body}
                onChange={(e) => setBody(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border dark:border-slate-700 leading-relaxed"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-2xl bg-teal-700 hover:bg-teal-800 text-white font-bold text-xs shadow-md transition flex items-center justify-center gap-2"
            >
              <Send className="w-4 h-4" />
              <span>Broadcast Announcement</span>
            </button>
          </form>
        </div>

        {/* Existing Announcements List */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
            <Bell className="w-4 h-4 text-teal-600" />
            <span>Active Broadcasts ({announcements.length})</span>
          </h3>

          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {announcements.map((a) => (
              <div key={a.id} className="py-4 first:pt-0 last:pb-0 space-y-2">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-teal-100 dark:bg-teal-950 text-teal-800 dark:text-teal-300">
                        {a.courseName || 'Global'}
                      </span>
                      <span className="text-[11px] text-slate-400">
                        {new Date(a.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white mt-1">
                      {a.title}
                    </h4>
                  </div>

                  <button
                    onClick={() => handleDeleteAnnouncement(a.id)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/20"
                    title="Delete Announcement"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  {a.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
