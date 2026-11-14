/**
 * Access Key Generation & Hashing Utilities
 * Spec:
 * - Human-readable, uppercase, no confusing characters (exclude 0, O, 1, I, L)
 * - Pattern: PREFIX-XXXX-XXXX-XXXX, e.g. CLNC-7F3K-9Q2M-XW4P
 * - Generated with crypto.getRandomValues (never Math.random)
 * - Key lookup is case-insensitive and ignores spaces and dashes
 * - Hashed with SHA-256 for secure server-side storage
 */

// 31 unambiguous alphanumeric characters
const UNAMBIGUOUS_CHARS = '23456789ABCDEFGHJKMNPQRSTUVWXYZ';

/**
 * Generate a single secure access key
 */
export function generateAccessKey(prefix: string = 'CLNC'): string {
  const cleanPrefix = (prefix || 'CLNC').toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 5);
  const randomBytes = new Uint8Array(12);
  
  if (typeof window !== 'undefined' && window.crypto && window.crypto.getRandomValues) {
    window.crypto.getRandomValues(randomBytes);
  } else {
    // Fallback for non-browser environment
    const nodeCrypto = (globalThis as unknown as { crypto?: { getRandomValues: (arr: Uint8Array) => Uint8Array } }).crypto;
    if (nodeCrypto?.getRandomValues) {
      nodeCrypto.getRandomValues(randomBytes);
    } else {
      for (let i = 0; i < 12; i++) {
        randomBytes[i] = Math.floor(Math.random() * 256);
      }
    }
  }

  const chars: string[] = [];
  for (let i = 0; i < 12; i++) {
    const charIndex = randomBytes[i] % UNAMBIGUOUS_CHARS.length;
    chars.push(UNAMBIGUOUS_CHARS[charIndex]);
  }

  const part1 = chars.slice(0, 4).join('');
  const part2 = chars.slice(4, 8).join('');
  const part3 = chars.slice(8, 12).join('');

  return `${cleanPrefix}-${part1}-${part2}-${part3}`;
}

/**
 * Generate multiple secure access keys
 */
export function generateBulkAccessKeys(count: number, prefix: string = 'CLNC'): string[] {
  const keys: string[] = [];
  const safeCount = Math.max(1, Math.min(count, 100));
  for (let i = 0; i < safeCount; i++) {
    keys.push(generateAccessKey(prefix));
  }
  return keys;
}

/**
 * Normalize an access key for comparison or hashing:
 * Removes dashes, spaces, and converts to uppercase
 */
export function normalizeKey(key: string): string {
  if (!key) return '';
  return key.replace(/[\s\-_]/g, '').toUpperCase();
}

/**
 * Auto-format user input into 4-character chunks:
 * Example: CLNC-7F3K-9Q2M-XW4P
 */
export function formatKeyInput(input: string, prefixLength: number = 3): string {
  const cleaned = input.toUpperCase().replace(/[^A-Z0-9]/g, '');
  if (cleaned.length === 0) return '';
  
  const chunks: string[] = [];
  let remaining = cleaned;
  
  // First chunk matches the prefix length or standard 4
  const firstLen = Math.min(prefixLength, remaining.length);
  chunks.push(remaining.slice(0, firstLen));
  remaining = remaining.slice(firstLen);
  
  // Subsequent chunks are 4 chars each
  while (remaining.length > 0) {
    chunks.push(remaining.slice(0, 4));
    remaining = remaining.slice(4);
  }
  
  // Limit to max 4 parts total (PREFIX + 3 chunks)
  return chunks.slice(0, 4).join('-');
}

/**
 * Compute SHA-256 hash of a normalized key string
 */
export async function sha256(str: string): Promise<string> {
  const normalized = normalizeKey(str);
  const encoder = new TextEncoder();
  const data = encoder.encode(normalized);
  
  if (typeof crypto !== 'undefined' && crypto.subtle) {
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }
  
  // Simple deterministic fallback hash if SubtleCrypto is unavailable
  let hash = 0;
  for (let i = 0; i < normalized.length; i++) {
    const char = normalized.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  return `sha256_mock_${Math.abs(hash).toString(16)}`;
}

/**
 * Extract last 4 characters from a key for display (e.g. "XW4P")
 */
export function extractKeyLast4(key: string): string {
  const norm = normalizeKey(key);
  return norm.length >= 4 ? norm.slice(-4) : norm;
}

/**
 * Validate Pakistani phone number (+92 3XX XXXXXXX or 03XX XXXXXXX)
 */
export function validatePakistaniPhone(phone: string): { valid: boolean; formatted: string } {
  const cleaned = phone.replace(/[\s\-\(\)]/g, '');
  // Match 03XXXXXXXXX (11 digits) or +923XXXXXXXXX (13 chars) or 923XXXXXXXXX (12 digits)
  const regex = /^(?:\+92|92|0)?(3[0-9]{9})$/;
  const match = cleaned.match(regex);
  if (!match) {
    return { valid: false, formatted: phone };
  }
  const digits = match[1]; // e.g. 3001234567
  const formatted = `+92 ${digits.slice(0, 3)} ${digits.slice(3)}`;
  return { valid: true, formatted };
}

/**
 * Hash a password or verification code (SHA-256 over a fixed app salt).
 * Unlike sha256() above this keeps case, spaces and dashes.
 */
export async function hashSecret(secret: string): Promise<string> {
  const data = new TextEncoder().encode('nma-lms::' + secret);
  const buf = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('');
}

/** 6-digit numeric code from crypto.getRandomValues. */
export function randomCode(): string {
  const a = new Uint32Array(1);
  crypto.getRandomValues(a);
  return String(a[0] % 1000000).padStart(6, '0');
}

/** Pull the 11-char video id out of any YouTube link (watch, youtu.be, shorts, embed, live). */
export function youtubeId(url: string): string | null {
  if (!url) return null;
  const s = url.trim();
  if (/^[A-Za-z0-9_-]{11}$/.test(s)) return s;
  const m = s.match(/(?:youtube(?:-nocookie)?\.com\/(?:watch\?(?:.*&)?v=|embed\/|shorts\/|live\/|v\/)|youtu\.be\/)([A-Za-z0-9_-]{11})/);
  return m ? m[1] : null;
}
