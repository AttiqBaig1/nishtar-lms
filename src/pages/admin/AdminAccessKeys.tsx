import React, { useState, useMemo } from 'react';
import { storageService } from '../../services/storageService';
import { useAuth } from '../../contexts/AuthContext';
import { AccessKey, Course } from '../../types';
import { generateBulkAccessKeys, sha256, extractKeyLast4 } from '../../lib/crypto';
import {
  KeyRound,
  Plus,
  Search,
  Filter,
  Copy,
  Check,
  Eye,
  EyeOff,
  MessageCircle,
  Download,
  AlertTriangle,
  RotateCcw,
  PlusCircle,
  Clock,
  ShieldAlert,
  Calendar,
  X,
  Sparkles
} from 'lucide-react';

export const AdminAccessKeys: React.FC = () => {
  const { currentUser } = useAuth();
  const [keysList, setKeysList] = useState<AccessKey[]>(() => storageService.getAccessKeys());
  const courses = storageService.getCourses();
  const settings = storageService.getClinicSettings();

  // Search and Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [courseFilter, setCourseFilter] = useState<string>('ALL');
  const [revealedKeys, setRevealedKeys] = useState<Record<string, boolean>>({});
  const [copiedKeyId, setCopiedKeyId] = useState<string | null>(null);

  // Selected Keys for Bulk Operations
  const [selectedKeyIds, setSelectedKeyIds] = useState<string[]>([]);

  // Generator Modal state
  const [genModalOpen, setGenModalOpen] = useState(false);
  const [genCourses, setGenCourses] = useState<string[]>(['*']); // default all courses
  const [genValidityDays, setGenValidityDays] = useState<number>(180);
  const [genIntendedName, setGenIntendedName] = useState('');
  const [genIntendedPhone, setGenIntendedPhone] = useState('');
  const [genMaxDevices, setGenMaxDevices] = useState<number>(settings.defaultDevicesPerKey || 2);
  const [genQuantity, setGenQuantity] = useState<number>(1);
  const [genNote, setGenNote] = useState('');
  const [generatedBatch, setGeneratedBatch] = useState<AccessKey[] | null>(null);

  // Revoke Modal state
  const [revokeModalKey, setRevokeModalKey] = useState<AccessKey | null>(null);
  const [revokeReason, setRevokeReason] = useState('Payment refunded or authorization cancelled');

  // Extend Expiry Modal state
  const [extendModalKey, setExtendModalKey] = useState<AccessKey | null>(null);
  const [extendDays, setExtendDays] = useState<number>(90);

  // Add Courses Modal state
  const [addCourseModalKey, setAddCourseModalKey] = useState<AccessKey | null>(null);
  const [addCourseSelected, setAddCourseSelected] = useState<string[]>([]);

  const refreshKeys = () => {
    setKeysList(storageService.getAccessKeys());
  };

  // Filter keys
  const filteredKeys = useMemo(() => {
    return keysList.filter((k) => {
      // Status filter
      if (statusFilter !== 'ALL' && k.status !== statusFilter) return false;

      // Course filter
      if (courseFilter !== 'ALL') {
        if (!k.courseIds.includes('*') && !k.courseIds.includes(courseFilter)) return false;
      }

      // Search query (search plainKey, last4, intendedName, intendedPhone, note)
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesPlain = k.plainKey?.toLowerCase().includes(q);
        const matchesLast4 = k.keyLast4?.toLowerCase().includes(q);
        const matchesName = k.intendedName?.toLowerCase().includes(q);
        const matchesPhone = k.intendedPhone?.toLowerCase().includes(q);
        const matchesNote = k.note?.toLowerCase().includes(q);
        if (!matchesPlain && !matchesLast4 && !matchesName && !matchesPhone && !matchesNote) {
          return false;
        }
      }

      return true;
    });
  }, [keysList, statusFilter, courseFilter, searchQuery]);

  // Copy Key
  const handleCopyKey = (key: AccessKey) => {
    const textToCopy = key.plainKey || `CLNC-****-****-${key.keyLast4}`;
    navigator.clipboard.writeText(textToCopy);
    setCopiedKeyId(key.id);
    setTimeout(() => setCopiedKeyId(null), 2000);
  };

  // WhatsApp Share Message
  const getWhatsAppLink = (key: AccessKey) => {
    const phone = (key.intendedPhone || '').replace(/[^0-9]/g, '');
    const courseTitle = key.courseIds.includes('*')
      ? 'All Academy Courses'
      : courses.find(c => c.id === key.courseIds[0])?.title || 'Clinical Skills Course';

    const plainKey = key.plainKey || `CLNC-****-****-${key.keyLast4}`;
    const studentName = key.intendedName || 'Doctor';

    const loginUrl = `${window.location.origin}${import.meta.env.BASE_URL}login`;
    const message = `Assalam o Alaikum ${studentName}, your access key for ${courseTitle} is: ${plainKey}\n\nOpen ${loginUrl}, choose "Student" and enter this key to watch your lectures. Please don't share it: the key works only for you.`;

    return `https://wa.me/${phone || settings.whatsappNumber}?text=${encodeURIComponent(message)}`;
  };

  // Toggle reveal
  const toggleRevealKey = (id: string) => {
    setRevealedKeys(prev => ({ ...prev, [id]: !prev[id] }));
  };

  // Bulk Generator Handler
  const handleGenerateKeys = async (e: React.FormEvent) => {
    e.preventDefault();
    const count = Math.max(1, Math.min(genQuantity, 100));
    const rawKeys = generateBulkAccessKeys(count, settings.keyPrefix || 'CLNC');

    const newKeys: AccessKey[] = [];
    for (const raw of rawKeys) {
      const hash = await sha256(raw);
      const last4 = extractKeyLast4(raw);

      newKeys.push({
        id: `key-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
        plainKey: raw,
        keyHash: hash,
        keyLast4: last4,
        courseIds: genCourses,
        validityDays: genValidityDays,
        maxDevices: genMaxDevices,
        status: 'UNUSED',
        intendedName: genIntendedName.trim() || undefined,
        intendedPhone: genIntendedPhone.trim() || undefined,
        note: genNote.trim() || undefined,
        createdBy: currentUser?.uid || 'admin-001',
        createdAt: new Date().toISOString(),
      });
    }

    storageService.saveAccessKeys(newKeys);
    refreshKeys();
    setGeneratedBatch(newKeys);
  };

  // Handle Revoke
  const handleConfirmRevoke = () => {
    if (!revokeModalKey) return;
    storageService.revokeAccessKey(revokeModalKey.id, revokeReason);
    setRevokeModalKey(null);
    refreshKeys();
  };

  // Handle Extend Expiry
  const handleConfirmExtend = () => {
    if (!extendModalKey) return;
    storageService.extendKeyExpiry(extendModalKey.id, extendDays);
    setExtendModalKey(null);
    refreshKeys();
  };

  // Handle Add Courses
  const handleConfirmAddCourses = () => {
    if (!addCourseModalKey || addCourseSelected.length === 0) return;
    storageService.addCoursesToKey(addCourseModalKey.id, addCourseSelected);
    setAddCourseModalKey(null);
    setAddCourseSelected([]);
    refreshKeys();
  };

  // Export to CSV
  const handleExportCSV = (keysToExport: AccessKey[]) => {
    const headers = ['Key', 'Status', 'Courses', 'Validity Days', 'Intended Name', 'Intended Phone', 'Note', 'Created At', 'Redeemed By', 'Expires At'];
    const rows = keysToExport.map(k => [
      k.plainKey || `CLNC-****-****-${k.keyLast4}`,
      k.status,
      k.courseIds.includes('*') ? 'All Courses' : k.courseIds.join('; '),
      k.validityDays,
      `"${k.intendedName || ''}"`,
      `"${k.intendedPhone || ''}"`,
      `"${(k.note || '').replace(/"/g, '""')}"`,
      k.createdAt,
      k.redeemedBy || '',
      k.expiresAt || '',
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `multan_academy_access_keys_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Select all toggle
  const toggleSelectAll = () => {
    if (selectedKeyIds.length === filteredKeys.length) {
      setSelectedKeyIds([]);
    } else {
      setSelectedKeyIds(filteredKeys.map(k => k.id));
    }
  };

  const toggleSelectKey = (id: string) => {
    setSelectedKeyIds(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  // Bulk Revoke Selected
  const handleBulkRevoke = () => {
    selectedKeyIds.forEach(id => {
      storageService.revokeAccessKey(id, 'Bulk administrative revocation');
    });
    setSelectedKeyIds([]);
    refreshKeys();
  };

  return (
    <div className="space-y-6">
      {/* Header and Generate Button */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
            Access Key Management
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Generate, track, and send secure access keys to students via WhatsApp after offline payment verification.
          </p>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <button
            onClick={() => handleExportCSV(filteredKeys)}
            className="flex items-center gap-2 px-3.5 py-2.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 transition"
          >
            <Download className="w-4 h-4 text-slate-500" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={() => {
              setGeneratedBatch(null);
              setGenModalOpen(true);
            }}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-extrabold shadow-lg shadow-teal-600/30 ring-2 ring-teal-400 transition transform hover:scale-105"
          >
            <Plus className="w-4 h-4" />
            <span>Generate New Access Key</span>
          </button>
        </div>
      </div>

      {/* Explanatory Banner: Where keys generate and how student gets access */}
      <div className="bg-teal-50 dark:bg-teal-950/40 border border-teal-500/30 rounded-3xl p-5 sm:p-6 space-y-3">
        <div className="flex items-center gap-2 text-teal-900 dark:text-teal-200 font-bold text-sm">
          <KeyRound className="w-5 h-5 text-teal-600" />
          <span>Access Key Workflow: Generation, WhatsApp Dispatch & Student Unlock</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
          <div className="bg-white dark:bg-slate-900 p-3.5 rounded-2xl border border-teal-200 dark:border-teal-800/40 space-y-1">
            <div className="font-bold text-teal-800 dark:text-teal-300">Step 1: Generate Access Key</div>
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
              Click <strong>"+ Generate New Access Key"</strong>. Configure the course, validity duration (e.g. 180 days), and student name/phone.
            </p>
          </div>
          <div className="bg-white dark:bg-slate-900 p-3.5 rounded-2xl border border-teal-200 dark:border-teal-800/40 space-y-1">
            <div className="font-bold text-teal-800 dark:text-teal-300">Step 2: Dispatch on WhatsApp</div>
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
              Once offline tuition is paid, click the <strong>WhatsApp</strong> button next to the key to send an automated activation message.
            </p>
          </div>
          <div className="bg-white dark:bg-slate-900 p-3.5 rounded-2xl border border-teal-200 dark:border-teal-800/40 space-y-1">
            <div className="font-bold text-teal-800 dark:text-teal-300">Step 3: Student Instant Unlock</div>
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
              The student signs in with the key itself (Login, Student tab). The first sign-in activates it and binds it to that student.
            </p>
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-4 sm:p-5 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
          {/* Search Input */}
          <div className="sm:col-span-5 relative">
            <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search by key code, student name, phone, or note..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 focus:border-teal-500 focus:outline-none"
            />
          </div>

          {/* Status Filter */}
          <div className="sm:col-span-3">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full py-2.5 px-3 rounded-xl bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 focus:border-teal-500 focus:outline-none"
            >
              <option value="ALL">All Statuses ({keysList.length})</option>
              <option value="UNUSED">UNUSED Keys</option>
              <option value="ACTIVE">ACTIVE (Redeemed)</option>
              <option value="EXPIRED">EXPIRED Keys</option>
              <option value="REVOKED">REVOKED Keys</option>
            </select>
          </div>

          {/* Course Filter */}
          <div className="sm:col-span-4">
            <select
              value={courseFilter}
              onChange={(e) => setCourseFilter(e.target.value)}
              className="w-full py-2.5 px-3 rounded-xl bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 focus:border-teal-500 focus:outline-none"
            >
              <option value="ALL">All Target Courses</option>
              {courses.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.title}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Bulk Action Bar (when selected) */}
        {selectedKeyIds.length > 0 && (
          <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
            <span className="font-semibold text-slate-700 dark:text-slate-300">
              {selectedKeyIds.length} key(s) selected
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleExportCSV(keysList.filter(k => selectedKeyIds.includes(k.id)))}
                className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 font-medium"
              >
                Export Selected
              </button>
              <button
                onClick={handleBulkRevoke}
                className="px-3 py-1.5 rounded-lg bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 hover:bg-rose-100 font-semibold"
              >
                Revoke Selected
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Keys Table */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50/70 dark:bg-slate-800/50 text-slate-500 uppercase tracking-wider text-[11px] font-bold border-b border-slate-200 dark:border-slate-800">
                <th className="p-4 w-10">
                  <input
                    type="checkbox"
                    checked={selectedKeyIds.length === filteredKeys.length && filteredKeys.length > 0}
                    onChange={toggleSelectAll}
                    className="rounded text-teal-600 cursor-pointer"
                  />
                </th>
                <th className="p-4">Access Key</th>
                <th className="p-4">Courses Unlocked</th>
                <th className="p-4">Status</th>
                <th className="p-4">Intended / Redeemed Student</th>
                <th className="p-4">Validity / Expiry</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredKeys.length > 0 ? (
                filteredKeys.map((key) => {
                  const isRevealed = revealedKeys[key.id];
                  const displayKey = isRevealed || key.plainKey
                    ? (key.plainKey || `CLNC-7F3K-9Q2M-${key.keyLast4}`)
                    : `••••-••••-••••-${key.keyLast4}`;

                  const courseNames = key.courseIds.includes('*')
                    ? 'All Academy Courses'
                    : key.courseIds.map(id => courses.find(c => c.id === id)?.title).filter(Boolean).join(', ');

                  // Status badge styling
                  const statusColors: Record<string, string> = {
                    UNUSED: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
                    ACTIVE: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300',
                    EXPIRED: 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300',
                    REVOKED: 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300',
                  };

                  return (
                    <tr
                      key={key.id}
                      className="hover:bg-slate-50/60 dark:hover:bg-slate-800/30 transition"
                    >
                      {/* Checkbox */}
                      <td className="p-4">
                        <input
                          type="checkbox"
                          checked={selectedKeyIds.includes(key.id)}
                          onChange={() => toggleSelectKey(key.id)}
                          className="rounded text-teal-600 cursor-pointer"
                        />
                      </td>

                      {/* Key Code & Reveal */}
                      <td className="p-4 font-mono font-bold text-slate-900 dark:text-white">
                        <div className="flex items-center gap-1.5">
                          <span className="text-teal-700 dark:text-teal-400">{displayKey}</span>
                          <button
                            onClick={() => toggleRevealKey(key.id)}
                            className="p-1 text-slate-400 hover:text-slate-600 transition"
                            title={isRevealed ? 'Mask Key' : 'Reveal Key'}
                          >
                            {isRevealed ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                          </button>
                        </div>
                        {key.note && (
                          <div className="text-[10px] font-sans font-normal text-slate-400 line-clamp-1 mt-0.5">
                            Note: {key.note}
                          </div>
                        )}
                      </td>

                      {/* Course */}
                      <td className="p-4 text-slate-700 dark:text-slate-300 max-w-xs">
                        <div className="font-semibold truncate">{courseNames}</div>
                        <div className="text-[10px] text-slate-400">Max {key.maxDevices} devices</div>
                      </td>

                      {/* Status */}
                      <td className="p-4">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${statusColors[key.status] || ''}`}>
                          {key.status}
                        </span>
                      </td>

                      {/* Student info */}
                      <td className="p-4 text-slate-600 dark:text-slate-400">
                        {key.redeemedBy ? (
                          <div>
                            <span className="font-bold text-slate-800 dark:text-slate-200">
                              {storageService.getUserById(key.redeemedBy)?.name || key.redeemedBy}
                            </span>
                            <div className="text-[10px] text-emerald-600 dark:text-emerald-400">
                              Redeemed on {new Date(key.redeemedAt || key.createdAt).toLocaleDateString()}
                            </div>
                          </div>
                        ) : key.intendedName ? (
                          <div>
                            <span className="font-semibold text-slate-700 dark:text-slate-300">
                              {key.intendedName}
                            </span>
                            <div className="text-[10px] text-slate-400">{key.intendedPhone}</div>
                          </div>
                        ) : (
                          <span className="text-slate-400 italic">Unassigned (General)</span>
                        )}
                      </td>

                      {/* Validity / Expiry */}
                      <td className="p-4 text-slate-600 dark:text-slate-400">
                        {key.expiresAt ? (
                          <div>
                            <div className="font-semibold text-slate-800 dark:text-slate-200">
                              {new Date(key.expiresAt).toLocaleDateString()}
                            </div>
                            <div className="text-[10px] text-slate-400">
                              {Math.ceil((new Date(key.expiresAt).getTime() - Date.now()) / 86400000)} days left
                            </div>
                          </div>
                        ) : (
                          <span>{key.validityDays >= 3650 ? 'Lifetime Access' : `${key.validityDays} days from activation`}</span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Copy */}
                          <button
                            onClick={() => handleCopyKey(key)}
                            className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 hover:text-teal-600 transition"
                            title="Copy Key to Clipboard"
                          >
                            {copiedKeyId === key.id ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                          </button>

                          {/* WhatsApp Share */}
                          <a
                            href={getWhatsAppLink(key)}
                            target="_blank"
                            rel="noreferrer"
                            className="p-1.5 rounded-lg hover:bg-emerald-50 dark:hover:bg-emerald-950/40 text-emerald-600 transition"
                            title="Share on WhatsApp"
                          >
                            <MessageCircle className="w-4 h-4" />
                          </a>

                          {/* Extend Expiry */}
                          {key.status === 'ACTIVE' && (
                            <button
                              onClick={() => setExtendModalKey(key)}
                              className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 hover:text-teal-600 transition"
                              title="Extend Expiry"
                            >
                              <Clock className="w-4 h-4" />
                            </button>
                          )}

                          {/* Add Course */}
                          {key.status !== 'REVOKED' && (
                            <button
                              onClick={() => setAddCourseModalKey(key)}
                              className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 hover:text-teal-600 transition"
                              title="Add Course to Key"
                            >
                              <PlusCircle className="w-4 h-4" />
                            </button>
                          )}

                          {/* Revoke */}
                          {key.status !== 'REVOKED' && (
                            <button
                              onClick={() => setRevokeModalKey(key)}
                              className="p-1.5 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40 text-slate-400 hover:text-rose-600 transition"
                              title="Revoke Key"
                            >
                              <ShieldAlert className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-400">
                    No access keys found matching your search and filter criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ================= GENERATE KEYS MODAL ================= */}
      {genModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
          <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-6 max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setGenModalOpen(false)}
              className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-slate-600"
            >
              <X className="w-5 h-5" />
            </button>

            {generatedBatch ? (
              /* Success Batch Presentation */
              <div className="space-y-5">
                <div className="text-center space-y-2">
                  <div className="w-14 h-14 rounded-2xl bg-emerald-100 dark:bg-emerald-950 text-emerald-600 flex items-center justify-center mx-auto">
                    <Sparkles className="w-8 h-8" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                    Generated {generatedBatch.length} Access Key(s)!
                  </h3>
                  <p className="text-xs text-slate-500">
                    Keys are securely hashed in the database. Share these codes with your trainees via WhatsApp.
                  </p>
                </div>

                <div className="bg-slate-50 dark:bg-slate-800/60 rounded-2xl p-4 max-h-60 overflow-y-auto divide-y divide-slate-200 dark:divide-slate-700/60">
                  {generatedBatch.map((k) => (
                    <div key={k.id} className="py-2.5 flex items-center justify-between text-xs">
                      <div>
                        <span className="font-mono font-bold text-teal-700 dark:text-teal-400 text-sm">
                          {k.plainKey}
                        </span>
                        {k.intendedName && (
                          <span className="text-slate-400 ml-2">({k.intendedName})</span>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleCopyKey(k)}
                          className="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-800 border text-[11px] font-semibold hover:border-teal-500"
                        >
                          Copy
                        </button>
                        <a
                          href={getWhatsAppLink(k)}
                          target="_blank"
                          rel="noreferrer"
                          className="px-2.5 py-1 rounded-lg bg-emerald-600 text-white text-[11px] font-semibold flex items-center gap-1"
                        >
                          <MessageCircle className="w-3.5 h-3.5" />
                          <span>WhatsApp</span>
                        </a>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex items-center justify-between pt-2">
                  <button
                    onClick={() => handleExportCSV(generatedBatch)}
                    className="px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-semibold hover:bg-slate-50 dark:hover:bg-slate-800"
                  >
                    Download Batch CSV
                  </button>
                  <button
                    onClick={() => {
                      setGenModalOpen(false);
                      setGeneratedBatch(null);
                    }}
                    className="px-6 py-2.5 rounded-xl bg-teal-700 text-white text-xs font-bold hover:bg-teal-800"
                  >
                    Done
                  </button>
                </div>
              </div>
            ) : (
              /* Generator Form */
              <form onSubmit={handleGenerateKeys} className="space-y-5">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 flex items-center justify-center font-bold">
                    <KeyRound className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                      Generate New Access Keys
                    </h3>
                    <p className="text-xs text-slate-500">
                      Keys follow the secure pattern: {settings.keyPrefix || 'CLNC'}-XXXX-XXXX-XXXX
                    </p>
                  </div>
                </div>

                {/* Course Selection */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                    Course(s) to Unlock
                  </label>
                  <div className="space-y-1.5 bg-slate-50 dark:bg-slate-800/50 p-3 rounded-2xl border border-slate-200 dark:border-slate-700">
                    <label className="flex items-center gap-2 text-xs font-bold text-teal-800 dark:text-teal-300 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={genCourses.includes('*')}
                        onChange={(e) => {
                          if (e.target.checked) setGenCourses(['*']);
                          else setGenCourses([courses[0]?.id || '']);
                        }}
                        className="rounded text-teal-600"
                      />
                      <span>Master Bundle: All Academy Courses</span>
                    </label>

                    {!genCourses.includes('*') && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2 border-t border-slate-200 dark:border-slate-700">
                        {courses.map((c) => (
                          <label key={c.id} className="flex items-center gap-2 text-xs text-slate-700 dark:text-slate-300 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={genCourses.includes(c.id)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setGenCourses([...genCourses, c.id]);
                                } else {
                                  setGenCourses(genCourses.filter(x => x !== c.id));
                                }
                              }}
                              className="rounded text-teal-600"
                            />
                            <span className="truncate">{c.title}</span>
                          </label>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Validity Period & Max Devices */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                      Validity After Activation
                    </label>
                    <select
                      value={genValidityDays}
                      onChange={(e) => setGenValidityDays(parseInt(e.target.value))}
                      className="w-full py-2.5 px-3 rounded-xl bg-slate-50 dark:bg-slate-800 text-xs border border-slate-200 dark:border-slate-700 font-semibold"
                    >
                      <option value={30}>30 Days Access</option>
                      <option value={90}>90 Days Access</option>
                      <option value={180}>180 Days Access (Standard)</option>
                      <option value={365}>365 Days Access (1 Year)</option>
                      <option value={3650}>Lifetime Access</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                      Max Simultaneous Devices
                    </label>
                    <input
                      type="number"
                      min={1}
                      max={5}
                      value={genMaxDevices}
                      onChange={(e) => setGenMaxDevices(parseInt(e.target.value) || 2)}
                      className="w-full py-2 px-3 rounded-xl bg-slate-50 dark:bg-slate-800 text-xs border border-slate-200 dark:border-slate-700"
                    />
                  </div>
                </div>

                {/* Student Record (Optional) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                      Intended Student Name (Optional)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Dr. Haris Qureshi"
                      value={genIntendedName}
                      onChange={(e) => setGenIntendedName(e.target.value)}
                      className="w-full py-2 px-3 rounded-xl bg-slate-50 dark:bg-slate-800 text-xs border border-slate-200 dark:border-slate-700"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                      Student WhatsApp / Phone (Optional)
                    </label>
                    <input
                      type="text"
                      placeholder="0300 1234567"
                      value={genIntendedPhone}
                      onChange={(e) => setGenIntendedPhone(e.target.value)}
                      className="w-full py-2 px-3 rounded-xl bg-slate-50 dark:bg-slate-800 text-xs border border-slate-200 dark:border-slate-700"
                    />
                  </div>
                </div>

                {/* Quantity & Note */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                      Quantity (1 to 100)
                    </label>
                    <input
                      type="number"
                      min={1}
                      max={100}
                      value={genQuantity}
                      onChange={(e) => setGenQuantity(parseInt(e.target.value) || 1)}
                      className="w-full py-2 px-3 rounded-xl bg-slate-50 dark:bg-slate-800 text-xs border border-slate-200 dark:border-slate-700 font-bold"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                      Internal Office Note (e.g. JazzCash TID)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Paid via JazzCash TID 9988221, Nishtar PGT"
                      value={genNote}
                      onChange={(e) => setGenNote(e.target.value)}
                      className="w-full py-2 px-3 rounded-xl bg-slate-50 dark:bg-slate-800 text-xs border border-slate-200 dark:border-slate-700"
                    />
                  </div>
                </div>

                {/* Submit */}
                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setGenModalOpen(false)}
                    className="px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2.5 rounded-xl bg-teal-700 hover:bg-teal-800 text-white font-bold text-xs shadow-md transition"
                  >
                    Generate {genQuantity} Key(s)
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* ================= REVOKE MODAL ================= */}
      {revokeModalKey && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4">
            <div className="flex items-center gap-3 text-rose-600">
              <ShieldAlert className="w-6 h-6" />
              <h3 className="font-bold text-base text-slate-900 dark:text-white">
                Revoke Access Key {revokeModalKey.keyLast4}
              </h3>
            </div>
            <p className="text-xs text-slate-500">
              Revoking this key immediately deactivates the student enrollment. The student will lose access to all linked lectures.
            </p>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                Reason for Revocation
              </label>
              <textarea
                value={revokeReason}
                onChange={(e) => setRevokeReason(e.target.value)}
                rows={3}
                className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border text-xs"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setRevokeModalKey(null)}
                className="px-4 py-2 rounded-xl border text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmRevoke}
                className="px-4 py-2 rounded-xl bg-rose-600 text-white font-bold text-xs hover:bg-rose-700"
              >
                Confirm Revocation
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= EXTEND EXPIRY MODAL ================= */}
      {extendModalKey && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4">
            <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
              <Clock className="w-5 h-5 text-teal-600" />
              <span>Extend Access Key Expiry</span>
            </h3>
            <p className="text-xs text-slate-500">
              Select additional days to extend for student access:
            </p>
            <div className="grid grid-cols-3 gap-2">
              {[30, 90, 180].map((d) => (
                <button
                  key={d}
                  onClick={() => setExtendDays(d)}
                  className={`p-3 rounded-xl border text-xs font-bold transition ${
                    extendDays === d ? 'border-teal-600 bg-teal-50 dark:bg-teal-950 text-teal-800 dark:text-teal-200' : 'border-slate-200 dark:border-slate-700'
                  }`}
                >
                  +{d} Days
                </button>
              ))}
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button onClick={() => setExtendModalKey(null)} className="px-4 py-2 rounded-xl border text-xs">
                Cancel
              </button>
              <button onClick={handleConfirmExtend} className="px-5 py-2 rounded-xl bg-teal-700 text-white font-bold text-xs">
                Extend Expiry
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= ADD COURSE MODAL ================= */}
      {addCourseModalKey && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4">
            <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
              <PlusCircle className="w-5 h-5 text-teal-600" />
              <span>Add Courses to Key</span>
            </h3>
            <p className="text-xs text-slate-500">
              Select courses to grant to this key:
            </p>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {courses.map((c) => (
                <label key={c.id} className="flex items-center gap-2 text-xs p-2 rounded-lg bg-slate-50 dark:bg-slate-800 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={addCourseSelected.includes(c.id)}
                    onChange={(e) => {
                      if (e.target.checked) setAddCourseSelected([...addCourseSelected, c.id]);
                      else setAddCourseSelected(addCourseSelected.filter(x => x !== c.id));
                    }}
                    className="rounded text-teal-600"
                  />
                  <span>{c.title}</span>
                </label>
              ))}
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button onClick={() => setAddCourseModalKey(null)} className="px-4 py-2 rounded-xl border text-xs">
                Cancel
              </button>
              <button onClick={handleConfirmAddCourses} className="px-5 py-2 rounded-xl bg-teal-700 text-white font-bold text-xs">
                Save Courses
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
