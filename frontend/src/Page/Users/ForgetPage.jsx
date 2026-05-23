import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import mainlogo from "../../Assests/1.png";
import forget from "../../Assests/forget.png";
import FailedPopup from "../../Components/SmallerComponents/FailedPopup";

const ForgetPage = () => {
  const [email, setEmail] = useState("");
  const [popupMessage, setPopupMessage] = useState("");
  const [popupType, setPopupType] = useState("error");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleResetRequest = async () => {
    if (!email.trim()) {
      setPopupType("error");
      setPopupMessage("Email is required.");
      return;
    }

    try {
      setLoading(true);
      const res = await fetch(
        "http://localhost:7000/api/auth/forgot-password",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email }),
        }
      );

      const text = await res.text();
      const data = text ? JSON.parse(text) : {};

      if (!res.ok) {
        if (res.status === 404 && data.message === "EMAIL_NOT_FOUND") {
          setPopupType("error");
          setPopupMessage("Email not found.");
          return;
        }
        setPopupType("warning");
        setPopupMessage(data.message || "Failed to send reset link.");
        return;
      }

      setPopupType("success");
      setPopupMessage("Reset link sent to your email.");

      // redirect to /login after 6 seconds
      setTimeout(() => {
        navigate("/login");
      }, 4000);
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
          src={forget}
          alt="Forget Password"
          className="mx-auto mb-8 w-full max-w-md"
        />

        <h1 className="mb-3 text-2xl font-semibold text-gray-800">
          Forgot your password?
        </h1>

        <p className="mb-8 text-sm text-gray-600">
          Don’t worry! We are here to help you. Enter your email address below
          to reset your password.
        </p>

        <input
          type="email"
          placeholder="Email Address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="mb-6 w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-800 placeholder:text-gray-400 focus:border-[#4CAF50] focus:outline-none focus:ring-2 focus:ring-[#4CAF50]/20"
        />

        <button
          type="button"
          onClick={handleResetRequest}
          disabled={loading}
          className="h-14 w-[200px] max-w-sm rounded-full bg-[#28A745] text-white disabled:opacity-60"
        >
          {loading ? "Sending..." : "Reset Password"}
        </button>
      </div>

      <FailedPopup
        message={popupMessage}
        type={popupType}
        duration={4000}
        onClose={() => setPopupMessage("")}
      />
    </div>
  );
};

export default ForgetPage;
