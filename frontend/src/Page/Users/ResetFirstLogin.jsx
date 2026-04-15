import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import FailedPopup from "../../Components/SmallerComponents/FailedPopup";

const ResetFirstLogin = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [popupMessage, setPopupMessage] = useState("");
  const [popupType, setPopupType] = useState("error");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleReset = async () => {
    if (!password || !confirm) {
      setPopupType("error");
      setPopupMessage("Please fill both password fields.");
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

    if (password !== confirm) {
      setPopupType("error");
      setPopupMessage("Passwords do not match.");
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) {
      setPopupType("error");
      setPopupMessage("You are not logged in.");
      return;
    }

    try {
      setLoading(true);

      const res = await fetch("http://localhost:7000/api/auth/change-password-first-login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`, // required for protected endpoint [web:498]
        },
        body: JSON.stringify({ password }),
      });

      const text = await res.text();
      const data = text ? JSON.parse(text) : {};

      if (!res.ok) {
        setPopupType("error");
        setPopupMessage(data.message || "Failed to change password.");
        return;
      }

      setPopupType("success");
      setPopupMessage("Password changed successfully.");
      
      // Update AuthContext state and localStorage so App.js doesn't redirect back here
      const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
      const updatedUser = { ...storedUser, mustChangePassword: false };
      localStorage.setItem("user", JSON.stringify(updatedUser));
      
      // We need to trigger a re-render or state update if possible, 
      // but since we navigate away, App.js will pick it up from localStorage if it reloads,
      // or we can just hope the navigate triggers the right check.
      // Actually, updating the state via AuthContext would be best.
      // However, we are about to navigate.

      const role = localStorage.getItem("role");
      setTimeout(() => {
        // Force a page reload or state sync if needed, but navigate should work if we updated localStorage
        if (role === "admin") {
          window.location.href = "/admin"; // Use window.location to ensure state is fresh
        } else if (role === "teacher") {
          window.location.href = "/teacher/dashboard";
        } else if (role === "student") {
          window.location.href = "/student/dashboard";
        } else {
          window.location.href = "/home";
        }
      }, 1000);
    } catch (err) {
      setPopupType("warning");
      setPopupMessage("Server error, please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white">
      <div className="w-full max-w-xl flex flex-col items-center px-4 text-center">
        <h1 className="mb-6 text-2xl font-semibold text-gray-800">
          Change Password (First Login)
        </h1>

        <div className="mb-4 w-full relative">
          <input
            type={showPassword ? "text" : "password"}
            placeholder="New Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-4 py-3 pr-16"
          />
          <button
            type="button"
            onClick={() => setShowPassword((prev) => !prev)}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-gray-400"
          >
            {showPassword ? "hide" : "show"}
          </button>
        </div>

        <div className="mb-4 w-full text-left bg-gray-50 p-4 rounded-lg border border-gray-100">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">Password Requirements</p>
          <div className="grid grid-cols-2 gap-y-2">
            <RequirementItem label="8+ Characters" met={password.length >= 8} />
            <RequirementItem label="Uppercase (A-Z)" met={/[A-Z]/.test(password)} />
            <RequirementItem label="Lowercase (a-z)" met={/[a-z]/.test(password)} />
            <RequirementItem label="Number (0-9)" met={/[0-9]/.test(password)} />
            <RequirementItem label="Special Character" met={/[!@#$%^&*(),.?":{}|<>]/.test(password)} />
          </div>
          <p className="mt-4 text-[9px] text-gray-400 italic">Recommended: 12-16 characters for maximum security.</p>
        </div>

        <div className="mb-8 w-full relative">
          <input
            type={showConfirm ? "text" : "password"}
            placeholder="Confirm Password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-4 py-3 pr-16 focus:ring-2 focus:ring-[#28A745]/20 focus:border-[#28A745] outline-none transition-all"
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
          className="h-14 w-[220px] rounded-full bg-[#28A745] text-white font-semibold disabled:opacity-60"
        >
          {loading ? "Saving..." : "Change Password"}
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

export default ResetFirstLogin;
