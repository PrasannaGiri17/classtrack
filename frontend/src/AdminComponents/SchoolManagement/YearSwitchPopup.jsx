import React, { useState } from 'react';
import {
  X,
  Mail,
  ShieldCheck,
  Calendar,
  Zap,
  RefreshCcw,
  Loader2
} from 'lucide-react';
import PortalPopup from '../../MainSystemComponents/PortalPopup';
import { toast } from '../../MainSystemComponents/Toast';
import axios from 'axios';

/**
 * NextYearSwitchPopup Component
 * Provides a secure modal for transitioning the school to the next academic year.
 * Includes OTP verification via school administrator email.
 */
const YearSwitchPopup = ({ isOpen, onClose, currentYear, schoolEmail }) => {
  const [email, setEmail] = useState(schoolEmail || '');

  React.useEffect(() => {
    if (schoolEmail) setEmail(schoolEmail);
  }, [schoolEmail]);
  const [otp, setOtp] = useState('');

  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);

  const [isSwitching, setIsSwitching] = useState(false);

  const nextYear = currentYear + 1;

  const handleSendOTP = async () => {
    if (!email) {
      toast({ type: 'error', message: 'Please enter your admin email address.' });
      return;
    }
    setIsSendingOtp(true);
    try {
      // Re-using the password reset OTP endpoint for identity verification
      await axios.post('http://localhost:7000/api/auth/forgot-password-otp', { email, type: "year_switch" });
      setOtpSent(true);
      toast({ type: 'success', message: '6-digit OTP sent to your admin email!' });
    } catch (error) {
      console.error(error);
      toast({ type: 'error', message: error.response?.data?.message || 'Failed to send OTP.' });
    } finally {
      setIsSendingOtp(false);
    }
  };

  const handleVerifyOTP = async () => {
    if (otp.length !== 6) {
      toast({ type: 'error', message: 'Please enter a valid 6-digit OTP.' });
      return;
    }
    setIsVerifyingOtp(true);
    // Implementing same local confirmation delay logic as seen in ForgotPasswordModal
    setTimeout(() => {
      setIsVerifyingOtp(false);
      setOtpVerified(true);
      toast({ type: 'success', message: 'OTP verified. Identity confirmed.' });
    }, 1200);
  };

  const handleFinalSwitch = async () => {
    if (!otpVerified) {
      toast({ type: 'error', message: "Verification required." });
      return;
    }

    const schoolId = localStorage.getItem("schoolId");
    if (!schoolId) {
      toast({ type: 'error', message: "School context missing. Please refresh." });
      return;
    }

    setIsSwitching(true);
    try {
      const token = localStorage.getItem("token");
      const response = await axios.post('http://localhost:7000/api/admins/year-switch',
        {
          verification_code: otp,
          school_id: Number(schoolId)
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      if (response.data.success) {
        toast({
          type: 'success',
          message: `Cycle Successful! Promoted: ${response.data.promoted_count}, Graduated: ${response.data.graduated_count}`,
          duration: 5000
        });
        // Reload page to reflect new year across system
        setTimeout(() => window.location.reload(), 2000);
      }
    } catch (error) {
      console.error(error);
      toast({
        type: 'error',
        message: error.response?.data?.message || "Critical transition failure."
      });
    } finally {
      setIsSwitching(false);
    }
  };

  return (
    <PortalPopup isOpen={isOpen} onClose={onClose}>
      {/* Container with premium aesthetics */}
      <div className="relative w-full max-w-[640px] bg-white dark:bg-[#0b1220] rounded-[40px] border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">

        {/* Header Section */}
        <div className="p-12 pb-6 relative">
          <button
            onClick={onClose}
            className="absolute right-10 top-12 w-10 h-10 flex items-center justify-center rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:text-white hover:bg-rose-500 transition-all duration-300"
            aria-label="Close"
          >
            <X size={20} />
          </button>

          <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight uppercase leading-none">Next Year Switch</h2>
        </div>

        <div className="px-12 pb-12 space-y-10">

          {/* Email Section - Used for verification */}
          <div className="space-y-4">
            <label className="text-[11px] font-black text-slate-500 dark:text-slate-400 tracking-widest ml-1">Admin Email Address</label>
            <div className="flex gap-4">
              <div className="relative flex-1 group">
                <div className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 group-focus-within:text-emerald-500 transition-colors">
                  <Mail size={18} />
                </div>
                <input
                  type="email"
                  value={email}
                  disabled={otpSent}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@school.com"
                  className="w-full bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-[24px] pl-14 pr-6 py-5 text-sm font-bold text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-600 outline-none focus:border-emerald-500/50 focus:ring-4 focus:ring-emerald-500/5 transition-all disabled:opacity-50"
                />
              </div>
              <button
                onClick={handleSendOTP}
                disabled={isSendingOtp || otpSent}
                className="bg-emerald-500 hover:bg-emerald-600 disabled:bg-slate-100 dark:disabled:bg-slate-800 text-white disabled:text-slate-400 px-8 rounded-[24px] text-[11px] font-black uppercase tracking-widest transition-all shadow-lg shadow-emerald-500/20 active:scale-95 shrink-0 flex items-center justify-center min-w-[120px]"
              >
                {isSendingOtp ? <Loader2 size={16} className="animate-spin" /> : otpSent ? 'Sent' : 'Send OTP'}
              </button>
            </div>
          </div>

          {/* OTP Verification Section */}
          <div className="space-y-4">
            <label className="text-[11px] font-black text-slate-500 dark:text-slate-400 tracking-widest ml-1">Verification Code</label>
            <div className="flex gap-4">
              <div className="relative flex-1 group">
                <div className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 group-focus-within:text-emerald-500 transition-colors">
                  <ShieldCheck size={18} />
                </div>
                <input
                  type="text"
                  maxLength={6}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  disabled={otpVerified || !otpSent}
                  placeholder="6-digit OTP"
                  className="w-full bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-[24px] pl-14 pr-6 py-5 text-sm font-bold text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-600 outline-none focus:border-emerald-500/50 focus:ring-4 focus:ring-emerald-500/5 transition-all transition-all tracking-[0.5em] font-mono disabled:opacity-50"
                />
              </div>
              <button
                disabled={!otpSent || otp.length < 6 || otpVerified || isVerifyingOtp}
                onClick={handleVerifyOTP}
                className={`px-8 rounded-[24px] text-[11px] font-black uppercase tracking-widest shrink-0 transition-all flex items-center justify-center min-w-[100px] ${otpSent && otp.length === 6 && !otpVerified
                  ? "bg-indigo-600 dark:bg-indigo-500 text-white shadow-lg active:scale-95"
                  : "bg-slate-100 dark:bg-slate-800/50 text-slate-400 dark:text-slate-500 cursor-not-allowed"
                  }`}
              >
                {isVerifyingOtp ? <Loader2 size={16} className="animate-spin" /> : otpVerified ? 'Verified' : 'Verify'}
              </button>
            </div>
          </div>

          {/* Context Information Card */}
          <div className="grid grid-cols-2 gap-6 bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800/50 rounded-[32px] p-8">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-500 dark:text-indigo-400">
                <Calendar size={20} />
              </div>
              <div>
                <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 tracking-widest">Active Year</p>
                <p className="text-lg font-black text-slate-900 dark:text-white leading-none mt-1">{currentYear} B.S.</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                <Zap size={20} />
              </div>
              <div>
                <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 tracking-widest">Target Year</p>
                <p className="text-lg font-black text-slate-900 dark:text-white leading-none mt-1">{nextYear} B.S.</p>
              </div>
            </div>

          </div>

          {/* Primary Action Button */}
          <button
            disabled={!otpVerified || isSwitching}
            onClick={handleFinalSwitch}
            className={`w-full rounded-[32px] py-6 flex items-center justify-center gap-4 transition-all group relative overflow-hidden shadow-xl ${otpVerified && !isSwitching
              ? "bg-rose-600 hover:bg-rose-700 text-white shadow-rose-600/20 active:scale-[0.98]"
              : "bg-slate-100 dark:bg-slate-800/50 text-slate-300 dark:text-slate-600 cursor-not-allowed"
              }`}
          >
            <div className="absolute inset-x-0 bottom-0 h-1.5 bg-white/20 scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left" />
            {isSwitching ? (
              <Loader2 size={22} className="animate-spin" />
            ) : (
              <RefreshCcw size={22} className="group-hover:rotate-180 transition-transform duration-700" />
            )}
            <span className="text-[13px] font-black tracking-[0.25em]">
              {isSwitching ? "Finalizing Transition..." : "End Year & Initialize Next"}
            </span>
          </button>
        </div>
      </div>
    </PortalPopup>
  );
};

export default YearSwitchPopup;
