import React, { useState } from 'react';
import { storageService } from '../../services/storageService';
import { ClinicSettings } from '../../types';
import { Settings, Save, CheckCircle2, Shield, Phone, MessageCircle, MapPin, KeyRound, Lock } from 'lucide-react';

export const AdminSettings: React.FC = () => {
  const [settings, setSettings] = useState<ClinicSettings>(() =>
    storageService.getClinicSettings()
  );
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    storageService.updateClinicSettings(settings);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
          Academy & Clinic Configuration
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
          Update your Multan clinic branding, offline fee receiving accounts (JazzCash / EasyPaisa), key generation defaults, and video watermark protection.
        </p>
      </div>

      {savedSuccess && (
        <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5" />
          <span className="font-bold">Settings updated and saved successfully!</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6 text-xs">
        {/* Clinic & Doctor Identity */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
            <Shield className="w-4 h-4 text-teal-600" />
            <span>Clinic & Doctor Profile</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                Clinic Name (English)
              </label>
              <input
                type="text"
                required
                value={settings.clinicName}
                onChange={(e) => setSettings({ ...settings, clinicName: e.target.value })}
                className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border dark:border-slate-700 font-semibold"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                Director / Lead Doctor Name
              </label>
              <input
                type="text"
                required
                value={settings.doctorName}
                onChange={(e) => setSettings({ ...settings, doctorName: e.target.value })}
                className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border dark:border-slate-700 font-semibold"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                Doctor Qualifications & Title
              </label>
              <input
                type="text"
                value={settings.doctorTitle}
                onChange={(e) => setSettings({ ...settings, doctorTitle: e.target.value })}
                className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border dark:border-slate-700"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
              Doctor Bio / Faculty Credentials
            </label>
            <textarea
              rows={3}
              value={settings.doctorBio}
              onChange={(e) => setSettings({ ...settings, doctorBio: e.target.value })}
              className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border dark:border-slate-700 leading-relaxed"
            />
          </div>
        </div>

        {/* Contact & Multan Clinic Location */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
            <MapPin className="w-4 h-4 text-teal-600" />
            <span>Contact & Physical Clinic Address</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                WhatsApp Number (without +)
              </label>
              <input
                type="text"
                required
                placeholder="e.g. 923007312345"
                value={settings.whatsappNumber}
                onChange={(e) => setSettings({ ...settings, whatsappNumber: e.target.value })}
                className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border dark:border-slate-700 font-mono font-semibold"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                Phone Number (Display)
              </label>
              <input
                type="text"
                value={settings.phone}
                onChange={(e) => setSettings({ ...settings, phone: e.target.value })}
                className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border dark:border-slate-700 font-mono"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                Official Email
              </label>
              <input
                type="email"
                value={settings.email}
                onChange={(e) => setSettings({ ...settings, email: e.target.value })}
                className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border dark:border-slate-700"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
              Multan Clinic Street Address
            </label>
            <input
              type="text"
              value={settings.address}
              onChange={(e) => setSettings({ ...settings, address: e.target.value })}
              className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border dark:border-slate-700"
            />
          </div>
        </div>

        {/* Offline Payment Information (JazzCash, EasyPaisa, Bank) */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
            <Phone className="w-4 h-4 text-teal-600" />
            <span>Offline Payment Accounts (Students Pay Here)</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                JazzCash Account Number & Title
              </label>
              <input
                type="text"
                value={settings.jazzCashAccount}
                onChange={(e) => setSettings({ ...settings, jazzCashAccount: e.target.value })}
                className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border dark:border-slate-700 font-mono font-bold"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                EasyPaisa Account Number & Title
              </label>
              <input
                type="text"
                value={settings.easyPaisaAccount}
                onChange={(e) => setSettings({ ...settings, easyPaisaAccount: e.target.value })}
                className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border dark:border-slate-700 font-mono font-bold"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
              Bank Account Details (HBL / Allied / Meezan)
            </label>
            <textarea
              rows={2}
              value={settings.bankDetails}
              onChange={(e) => setSettings({ ...settings, bankDetails: e.target.value })}
              className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border dark:border-slate-700 font-mono text-xs"
            />
          </div>
        </div>

        {/* Access Key & Video Protection Settings */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
            <KeyRound className="w-4 h-4 text-teal-600" />
            <span>Access Key & Anti-Piracy Settings</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                Key Prefix (3–5 letters)
              </label>
              <input
                type="text"
                maxLength={5}
                value={settings.keyPrefix}
                onChange={(e) => setSettings({ ...settings, keyPrefix: e.target.value.toUpperCase() })}
                className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border dark:border-slate-700 font-mono font-bold uppercase"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                Default Device Limit
              </label>
              <input
                type="number"
                min={1}
                max={5}
                value={settings.defaultDevicesPerKey}
                onChange={(e) => setSettings({ ...settings, defaultDevicesPerKey: parseInt(e.target.value) || 2 })}
                className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border dark:border-slate-700 font-bold"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                Default Validity (Days)
              </label>
              <input
                type="number"
                value={settings.defaultValidityDays}
                onChange={(e) => setSettings({ ...settings, defaultValidityDays: parseInt(e.target.value) || 180 })}
                className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border dark:border-slate-700 font-bold"
              />
            </div>
          </div>

          <div className="space-y-3 pt-3 border-t border-slate-100 dark:border-slate-800">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={settings.watermarkEnabled}
                onChange={(e) => setSettings({ ...settings, watermarkEnabled: e.target.checked })}
                className="rounded text-teal-600 w-4 h-4"
              />
              <div>
                <span className="font-bold text-slate-900 dark:text-white">
                  Dynamic Moving Anti-Piracy Watermark
                </span>
                <p className="text-[11px] text-slate-500">
                  Displays student’s registered name and mobile number floating across the video every 12 seconds to prevent screen recording.
                </p>
              </div>
            </label>

            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={settings.pauseOnTabBlur}
                onChange={(e) => setSettings({ ...settings, pauseOnTabBlur: e.target.checked })}
                className="rounded text-teal-600 w-4 h-4"
              />
              <div>
                <span className="font-bold text-slate-900 dark:text-white">
                  Pause Video when Tab is Hidden
                </span>
                <p className="text-[11px] text-slate-500">
                  Automatically pauses video playback if the student switches tabs or minimizes the window.
                </p>
              </div>
            </label>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            className="flex items-center gap-2 px-8 py-3.5 rounded-2xl bg-teal-700 hover:bg-teal-800 text-white font-bold text-sm shadow-lg shadow-teal-700/20 transition"
          >
            <Save className="w-4 h-4" />
            <span>Save All Clinic Settings</span>
          </button>
        </div>
      </form>
    </div>
  );
};
