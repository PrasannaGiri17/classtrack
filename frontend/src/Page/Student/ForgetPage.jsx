import React from "react";
import mainlogo from '../../Assests/temp-logo.png'
import forget from "../../Assests/forget.png";

const ForgetPage = () => {
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
          className="mb-6 w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-800 placeholder:text-gray-400 focus:border-[#4CAF50] focus:outline-none focus:ring-2 focus:ring-[#4CAF50]/20"
        />

        <button
          type="button"
          className="h-14 w-[200px] max-w-sm rounded-full bg-[#28A745] text-white"
        >
          Reset Password
        </button>
      </div>
    </div>
  );
};

export default ForgetPage;
