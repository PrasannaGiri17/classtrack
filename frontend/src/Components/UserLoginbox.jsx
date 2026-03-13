import React, { useState } from "react";
import googlePhoto from "../Assests/download.png";
import { Link, useNavigate } from "react-router-dom";
import { useGoogleLogin, googleLogout } from "@react-oauth/google";
import FailedPopup from "../Components/SmallerComponents/FailedPopup.jsx";

const UserLoginbox = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");

  const [emailError, setEmailError] = useState("");
  const [popupMessage, setPopupMessage] = useState("");
  const [popupType, setPopupType] = useState("error");

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setEmailError("");
    setPopupMessage("");

    if (!email.trim()) {
      setEmailError("Email is required.");
      return;
    }

    try {
      const res = await fetch("http://localhost:7000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const text = await res.text();
      const data = text ? JSON.parse(text) : {};

      if (!res.ok) {
        if (res.status === 404 || data.message === "EMAIL_NOT_FOUND") {
          setEmailError("Email not found.");
          return;
        }

        if (res.status === 401 || data.message === "INVALID_PASSWORD") {
          setPopupType("error");
          setPopupMessage("Invalid password.");
          return;
        }

        setPopupType("warning");
        setPopupMessage(data.message || "Login failed.");
        return;
      }

      // Save JWT and user details
      localStorage.setItem("token", data.token);
      localStorage.setItem("role", data.role);
      const studentId = data.studentId;
      if (studentId) localStorage.setItem("studentId", studentId);
      if (data.teacherId) localStorage.setItem("teacherId", data.teacherId);

      const nameToStore = [data.firstName, data.lastName].filter(Boolean).join(" ") || data.name || data.email?.split('@')[0] || "Student";
      localStorage.setItem("userName", nameToStore);
      localStorage.setItem("userEmail", data.email || email);

      // Redirect based on first-login flag
      if (data.mustChangePassword) {
        navigate("/reset-first-login");
      } else {
        // Role-based redirection
        if (data.role === "teacher") {
          navigate("/teacher/dashboard");
        } else if (data.role === "student") {
          navigate("/student/dashboard");
        } else {
          // Fallback or Admin
          navigate("/dashboard");
        }
      }
    } catch (err) {
      setPopupType("warning");
      setPopupMessage("Server error, please try again.");
    }
  };

  // Google login with custom button + backend check
  const loginWithGoogle = useGoogleLogin({
    flow: "implicit",
    onSuccess: async (tokenResponse) => {
      try {
        // 1) get Google user info (includes email)
        const resUser = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
          headers: {
            Authorization: `Bearer ${tokenResponse.access_token}`,
          },
        });
        const googleUser = await resUser.json();

        // 2) send email to backend to check if registered
        const res = await fetch("http://localhost:7000/api/auth/google-login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: googleUser.email,
            name: googleUser.name,
            googleId: googleUser.sub,
          }),
        });

        const text = await res.text();
        const data = text ? JSON.parse(text) : {};

        if (!res.ok) {
          // email not registered by admin
          if (res.status === 403 && data.message === "EMAIL_NOT_REGISTERED") {
            setPopupType("error");
            setPopupMessage("Your email is not registered by admin.");
            return;
          }

          setPopupType("warning");
          setPopupMessage(data.message || "Google login failed.");
          return;
        }

        // 3) backend returned your JWT → save and go in
        localStorage.setItem("token", data.token);
        localStorage.setItem("googleUser", JSON.stringify(googleUser));
        localStorage.setItem("role", data.role);
        localStorage.setItem("userName", googleUser.name || "User");
        localStorage.setItem("userEmail", googleUser.email);

        if (data.teacherId) localStorage.setItem("teacherId", data.teacherId);
        if (data.studentId) localStorage.setItem("studentId", data.studentId);

        // Redirect based on first-login flag
        if (data.mustChangePassword) {
          navigate("/reset-first-login");
        } else {
          // Role-based redirection
          if (data.role === "teacher") {
            navigate("/teacher/dashboard");
          } else if (data.role === "student") {
            navigate("/student/dashboard");
          } else {
            // Fallback or Admin
            navigate("/dashboard");
          }
        }
      } catch (err) {
        console.error("Google login error", err);
        setPopupType("error");
        setPopupMessage("Google login failed.");
      }
    },
    onError: () => {
      setPopupType("error");
      setPopupMessage("Google login failed.");
    },
  });

  const handleLogout = () => {
    googleLogout();
    localStorage.removeItem("googleAccessToken");
    localStorage.removeItem("googleUser");
    localStorage.removeItem("token");
    navigate("/");
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-white px-4">
      <div className="w-full max-w-md">
        <h1 className="mb-8 text-3xl font-medium text-gray-800">
          Sign in to your account
        </h1>

        <form className="space-y-6" onSubmit={handleSubmit}>
          {/* email */}
          <div>
            <input
              type="email"
              placeholder="Email Address"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setEmailError("");
              }}
              className={`w-full rounded-lg border px-4 py-3 text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2
                ${emailError
                  ? "border-red-500 focus:border-red-500 focus:ring-red-200"
                  : "border-gray-300 focus:border-[#4CAF50] focus:ring-[#4CAF50]/20"
                }`}
            />
            {emailError && <p className="mt-1 text-sm text-red-500">{emailError}</p>}
          </div>

          {/* password */}
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
            <Link to="/forget" className="text-sm font-medium text-[#4CAF50] hover:underline">
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

          {/* Google button */}
          <button
            type="button"
            className="mt-4 flex w-full items-center justify-center gap-3 rounded-full border border-gray-300 bg-white py-3.5 text-base font-medium text-gray-700 transition-colors hover:bg-gray-50"
            onClick={() => loginWithGoogle()}
          >
            <img src={googlePhoto} alt="Google" className="h-5 w-5" />
            <span>Log in with Google</span>
          </button>
        </form>

        <FailedPopup
          message={popupMessage}
          type={popupType}
          duration={5000}
          onClose={() => setPopupMessage("")}
        />
      </div>
    </div>
  );
};

export default UserLoginbox;
