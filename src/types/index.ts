export type UserRole = 'admin' | 'supervisor' | 'student';
export type UserStatus = 'active' | 'suspended';

export interface UserProfile {
  uid: string;
  name: string;
  phone: string; // Format +92 3XX XXXXXXX
  email: string; // staff: login email. student: optional verified email ('' until linked)
  emailVerified?: boolean;
  passwordHash?: string; // staff only (SHA-256 of salt+password)
  city: string;
  role: UserRole;
  status: UserStatus;
  createdAt: string;
  lastActiveAt: string;
}

export type CourseLevel = 'Beginner' | 'Intermediate' | 'Advanced' | 'All Levels';
export type CourseLanguage = 'English' | 'Urdu' | 'Bilingual (Urdu/English)';

export interface LessonAttachment {
  id: string;
  name: string;
  url: string;
  size?: string;
  type?: 'pdf' | 'doc' | 'image' | 'archive';
}

export interface Lesson {
  id: string;
  moduleId: string;
  courseId: string;
  title: string;
  titleUrdu?: string;
  description: string;
  videoUrl: string; // YouTube (unlisted) link, or a direct MP4 / HLS stream
  duration: number; // In seconds
  durationFormatted?: string; // e.g. "18:45"
  attachments: LessonAttachment[];
  isFreePreview: boolean;
  order: number;
}

export interface CourseModule {
  id: string;
  courseId: string;
  title: string;
  titleUrdu?: string;
  order: number;
  lessons: Lesson[];
}

export interface Course {
  id: string;
  title: string;
  titleUrdu?: string;
  slug: string;
  shortDescription: string;
  description: string;
  thumbnailUrl: string;
  category: string;
  instructor: string;
  instructorTitle?: string;
  level: CourseLevel;
  language: CourseLanguage;
  published: boolean;
  order: number;
  totalLessons: number;
  totalDuration: number; // In minutes
  pricePkr: number;
  featured?: boolean;
  createdAt: string;
  modules: CourseModule[];
}

export type KeyStatus = 'UNUSED' | 'ACTIVE' | 'EXPIRED' | 'REVOKED';

export interface AccessKey {
  id: string;
  plainKey?: string; // Stored only temporarily for initial generation reveal or in demo mode
  keyHash: string; // SHA-256 hash for secure server lookup
  keyLast4: string; // e.g. "XW4P"
  courseIds: string[]; // List of course IDs or ['*'] for all courses
  validityDays: number; // e.g. 30, 90, 180, 365, or 3650 for lifetime
  maxDevices: number;
  status: KeyStatus;
  intendedName?: string;
  intendedPhone?: string;
  note?: string;
  createdBy: string;
  createdAt: string;
  redeemedBy?: string; // Student uid
  redeemedAt?: string;
  expiresAt?: string;
  revokedAt?: string;
  revokedReason?: string;
}

export interface Enrollment {
  id: string;
  uid: string;
  courseId: string;
  keyId: string;
  grantedAt: string;
  expiresAt: string | null; // null means lifetime
  active: boolean;
}

export interface LessonProgress {
  uid?: string;
  lessonId: string;
  courseId: string;
  watchedSeconds: number;
  completed: boolean;
  updatedAt: string;
}

export interface LessonNote {
  uid?: string;
  lessonId: string;
  courseId: string;
  text: string;
  updatedAt: string;
}

export interface DeviceSession {
  id: string;
  deviceId: string;
  userAgent: string;
  createdAt: string;
  lastSeenAt: string;
  ip?: string;
}

export interface Announcement {
  id: string;
  title: string;
  titleUrdu?: string;
  body: string;
  bodyUrdu?: string;
  courseId?: string; // Optional: specific course or global
  courseName?: string;
  createdAt: string;
  authorName: string;
}

export interface ClinicSettings {
  clinicName: string;
  clinicNameUrdu?: string;
  tagline: string;
  logoUrl?: string;
  doctorName: string;
  doctorTitle: string;
  doctorBio: string;
  phone: string;
  whatsappNumber: string; // e.g. "923001234567" without leading '+' for wa.me links
  email: string;
  address: string;
  city: string;
  jazzCashAccount: string;
  jazzCashTitle: string;
  easyPaisaAccount: string;
  easyPaisaTitle: string;
  bankDetails: string;
  keyPrefix: string;
  defaultDevicesPerKey: number;
  defaultValidityDays: number;
  watermarkEnabled: boolean;
  pauseOnTabBlur: boolean;
}

export interface AuditLog {
  id: string;
  action: string;
  actorUid: string;
  actorName: string;
  targetId?: string;
  targetType?: 'key' | 'course' | 'student' | 'setting';
  timestamp: string;
  details: string;
}

export type CodePurpose = 'change_password' | 'change_email' | 'reset_password' | 'link_email';

export interface VerificationCode {
  id: string;
  uid: string;
  purpose: CodePurpose;
  sentTo: string; // email address the code was sent to
  codeHash: string;
  newValue?: string; // e.g. the new email being verified
  expiresAt: number;
  attempts: number;
  used: boolean;
}

/** Demo-mode outbox: what would have been emailed. */
export interface OutboxEmail {
  id: string;
  to: string;
  subject: string;
  body: string;
  code: string;
  sentAt: string;
}
