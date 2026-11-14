import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { storageService } from '../services/storageService';
import { useAuth } from '../contexts/AuthContext';
import { RedeemKeyModal } from '../components/keys/RedeemKeyModal';
import {
  GraduationCap,
  Play,
  KeyRound,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Layers,
  Award,
  ArrowRight,
  MessageCircle,
  Phone,
  Mail,
  MapPin,
  Star,
  Users,
  Smartphone,
  ChevronRight,
  Sparkles
} from 'lucide-react';

export const LandingPage: React.FC = () => {
  const { currentUser, refreshUser } = useAuth();
  const navigate = useNavigate();
  const settings = storageService.getClinicSettings();
  const courses = storageService.getCourses();

  const [redeemModalOpen, setRedeemModalOpen] = useState(false);

  const clinicWaUrl = `https://wa.me/${settings.whatsappNumber}?text=${encodeURIComponent(
    `Assalam o Alaikum, I would like to inquire about enrolling in Nishtar Medical Academy surgical and clinical video courses in Multan.`
  )}`;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col">
      {/* ================= HERO SECTION ================= */}
      <section className="relative overflow-hidden bg-gradient-to-b from-teal-950 via-slate-900 to-slate-950 text-white pt-12 pb-20 sm:pt-20 sm:pb-32 px-4 sm:px-6 lg:px-8 border-b border-teal-900/40">
        {/* Subtle decorative glow */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-teal-600/15 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-6xl mx-auto text-center space-y-6 relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-teal-500/15 border border-teal-400/30 text-teal-300 text-xs font-semibold shadow-xs">
            <Sparkles className="w-4 h-4 text-teal-400" />
            <span>Nishtar Medical Academy • Ophthalmology LMS Multan</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-tight max-w-4xl mx-auto">
            Master Cataract Phaco & Eye Surgery with{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-emerald-300">
              Nishtar Medical Academy Multan
            </span>
          </h1>

          <p className="text-sm sm:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
            Recorded surgical masterclasses for Eye Residents, Postgraduates, and House Officers. Pay offline via JazzCash, EasyPaisa, or Bank, unlocked with your clinic access key.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 pt-4">
            {currentUser ? (
              <Link
                to="/dashboard"
                className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-sm shadow-xl shadow-teal-600/25 transition flex items-center justify-center gap-2"
              >
                <span>Go to Student Dashboard</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            ) : (
              <>
                <Link
                  to="/login"
                  className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-sm shadow-xl shadow-teal-600/25 transition flex items-center justify-center gap-2"
                >
                  <span>Student Login (Access Key)</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <button
                  onClick={() => setRedeemModalOpen(true)}
                  className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-white/10 hover:bg-white/15 text-white font-bold text-sm border border-white/20 backdrop-blur-md transition flex items-center justify-center gap-2"
                >
                  <KeyRound className="w-4 h-4 text-teal-300" />
                  <span>Enter Access Key</span>
                </button>
              </>
            )}
            <a
              href={clinicWaUrl}
              target="_blank"
              rel="noreferrer"
              className="w-full sm:w-auto px-6 py-4 rounded-2xl bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 font-bold text-sm border border-emerald-500/30 transition flex items-center justify-center gap-2"
            >
              <MessageCircle className="w-4 h-4 fill-emerald-400" />
              <span>Contact on WhatsApp</span>
            </a>
          </div>

          {/* Quick Metrics Bar */}
          <div className="pt-10 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto text-left border-t border-slate-800/80">
            <div className="bg-white/5 rounded-2xl p-4 border border-white/10">
              <div className="text-2xl font-black text-teal-300">100%</div>
              <div className="text-xs text-slate-400 mt-0.5">Hands-On Real Cases</div>
            </div>
            <div className="bg-white/5 rounded-2xl p-4 border border-white/10">
              <div className="text-2xl font-black text-teal-300">450+</div>
              <div className="text-xs text-slate-400 mt-0.5">Trained Clinicians</div>
            </div>
            <div className="bg-white/5 rounded-2xl p-4 border border-white/10">
              <div className="text-2xl font-black text-teal-300">Full HD</div>
              <div className="text-xs text-slate-400 mt-0.5">Surgical Video Feeds</div>
            </div>
            <div className="bg-white/5 rounded-2xl p-4 border border-white/10">
              <div className="text-2xl font-black text-teal-300">24/7</div>
              <div className="text-xs text-slate-400 mt-0.5">Anywhere Mobile Access</div>
            </div>
          </div>
        </div>
      </section>

      {/* ================= 3-STEP OFFLINE ACCESS GUIDE ================= */}
      <section id="how-it-works" className="py-16 sm:py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        <div className="text-center space-y-3 mb-14">
          <span className="text-xs font-bold text-teal-700 dark:text-teal-400 uppercase tracking-widest">
            Simple 3-Step Enrollment
          </span>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900 dark:text-white">
            How the Access Key System Works
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 max-w-2xl mx-auto">
            No credit card needed. Pay locally in Pakistan via JazzCash, EasyPaisa, or Bank Transfer, and get started right away.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
          {/* Step 1 */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4 hover:shadow-lg transition">
            <div className="w-12 h-12 rounded-2xl bg-teal-50 dark:bg-teal-950 text-teal-700 dark:text-teal-300 font-black text-xl flex items-center justify-center">
              1
            </div>
            <h3 className="font-bold text-lg text-slate-900 dark:text-white">
              1. Pay Fee Offline & Contact
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              Transfer the course fee to our official JazzCash/EasyPaisa ({settings.jazzCashAccount}) or HBL Bank account. Send the transaction screenshot on WhatsApp.
            </p>
            <div className="pt-2">
              <span className="text-[11px] font-mono font-semibold px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-teal-700 dark:text-teal-400">
                JazzCash: {settings.jazzCashAccount}
              </span>
            </div>
          </div>

          {/* Step 2 */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4 hover:shadow-lg transition">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-black text-xl flex items-center justify-center">
              2
            </div>
            <h3 className="font-bold text-lg text-slate-900 dark:text-white">
              2. Receive Your 16-Char Key
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              The clinic admin validates your payment and sends you a cryptographically unique 16-character access key (e.g. <code>NMA-7F3K-9Q2M-XW4P</code>) within 15 minutes.
            </p>
            <div className="pt-2">
              <span className="text-[11px] font-mono font-semibold px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
                Pattern: NMA-XXXX-XXXX-XXXX
              </span>
            </div>
          </div>

          {/* Step 3 */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4 hover:shadow-lg transition">
            <div className="w-12 h-12 rounded-2xl bg-teal-50 dark:bg-teal-950 text-teal-700 dark:text-teal-300 font-black text-xl flex items-center justify-center">
              3
            </div>
            <h3 className="font-bold text-lg text-slate-900 dark:text-white">
              3. Activate & Start Learning
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              Sign in with the access key the academy sends you on WhatsApp and immediately unlock full video lectures, downloadable PDF protocols, and private notes.
            </p>
            <div className="pt-2">
              <button
                onClick={() => setRedeemModalOpen(true)}
                className="text-xs font-bold text-teal-700 dark:text-teal-400 hover:underline flex items-center gap-1"
              >
                <span>Try Activating a Key Now</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ================= FEATURED COURSES SECTION ================= */}
      <section className="py-16 bg-slate-100/70 dark:bg-slate-900/40 border-y border-slate-200 dark:border-slate-800/80 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto space-y-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <span className="text-xs font-bold text-teal-700 dark:text-teal-400 uppercase tracking-widest">
                Hands-On Curriculum
              </span>
              <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900 dark:text-white mt-1">
                Featured Clinical Video Courses
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-xl">
                High-yield procedural demonstrations filmed in the OT and Emergency Department at Nishtar Hospital Multan.
              </p>
            </div>

            <Link
              to="/courses"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-teal-700 dark:text-teal-400 hover:underline"
            >
              <span>Explore All Courses</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map((course) => (
              <div
                key={course.id}
                className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs hover:shadow-xl transition-all duration-200 overflow-hidden flex flex-col justify-between"
              >
                <div>
                  <div className="relative aspect-video bg-slate-100">
                    <img
                      src={course.thumbnailUrl}
                      alt={course.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-3 left-3">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-teal-800/90 text-white backdrop-blur-xs">
                        {course.category}
                      </span>
                    </div>
                    {course.modules[0]?.lessons[0]?.isFreePreview && (
                      <div className="absolute top-3 right-3">
                        <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-emerald-600 text-white shadow-xs">
                          Free Preview
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="p-5 sm:p-6 space-y-3">
                    <h3 className="font-bold text-base sm:text-lg text-slate-900 dark:text-white line-clamp-2">
                      {course.title}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                      {course.shortDescription}
                    </p>

                    <div className="flex items-center gap-4 text-xs text-slate-500 pt-2 border-t border-slate-100 dark:border-slate-800">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-teal-600" />
                        <span>{course.totalDuration} mins</span>
                      </span>
                      <span>•</span>
                      <span>{course.totalLessons} Lessons</span>
                      <span>•</span>
                      <span>{course.level}</span>
                    </div>
                  </div>
                </div>

                <div className="p-5 sm:p-6 pt-0 flex items-center justify-between border-t border-slate-100 dark:border-slate-800/60 mt-4">
                  <div>
                    <span className="text-base font-black text-slate-900 dark:text-white">
                      PKR {course.pricePkr.toLocaleString()}
                    </span>
                    <span className="text-[10px] text-slate-400 ml-1">/ offline key</span>
                  </div>

                  <Link
                    to={`/courses/${course.id}`}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-teal-700 hover:bg-teal-800 text-white font-bold text-xs shadow-xs transition"
                  >
                    <span>View Syllabus</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ================= FACULTY & DOCTOR BIO ================= */}
      <section id="about-faculty" className="py-16 sm:py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-8 sm:p-12 shadow-sm grid grid-cols-1 lg:grid-cols-3 gap-8 items-center">
          <div className="flex flex-col items-center text-center space-y-4">
            <div className="w-32 h-32 sm:w-40 sm:h-40 rounded-3xl bg-teal-700 text-white flex items-center justify-center font-bold text-5xl shadow-xl shadow-teal-700/20 border-4 border-teal-100 dark:border-teal-900">
              TM
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                {settings.doctorName}
              </h3>
              <p className="text-xs font-semibold text-teal-700 dark:text-teal-400 mt-0.5">
                {settings.doctorTitle}
              </p>
              <p className="text-[11px] text-slate-500 mt-0.5">Nishtar Medical University & Hospital, Multan</p>
            </div>
          </div>

          <div className="lg:col-span-2 space-y-4">
            <span className="text-xs font-bold text-teal-700 dark:text-teal-400 uppercase tracking-widest">
              Lead Course Faculty & Director
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
              Practical Clinical Education Filmed in Real Hospital Settings
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              {settings.doctorBio}
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 text-xs">
              <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300 font-medium">
                <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0" />
                <span>CPD Certificate upon syllabus completion</span>
              </div>
              <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300 font-medium">
                <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0" />
                <span>Live Q&A discussion via private WhatsApp</span>
              </div>
              <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300 font-medium">
                <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0" />
                <span>Downloadable pocket PDFs for ward duty</span>
              </div>
              <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300 font-medium">
                <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0" />
                <span>Anti-piracy watermarked dynamic viewing</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================= TESTIMONIALS SECTION ================= */}
      <section className="py-16 bg-slate-100/60 dark:bg-slate-900/30 px-4 sm:px-6 lg:px-8 border-y border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto space-y-8">
          <div className="text-center space-y-2">
            <span className="text-xs font-bold text-teal-700 dark:text-teal-400 uppercase tracking-widest">
              Student Feedback
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
              Trusted by Doctors & Trainees Across South Punjab
            </h2>
            <p className="text-xs text-slate-400 italic">
              [Note for Clinic Admin: Testimonials can be customized in the clinic settings or replaced with local student reviews]
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
              <div className="flex text-amber-400 gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-amber-400" />
                ))}
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                "The POCUS ultrasound course changed my confidence level during night calls in the emergency ward at Nishtar Hospital. The knobology breakdown and Morisons pouch views are explained with clarity."
              </p>
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                <div className="font-bold text-xs text-slate-900 dark:text-white">Dr. Ahmed Raza</div>
                <div className="text-[10px] text-slate-400">House Officer, Nishtar Hospital Multan</div>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
              <div className="flex text-amber-400 gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-amber-400" />
                ))}
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                "Paying through JazzCash was seamless. The admin sent me my access key on WhatsApp within 10 minutes. The suturing tension-free repair videos are crystal clear on mobile data."
              </p>
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                <div className="font-bold text-xs text-slate-900 dark:text-white">Dr. Fatima Noor</div>
                <div className="text-[10px] text-slate-400">Post-Graduate Surgery Resident, Bahawalpur</div>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
              <div className="flex text-amber-400 gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-amber-400" />
                ))}
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                "The emergency airway management guide is essential for any clinician working in intensive care in South Punjab. The high quality video streams played smoothly without buffering."
              </p>
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                <div className="font-bold text-xs text-slate-900 dark:text-white">Dr. Usman Tariq</div>
                <div className="text-[10px] text-slate-400">Medical Officer, Dera Ghazi Khan DHQ</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================= MULTAN LOCATION & CONTACT ================= */}
      <section id="location" className="py-16 sm:py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          <div className="space-y-6">
            <span className="text-xs font-bold text-teal-700 dark:text-teal-400 uppercase tracking-widest">
              Multan Campus & Reception
            </span>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900 dark:text-white">
              Visit Our Clinical Skills Center on Nishtar Road
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              Prefer to pay in cash or attend hands-on mannequin workshops in person? Visit our reception desk opposite Nishtar Hospital Gate 2 in Multan.
            </p>

            <div className="space-y-3 text-xs">
              <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                <MapPin className="w-5 h-5 text-teal-600 shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold text-slate-900 dark:text-white">Physical Address:</div>
                  <div className="text-slate-500 mt-0.5">{settings.address}</div>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                <Phone className="w-5 h-5 text-teal-600 shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold text-slate-900 dark:text-white">Official Helpline / WhatsApp:</div>
                  <div className="text-slate-500 mt-0.5">{settings.phone} ({settings.whatsappNumber})</div>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                <Mail className="w-5 h-5 text-teal-600 shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold text-slate-900 dark:text-white">Email Address:</div>
                  <div className="text-slate-500 mt-0.5">{settings.email}</div>
                </div>
              </div>
            </div>

            <div className="pt-2">
              <a
                href={clinicWaUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-md transition"
              >
                <MessageCircle className="w-5 h-5 fill-white" />
                <span>Message Clinic on WhatsApp</span>
              </a>
            </div>
          </div>

          {/* Interactive Google Maps Embed for Multan */}
          <div className="rounded-3xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-xl aspect-4/3 sm:aspect-video lg:aspect-square bg-slate-200">
            <iframe
              title="Multan Clinic Location Map"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              loading="lazy"
              allowFullScreen
              referrerPolicy="no-referrer-when-downgrade"
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d13797.10309995832!2d71.4398124!3d30.1793745!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x393b33946ea731a5%3A0xe1c7694f2bb73273!2sNishtar%20Hospital%2C%20Multan%2C%20Punjab!5e0!3m2!1sen!2s!4v1709000000000!5m2!1sen!2s"
            />
          </div>
        </div>
      </section>

      {/* ================= FOOTER ================= */}
      <footer className="mt-auto bg-slate-900 text-slate-400 border-t border-slate-800 py-12 px-4 sm:px-6 lg:px-8 text-xs">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-teal-700 text-white flex items-center justify-center font-bold">
              <GraduationCap className="w-4 h-4 text-teal-200" />
            </div>
            <div>
              <div className="font-bold text-white text-sm">{settings.clinicName}</div>
              <div className="text-[11px] text-slate-500">Nishtar Road, Multan, Pakistan</div>
            </div>
          </div>

          <div className="text-center md:text-right space-y-1">
            <p>© {new Date().getFullYear()} Nishtar Medical Academy Multan. All rights reserved.</p>
            <p className="text-[11px] text-slate-500">
              Videos protected by dynamic watermark & session monitoring.
            </p>
          </div>
        </div>
      </footer>

      {/* Redeem Key Modal */}
      <RedeemKeyModal
        isOpen={redeemModalOpen}
        onClose={() => setRedeemModalOpen(false)}
        onSuccess={() => {
          refreshUser();
          navigate('/dashboard');
        }}
      />
    </div>
  );
};
