import React, { useState } from 'react';
import { Mail, X, ShieldCheck, Lock, CheckCircle2 } from 'lucide-react';
import PortalPopup from '../../MainSystemComponents/PortalPopup';
import { toast } from '../../MainSystemComponents/Toast';
import axios from 'axios';

const ForgotPasswordModal = ({ isOpen, onClose, initialEmail = '' }) => {
    const [email, setEmail] = useState(initialEmail);

    React.useEffect(() => {
        if (initialEmail) setEmail(initialEmail);
    }, [initialEmail]);
    const [otp, setOtp] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const [isSendingOtp, setIsSendingOtp] = useState(false);
    const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
    const [isResetting, setIsResetting] = useState(false);

    const [otpSent, setOtpSent] = useState(false);
    const [otpVerified, setOtpVerified] = useState(false);

    const handleSendOTP = async () => {
        if (!email) {
            toast({ type: 'error', message: 'Please enter your email address.' });
            return;
        }
        setIsSendingOtp(true);
        try {
            await axios.post('http://localhost:7000/api/auth/forgot-password-otp', { email });
            setOtpSent(true);
            toast({ type: 'success', message: '6-digit OTP sent to your email!' });
        } catch (error) {
            console.error(error);
            toast({ type: 'error', message: error.response?.data?.message || 'Failed to send OTP. Please try again.' });
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
        // We'll actually verify it during the reset call to keep it simple, 
        // or we could add a verification endpoint if it existed.
        // Since the current backend verifies OTP during resetPasswordOtp,
        // we'll just mark it as "verified" locally after a small delay to move the UI.
        setTimeout(() => {
            setIsVerifyingOtp(false);
            setOtpVerified(true);
            toast({ type: 'success', message: 'OTP confirmed locally. Enter your new password.' });
        }, 800);
    };

    const handleResetPassword = async (e) => {
        e.preventDefault();
        if (!otpVerified) {
            toast({ type: 'error', message: 'Please verify your OTP first.' });
            return;
        }
        if (newPassword !== confirmPassword) {
            toast({ type: 'error', message: 'Passwords do not match.' });
            return;
        }
        if (newPassword.length < 6) {
            toast({ type: 'error', message: 'Password must be at least 6 characters.' });
            return;
        }

        setIsResetting(true);
        try {
            await axios.post('http://localhost:7000/api/auth/reset-password-otp', {
                email,
                otp,
                password: newPassword
            });
            toast({ type: 'success', message: 'Password reset successfully!' });
            onClose();
        } catch (error) {
            console.error(error);
            toast({ type: 'error', message: error.response?.data?.message || 'Reset failed. Please try again.' });
        } finally {
            setIsResetting(false);
        }
    };

    return (
        <PortalPopup isOpen={isOpen} onClose={onClose}>
            <div className="w-full max-w-xl bg-[#111827] rounded-[32px] border border-slate-800 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
                {/* Header */}
                <div className="px-10 pt-8 pb-6 flex items-start justify-between relative">
                    <div className="space-y-1">
                        <h2 className="text-xl font-black text-white tracking-tight uppercase">Reset Password</h2>
                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest leading-relaxed">
                            Securely update your account credentials
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-1.5 bg-slate-800/50 hover:bg-slate-800 text-slate-400 hover:text-white rounded-xl transition-all active:scale-90"
                    >
                        <X size={18} />
                    </button>
                </div>

                <div className="h-px bg-slate-800/50 w-full" />

                {/* Form */}
                <form onSubmit={handleResetPassword} className="p-10 space-y-7">
                    {/* Email Row */}
                    <div className="space-y-2.5">
                        <label className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">Email Address</label>
                        <div className="flex gap-3">
                            <div className="relative flex-1 group">
                                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-emerald-500 transition-colors">
                                    <Mail size={16} />
                                </div>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    disabled={otpSent}
                                    placeholder="email@example.com"
                                    className="w-full bg-slate-900/50 border border-slate-800 rounded-xl pl-12 pr-4 py-3.5 text-sm font-bold text-white placeholder:text-slate-700 focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500/40 outline-none transition-all disabled:opacity-50"
                                />
                            </div>
                            <button
                                type="button"
                                onClick={handleSendOTP}
                                disabled={isSendingOtp || otpSent}
                                className="px-5 bg-emerald-500 hover:bg-emerald-600 disabled:bg-slate-800 text-white rounded-xl font-black text-[10px] uppercase tracking-widest transition-all active:scale-95 shrink-0 flex items-center justify-center min-w-[100px]"
                            >
                                {isSendingOtp ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : otpSent ? 'Sent' : 'Send OTP'}
                            </button>
                        </div>
                    </div>

                    {/* OTP Row */}
                    <div className={`space-y-2.5 transition-all duration-500 ${otpSent ? 'opacity-100 translate-y-0' : 'opacity-30 pointer-events-none'}`}>
                        <label className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">Verification Code</label>
                        <div className="flex gap-3">
                            <div className="relative flex-1 group">
                                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-emerald-500 transition-colors">
                                    <ShieldCheck size={16} />
                                </div>
                                <input
                                    type="text"
                                    value={otp}
                                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                    disabled={otpVerified}
                                    placeholder="6-digit OTP"
                                    className="w-full bg-slate-900/50 border border-slate-800 rounded-xl pl-12 pr-4 py-3.5 text-sm font-bold text-white placeholder:text-slate-700 focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500/40 outline-none transition-all disabled:opacity-50"
                                />
                            </div>
                            <button
                                type="button"
                                onClick={handleVerifyOTP}
                                disabled={isVerifyingOtp || otpVerified || !otpSent}
                                className="px-5 bg-indigo-500 hover:bg-indigo-600 disabled:bg-slate-800 text-white rounded-xl font-black text-[10px] uppercase tracking-widest transition-all active:scale-95 shrink-0 flex items-center justify-center min-w-[100px]"
                            >
                                {isVerifyingOtp ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : otpVerified ? 'Verified' : 'Verify OTP'}
                            </button>
                        </div>
                    </div>

                    {/* Password Fields */}
                    <div className={`space-y-5 transition-all duration-500 ${otpVerified ? 'opacity-100 translate-y-0' : 'opacity-30 pointer-events-none'}`}>
                        <div className="space-y-2.5">
                            <label className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">New Password</label>
                            <div className="relative group">
                                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-emerald-500 transition-colors">
                                    <Lock size={16} />
                                </div>
                                <input
                                    type="password"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    placeholder="••••••••"
                                    className="w-full bg-slate-900/50 border border-slate-800 rounded-xl pl-12 pr-4 py-3.5 text-sm font-bold text-white placeholder:text-slate-700 focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500/40 outline-none transition-all"
                                />
                            </div>
                        </div>

                        <div className="space-y-2.5">
                            <label className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">Confirm Password</label>
                            <div className="relative group">
                                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-emerald-500 transition-colors">
                                    <Lock size={16} />
                                </div>
                                <input
                                    type="password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    placeholder="••••••••"
                                    className="w-full bg-slate-900/50 border border-slate-800 rounded-xl pl-12 pr-4 py-3.5 text-sm font-bold text-white placeholder:text-slate-700 focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500/40 outline-none transition-all"
                                />
                            </div>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={isResetting || !otpVerified}
                        className="w-full bg-emerald-500 hover:bg-emerald-600 disabled:bg-slate-800 text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg shadow-emerald-500/10 transition-all active:scale-[0.98] flex items-center justify-center gap-3 mt-4"
                    >
                        {isResetting ? (
                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                            <>
                                <CheckCircle2 size={18} />
                                Update Password
                            </>
                        )}
                    </button>
                </form>
            </div>
        </PortalPopup>
    );
};

export default ForgotPasswordModal;