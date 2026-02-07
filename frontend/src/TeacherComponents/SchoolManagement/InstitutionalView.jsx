import React, { useState, useEffect } from "react";
import {
  Edit3,
  Loader2,
  Mail,
  Phone,
  Instagram,
  Facebook,
  Music,
  Plus,
  X,
  CheckCircle2,
  ChevronDown,
  Globe,
} from "lucide-react";

/**
 * Props:
 * config = {
 *  name: string,
 *  address: string,
 *  logo: string,
 *  schoolEmail: string,
 *  phoneNumbers: string[],
 *  socialLinks: { tiktok: string, facebook: string, instagram: string }
 * }
 * onUpdate(updates) => void
 */
const InstitutionalView = ({ config, onUpdate, onSave, isLoading }) => {
  const [isPhoneModalOpen, setIsPhoneModalOpen] = useState(false);
  const [phoneCount, setPhoneCount] = useState(
    (config?.phoneNumbers?.length || 1)
  );
  const [tempPhones, setTempPhones] = useState(
    config?.phoneNumbers?.length ? config.phoneNumbers : [""]
  );
  const [isUploading, setIsUploading] = useState(false);

  // Sync temp state with config when modal opens
  useEffect(() => {
    if (isPhoneModalOpen) {
      setTempPhones(config?.phoneNumbers?.length ? config.phoneNumbers : [""]);
      setPhoneCount(config?.phoneNumbers?.length || 1);
    }
  }, [isPhoneModalOpen, config?.phoneNumbers]);

  const handlePhoneCountChange = (count) => {
    setPhoneCount(count);
    const newPhones = [...tempPhones];

    if (count > newPhones.length) {
      for (let i = newPhones.length; i < count; i++) newPhones.push("");
    } else {
      newPhones.length = count;
    }
    setTempPhones(newPhones);
  };



  const handleImageUpload = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);

    const reader = new FileReader();
    reader.onloadend = () => {
      // Simulate upload delay for effect (optional, or remove)
      setTimeout(() => {
        onUpdate({ logo: reader.result }); // reader.result is the Base64 string
        setIsUploading(false);
      }, 1000);
    };
    reader.onerror = () => {
      console.error("File reading failed");
      setIsUploading(false);
    };
    reader.readAsDataURL(file);
  };

  const handlePhoneSave = () => {
    const validPhones = tempPhones.filter((p) => p.trim() !== "");
    onUpdate({ phoneNumbers: validPhones });
    setIsPhoneModalOpen(false);
  };

  const socialPlatforms = [
    { id: "tiktok", icon: Music, placeholder: "tiktok.com/@academy" },
    { id: "facebook", icon: Facebook, placeholder: "facebook.com/academy" },
    { id: "instagram", icon: Instagram, placeholder: "instagram.com/academy" },
  ];

  return (
    <div className="space-y-10 relative">
      <div className="flex flex-col lg:flex-row gap-10 items-start pb-20">
        {/* Left column - identity card */}
        <div className="w-full lg:w-[280px] shrink-0 flex flex-col items-center lg:items-start space-y-8">
          <div className="relative group cursor-pointer w-44 h-44">
            <div className="w-full h-full rounded-[32px] overflow-hidden shadow-xl ring-4 ring-white dark:ring-slate-900 ring-offset-2 ring-offset-slate-100 dark:ring-offset-slate-800 transition-all duration-500 hover:scale-105 hover:shadow-2xl hover:ring-emerald-500/20 relative z-10">
              <img
                src={config.logo}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                alt="School Logo"
              />

              {/* Anti-gravity Hover Overlay */}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 backdrop-blur-[0px] group-hover:backdrop-blur-sm transition-all duration-500 flex items-center justify-center">
                <div className="absolute opacity-0 group-hover:opacity-100 transform scale-75 group-hover:scale-100 transition-all duration-300 delay-75">
                  <div className="w-10 h-10 bg-white/90 backdrop-blur-md rounded-2xl shadow-2xl flex items-center justify-center text-slate-900 animate-bounce cursor-pointer border border-white/50 group-hover:border-white transition-all">
                    <Edit3 size={18} className="transition-transform group-hover:rotate-6" />
                  </div>
                </div>
              </div>

              {/* Loading Overlay */}
              {isUploading && (
                <div className="absolute inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center animate-in fade-in duration-300">
                  <Loader2 className="w-8 h-8 text-white animate-spin" />
                </div>
              )}
            </div>

            {/* Hidden File Input */}
            <input
              type="file"
              accept="image/*"
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20"
              onChange={handleImageUpload}
              disabled={isUploading}
            />
          </div>

          <div className="w-full space-y-3 text-center lg:text-left">
            <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight leading-none">
              School Information
            </h2>
            <p className="text-xs font-medium text-slate-400 leading-relaxed">
              Update your School&apos;s general Information.
            </p>
          </div>
        </div>

        {/* Right column - Main Configuration Box (NO INNER SCROLL) */}
        <div className="flex-1 w-full space-y-8">
          <div className="bg-white dark:bg-slate-900 p-8 rounded-[32px] border border-slate-100 dark:border-slate-800 shadow-sm space-y-10 h-auto overflow-visible">
            {/* Section 1: Core Details */}
            <div className="space-y-8">
              <div className="space-y-3">
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1">
                  Full School Name

                </label>
                <input
                  type="text"
                  value={config.name}
                  onChange={(e) => onUpdate({ name: e.target.value })}
                  className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-800/50 border-none rounded-2xl text-xl font-bold dark:text-white focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all"
                />
              </div>

              <div className="space-y-3">
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1">
                  School Address
                </label>
                <textarea
                  rows={3}
                  value={config.address}
                  onChange={(e) => onUpdate({ address: e.target.value })}
                  className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-800/50 border-none rounded-2xl text-base font-medium dark:text-white focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all resize-none"
                />
              </div>
            </div>

            <div className="h-px bg-slate-100 dark:bg-slate-800" />

            {/* Section 2: Contact & Social Links */}
            <div className="space-y-8">
              <div className="flex items-center gap-3">
                <Globe size={18} className="text-emerald-500" />
                <h3 className="text-base font-black text-slate-900 dark:text-white uppercase tracking-tight">
                  Contact & Social Links
                </h3>
              </div>

              {/* Email */}
              <div className="space-y-3">
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1">
                  Official School Email
                </label>
                <div className="relative group">
                  <Mail
                    className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-500 transition-colors"
                    size={18}
                  />
                  <input
                    type="email"
                    placeholder="school@example.com"
                    value={config.schoolEmail || ""}
                    onChange={(e) => onUpdate({ schoolEmail: e.target.value })}
                    className="w-full pl-14 pr-6 py-4 bg-slate-50 dark:bg-slate-800/50 border-none rounded-2xl text-sm font-semibold dark:text-white focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all"
                  />
                </div>
              </div>

              {/* Phone Numbers Display */}
              <div className="space-y-4">
                <div className="flex items-center justify-between px-1">
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                    Phone Registers
                  </label>
                  <button
                    type="button"
                    onClick={() => setIsPhoneModalOpen(true)}
                    className="flex items-center gap-2 text-[10px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-wider hover:underline"
                  >
                    <Plus size={14} /> Setup Phone Numbers
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {config.phoneNumbers?.length > 0 ? (
                    config.phoneNumbers.map((phone, idx) => (
                      <div
                        key={idx}
                        className="flex items-center gap-3 px-5 py-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-transparent hover:border-emerald-500/20 transition-all"
                      >
                        <Phone size={14} className="text-emerald-500" />
                        <span className="text-xs font-bold text-slate-600 dark:text-slate-300">
                          {phone}
                        </span>
                      </div>
                    ))
                  ) : (
                    <p className="text-[11px] font-medium text-slate-400 italic px-1">
                      No phone numbers configured.
                    </p>
                  )}
                </div>
              </div>

              {/* Social Media Inputs */}
              <div className="space-y-4">
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1">
                  Social Media
                </label>

                <div className="grid grid-cols-1 gap-4">
                  {socialPlatforms.map((platform) => {
                    const Icon = platform.icon;
                    return (
                      <div key={platform.id} className="relative group">
                        <div className="absolute left-6 top-1/2 -translate-y-1/2 flex items-center justify-center text-emerald-500 bg-emerald-500/10 w-8 h-8 rounded-lg">
                          <Icon size={16} />
                        </div>

                        <input
                          type="url"
                          placeholder={platform.placeholder}
                          value={(config.socialLinks || {})[platform.id] || ""}
                          onChange={(e) =>
                            onUpdate({
                              socialLinks: {
                                ...(config.socialLinks || {}),
                                [platform.id]: e.target.value,
                              },
                            })
                          }
                          className="w-full pl-16 pr-6 py-4 bg-slate-50 dark:bg-slate-800/50 border-none rounded-2xl text-xs font-bold dark:text-white focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all"
                        />
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
            {/* Save Button Action */}
            <div className="pt-6 border-t border-slate-100 dark:border-slate-800 flex justify-end">
              <button
                onClick={onSave}
                disabled={isLoading}
                className="flex items-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl font-bold uppercase tracking-wider shadow-lg shadow-emerald-600/20 transition-all hover:scale-105 active:scale-95 text-xs"
              >
                {isLoading && <Loader2 size={16} className="animate-spin" />}
                {isLoading ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Phone Number Setup Modal */}
      {isPhoneModalOpen && (
        <div
          className="fixed inset-0 z-[120] flex items-center justify-center p-6 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-300"
          onClick={() => setIsPhoneModalOpen(false)}
        >
          <div
            className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-[40px] shadow-2xl border border-slate-100 dark:border-slate-800 animate-in zoom-in-95 duration-200 overflow-hidden flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-10 py-8 border-b border-slate-50 dark:border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-emerald-500 rounded-2xl flex items-center justify-center text-white shadow-lg">
                  <Phone size={24} />
                </div>
                <div>
                  <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase leading-none">
                    Phone Setup
                  </h3>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1.5">
                    Manage Communication Lines
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsPhoneModalOpen(false)}
                className="w-10 h-10 flex items-center justify-center rounded-xl text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
              >
                <X size={24} />
              </button>
            </div>

            {/* NOTE: keeping modal scroll is fine; only right box should not be scrollable */}
            <div className="p-10 space-y-8 overflow-y-auto max-h-[60vh]">
              {/* Count Selector */}
              <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                  How many phone numbers does the school have?
                </label>
                <div className="relative group">
                  <select
                    value={phoneCount}
                    onChange={(e) =>
                      handlePhoneCountChange(parseInt(e.target.value, 10))
                    }
                    className="appearance-none w-full bg-slate-50 dark:bg-slate-800 border-none rounded-2xl px-6 py-4 text-sm font-bold dark:text-white focus:ring-4 focus:ring-emerald-500/10 transition-all cursor-pointer"
                  >
                    {[1, 2, 3, 4, 5].map((n) => (
                      <option key={n} value={n}>
                        {n} {n === 1 ? "Number" : "Numbers"}
                      </option>
                    ))}
                  </select>
                  <ChevronDown
                    size={16}
                    className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none group-hover:text-emerald-500"
                  />
                </div>
              </div>

              {/* Dynamic Inputs */}
              <div className="space-y-5">
                {tempPhones.map((val, idx) => (
                  <div
                    key={idx}
                    className="space-y-2 animate-in slide-in-from-left-2 duration-300"
                    style={{ transitionDelay: `${idx * 50}ms` }}
                  >
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">
                      Line {idx + 1}
                    </label>

                    <div className="relative group">
                      <Phone
                        className="absolute left-5 top-1/2 -translate-y-1/2 text-emerald-500/40 group-focus-within:text-emerald-500 transition-colors"
                        size={14}
                      />
                      <input
                        type="tel"
                        placeholder="+XX XXXXXXXX"
                        value={val}
                        onChange={(e) => {
                          const updated = [...tempPhones];
                          updated[idx] = e.target.value;
                          setTempPhones(updated);
                        }}
                        className="w-full pl-12 pr-6 py-4 bg-slate-50 dark:bg-slate-800 border-none rounded-xl text-sm font-bold dark:text-white focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="px-10 py-8 bg-slate-50/50 dark:bg-slate-900 border-t border-slate-50 dark:border-slate-800 flex items-center justify-end gap-4">
              <button
                type="button"
                onClick={() => setIsPhoneModalOpen(false)}
                className="px-8 py-4 rounded-2xl text-[10px] font-black text-slate-400 uppercase tracking-widest hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handlePhoneSave}
                className="flex items-center gap-3 px-10 py-4 bg-emerald-600 text-white rounded-[20px] font-black text-xs uppercase tracking-widest shadow-xl shadow-emerald-600/20 hover:scale-105 active:scale-95 transition-all"
              >
                <CheckCircle2 size={18} /> Save Phone Numbers
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InstitutionalView;
