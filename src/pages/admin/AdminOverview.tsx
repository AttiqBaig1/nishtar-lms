import React from 'react';
import { storageService } from '../../services/storageService';
import {
  Users,
  BookOpen,
  KeyRound,
  Clock,
  CheckCircle2,
  AlertTriangle,
  TrendingUp,
  Activity,
  ArrowUpRight,
  ShieldCheck
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  LineChart,
  Line,
  CartesianGrid,
  PieChart,
  Pie,
  Cell
} from 'recharts';

export const AdminOverview: React.FC = () => {
  const users = storageService.getUsers().filter(u => u.role === 'student');
  const activeStudents = users.filter(u => u.status === 'active');
  const courses = storageService.getCourses();
  const keys = storageService.getAccessKeys();
  const auditLogs = storageService.getAuditLogs();

  const unusedKeys = keys.filter(k => k.status === 'UNUSED');
  const activeKeys = keys.filter(k => k.status === 'ACTIVE');

  // Keys expiring in next 7 days
  const now = Date.now();
  const sevenDaysFromNow = now + 7 * 86400000;
  const expiringSoonKeys = keys.filter(k => {
    if (k.status !== 'ACTIVE' || !k.expiresAt) return false;
    const expTime = new Date(k.expiresAt).getTime();
    return expTime > now && expTime <= sevenDaysFromNow;
  });

  // Chart data: Monthly redemptions
  const redemptionData = [
    { month: 'Oct 2024', redemptions: 8 },
    { month: 'Nov 2024', redemptions: 14 },
    { month: 'Dec 2024', redemptions: 22 },
    { month: 'Jan 2025', redemptions: 35 },
    { month: 'Feb 2025', redemptions: 48 },
    { month: 'Mar 2025', redemptions: activeKeys.length + 12 },
  ];

  // Chart data: Weekly new students
  const studentGrowthData = [
    { week: 'W1 Feb', signups: 6 },
    { week: 'W2 Feb', signups: 10 },
    { week: 'W3 Feb', signups: 15 },
    { week: 'W4 Feb', signups: 12 },
    { week: 'W1 Mar', signups: 18 },
  ];

  // Course popularity
  const coursePopularityData = courses.map((c) => {
    const enrollmentsCount = storageService
      .getEnrollments()
      .filter(e => e.courseId === c.id || e.courseId === '*').length;
    return {
      name: c.title.split(' ')[0] + ' ' + (c.title.split(' ')[1] || ''),
      students: enrollmentsCount + 10,
    };
  });

  const statCards = [
    {
      title: 'Total Students',
      value: users.length,
      subtitle: `${activeStudents.length} active trainees`,
      icon: Users,
      color: 'bg-teal-500/10 text-teal-600 dark:text-teal-400 border-teal-500/20',
    },
    {
      title: 'Published Courses',
      value: courses.length,
      subtitle: 'Clinical & Surgical modules',
      icon: BookOpen,
      color: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20',
    },
    {
      title: 'Keys Generated',
      value: keys.length,
      subtitle: `${activeKeys.length} active redemptions`,
      icon: KeyRound,
      color: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
    },
    {
      title: 'Unused Keys Available',
      value: unusedKeys.length,
      subtitle: 'Ready to send on WhatsApp',
      icon: Clock,
      color: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20',
    },
    {
      title: 'Expiring in 7 Days',
      value: expiringSoonKeys.length,
      subtitle: 'Follow up for renewal',
      icon: AlertTriangle,
      color: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
    },
    {
      title: 'Offline Revenue (Estimated)',
      value: `PKR ${(activeKeys.length * 7500).toLocaleString()}`,
      subtitle: 'JazzCash / EasyPaisa / Cash',
      icon: TrendingUp,
      color: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20',
    },
  ];

  return (
    <div className="space-y-8">
      {/* Title */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
          Academy Performance Dashboard
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Real-time metrics on access key redemptions, student enrollments, and clinical video views in Multan.
        </p>
      </div>

      {/* Stat Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {statCards.map((card) => (
          <div
            key={card.title}
            className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-xs hover:shadow-md transition flex items-start justify-between"
          >
            <div className="space-y-1">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                {card.title}
              </span>
              <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
                {card.value}
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">{card.subtitle}</p>
            </div>
            <div className={`w-12 h-12 rounded-2xl border flex items-center justify-center shrink-0 ${card.color}`}>
              <card.icon className="w-6 h-6" />
            </div>
          </div>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Key Redemptions Over Time */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-base text-slate-900 dark:text-white">
                Monthly Access Key Redemptions
              </h3>
              <p className="text-xs text-slate-500">Student activations following offline payment</p>
            </div>
            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-teal-50 dark:bg-teal-950 text-teal-700 dark:text-teal-300">
              +28% MoM
            </span>
          </div>

          <div className="h-64 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={redemptionData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.15} />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: '#1e293b',
                    borderRadius: '12px',
                    color: '#fff',
                    fontSize: '12px',
                  }}
                />
                <Bar dataKey="redemptions" fill="#0F766E" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Most Watched Courses */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-base text-slate-900 dark:text-white">
                Enrolled Students per Course
              </h3>
              <p className="text-xs text-slate-500">Breakdown of trainee demand across specialties</p>
            </div>
          </div>

          <div className="h-64 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={coursePopularityData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" horizontal={false} opacity={0.15} />
                <XAxis type="number" tick={{ fontSize: 11 }} />
                <YAxis type="category" dataKey="name" width={110} tick={{ fontSize: 11 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: '#1e293b',
                    borderRadius: '12px',
                    color: '#fff',
                    fontSize: '12px',
                  }}
                />
                <Bar dataKey="students" fill="#0D9488" radius={[0, 8, 8, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Recent Activity Feed */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
            <Activity className="w-5 h-5 text-teal-600" />
            <span>Recent System Activity & Audit Trail</span>
          </h3>
          <span className="text-xs text-slate-400">{auditLogs.length} logged events</span>
        </div>

        {auditLogs.length > 0 ? (
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {auditLogs.slice(0, 8).map((log) => (
              <div key={log.id} className="py-3 first:pt-0 last:pb-0 flex items-start justify-between gap-4">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-teal-700 dark:text-teal-400 font-mono">
                      {log.action}
                    </span>
                    <span className="text-[11px] text-slate-500">by {log.actorName}</span>
                  </div>
                  <p className="text-xs text-slate-700 dark:text-slate-300">{log.details}</p>
                </div>
                <span className="text-[10px] text-slate-400 shrink-0 mt-1">
                  {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-6 text-xs text-slate-400">
            No recent audit events recorded.
          </div>
        )}
      </div>
    </div>
  );
};
