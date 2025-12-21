import React, { useState } from "react";
import googlePhoto from "../Assests/download.png";
import { Link, useNavigate } from "react-router-dom";

const UserLoginbox = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await fetch("http://localhost:7000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      console.log("status", res.status);
      const data = await res.json();

      if (!res.ok) {
        alert(data.message || "Login failed");
        return;
      }

      localStorage.setItem("token", data.token);
      navigate("/test"); // go to /test after login
    } catch (err) {
      alert("Server error, please try again.");
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-white px-4">
      <div className="w-full max-w-md">
        <h1 className="mb-8 text-3xl font-medium text-gray-800">
          Sign in to your account
        </h1>

        <form className="space-y-6" onSubmit={handleSubmit}>
          <div>
            <input
              type="email"
              placeholder="Email Address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-800 placeholder:text-gray-400 focus:border-[#4CAF50] focus:outline-none focus:ring-2 focus:ring-[#4CAF50]/20"
            />
          </div>

          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Enter Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-4 py-3 pr-16 text-gray-800 placeholder:text-gray-400 focus:border-[#4CAF50] focus:outline-none focus:ring-2 focus:ring-[#4CAF50]/20"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-gray-400 hover:text-gray-600"
            >
              {showPassword ? "hide" : "show"}
            </button>
          </div>

          <div>
            <Link
              to="/forget"
              className="text-sm font-medium text-[#4CAF50] hover:underline"
            >
              Forgot your password?
            </Link>
          </div>

          <button
            type="submit"
            className="w-full rounded-full bg-[#4CAF50] py-3.5 text-base font-medium text-white transition-colors hover:bg-[#43A047]"
          >
            Sign In
          </button>

          <div className="flex items-center gap-4">
            <div className="h-px flex-1 bg-gray-300"></div>
            <span className="text-sm text-gray-400">OR</span>
            <div className="h-px flex-1 bg-gray-300"></div>
          </div>

          <button
            type="button"
            className="flex w-full items-center justify-center gap-3 rounded-full border border-gray-300 bg-white py-3.5 text-base font-medium text-gray-700 transition-colors hover:bg-gray-50"
          >
            <img src={googlePhoto} alt="Google" className="h-5 w-5" />
            Sign in with Google
          </button>
        </form>
      </div>
    </div>
  );
};

export default UserLoginbox;
