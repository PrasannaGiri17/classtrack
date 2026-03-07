import React, { useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import mainlogo from "../../Assests/temp-logo.png";
import reset from "../../Assests/reset.png";
import FailedPopup from "../../Components/SmallerComponents/FailedPopup";

const ResetPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [popupMessage, setPopupMessage] = useState("");
  const [popupType, setPopupType] = useState("error");
  const [loading, setLoading] = useState(false);

  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const token = searchParams.get("token");
  const email = searchParams.get("email");

  const handleReset = async () => {
    if (!password || !confirm) {
      setPopupType("error");
      setPopupMessage("Please fill both password fields.");
      return;
    }
    if (password !== confirm) {
      setPopupType("error");
      setPopupMessage("Passwords do not match.");
      return;
    }

    // Password validation logic
    const minLength = 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    if (password.length < minLength) {
      setPopupType("error");
      setPopupMessage(`Password must be at least ${minLength} characters.`);
      return;
    }
    if (!hasUpperCase || !hasLowerCase || !hasNumber || !hasSpecialChar) {
      setPopupType("error");
      setPopupMessage("Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character.");
      return;
    }
    if (!token || !email) {
      setPopupType("error");
      setPopupMessage("Invalid or missing reset link.");
      return;
    }

    try {
      setLoading(true);
      const res = await fetch(
        `http://localhost:7000/api/auth/reset-password/${token}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        }
      );

      const text = await res.text();
      const data = text ? JSON.parse(text) : {};

      if (!res.ok) {
        setPopupType("error");
        setPopupMessage(data.message || "Failed to reset password.");
        return;
      }

      setPopupType("success");
      setPopupMessage("Password reset successful. You can now log in.");
      setTimeout(() => navigate("/"), 2000);
    } catch (err) {
      setPopupType("warning");
      setPopupMessage("Server error, please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white">
      {/* Logo */}
      <div className="absolute left-10 top-8 flex items-center gap-3">
        <img
          src={mainlogo}
          alt="ClassTrack logo"
          className="h-16 w-auto object-contain"
        />
      </div>

      {/* Center card */}
      <div className="w-full max-w-xl flex flex-col items-center px-4 text-center">
        <img
          src={reset}
          alt="Reset Password"
          className="mx-auto mb-8 w-full max-w-md"
        />

        <h1 className="mb-6 text-2xl font-semibold text-gray-800">
          Reset Password
        </h1>

        {/* New password */}
        <div className="mb-4 w-full relative">
          <input
            type={showPassword ? "text" : "password"}
            placeholder="New Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-4 py-3 pr-16 text-gray-800 placeholder:text-gray-400 focus:border-[#4CAF50] focus:outline-none focus:ring-2 focus:ring-[#4CAF50]/20"
          />
          <button
            type="button"
            onClick={() => setShowPassword((prev) => !prev)}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-gray-400 hover:text-gray-600"
          >
            {showPassword ? "hide" : "show"}
          </button>
        </div>

        <div className="mb-8 w-full text-left bg-gray-50 p-4 rounded-lg border border-gray-100">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3 text-center sm:text-left">Password Requirements</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-2">
            <RequirementItem label="8+ Characters" met={password.length >= 8} />
            <RequirementItem label="Uppercase (A-Z)" met={/[A-Z]/.test(password)} />
            <RequirementItem label="Lowercase (a-z)" met={/[a-z]/.test(password)} />
            <RequirementItem label="Number (0-9)" met={/[0-9]/.test(password)} />
            <RequirementItem label="Special Character" met={/[!@#$%^&*(),.?":{}|<>]/.test(password)} />
          </div>
          <p className="mt-4 text-[9px] text-gray-400 italic text-center sm:text-left">Recommended: 12-16 characters for maximum security.</p>
        </div>

        {/* Confirm password */}
        <div className="mb-8 w-full relative">
          <input
            type={showConfirm ? "text" : "password"}
            placeholder="Confirm Password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-4 py-3 pr-16 text-gray-800 placeholder:text-gray-400 focus:border-[#4CAF50] focus:outline-none focus:ring-2 focus:ring-[#4CAF50]/20 transition-all font-semibold"
          />
          <button
            type="button"
            onClick={() => setShowConfirm((prev) => !prev)}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-gray-400 hover:text-gray-600"
          >
            {showConfirm ? "hide" : "show"}
          </button>
        </div>

        <button
          type="button"
          onClick={handleReset}
          disabled={loading}
          className="h-14 w-[200px] rounded-full bg-[#28A745] text-white font-semibold disabled:opacity-60"
        >
          {loading ? "Saving..." : "Reset Password"}
        </button>
      </div>

      <FailedPopup
        message={popupMessage}
        type={popupType}
        duration={5000}
        onClose={() => setPopupMessage("")}
      />
    </div>
  );
};

const RequirementItem = ({ label, met }) => (
  <div className="flex items-center gap-2">
    <div className={`w-1.5 h-1.5 rounded-full ${met ? 'bg-green-500' : 'bg-gray-300'}`} />
    <span className={`text-[11px] font-medium ${met ? 'text-green-600' : 'text-gray-500'}`}>{label}</span>
  </div>
);

export default ResetPage;
