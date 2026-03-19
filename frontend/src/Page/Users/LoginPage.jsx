import React from "react";
import UserLoginbox from "../../Components/UserLoginbox";
import mainlogo from "../../Assests/temp-logo.png";
import classpicture from "../../Assests/cover.png";

export default function LoginPage() {
  return (
    // Full width page background 
    <div className="min-h-screen bg-white">
      {/* Center the whole 2-column layout horizontally */}
      <div className="flex min-h-screen w-full">
        {/* Left Side - Green panel (full height, fixed 50%) */}
        <div className="hidden lg:flex lg:w-1/2 bg-[#4CAF50]">
          <div className="mx-auto flex w-full max-w-2xl flex-col px-8 py-16 xl:px-10">
            {/* Logo + Text */}
            <div className="mb-8 flex items-center gap-4">
              <img src={mainlogo} alt="ClassTrack logo" className="h-12 w-auto object-contain" />
              <h2 className="text-3xl font-bold text-white">ClassTrack</h2>
            </div>

            {/* Class Picture */}
            <img src={classpicture || "/placeholder.svg"} alt="Class Picture" className="mb-8 h-auto w-full max-w-lg" />

            {/* Heading */}
            <h1 className="mb-6 max-w-2xl text-3xl font-bold leading-tight text-white">
              Achieve academic success with ClassTrack.
            </h1>

            {/* Description */}
            <p className="max-w-2xl text-base leading-relaxed text-white/90">
              ClassTrack is an online learning platform used by schools, teachers, and students worldwide (including homeschoolers). With ClassTrack, students can learn through engaging interactive videos, take quizzes, and receive diagnostic reports highlighting strengths and areas to improve. It also lets you create custom test papers, access eBooks, and review your own comments from any device.
            </p>
          </div>
        </div>

        {/* Right Side - White panel (full height, fixed 50%) */}
        <div className="flex w-full items-center justify-center bg-white lg:w-1/2">
          <div className="w-full max-w-md px-6 py-8">
            <UserLoginbox />
          </div>
        </div>
      </div>
    </div>
  );
}