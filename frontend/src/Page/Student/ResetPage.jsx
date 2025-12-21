import React, { useState } from "react";
import mainlogo from "../../Assests/temp-logo.png";
import reset from "../../Assests/reset.png";

const ResetPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

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

        {/* Confirm password */}
        <div className="mb-8 w-full relative">
          <input
            type={showConfirm ? "text" : "password"}
            placeholder="Confirm Password"
            className="w-full rounded-lg border border-gray-300 px-4 py-3 pr-16 text-gray-800 placeholder:text-gray-400 focus:border-[#4CAF50] focus:outline-none focus:ring-2 focus:ring-[#4CAF50]/20"
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
          className="h-14 w-[200px] rounded-full bg-[#28A745] text-white font-semibold"
        >
          Reset Password
        </button>
      </div>
    </div>
  );
};

export default ResetPage;
