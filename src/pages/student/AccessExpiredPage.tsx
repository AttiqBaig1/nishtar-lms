import React from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { storageService } from '../../services/storageService';
import { useAuth } from '../../contexts/AuthContext';
import { Clock, MessageCircle, ArrowLeft, RefreshCw } from 'lucide-react';

export const AccessExpiredPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const courseId = searchParams.get('courseId');
  const course = courseId ? storageService.getCourseById(courseId) : null;
  const settings = storageService.getClinicSettings();
  const { currentUser } = useAuth();

  const renewWaUrl = `https://wa.me/${settings.whatsappNumber}?text=${encodeURIComponent(
    `Assalam o Alaikum, my access has expired for "${course ? course.title : 'Course'}". Student name: ${
      currentUser?.name || ''
    } (Phone: ${currentUser?.phone || ''}). Please share renewal payment details.`
  )}`;

  return (
    <div className="min-h-[75vh] flex items-center justify-center p-4">
      <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl p-8 border border-slate-200 dark:border-slate-800 shadow-xl text-center space-y-6">
        <div className="w-16 h-16 rounded-2xl bg-amber-100 dark:bg-amber-950/60 text-amber-600 flex items-center justify-center mx-auto">
          <Clock className="w-9 h-9" />
        </div>

        <div className="space-y-2">
          <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300">
            Enrollment Validity Expired
          </span>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white">
            Access Key Period Has Ended
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto leading-relaxed">
            Your validity period for <strong>{course ? course.title : 'this course'}</strong> has concluded.
            To continue accessing lectures, practical demonstrations, and updated clinical guidelines, please renew your access key with the clinic administration.
          </p>
        </div>

        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
          <a
            href={renewWaUrl}
            target="_blank"
            rel="noreferrer"
            className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md transition flex items-center justify-center gap-2"
          >
            <MessageCircle className="w-4 h-4 fill-white" />
            <span>Renew Access via WhatsApp</span>
          </a>

          <Link
            to="/dashboard"
            className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs transition flex items-center justify-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Dashboard</span>
          </Link>
        </div>
      </div>
    </div>
  );
};
