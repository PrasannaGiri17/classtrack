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
  Trash2,
} from "lucide-react";
import PortalPopup from "../../MainSystemComponents/PortalPopup";
import ConfirmDialog from "../../MainSystemComponents/ConfirmDialog";
import { toast } from "../../MainSystemComponents/Toast";

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
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);
  const [contactToDeleteIndex, setContactToDeleteIndex] = useState(null);
  const [isDirectDelete, setIsDirectDelete] = useState(false);

  // Fixed phone lines mapping (core requirements)
  const fixedLines = [
    { label: 'Main Office Number', icon: Phone },
    { label: "Principal's Office (Optional)", icon: Phone },
    { label: 'Admission Helpline', icon: Phone },
    { label: 'Emergency Contact', icon: Phone },
  ];

  // Initialize temp state with fixed structure if empty
  const [tempPhones, setTempPhones] = useState([]);

  const [isUploading, setIsUploading] = useState(false);

  // Sync and ensure core structure
  useEffect(() => {
    if (isPhoneModalOpen) {
      // Safety: conversion of any legacy strings to objects
      const existing = (config?.phoneNumbers || []).map(p =>
        typeof p === 'string' ? { label: 'Phone', number: p } : p
      );

      const initialized = [...existing];

      // Ensure at least the 4 core lines exist
      while (initialized.length < 4) {
        initialized.push({ label: fixedLines[initialized.length].label, number: '' });
      }

      setTempPhones(initialized);
    }
  }, [isPhoneModalOpen, config?.phoneNumbers]);

  const addCustomContact = () => {
    setTempPhones([...tempPhones, { label: 'Other Contact', number: '' }]);
  };

  const attemptRemoveContact = (index) => {
    setContactToDeleteIndex(index);
    setIsDirectDelete(false);
    setIsConfirmDialogOpen(true);
  };

  const confirmRemoveContact = () => {
    if (contactToDeleteIndex !== null) {
      if (isDirectDelete) {
        const updated = (config.phoneNumbers || []).filter((_, i) => i !== contactToDeleteIndex);
        onUpdate({ phoneNumbers: updated });
        setIsDirectDelete(false);
      } else {
        setTempPhones(tempPhones.filter((_, i) => i !== contactToDeleteIndex));
      }
      setContactToDeleteIndex(null);
      setIsConfirmDialogOpen(false);
      toast({ type: 'success', message: 'Contact line removed successfully!' });
    }
  };

  const toTitleCase = (str) => {
    if (!str) return "";
    return str.toLowerCase().split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  };

  const formatLabel = (label) => {
    if (!label) return "Contact";
    return toTitleCase(label.split(' (')[0]);
  };

  const handlePhoneSave = () => {
    // Filter out entries where the phone number is empty
    const activePhones = tempPhones.filter((p) => p.number && p.number.trim() !== "");

    // Validate 10 digits for all active entries
    const invalidEntry = activePhones.find(p => p.number.length !== 10);
    if (invalidEntry) {
      toast({
        type: 'error',
        message: `The number for "${invalidEntry.label || 'Contact'}" must be exactly 10 digits.`
      });
      return;
    }

    // Check for duplicates
    const numbers = activePhones.map(p => p.number);
    const hasDuplicates = numbers.some((val, i) => numbers.indexOf(val) !== i);
    if (hasDuplicates) {
      toast({
        type: 'error',
        message: 'Duplicate phone numbers identified. Please provide unique contact lines.'
      });
      return;
    }

    onUpdate({ phoneNumbers: activePhones });
    setIsPhoneModalOpen(false);
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


  const socialPlatforms = [
    { id: "tiktok", icon: Music, placeholder: "tiktok.com/@academy" },
    { id: "facebook", icon: Facebook, placeholder: "facebook.com/academy" },
    { id: "instagram", icon: Instagram, placeholder: "instagram.com/academy" },
  ];

  return (
    <div className="space-y-10 relative">
      <div className="max-w-6xl mx-auto pb-20">
        <div className="bg-white dark:bg-slate-900 p-8 md:p-12 rounded-[32px] border border-slate-100 dark:border-slate-800 shadow-sm space-y-10 h-auto overflow-visible">
          {/* Section 0: Header with Logo and Title */}
          <div className="flex flex-col md:flex-row gap-10 items-center md:items-start">
            <div className="relative group cursor-pointer w-44 h-44 shrink-0">
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

            <div className="flex-1 space-y-4 pt-4 text-center md:text-left">
              <div className="space-y-2">
                <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight leading-none">
                  School Information
                </h2>
                <p className="text-base font-medium text-slate-400 leading-relaxed max-w-xl">
                  Update your school&apos;s official identity, including name, logo, address, and contact information.
                </p>
              </div>
              <div className="flex flex-wrap justify-center md:justify-start gap-4 pt-2">
                <div className="px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-[10px] font-black text-emerald-600 dark:text-emerald-400 tracking-wider">
                  Official Profile
                </div>
              </div>
            </div>
          </div>

          <div className="h-px bg-slate-100 dark:bg-slate-800" />

          {/* Section 1: Core Institutional Details */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-12 gap-y-8">
            <div className="space-y-8 col-span-1 lg:col-span-2">
              <div className="space-y-3">
                <label className="text-[11px] font-bold text-slate-400 tracking-wider ml-1">
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
                <label className="text-[11px] font-bold text-slate-400 tracking-wider ml-1">
                  School Motto
                </label>
                <input
                  type="text"
                  placeholder="e.g., Knowledge is Power"
                  value={config.motto || ""}
                  onChange={(e) => onUpdate({ motto: e.target.value })}
                  className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-800/50 border-none rounded-2xl text-base font-medium italic dark:text-white focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all"
                />
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-[11px] font-bold text-slate-400 tracking-wider ml-1">
                Principal&apos;s Full Name
              </label>
              <input
                type="text"
                placeholder="Dr. John Doe"
                value={config.principalName || ""}
                onChange={(e) => onUpdate({ principalName: e.target.value })}
                className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-800/50 border-none rounded-2xl text-sm font-bold dark:text-white focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-3">
                <label className="text-[11px] font-bold text-slate-400 tracking-wider ml-1">
                  Established Year
                </label>
                <input
                  type="text"
                  placeholder="20XX"
                  value={config.establishedYear || ""}
                  onChange={(e) => onUpdate({ establishedYear: e.target.value })}
                  className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-800/50 border-none rounded-2xl text-sm font-bold dark:text-white focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all"
                />
              </div>
              <div className="space-y-3">
                <label className="text-[11px] font-bold text-slate-400 tracking-wider ml-1">
                  Affiliation
                </label>
                <input
                  type="text"
                  placeholder="NEB, CBSE, Cambridge"
                  value={config.affiliation || ""}
                  onChange={(e) => onUpdate({ affiliation: e.target.value })}
                  className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-800/50 border-none rounded-2xl text-sm font-bold dark:text-white focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all"
                />
              </div>
            </div>

            <div className="space-y-3 col-span-1 lg:col-span-2">
              <label className="text-[11px] font-bold text-slate-400 tracking-wider ml-1">
                School Address
              </label>
              <textarea
                rows={2}
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
              <h3 className="text-base font-black text-slate-900 dark:text-white tracking-tight">
                Contact & Connectivity
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Email */}
              <div className="space-y-3">
                <label className="text-[11px] font-bold text-slate-400 tracking-wider ml-1">
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

              {/* Website */}
              <div className="space-y-3">
                <label className="text-[11px] font-bold text-slate-400 tracking-wider ml-1">
                  School Website
                </label>
                <div className="relative group">
                  <Globe
                    className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-500 transition-colors"
                    size={18}
                  />
                  <input
                    type="url"
                    placeholder="https://www.yourschool.com"
                    value={config.website || ""}
                    onChange={(e) => onUpdate({ website: e.target.value })}
                    className="w-full pl-14 pr-6 py-4 bg-slate-50 dark:bg-slate-800/50 border-none rounded-2xl text-sm font-semibold dark:text-white focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all"
                  />
                </div>
              </div>
            </div>

            {/* Phone Numbers Display */}
            <div className="space-y-4">
              <div className="flex items-center justify-between px-1">
                <label className="text-[11px] font-bold text-slate-400 tracking-wider">
                  Phone Registers
                </label>
                <button
                  type="button"
                  onClick={() => setIsPhoneModalOpen(true)}
                  className="flex items-center gap-2 text-[10px] font-black text-emerald-600 dark:text-emerald-400 tracking-wider hover:underline"
                >
                  <Plus size={14} /> Setup Phone Lines
                </button>
              </div>

              <div className="flex flex-wrap gap-4">
                {(config.phoneNumbers?.length > 0 ? config.phoneNumbers : fixedLines).map((phone, idx) => (
                  <div
                    key={idx}
                    className="group/card flex flex-col gap-2.5 p-6 bg-slate-50 dark:bg-slate-800/50 rounded-3xl border border-transparent hover:border-emerald-500/20 hover:shadow-xl hover:shadow-emerald-500/5 transition-all min-w-[240px] flex-1 relative"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-emerald-500/10 rounded-xl flex items-center justify-center">
                          <Phone size={16} className="text-emerald-500" />
                        </div>
                        <span className="text-[10px] font-black text-slate-400 tracking-widest">
                          {formatLabel(phone.label)}
                        </span>
                      </div>

                      {config.phoneNumbers?.length > 0 && (
                        <div className="flex items-center gap-1 opacity-0 group-hover/card:opacity-100 transition-all duration-300">
                          <button
                            type="button"
                            onClick={() => setIsPhoneModalOpen(true)}
                            className="p-1.5 hover:bg-emerald-500/10 rounded-lg text-slate-400 hover:text-emerald-500 transition-all active:scale-95"
                            title="Edit Contacts"
                          >
                            <Edit3 size={14} />
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setContactToDeleteIndex(idx);
                              setIsDirectDelete(true);
                              setIsConfirmDialogOpen(true);
                            }}
                            className="p-1.5 hover:bg-rose-500/10 rounded-lg text-slate-400 hover:text-rose-500 transition-all active:scale-95"
                            title="Delete Contact"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      )}
                    </div>
                    <span className="text-lg font-bold text-slate-700 dark:text-slate-200 truncate pl-1">
                      {phone.number || "Not Set"}
                    </span>
                  </div>
                )
                )}
              </div>
            </div>

            {/* Social Media Inputs */}
            <div className="space-y-4">
              <label className="text-[11px] font-bold text-slate-400 tracking-wider ml-1">
                Social Media
              </label>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
              className="flex items-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl font-bold tracking-wider shadow-lg shadow-emerald-600/20 transition-all hover:scale-105 active:scale-95 text-xs"
            >
              {isLoading && <Loader2 size={16} className="animate-spin" />}
              {isLoading ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </div>
      </div>

      {/* Phone Number Setup Modal */}
      <PortalPopup isOpen={isPhoneModalOpen} onClose={() => setIsPhoneModalOpen(false)}>
        <div
          className="bg-white dark:bg-slate-900 w-full max-w-4xl rounded-[40px] shadow-2xl border border-slate-100 dark:border-slate-800 animate-in zoom-in-95 duration-200 overflow-hidden flex flex-col"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="px-10 py-8 border-b border-slate-50 dark:border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-emerald-500 rounded-2xl flex items-center justify-center text-white shadow-lg">
                <Phone size={24} />
              </div>
              <div>
                <h3 className="text-xl font-black text-slate-900 dark:text-white leading-none">
                  Phone Setup
                </h3>
                <p className="text-[10px] font-bold text-slate-400 tracking-widest mt-1.5">
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

          {/* Specific Lines Inputs */}
          <div className="p-10 pb-4 space-y-8 overflow-y-auto max-h-[60vh]">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-8">
              {tempPhones.map((phone, idx) => (
                <div
                  key={idx}
                  className="space-y-3 p-4 bg-slate-50/50 dark:bg-slate-800/30 rounded-3xl border border-transparent hover:border-emerald-500/10 transition-all relative group/item"
                >
                  <div className="flex items-center justify-between ml-1">
                    <input
                      type="text"
                      value={phone.label}
                      onChange={(e) => {
                        const updated = [...tempPhones];
                        updated[idx].label = toTitleCase(e.target.value);
                        setTempPhones(updated);
                      }}
                      className="bg-transparent border-none p-0 text-xs font-black text-emerald-500 tracking-widest outline-none focus:ring-0 w-full"
                      placeholder="Contact Name..."
                    />

                    <button
                      onClick={() => attemptRemoveContact(idx)}
                      className="opacity-0 group-hover/item:opacity-100 text-rose-500 hover:text-rose-600 transition-all p-1"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>

                  <div className="relative group">
                    <Phone
                      className="absolute left-5 top-1/2 -translate-y-1/2 text-emerald-500/40 group-focus-within:text-emerald-500 transition-colors"
                      size={14}
                    />
                    <input
                      type="tel"
                      placeholder="10 Digit Number"
                      value={phone.number}
                      onChange={(e) => {
                        const val = e.target.value.replace(/\D/g, '').slice(0, 10);
                        const updated = [...tempPhones];
                        updated[idx].number = val;
                        setTempPhones(updated);
                      }}
                      className="w-full pl-12 pr-6 py-4 bg-white dark:bg-slate-800 border-none rounded-2xl text-sm font-bold dark:text-white shadow-sm focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all"
                    />
                  </div>
                </div>
              ))}

              {/* Add Button as a Card */}
              <button
                type="button"
                onClick={addCustomContact}
                className="flex flex-col items-center justify-center gap-2 p-4 bg-slate-50/50 dark:bg-slate-800/20 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-3xl text-slate-400 hover:text-emerald-500 hover:border-emerald-500/50 hover:bg-emerald-500/5 transition-all group h-full min-h-[106px]"
              >
                <div className="w-9 h-9 bg-white dark:bg-slate-800 rounded-xl flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                  <Plus size={18} />
                </div>
                <span className="text-[9px] font-black tracking-widest text-slate-500 group-hover:text-emerald-600">Add Line</span>
              </button>
            </div>
          </div>

          <div className="px-10 py-8 bg-slate-50/50 dark:bg-slate-900 border-t border-slate-50 dark:border-slate-800 flex items-center justify-end gap-4">
            <button
              type="button"
              onClick={() => setIsPhoneModalOpen(false)}
              className="px-8 py-4 rounded-2xl text-[10px] font-black text-slate-400 tracking-widest hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={handlePhoneSave}
              className="flex items-center gap-3 px-10 py-4 bg-emerald-600 text-white rounded-[20px] font-black text-xs tracking-widest shadow-xl shadow-emerald-600/20 hover:scale-105 active:scale-95 transition-all"
            >
              <CheckCircle2 size={18} /> Save Phone Numbers
            </button>
          </div>
        </div>
      </PortalPopup>

      <ConfirmDialog
        isOpen={isConfirmDialogOpen}
        onClose={() => {
          setIsConfirmDialogOpen(false);
          setContactToDeleteIndex(null);
        }}
        onConfirm={confirmRemoveContact}
        title="Remove Contact"
        message="Are you sure you want to remove this contact line? This action cannot be undone."
      />
    </div>
  );
};

export default InstitutionalView;
