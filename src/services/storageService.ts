/**
 * Storage Service & State Management
 * Seamlessly manages data in Demo Mode (localStorage) and bridges to Firebase.
 */

import {
  UserProfile,
  Course,
  AccessKey,
  Enrollment,
  LessonProgress,
  LessonNote,
  Announcement,
  ClinicSettings,
  AuditLog,
  DeviceSession,
  CodePurpose,
  VerificationCode,
  OutboxEmail
} from '../types';
import {
  INITIAL_CLINIC_SETTINGS,
  INITIAL_USERS,
  INITIAL_COURSES,
  INITIAL_ACCESS_KEYS,
  INITIAL_ENROLLMENTS,
  INITIAL_PROGRESS,
  INITIAL_NOTES,
  INITIAL_ANNOUNCEMENTS
} from './mockData';
import { normalizeKey, sha256, hashSecret, randomCode, validatePakistaniPhone } from '../lib/crypto';

const STORAGE_KEYS = {
  USERS: 'nma_users_v3',
  COURSES: 'nma_courses_v3',
  ACCESS_KEYS: 'nma_keys_v3',
  ENROLLMENTS: 'nma_enrollments_v3',
  PROGRESS: 'nma_progress_v3',
  NOTES: 'nma_notes_v3',
  ANNOUNCEMENTS: 'nma_announcements_v3',
  SETTINGS: 'nma_settings_v3',
  AUDIT: 'nma_audit_v3',
  RATE_LIMITS: 'nma_ratelimits_v3',
  SESSIONS: 'nma_sessions_v3',
  CODES: 'nma_codes_v3',
  OUTBOX: 'nma_outbox_v3',
};

const CODE_TTL_MS = 10 * 60 * 1000; // verification codes live 10 minutes
const CODE_MAX_ATTEMPTS = 5;

// Rate limit helper: 5 attempts per 15 minutes per user/device
interface RateLimitRecord {
  attempts: number;
  lockedUntil?: number;
}

class StorageService {
  private getStorageItem<T>(key: string, defaultValue: T): T {
    try {
      const data = localStorage.getItem(key);
      if (!data) return defaultValue;
      return JSON.parse(data) as T;
    } catch {
      return defaultValue;
    }
  }

  private setStorageItem<T>(key: string, value: T): void {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      console.error('Storage write error', e);
    }
  }

  constructor() {
    this.initializeDefaults();
  }

  public initializeDefaults(force = false): void {
    if (typeof window === 'undefined') return;

    if (force || !localStorage.getItem(STORAGE_KEYS.USERS)) {
      this.setStorageItem(STORAGE_KEYS.USERS, INITIAL_USERS);
    }
    if (force || !localStorage.getItem(STORAGE_KEYS.COURSES)) {
      this.setStorageItem(STORAGE_KEYS.COURSES, INITIAL_COURSES);
    }
    if (force || !localStorage.getItem(STORAGE_KEYS.ACCESS_KEYS)) {
      this.setStorageItem(STORAGE_KEYS.ACCESS_KEYS, INITIAL_ACCESS_KEYS);
    }
    if (force || !localStorage.getItem(STORAGE_KEYS.ENROLLMENTS)) {
      this.setStorageItem(STORAGE_KEYS.ENROLLMENTS, INITIAL_ENROLLMENTS);
    }
    if (force || !localStorage.getItem(STORAGE_KEYS.PROGRESS)) {
      this.setStorageItem(STORAGE_KEYS.PROGRESS, INITIAL_PROGRESS);
    }
    if (force || !localStorage.getItem(STORAGE_KEYS.NOTES)) {
      this.setStorageItem(STORAGE_KEYS.NOTES, INITIAL_NOTES);
    }
    if (force || !localStorage.getItem(STORAGE_KEYS.ANNOUNCEMENTS)) {
      this.setStorageItem(STORAGE_KEYS.ANNOUNCEMENTS, INITIAL_ANNOUNCEMENTS);
    }
    if (force || !localStorage.getItem(STORAGE_KEYS.SETTINGS)) {
      this.setStorageItem(STORAGE_KEYS.SETTINGS, INITIAL_CLINIC_SETTINGS);
    }
    if (force || !localStorage.getItem(STORAGE_KEYS.AUDIT)) {
      this.setStorageItem(STORAGE_KEYS.AUDIT, []);
    }
  }

  // ================= USERS =================
  public getUsers(): UserProfile[] {
    return this.getStorageItem<UserProfile[]>(STORAGE_KEYS.USERS, INITIAL_USERS);
  }

  public getUserById(uid: string): UserProfile | null {
    const users = this.getUsers();
    return users.find(u => u.uid === uid) || null;
  }

  public getUserByEmail(email: string): UserProfile | null {
    const users = this.getUsers();
    return users.find(u => u.email.toLowerCase() === email.toLowerCase()) || null;
  }

  public saveUser(user: UserProfile): void {
    const users = this.getUsers();
    const index = users.findIndex(u => u.uid === user.uid);
    if (index >= 0) {
      users[index] = user;
    } else {
      users.push(user);
    }
    this.setStorageItem(STORAGE_KEYS.USERS, users);
  }

  public updateUserStatus(uid: string, status: 'active' | 'suspended'): void {
    const user = this.getUserById(uid);
    if (user) {
      user.status = status;
      this.saveUser(user);
      this.addAuditLog('UPDATE_USER_STATUS', 'admin', `User ${user.name} status set to ${status}`);
    }
  }

  // ================= COURSES =================
  public getCourses(): Course[] {
    return this.getStorageItem<Course[]>(STORAGE_KEYS.COURSES, INITIAL_COURSES);
  }

  public getCourseById(courseId: string): Course | null {
    return this.getCourses().find(c => c.id === courseId) || null;
  }

  public saveCourse(course: Course): void {
    const courses = this.getCourses();
    const index = courses.findIndex(c => c.id === course.id);
    if (index >= 0) {
      courses[index] = course;
    } else {
      courses.push(course);
    }
    this.setStorageItem(STORAGE_KEYS.COURSES, courses);
    this.addAuditLog('SAVE_COURSE', 'admin', `Saved course: ${course.title}`);
  }

  public deleteCourse(courseId: string): { success: boolean; error?: string } {
    // Check if course has active enrollments
    const enrollments = this.getEnrollments().filter(e => e.courseId === courseId && e.active);
    if (enrollments.length > 0) {
      return {
        success: false,
        error: `Cannot delete course: ${enrollments.length} student(s) currently enrolled. Please unpublish the course instead.`
      };
    }
    const courses = this.getCourses().filter(c => c.id !== courseId);
    this.setStorageItem(STORAGE_KEYS.COURSES, courses);
    this.addAuditLog('DELETE_COURSE', 'admin', `Deleted course ID: ${courseId}`);
    return { success: true };
  }

  // ================= ENROLLMENTS =================
  public getEnrollments(): Enrollment[] {
    return this.getStorageItem<Enrollment[]>(STORAGE_KEYS.ENROLLMENTS, INITIAL_ENROLLMENTS);
  }

  public getEnrollmentsForUser(uid: string): Enrollment[] {
    const now = new Date().getTime();
    return this.getEnrollments().filter(e => {
      if (e.uid !== uid) return false;
      if (!e.active) return false;
      if (e.expiresAt) {
        return new Date(e.expiresAt).getTime() > now;
      }
      return true; // Lifetime access
    });
  }

  public checkUserAccessToCourse(uid: string, courseId: string): boolean {
    const enrollments = this.getEnrollmentsForUser(uid);
    return enrollments.some(e => e.courseId === courseId || e.courseId === '*');
  }

  public checkUserHasAnyActiveKey(uid: string): boolean {
    const enrollments = this.getEnrollmentsForUser(uid);
    return enrollments.length > 0;
  }

  // ================= ACCESS KEYS =================
  public getAccessKeys(): AccessKey[] {
    return this.getStorageItem<AccessKey[]>(STORAGE_KEYS.ACCESS_KEYS, INITIAL_ACCESS_KEYS);
  }

  public saveAccessKeys(newKeys: AccessKey[]): void {
    const keys = this.getAccessKeys();
    this.setStorageItem(STORAGE_KEYS.ACCESS_KEYS, [...newKeys, ...keys]);
    this.addAuditLog('GENERATE_KEYS', 'admin', `Generated ${newKeys.length} new access key(s)`);
  }

  public updateAccessKey(updatedKey: AccessKey): void {
    const keys = this.getAccessKeys();
    const index = keys.findIndex(k => k.id === updatedKey.id);
    if (index >= 0) {
      keys[index] = updatedKey;
      this.setStorageItem(STORAGE_KEYS.ACCESS_KEYS, keys);
    }
  }

  public revokeAccessKey(keyId: string, reason: string): { success: boolean; message: string } {
    const keys = this.getAccessKeys();
    const key = keys.find(k => k.id === keyId);
    if (!key) return { success: false, message: 'Key not found.' };

    key.status = 'REVOKED';
    key.revokedAt = new Date().toISOString();
    key.revokedReason = reason || 'Revoked by admin';
    this.updateAccessKey(key);

    // Immediately revoke linked active enrollments
    const enrollments = this.getEnrollments();
    let affectedCount = 0;
    enrollments.forEach(e => {
      if (e.keyId === keyId) {
        e.active = false;
        affectedCount++;
      }
    });
    this.setStorageItem(STORAGE_KEYS.ENROLLMENTS, enrollments);

    this.addAuditLog('REVOKE_KEY', 'admin', `Revoked key ${key.keyLast4} (${reason}). Deactivated ${affectedCount} enrollment(s).`);
    return { success: true, message: `Access key revoked. ${affectedCount} student access grant(s) disabled.` };
  }

  public extendKeyExpiry(keyId: string, additionalDays: number): { success: boolean; message: string } {
    const keys = this.getAccessKeys();
    const key = keys.find(k => k.id === keyId);
    if (!key) return { success: false, message: 'Key not found.' };

    key.validityDays += additionalDays;
    if (key.expiresAt) {
      const currentExp = new Date(key.expiresAt).getTime();
      const baseTime = currentExp > Date.now() ? currentExp : Date.now();
      const newExp = new Date(baseTime + additionalDays * 86400000).toISOString();
      key.expiresAt = newExp;
      key.status = 'ACTIVE';

      // Update linked enrollments
      const enrollments = this.getEnrollments();
      enrollments.forEach(e => {
        if (e.keyId === keyId) {
          e.expiresAt = newExp;
          e.active = true;
        }
      });
      this.setStorageItem(STORAGE_KEYS.ENROLLMENTS, enrollments);
    }

    this.updateAccessKey(key);
    this.addAuditLog('EXTEND_KEY', 'admin', `Extended key ${key.keyLast4} by ${additionalDays} days.`);
    return { success: true, message: `Key expiry extended by ${additionalDays} days.` };
  }

  public addCoursesToKey(keyId: string, additionalCourseIds: string[]): { success: boolean; message: string } {
    const keys = this.getAccessKeys();
    const key = keys.find(k => k.id === keyId);
    if (!key) return { success: false, message: 'Key not found.' };

    const set = new Set([...key.courseIds, ...additionalCourseIds]);
    key.courseIds = Array.from(set);
    this.updateAccessKey(key);

    // If key was already redeemed, also grant enrollments for the newly added courses!
    if (key.redeemedBy && key.status === 'ACTIVE') {
      const enrollments = this.getEnrollments();
      additionalCourseIds.forEach(cId => {
        const exists = enrollments.find(e => e.uid === key.redeemedBy && e.courseId === cId && e.active);
        if (!exists) {
          enrollments.push({
            id: `enr-${key.redeemedBy}-${cId}-${Date.now()}`,
            uid: key.redeemedBy!,
            courseId: cId,
            keyId: key.id,
            grantedAt: new Date().toISOString(),
            expiresAt: key.expiresAt || null,
            active: true
          });
        }
      });
      this.setStorageItem(STORAGE_KEYS.ENROLLMENTS, enrollments);
    }

    return { success: true, message: 'Courses successfully added to access key.' };
  }

  // ================= REDEMPTION LOGIC & RATE LIMITING =================
  private checkRateLimit(uid: string): { blocked: boolean; minutesRemaining?: number } {
    const limits = this.getStorageItem<Record<string, RateLimitRecord>>(STORAGE_KEYS.RATE_LIMITS, {});
    const record = limits[uid];
    if (!record) return { blocked: false };

    const now = Date.now();
    if (record.lockedUntil && record.lockedUntil > now) {
      const minutesRemaining = Math.ceil((record.lockedUntil - now) / 60000);
      return { blocked: true, minutesRemaining };
    }

    // Lock has expired, reset
    if (record.lockedUntil && record.lockedUntil <= now) {
      delete limits[uid];
      this.setStorageItem(STORAGE_KEYS.RATE_LIMITS, limits);
    }

    return { blocked: false };
  }

  private recordFailedAttempt(uid: string): { blocked: boolean; attemptsLeft: number } {
    const limits = this.getStorageItem<Record<string, RateLimitRecord>>(STORAGE_KEYS.RATE_LIMITS, {});
    const record = limits[uid] || { attempts: 0 };
    record.attempts += 1;

    if (record.attempts >= 5) {
      record.lockedUntil = Date.now() + 15 * 60 * 1000; // 15 minutes lockout
      limits[uid] = record;
      this.setStorageItem(STORAGE_KEYS.RATE_LIMITS, limits);
      return { blocked: true, attemptsLeft: 0 };
    }

    limits[uid] = record;
    this.setStorageItem(STORAGE_KEYS.RATE_LIMITS, limits);
    return { blocked: false, attemptsLeft: 5 - record.attempts };
  }

  private clearFailedAttempts(uid: string): void {
    const limits = this.getStorageItem<Record<string, RateLimitRecord>>(STORAGE_KEYS.RATE_LIMITS, {});
    if (limits[uid]) {
      delete limits[uid];
      this.setStorageItem(STORAGE_KEYS.RATE_LIMITS, limits);
    }
  }

  /**
   * Redeem Access Key - Atomic server-side simulation with comprehensive validation
   */
  public async redeemAccessKey(
    uid: string,
    rawKeyInput: string
  ): Promise<{
    success: boolean;
    message: string;
    unlockedCourses?: Course[];
    extendedCourse?: Course;
  }> {
    const user = this.getUserById(uid);
    if (!user) {
      return { success: false, message: 'User session not found. Please log in again.' };
    }

    if (user.status === 'suspended') {
      return { success: false, message: 'Your student account has been suspended. Please contact the clinic administration.' };
    }

    // 1. Rate-limit check
    const rateCheck = this.checkRateLimit(uid);
    if (rateCheck.blocked) {
      return {
        success: false,
        message: `Too many invalid attempts. Your account is temporarily locked for redemption. Please try again in ${rateCheck.minutesRemaining} minute(s) or contact the clinic on WhatsApp.`
      };
    }

    // 2. Normalize input key
    const normalized = normalizeKey(rawKeyInput);
    if (!normalized || normalized.length < 8) {
      const fail = this.recordFailedAttempt(uid);
      return {
        success: false,
        message: `Invalid access key format. Please check the code provided by the clinic. (${fail.attemptsLeft} attempts remaining)`
      };
    }

    // Compute hash
    const inputHash = await sha256(normalized);

    // 3. Find key matching normalized plainKey or hash
    const keys = this.getAccessKeys();
    const matchedKey = keys.find(k => {
      if (k.keyHash === inputHash) return true;
      if (k.plainKey && normalizeKey(k.plainKey) === normalized) return true;
      // Also check mock prefixes in demo data
      if (k.keyHash === `hash-${normalized.toLowerCase()}`) return true;
      return false;
    });

    if (!matchedKey) {
      const fail = this.recordFailedAttempt(uid);
      return {
        success: false,
        message: `Invalid access key. Please double-check your code or contact the clinic on WhatsApp. (${fail.attemptsLeft} attempts remaining before temporary lockout)`
      };
    }

    // 4. Check key status
    if (matchedKey.status === 'REVOKED') {
      return {
        success: false,
        message: 'This key is no longer valid. Please contact the clinic.'
      };
    }

    if (matchedKey.status === 'EXPIRED') {
      return {
        success: false,
        message: 'This key has already expired. Contact the clinic to renew your enrollment.'
      };
    }

    if (matchedKey.status === 'ACTIVE' && matchedKey.redeemedBy && matchedKey.redeemedBy !== uid) {
      return {
        success: false,
        message: 'This key has already been used by another student account.'
      };
    }

    if (matchedKey.status === 'ACTIVE' && matchedKey.redeemedBy === uid) {
      return {
        success: false,
        message: 'You have already redeemed this access key.'
      };
    }

    // Clear rate limits on valid key match
    this.clearFailedAttempts(uid);

    // 5. Calculate expiration date based on redemption date
    const now = new Date();
    const isLifetime = matchedKey.validityDays >= 3650;
    const expiresDate = isLifetime ? null : new Date(now.getTime() + matchedKey.validityDays * 86400000).toISOString();

    // 6. Mark key as ACTIVE
    matchedKey.status = 'ACTIVE';
    matchedKey.redeemedBy = uid;
    matchedKey.redeemedAt = now.toISOString();
    matchedKey.expiresAt = expiresDate || undefined;
    this.updateAccessKey(matchedKey);

    // 7. Resolve target courses
    const allCourses = this.getCourses();
    let targetCourseIds: string[] = [];
    if (matchedKey.courseIds.includes('*')) {
      targetCourseIds = allCourses.map(c => c.id);
    } else {
      targetCourseIds = matchedKey.courseIds;
    }

    const enrollments = this.getEnrollments();
    const unlockedCourses: Course[] = [];
    let extendedCourse: Course | undefined = undefined;

    for (const cId of targetCourseIds) {
      const course = allCourses.find(c => c.id === cId);
      if (!course) continue;

      // Edge case requirement: If student already owns course, extend expiry instead of duplicating!
      const existingEnrollment = enrollments.find(e => e.uid === uid && e.courseId === cId && e.active);
      if (existingEnrollment) {
        if (existingEnrollment.expiresAt && expiresDate) {
          const currentExp = new Date(existingEnrollment.expiresAt).getTime();
          const addedMs = matchedKey.validityDays * 86400000;
          const newExp = new Date(Math.max(currentExp, now.getTime()) + addedMs).toISOString();
          existingEnrollment.expiresAt = newExp;
        } else if (isLifetime) {
          existingEnrollment.expiresAt = null; // Upgraded to lifetime
        }
        extendedCourse = course;
      } else {
        // Create new enrollment
        enrollments.push({
          id: `enr-${uid}-${cId}-${Date.now()}`,
          uid,
          courseId: cId,
          keyId: matchedKey.id,
          grantedAt: now.toISOString(),
          expiresAt: expiresDate,
          active: true
        });
        unlockedCourses.push(course);
      }
    }

    this.setStorageItem(STORAGE_KEYS.ENROLLMENTS, enrollments);
    this.addAuditLog('REDEEM_KEY', uid, `Student ${user.name} redeemed key ${matchedKey.keyLast4}. Unlocked ${unlockedCourses.length} course(s).`);

    return {
      success: true,
      message: extendedCourse && unlockedCourses.length === 0
        ? `Access successfully extended for "${extendedCourse.title}"!`
        : `Congratulations! Access key activated successfully.`,
      unlockedCourses,
      extendedCourse
    };
  }

  // ================= DEVICE SESSIONS =================
  public getSessions(uid: string): DeviceSession[] {
    const allSessions = this.getStorageItem<Record<string, DeviceSession[]>>(STORAGE_KEYS.SESSIONS, {});
    return allSessions[uid] || [];
  }

  public registerSession(
    uid: string,
    deviceId: string,
    userAgent: string
  ): { allowed: boolean; maxDevices: number; activeDevices: number; message?: string } {
    const allSessions = this.getStorageItem<Record<string, DeviceSession[]>>(STORAGE_KEYS.SESSIONS, {});
    const userSessions = allSessions[uid] || [];

    // Find user's keys to determine allowed devices limit (minimum maxDevices among keys or default 2)
    const settings = this.getClinicSettings();
    const userKeys = this.getAccessKeys().filter(k => k.redeemedBy === uid && k.status === 'ACTIVE');
    const allowedLimit = userKeys.length > 0
      ? Math.max(...userKeys.map(k => k.maxDevices))
      : settings.defaultDevicesPerKey || 2;

    const existingIndex = userSessions.findIndex(s => s.deviceId === deviceId);
    if (existingIndex >= 0) {
      userSessions[existingIndex].lastSeenAt = new Date().toISOString();
      allSessions[uid] = userSessions;
      this.setStorageItem(STORAGE_KEYS.SESSIONS, allSessions);
      return { allowed: true, maxDevices: allowedLimit, activeDevices: userSessions.length };
    }

    // New device
    if (userSessions.length >= allowedLimit) {
      return {
        allowed: false,
        maxDevices: allowedLimit,
        activeDevices: userSessions.length,
        message: `Device limit exceeded (${userSessions.length}/${allowedLimit} devices in use). To watch on this device, please log out of an existing device from My Account or contact the clinic admin.`
      };
    }

    const newSession: DeviceSession = {
      id: `sess-${Date.now()}`,
      deviceId,
      userAgent: userAgent.slice(0, 80),
      createdAt: new Date().toISOString(),
      lastSeenAt: new Date().toISOString()
    };
    userSessions.push(newSession);
    allSessions[uid] = userSessions;
    this.setStorageItem(STORAGE_KEYS.SESSIONS, allSessions);

    return { allowed: true, maxDevices: allowedLimit, activeDevices: userSessions.length };
  }

  public logoutOtherDevices(uid: string, currentDeviceId: string): void {
    const allSessions = this.getStorageItem<Record<string, DeviceSession[]>>(STORAGE_KEYS.SESSIONS, {});
    const userSessions = allSessions[uid] || [];
    allSessions[uid] = userSessions.filter(s => s.deviceId === currentDeviceId);
    this.setStorageItem(STORAGE_KEYS.SESSIONS, allSessions);
    this.addAuditLog('LOGOUT_OTHER_DEVICES', uid, `Logged out all other devices for user ${uid}`);
  }

  public resetAllDevicesForUser(uid: string): void {
    const allSessions = this.getStorageItem<Record<string, DeviceSession[]>>(STORAGE_KEYS.SESSIONS, {});
    delete allSessions[uid];
    this.setStorageItem(STORAGE_KEYS.SESSIONS, allSessions);
    this.addAuditLog('RESET_DEVICES', 'admin', `Admin reset all logged-in devices for student ${uid}`);
  }

  // ================= PROGRESS & NOTES =================
  public getAllProgress(): LessonProgress[] {
    return this.getStorageItem<LessonProgress[]>(STORAGE_KEYS.PROGRESS, INITIAL_PROGRESS);
  }

  public getProgress(uid: string): LessonProgress[] {
    return this.getAllProgress().filter(p => p.uid === uid);
  }

  public getProgressForCourse(uid: string, courseId: string): LessonProgress[] {
    return this.getProgress(uid).filter(p => p.courseId === courseId);
  }

  public updateLessonProgress(
    uid: string,
    courseId: string,
    lessonId: string,
    watchedSeconds: number,
    durationSeconds: number,
    forceCompleted?: boolean
  ): void {
    const progressList = this.getAllProgress();
    const existing = progressList.find(p => p.uid === uid && p.lessonId === lessonId);
    
    // Auto-complete at 90% watched
    const isCompleted = forceCompleted || (durationSeconds > 0 && watchedSeconds >= durationSeconds * 0.9);

    if (existing) {
      existing.watchedSeconds = Math.max(existing.watchedSeconds, watchedSeconds);
      if (isCompleted) existing.completed = true;
      existing.updatedAt = new Date().toISOString();
    } else {
      progressList.push({
        uid,
        lessonId,
        courseId,
        watchedSeconds,
        completed: isCompleted,
        updatedAt: new Date().toISOString()
      });
    }

    this.setStorageItem(STORAGE_KEYS.PROGRESS, progressList);
  }

  public getNotes(uid: string): LessonNote[] {
    return this.getStorageItem<LessonNote[]>(STORAGE_KEYS.NOTES, INITIAL_NOTES).filter(n => n.uid === uid);
  }

  public getNoteForLesson(uid: string, lessonId: string): LessonNote | null {
    const notes = this.getNotes(uid);
    return notes.find(n => n.lessonId === lessonId) || null;
  }

  public saveNote(uid: string, courseId: string, lessonId: string, text: string): void {
    const notes = this.getStorageItem<LessonNote[]>(STORAGE_KEYS.NOTES, INITIAL_NOTES);
    const existing = notes.find(n => n.uid === uid && n.lessonId === lessonId);
    if (existing) {
      existing.text = text;
      existing.updatedAt = new Date().toISOString();
    } else {
      notes.push({
        uid,
        lessonId,
        courseId,
        text,
        updatedAt: new Date().toISOString()
      });
    }
    this.setStorageItem(STORAGE_KEYS.NOTES, notes);
  }

  // ================= ANNOUNCEMENTS =================
  public getAnnouncements(): Announcement[] {
    return this.getStorageItem<Announcement[]>(STORAGE_KEYS.ANNOUNCEMENTS, INITIAL_ANNOUNCEMENTS);
  }

  public saveAnnouncement(announcement: Announcement): void {
    const list = this.getAnnouncements();
    list.unshift(announcement);
    this.setStorageItem(STORAGE_KEYS.ANNOUNCEMENTS, list);
    this.addAuditLog('CREATE_ANNOUNCEMENT', 'admin', `Posted notice: ${announcement.title}`);
  }

  public deleteAnnouncement(id: string): void {
    const list = this.getAnnouncements().filter(a => a.id !== id);
    this.setStorageItem(STORAGE_KEYS.ANNOUNCEMENTS, list);
  }

  // ================= CLINIC SETTINGS =================
  public getClinicSettings(): ClinicSettings {
    return this.getStorageItem<ClinicSettings>(STORAGE_KEYS.SETTINGS, INITIAL_CLINIC_SETTINGS);
  }

  public updateClinicSettings(settings: ClinicSettings): void {
    this.setStorageItem(STORAGE_KEYS.SETTINGS, settings);
    this.addAuditLog('UPDATE_SETTINGS', 'admin', 'Updated clinic settings and payment information.');
  }


  // ================= AUTH: STAFF (email + password) =================
  public getStaff(): UserProfile[] {
    return this.getUsers().filter(u => u.role === 'admin' || u.role === 'supervisor');
  }

  public async authenticateStaff(email: string, password: string): Promise<{ ok: boolean; user?: UserProfile; message?: string }> {
    const user = this.getUserByEmail(email.trim());
    const generic = 'Email ya password galat hai. / Incorrect email or password.';
    if (!user || user.role === 'student' || !user.passwordHash) return { ok: false, message: generic };
    const rate = this.checkRateLimit('login:' + user.uid);
    if (rate.blocked) return { ok: false, message: `Too many wrong attempts. Try again in ${rate.minutesRemaining} minute(s).` };
    if ((await hashSecret(password)) !== user.passwordHash) {
      this.recordFailedAttempt('login:' + user.uid);
      return { ok: false, message: generic };
    }
    this.clearFailedAttempts('login:' + user.uid);
    if (user.status === 'suspended') return { ok: false, message: 'This account is suspended. Contact the academy admin.' };
    user.lastActiveAt = new Date().toISOString();
    this.saveUser(user);
    this.addAuditLog('STAFF_LOGIN', user.uid, `${user.name} signed in`);
    return { ok: true, user };
  }

  /** Admin creates a supervisor (or another admin). */
  public async createStaff(p: { name: string; email: string; phone: string; role: 'admin' | 'supervisor'; password: string }, actorUid: string): Promise<{ ok: boolean; message: string }> {
    const email = p.email.trim().toLowerCase();
    if (!p.name.trim()) return { ok: false, message: 'Name is required.' };
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return { ok: false, message: 'Enter a valid email address.' };
    if (this.getUserByEmail(email)) return { ok: false, message: 'An account with this email already exists.' };
    const pw = checkPasswordStrength(p.password);
    if (pw) return { ok: false, message: pw };
    const user: UserProfile = {
      uid: `${p.role}-${Date.now().toString(36)}`,
      name: p.name.trim(),
      phone: p.phone.trim(),
      email,
      emailVerified: false,
      passwordHash: await hashSecret(p.password),
      city: 'Multan',
      role: p.role,
      status: 'active',
      createdAt: new Date().toISOString(),
      lastActiveAt: new Date().toISOString(),
    };
    this.saveUser(user);
    this.addAuditLog('CREATE_STAFF', actorUid, `Created ${p.role} account for ${user.name} (${email})`);
    return { ok: true, message: `${p.role === 'admin' ? 'Admin' : 'Supervisor'} account created.` };
  }

  public deleteStaff(uid: string, actorUid: string): { ok: boolean; message: string } {
    const user = this.getUserById(uid);
    if (!user || user.role === 'student') return { ok: false, message: 'Staff account not found.' };
    if (uid === actorUid) return { ok: false, message: 'You cannot delete your own account.' };
    if (user.role === 'admin' && this.getStaff().filter(u => u.role === 'admin').length <= 1) {
      return { ok: false, message: 'At least one admin account must remain.' };
    }
    this.setStorageItem(STORAGE_KEYS.USERS, this.getUsers().filter(u => u.uid !== uid));
    this.addAuditLog('DELETE_STAFF', actorUid, `Removed ${user.role} ${user.name}`);
    return { ok: true, message: 'Account removed.' };
  }

  // ================= AUTH: STUDENT (access key only) =================
  /**
   * A student signs in with nothing but the access key the academy issued.
   * - UNUSED key: activates it, creating the student's profile (name/phone from
   *   the key, or from `profile` when the key was issued without a name).
   * - ACTIVE key: signs in the student it belongs to.
   * - EXPIRED / REVOKED / unknown: refused.
   */
  public async loginWithKey(
    rawKey: string,
    deviceKey: string,
    profile?: { name: string; phone: string }
  ): Promise<{ ok: boolean; user?: UserProfile; needsProfile?: boolean; message?: string }> {
    const rate = this.checkRateLimit('key:' + deviceKey);
    if (rate.blocked) {
      return { ok: false, message: `Too many invalid keys from this device. Try again in ${rate.minutesRemaining} minute(s) or contact the academy on WhatsApp.` };
    }
    const normalized = normalizeKey(rawKey);
    const key = normalized.length >= 8 ? await this.findKey(normalized) : undefined;
    if (!key) {
      const fail = this.recordFailedAttempt('key:' + deviceKey);
      return { ok: false, message: `Invalid access key. Check the code the academy sent you. (${fail.attemptsLeft} attempts left)` };
    }
    this.clearFailedAttempts('key:' + deviceKey);
    this.refreshKeyExpiry(key);

    if (key.status === 'REVOKED') return { ok: false, message: 'This key has been cancelled by the academy. Please contact the admin.' };
    if (key.status === 'EXPIRED') return { ok: false, message: 'This key has expired. Contact the academy on WhatsApp to renew your access.' };

    if (key.status === 'ACTIVE' && key.redeemedBy) {
      const user = this.getUserById(key.redeemedBy);
      if (!user) return { ok: false, message: 'Student account for this key was not found. Contact the admin.' };
      if (user.status === 'suspended') return { ok: false, message: 'Your account is suspended. Please contact the academy.' };
      user.lastActiveAt = new Date().toISOString();
      this.saveUser(user);
      return { ok: true, user };
    }

    // UNUSED -> first sign-in: create the student and activate the key
    const name = (profile?.name || key.intendedName || '').trim();
    const phoneRaw = (profile?.phone || key.intendedPhone || '').trim();
    if (!name) return { ok: false, needsProfile: true, message: 'Pehli dafa login: apna naam aur mobile number likhein.' };
    const phone = phoneRaw ? validatePakistaniPhone(phoneRaw) : { valid: true, formatted: '' };
    if (!phone.valid) return { ok: false, needsProfile: true, message: 'Enter a valid Pakistani mobile number, e.g. 0300 1234567.' };

    const user: UserProfile = {
      uid: 'student-' + Date.now().toString(36),
      name,
      phone: phone.formatted,
      email: '',
      emailVerified: false,
      city: 'Multan',
      role: 'student',
      status: 'active',
      createdAt: new Date().toISOString(),
      lastActiveAt: new Date().toISOString(),
    };
    this.saveUser(user);
    const res = await this.redeemAccessKey(user.uid, rawKey);
    if (!res.success) {
      this.setStorageItem(STORAGE_KEYS.USERS, this.getUsers().filter(u => u.uid !== user.uid));
      return { ok: false, message: res.message };
    }
    this.addAuditLog('STUDENT_FIRST_LOGIN', user.uid, `${user.name} activated key ${key.keyLast4}`);
    return { ok: true, user: this.getUserById(user.uid)! };
  }

  private async findKey(normalized: string): Promise<AccessKey | undefined> {
    const hash = await sha256(normalized);
    return this.getAccessKeys().find(k =>
      k.keyHash === hash ||
      (k.plainKey && normalizeKey(k.plainKey) === normalized) ||
      k.keyHash === `hash-${normalized.toLowerCase()}`
    );
  }

  /** Mark an ACTIVE key EXPIRED once its date has passed. */
  private refreshKeyExpiry(key: AccessKey): void {
    if (key.status === 'ACTIVE' && key.expiresAt && new Date(key.expiresAt).getTime() < Date.now()) {
      key.status = 'EXPIRED';
      this.updateAccessKey(key);
    }
  }

  // ================= EMAIL VERIFICATION CODES =================
  /**
   * Issues a 6-digit code and "emails" it. In this demo build the email lands
   * in the on-screen Demo Inbox (localStorage); with a mail service connected
   * the same call sends a real email.
   */
  public async sendVerificationCode(
    uid: string,
    purpose: CodePurpose,
    sendTo: string,
    newValue?: string
  ): Promise<{ ok: boolean; message: string; codeId?: string }> {
    const to = sendTo.trim().toLowerCase();
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(to)) return { ok: false, message: 'Enter a valid email address.' };
    const rate = this.checkRateLimit('codes:' + uid);
    if (rate.blocked) return { ok: false, message: `Too many codes requested. Try again in ${rate.minutesRemaining} minute(s).` };

    const code = randomCode();
    const codes = this.getStorageItem<VerificationCode[]>(STORAGE_KEYS.CODES, [])
      .filter(c => !(c.uid === uid && c.purpose === purpose)); // one live code per purpose
    const rec: VerificationCode = {
      id: 'code-' + Date.now().toString(36),
      uid, purpose, sentTo: to,
      codeHash: await hashSecret(code),
      newValue,
      expiresAt: Date.now() + CODE_TTL_MS,
      attempts: 0,
      used: false,
    };
    codes.push(rec);
    this.setStorageItem(STORAGE_KEYS.CODES, codes);

    const what: Record<CodePurpose, string> = {
      change_password: 'change your password',
      change_email: 'change your login email',
      reset_password: 'reset your password',
      link_email: 'verify your email address',
    };
    const settings = this.getClinicSettings();
    const mail: OutboxEmail = {
      id: 'mail-' + Date.now().toString(36),
      to,
      subject: `${settings.clinicName}: your verification code ${code}`,
      body: `Your code to ${what[purpose]} is ${code}. It expires in 10 minutes. If you did not request this, ignore this email.`,
      code,
      sentAt: new Date().toISOString(),
    };
    const outbox = this.getOutbox();
    outbox.unshift(mail);
    this.setStorageItem(STORAGE_KEYS.OUTBOX, outbox.slice(0, 30));
    window.dispatchEvent(new CustomEvent('nma-mail', { detail: mail }));
    this.recordCodeRequest(uid);
    return { ok: true, message: `A 6-digit code was sent to ${maskEmail(to)}.`, codeId: rec.id };
  }

  /** Checks a code; on success marks it used and returns the record. */
  public async verifyCode(uid: string, purpose: CodePurpose, code: string): Promise<{ ok: boolean; message: string; record?: VerificationCode }> {
    const codes = this.getStorageItem<VerificationCode[]>(STORAGE_KEYS.CODES, []);
    const rec = codes.find(c => c.uid === uid && c.purpose === purpose && !c.used);
    if (!rec) return { ok: false, message: 'No active code. Please request a new one.' };
    if (Date.now() > rec.expiresAt) return { ok: false, message: 'This code has expired. Request a new one.' };
    if (rec.attempts >= CODE_MAX_ATTEMPTS) return { ok: false, message: 'Too many wrong codes. Request a new one.' };
    if ((await hashSecret(code.trim())) !== rec.codeHash) {
      rec.attempts += 1;
      this.setStorageItem(STORAGE_KEYS.CODES, codes);
      return { ok: false, message: `Wrong code. ${CODE_MAX_ATTEMPTS - rec.attempts} attempt(s) left.` };
    }
    rec.used = true;
    this.setStorageItem(STORAGE_KEYS.CODES, codes);
    return { ok: true, message: 'Code verified.', record: rec };
  }

  public getOutbox(): OutboxEmail[] {
    return this.getStorageItem<OutboxEmail[]>(STORAGE_KEYS.OUTBOX, []);
  }

  public clearOutbox(): void {
    this.setStorageItem(STORAGE_KEYS.OUTBOX, []);
  }

  private recordCodeRequest(uid: string): void {
    // 8 code emails per 15 minutes per account
    const limits = this.getStorageItem<Record<string, RateLimitRecord>>(STORAGE_KEYS.RATE_LIMITS, {});
    const r = limits['codes:' + uid] || { attempts: 0 };
    r.attempts += 1;
    if (r.attempts >= 8) r.lockedUntil = Date.now() + 15 * 60 * 1000;
    limits['codes:' + uid] = r;
    this.setStorageItem(STORAGE_KEYS.RATE_LIMITS, limits);
  }

  // ---- the three verified changes ----
  /** Step 2 of a password change or reset: code must already be verified by verifyCode. */
  public async setPassword(uid: string, newPassword: string, verified: VerificationCode | undefined): Promise<{ ok: boolean; message: string }> {
    const user = this.getUserById(uid);
    if (!user || user.role === 'student') return { ok: false, message: 'Account not found.' };
    if (!verified || verified.uid !== uid || !verified.used || !['change_password', 'reset_password'].includes(verified.purpose)) {
      return { ok: false, message: 'Verify the email code first.' };
    }
    const pw = checkPasswordStrength(newPassword);
    if (pw) return { ok: false, message: pw };
    user.passwordHash = await hashSecret(newPassword);
    this.saveUser(user);
    this.logoutOtherDevices(uid, '');
    this.addAuditLog('PASSWORD_CHANGED', uid, `${user.name} changed password (email verified)`);
    return { ok: true, message: 'Password updated. Use the new password next time you sign in.' };
  }

  /** Applies an email change / link after the code sent to the NEW address is verified. */
  public applyVerifiedEmail(uid: string, verified: VerificationCode | undefined): { ok: boolean; message: string } {
    const user = this.getUserById(uid);
    if (!user || !verified || verified.uid !== uid || !verified.used || !verified.newValue ||
        !['change_email', 'link_email'].includes(verified.purpose)) {
      return { ok: false, message: 'Verify the email code first.' };
    }
    // Replacing an existing email needs the current inbox to have confirmed it first.
    if (user.email && verified.purpose === 'link_email') {
      const codes = this.getStorageItem<VerificationCode[]>(STORAGE_KEYS.CODES, []);
      const confirmed = codes.some(c => c.uid === uid && c.purpose === 'change_email' && c.used &&
        c.newValue === verified.newValue && Date.now() - c.expiresAt < 15 * 60 * 1000);
      if (!confirmed) return { ok: false, message: 'Confirm the code sent to your current email first.' };
    }
    const other = this.getUserByEmail(verified.newValue);
    if (other && other.uid !== uid) return { ok: false, message: 'This email is already used by another account.' };
    const old = user.email;
    user.email = verified.newValue;
    user.emailVerified = true;
    this.saveUser(user);
    this.addAuditLog('EMAIL_CHANGED', uid, `${user.name} email ${old || '(none)'} -> ${user.email} (verified)`);
    return { ok: true, message: user.role === 'student' ? 'Email verified and saved.' : 'Login email updated. Sign in with the new email from now on.' };
  }

  /** Staff "forgot password": finds the account and emails a reset code. */
  public async requestPasswordReset(email: string): Promise<{ ok: boolean; message: string; uid?: string }> {
    const user = this.getUserByEmail(email.trim());
    // Same reply whether or not the account exists, so emails can't be probed.
    const reply = 'If this email belongs to a staff account, a 6-digit reset code has been sent to it.';
    if (!user || user.role === 'student') return { ok: true, message: reply };
    const r = await this.sendVerificationCode(user.uid, 'reset_password', user.email);
    return { ok: r.ok, message: r.ok ? reply : r.message, uid: r.ok ? user.uid : undefined };
  }

  // ================= STUDENT PROGRESS (for staff) =================
  public getStudentSummary(uid: string): { coursesActive: number; lessonsCompleted: number; lessonsTotal: number; lastWatched?: string } {
    const enrollments = this.getEnrollmentsForUser(uid);
    const courses = this.getCourses();
    const ids = new Set<string>();
    enrollments.forEach(e => (e.courseId === '*' ? courses.map(c => c.id) : [e.courseId]).forEach(id => ids.add(id)));
    const total = courses.filter(c => ids.has(c.id)).reduce((n, c) => n + c.modules.reduce((m, md) => m + md.lessons.length, 0), 0);
    const prog = this.getProgress(uid);
    const last = prog.map(p => p.updatedAt).sort().pop();
    return { coursesActive: ids.size, lessonsCompleted: prog.filter(p => p.completed).length, lessonsTotal: total, lastWatched: last };
  }

  // ================= AUDIT LOG =================
  public getAuditLogs(): AuditLog[] {
    return this.getStorageItem<AuditLog[]>(STORAGE_KEYS.AUDIT, []);
  }

  public addAuditLog(action: string, actorUid: string, details: string): void {
    const logs = this.getAuditLogs();
    logs.unshift({
      id: `audit-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      action,
      actorUid,
      actorName: actorUid === 'admin' ? 'Academy Admin' : (this.getUserById(actorUid)?.name || actorUid),
      timestamp: new Date().toISOString(),
      details
    });
    // Keep max 200 logs
    if (logs.length > 200) logs.pop();
    this.setStorageItem(STORAGE_KEYS.AUDIT, logs);
  }
}

/** Returns an error message, or '' when the password is acceptable. */
export function checkPasswordStrength(pw: string): string {
  if (!pw || pw.length < 8) return 'Password must be at least 8 characters.';
  if (!/[A-Za-z]/.test(pw) || !/[0-9]/.test(pw)) return 'Password must contain letters and numbers.';
  return '';
}

export function maskEmail(email: string): string {
  const [u, d] = email.split('@');
  if (!d) return email;
  return (u.length <= 2 ? u[0] + '*' : u.slice(0, 2) + '*'.repeat(Math.max(1, u.length - 2))) + '@' + d;
}

export const storageService = new StorageService();
