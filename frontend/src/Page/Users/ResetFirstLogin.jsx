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
      setTimeout(() => navigate("/home"), 1000); // useNavigate redirect [web:438]
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

        <div className="mb-8 w-full relative">
          <input
            type={showConfirm ? "text" : "password"}
            placeholder="Confirm Password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-4 py-3 pr-16"
          />
          <button
            type="button"
            onClick={() => setShowConfirm((prev) => !prev)}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-gray-400"
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

export default ResetFirstLogin;
