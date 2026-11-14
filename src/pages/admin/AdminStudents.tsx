import React, { useState } from 'react';
import { storageService } from '../../services/storageService';
import { UserProfile, AccessKey, Enrollment, LessonProgress, DeviceSession } from '../../types';
import {
  Users,
  Search,
  ShieldAlert,
  ShieldCheck,
  Smartphone,
  BookOpen,
  KeyRound,
  RotateCcw,
  CheckCircle2,
  X,
  Clock,
  MapPin,
  Phone,
  Mail,
  Plus
} from 'lucide-react';

export const AdminStudents: React.FC = () => {
  const [users, setUsers] = useState<UserProfile[]>(() =>
    storageService.getUsers().filter(u => u.role === 'student')
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStudent, setSelectedStudent] = useState<UserProfile | null>(null);
  const [grantKeyStudent, setGrantKeyStudent] = useState<UserProfile | null>(null);

  const courses = storageService.getCourses();

  const refreshStudents = () => {
    setUsers(storageService.getUsers().filter(u => u.role === 'student'));
  };

  const filteredStudents = users.filter((u) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      u.name.toLowerCase().includes(q) ||
      u.phone.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q) ||
      u.city.toLowerCase().includes(q)
    );
  });

  const handleToggleSuspend = (student: UserProfile) => {
    const nextStatus = student.status === 'active' ? 'suspended' : 'active';
    storageService.updateUserStatus(student.uid, nextStatus);
    refreshStudents();
    if (selectedStudent && selectedStudent.uid === student.uid) {
      setSelectedStudent({ ...student, status: nextStatus });
    }
  };

  const handleResetDevices = (studentUid: string) => {
    storageService.resetAllDevicesForUser(studentUid);
    refreshStudents();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
            Registered Students Directory
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Track student accounts across Multan and South Punjab, monitor clinical watch progress, and manage devices.
          </p>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-4 sm:p-5 border border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search students by name, phone (+92...), email, or city..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 focus:border-teal-500 focus:outline-none"
          />
        </div>
      </div>

      {/* Students Table */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50/70 dark:bg-slate-800/50 text-slate-500 uppercase tracking-wider text-[11px] font-bold border-b border-slate-200 dark:border-slate-800">
                <th className="p-4">Student Name</th>
                <th className="p-4">Contact & City</th>
                <th className="p-4">Courses &amp; Progress</th>
                <th className="p-4">Account Status</th>
                <th className="p-4">Last Watched</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredStudents.length > 0 ? (
                filteredStudents.map((student) => {
                  const summary = storageService.getStudentSummary(student.uid);
                  const pct = summary.lessonsTotal ? Math.round((summary.lessonsCompleted / summary.lessonsTotal) * 100) : 0;
                  const isSuspended = student.status === 'suspended';

                  return (
                    <tr
                      key={student.uid}
                      className="hover:bg-slate-50/60 dark:hover:bg-slate-800/30 transition"
                    >
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-xl bg-teal-100 dark:bg-teal-950 text-teal-700 dark:text-teal-300 flex items-center justify-center font-bold">
                            {student.name.charAt(0)}
                          </div>
                          <div>
                            <span className="font-bold text-slate-900 dark:text-white block">
                              {student.name}
                            </span>
                            <span className="text-[11px] text-slate-400">{student.email || 'No email added'}</span>
                          </div>
                        </div>
                      </td>

                      <td className="p-4 text-slate-600 dark:text-slate-400">
                        <div className="font-mono text-slate-800 dark:text-slate-200">{student.phone}</div>
                        <div className="text-[11px] text-slate-400">{student.city}</div>
                      </td>

                      <td className="p-4">
                        <span className="inline-flex items-center gap-1 font-bold text-teal-700 dark:text-teal-400">
                          <BookOpen className="w-3.5 h-3.5" />
                          <span>{summary.coursesActive} Course(s)</span>
                        </span>
                        <div className="mt-1.5 w-36" data-progress={pct}>
                          <div className="h-1.5 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                            <div className="h-full bg-teal-600" style={{ width: `${pct}%` }} />
                          </div>
                          <div className="text-[10px] text-slate-500 mt-0.5">{summary.lessonsCompleted}/{summary.lessonsTotal} lectures done ({pct}%)</div>
                        </div>
                      </td>

                      <td className="p-4">
                        <span
                          className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                            isSuspended
                              ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                              : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                          }`}
                        >
                          {student.status.toUpperCase()}
                        </span>
                      </td>

                      <td className="p-4 text-slate-500 text-xs">
                        {summary.lastWatched ? new Date(summary.lastWatched).toLocaleString() : 'Not started'}
                      </td>

                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => setSelectedStudent(student)}
                            className="px-2.5 py-1 rounded-lg bg-teal-50 dark:bg-teal-950 text-teal-700 dark:text-teal-300 font-semibold text-xs hover:bg-teal-100"
                          >
                            Details
                          </button>

                          <button
                            onClick={() => handleToggleSuspend(student)}
                            className={`p-1.5 rounded-lg transition ${
                              isSuspended
                                ? 'text-emerald-600 hover:bg-emerald-50'
                                : 'text-slate-400 hover:text-rose-600 hover:bg-rose-50'
                            }`}
                            title={isSuspended ? 'Unsuspend' : 'Suspend Account'}
                          >
                            <ShieldAlert className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-400">
                    No students found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ================= STUDENT DETAIL MODAL ================= */}
      {selectedStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-6 max-h-[90vh] overflow-y-auto text-xs">
            <button
              onClick={() => setSelectedStudent(null)}
              className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-slate-600"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Profile Header */}
            <div className="flex items-center gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
              <div className="w-16 h-16 rounded-2xl bg-teal-700 text-white flex items-center justify-center font-bold text-2xl shadow-md">
                {selectedStudent.name.charAt(0)}
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                    {selectedStudent.name}
                  </h3>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      selectedStudent.status === 'suspended'
                        ? 'bg-rose-100 text-rose-800'
                        : 'bg-emerald-100 text-emerald-800'
                    }`}
                  >
                    {selectedStudent.status}
                  </span>
                </div>
                <div className="text-slate-500 flex flex-wrap items-center gap-3">
                  <span>{selectedStudent.phone}</span>
                  <span>•</span>
                  <span>{selectedStudent.email}</span>
                  <span>•</span>
                  <span>{selectedStudent.city}</span>
                </div>
              </div>
            </div>

            {/* Keys Owned */}
            <div className="space-y-3">
              <h4 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-1.5">
                <KeyRound className="w-4 h-4 text-teal-600" />
                <span>Keys & Enrollments</span>
              </h4>
              <div className="bg-slate-50 dark:bg-slate-800/60 rounded-2xl p-4 divide-y divide-slate-200 dark:divide-slate-700/60">
                {storageService
                  .getAccessKeys()
                  .filter(k => k.redeemedBy === selectedStudent.uid)
                  .map((k) => (
                    <div key={k.id} className="py-2.5 first:pt-0 last:pb-0 flex items-center justify-between">
                      <div>
                        <div className="font-mono font-bold text-teal-700 dark:text-teal-400 text-xs">
                          {k.plainKey || `••••-••••-••••-${k.keyLast4}`}
                        </div>
                        <div className="text-[11px] text-slate-500">
                          Expires: {k.expiresAt ? new Date(k.expiresAt).toLocaleDateString() : 'Lifetime'}
                        </div>
                      </div>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                        {k.status}
                      </span>
                    </div>
                  ))}
              </div>
            </div>

            {/* Logged in Sessions */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-1.5">
                  <Smartphone className="w-4 h-4 text-teal-600" />
                  <span>Logged-in Devices ({storageService.getSessions(selectedStudent.uid).length})</span>
                </h4>
                <button
                  onClick={() => handleResetDevices(selectedStudent.uid)}
                  className="text-xs text-rose-600 dark:text-rose-400 font-semibold hover:underline"
                >
                  Reset All Devices
                </button>
              </div>

              <div className="bg-slate-50 dark:bg-slate-800/60 rounded-2xl p-3 space-y-2">
                {storageService.getSessions(selectedStudent.uid).map((sess) => (
                  <div key={sess.id} className="text-xs text-slate-700 dark:text-slate-300 flex items-center justify-between">
                    <span className="truncate max-w-sm">{sess.userAgent}</span>
                    <span className="text-[10px] text-slate-400">
                      {new Date(sess.lastSeenAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-between">
              <button
                onClick={() => handleToggleSuspend(selectedStudent)}
                className="px-4 py-2 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 font-bold hover:bg-rose-100"
              >
                {selectedStudent.status === 'suspended' ? 'Unsuspend Account' : 'Suspend Account'}
              </button>

              <button
                onClick={() => setSelectedStudent(null)}
                className="px-5 py-2 rounded-xl bg-slate-200 dark:bg-slate-800 font-semibold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
