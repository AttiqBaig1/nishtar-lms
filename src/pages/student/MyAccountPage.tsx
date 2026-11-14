import { SecurityPanel } from '../../components/security/SecurityPanel';
import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { storageService } from '../../services/storageService';
import { RedeemKeyModal } from '../../components/keys/RedeemKeyModal';
import {
  User,
  Phone,
  Mail,
  MapPin,
  KeyRound,
  Smartphone,
  ShieldCheck,
  Calendar,
  LogOut,
  PlusCircle,
  Clock,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

export const MyAccountPage: React.FC = () => {
  const { currentUser, deviceId, refreshUser } = useAuth();
  const [redeemModalOpen, setRedeemModalOpen] = useState(false);
  const [deviceAlert, setDeviceAlert] = useState<string | null>(null);

  if (!currentUser) return null;

  const enrollments = storageService.getEnrollmentsForUser(currentUser.uid);
  const allKeys = storageService.getAccessKeys().filter(k => k.redeemedBy === currentUser.uid);
  const userSessions = storageService.getSessions(currentUser.uid);
  const allCourses = storageService.getCourses();

  const handleLogoutOtherDevices = () => {
    storageService.logoutOtherDevices(currentUser.uid, deviceId);
    setDeviceAlert('All other device sessions have been terminated. Only this browser is now active.');
    setTimeout(() => setDeviceAlert(null), 4000);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
            My Student Account
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Manage your personal profile, active keys, and logged-in devices.
          </p>
        </div>

        <button
          onClick={() => setRedeemModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-teal-700 hover:bg-teal-800 text-white font-bold text-xs shadow-md transition"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Add Access Key</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Profile Card */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-xs space-y-5">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-teal-700 text-white flex items-center justify-center font-bold text-2xl shadow-md">
              {currentUser.name.charAt(0)}
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">{currentUser.name}</h2>
              <span className="inline-block mt-0.5 text-xs font-semibold px-2 py-0.5 rounded-full bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300">
                Student
              </span>
            </div>
          </div>

          <div className="space-y-3 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs">
            <div className="flex items-center gap-2.5 text-slate-600 dark:text-slate-400">
              <Phone className="w-4 h-4 text-teal-600 shrink-0" />
              <span>{currentUser.phone}</span>
            </div>
            <div className="flex items-center gap-2.5 text-slate-600 dark:text-slate-400">
              <Mail className="w-4 h-4 text-teal-600 shrink-0" />
              <span>{currentUser.email || 'No email added'}</span>
            </div>
            <div className="flex items-center gap-2.5 text-slate-600 dark:text-slate-400">
              <MapPin className="w-4 h-4 text-teal-600 shrink-0" />
              <span>{currentUser.city}, Pakistan</span>
            </div>
            <div className="flex items-center gap-2.5 text-slate-600 dark:text-slate-400">
              <Calendar className="w-4 h-4 text-teal-600 shrink-0" />
              <span>Joined: {new Date(currentUser.createdAt).toLocaleDateString()}</span>
            </div>
          </div>
        </div>

        {/* Right 2 columns: Active Keys & Devices */}
        <div className="md:col-span-2 space-y-6">
          {/* Active Access Keys */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
                <KeyRound className="w-5 h-5 text-teal-600" />
                <span>My Active Access Keys ({allKeys.length})</span>
              </h3>
            </div>

            {allKeys.length > 0 ? (
              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {allKeys.map((key) => {
                  const unlockedCourseTitles = key.courseIds.includes('*')
                    ? 'All Academy Courses'
                    : key.courseIds
                        .map(id => allCourses.find(c => c.id === id)?.title)
                        .filter(Boolean)
                        .join(', ');

                  const expiresFormatted = key.expiresAt
                    ? new Date(key.expiresAt).toLocaleDateString()
                    : 'Lifetime Access';

                  return (
                    <div key={key.id} className="py-3.5 first:pt-0 last:pb-0 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-mono font-bold text-xs text-teal-700 dark:text-teal-400">
                          {key.plainKey || `••••-••••-••••-${key.keyLast4}`}
                        </span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300">
                          {key.status}
                        </span>
                      </div>
                      <div className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                        {unlockedCourseTitles}
                      </div>
                      <div className="text-[11px] text-slate-500 flex items-center gap-3">
                        <span>Redeemed: {new Date(key.redeemedAt || key.createdAt).toLocaleDateString()}</span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3 text-teal-600" />
                          <span>Expires: {expiresFormatted}</span>
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-xs text-slate-500 py-3">No active access keys registered yet.</p>
            )}
          </div>

          {/* Logged-In Devices & Device Limit Management */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
              <div>
                <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
                  <Smartphone className="w-5 h-5 text-teal-600" />
                  <span>Logged-In Devices ({userSessions.length} active)</span>
                </h3>
                <p className="text-xs text-slate-500">
                  Per security rules, your access key allows up to 2 active devices simultaneously.
                </p>
              </div>

              {userSessions.length > 1 && (
                <button
                  onClick={handleLogoutOtherDevices}
                  className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 transition"
                >
                  Log Out Other Devices
                </button>
              )}
            </div>

            {deviceAlert && (
              <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{deviceAlert}</span>
              </div>
            )}

            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {userSessions.map((session) => {
                const isCurrent = session.deviceId === deviceId;
                return (
                  <div key={session.id} className="py-3 first:pt-0 last:pb-0 flex items-center justify-between">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate max-w-xs sm:max-w-md">
                          {session.userAgent || 'Chrome / Mobile Android Browser'}
                        </span>
                        {isCurrent && (
                          <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-teal-100 dark:bg-teal-950 text-teal-800 dark:text-teal-300">
                            Current Device
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-slate-400">
                        First logged in: {new Date(session.createdAt).toLocaleDateString()} • Last active: Just now
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6"><SecurityPanel /></div>

      {/* Redeem Key Modal */}
      <RedeemKeyModal
        isOpen={redeemModalOpen}
        onClose={() => setRedeemModalOpen(false)}
        onSuccess={() => refreshUser()}
      />
    </div>
  );
};
