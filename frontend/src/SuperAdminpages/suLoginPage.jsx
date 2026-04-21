import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, ShieldCheck, ArrowRight, LayoutDashboard, Users, BookOpen } from 'lucide-react';

import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import logo from '../Assests/classtrackofficallogo.png';


const SuLoginPage = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const response = await axios.post('http://localhost:7000/api/superadmin/login', { username, password });

      // Store auth state in central Context
      const superAdminUser = { ...response.data.user, role: 'super-admin' }; // Ensure role is set
      login(superAdminUser, response.data.token);

      // Keep isolated tracking tokens if needed by other components
      localStorage.setItem('superAdminToken', response.data.token);
      localStorage.setItem('suUserName', response.data.user.name);
      navigate('/super-admin/dashboard');

    } catch (err) {
      setError(err.response?.data?.message || "Failed to log in as Super Admin");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col lg:flex-row bg-slate-50 font-sans">

      {/* Left Side: Illustration / Image */}
      <div className="relative w-full lg:w-1/2 h-64 lg:h-screen bg-emerald-950 flex flex-col items-center justify-center overflow-hidden shrink-0">
        {/* Abstract Background Elements */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_0%_0%,_#0d9488_0%,_transparent_50%)]"></div>
          <div className="absolute bottom-0 right-0 w-full h-full bg-[radial-gradient(circle_at_100%_100%,_#059669_0%,_transparent_50%)]"></div>
        </div>

        {/* Decorative Grid */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff0a_1px,transparent_1px),linear-gradient(to_bottom,#ffffff0a_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)]"></div>

        {/* Floating UI Elements (representing dashboard/management) */}
        <div className="relative z-10 hidden lg:flex flex-col items-center">
          <div className="relative w-80 h-80">
            {/* Main Card */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-40 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl shadow-2xl p-5 transform transition-transform duration-700 hover:scale-105">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-teal-500/20 flex items-center justify-center">
                  <LayoutDashboard className="text-teal-400 w-5 h-5" />
                </div>
                <div>
                  <div className="h-2 w-20 bg-white/40 rounded-full mb-2"></div>
                  <div className="h-2 w-12 bg-white/20 rounded-full"></div>
                </div>
              </div>
              <div className="space-y-2">
                <div className="h-2 w-full bg-white/10 rounded-full"></div>
                <div className="h-2 w-4/5 bg-white/10 rounded-full"></div>
                <div className="h-2 w-full bg-white/10 rounded-full"></div>
              </div>
            </div>

            {/* Floating Element 1 */}
            <div className="absolute top-4 -left-8 w-32 h-32 bg-emerald-600/40 backdrop-blur-md border border-emerald-400/30 rounded-2xl shadow-xl p-4 animate-[bounce_6s_infinite]">
              <div className="w-8 h-8 rounded-full bg-emerald-400/30 flex items-center justify-center mb-3">
                <Users className="text-emerald-200 w-4 h-4" />
              </div>
              <div className="h-2 w-16 bg-white/40 rounded-full mb-2"></div>
              <div className="text-2xl font-bold text-white">1,240</div>
            </div>

            {/* Floating Element 2 */}
            <div className="absolute bottom-4 -right-8 w-36 h-28 bg-teal-600/30 backdrop-blur-md border border-teal-400/30 rounded-2xl shadow-xl p-4 animate-[bounce_7s_infinite_reverse]">
              <div className="w-8 h-8 rounded-full bg-teal-400/30 flex items-center justify-center mb-3">
                <BookOpen className="text-teal-200 w-4 h-4" />
              </div>
              <div className="h-2 w-20 bg-white/40 rounded-full mb-2"></div>
              <div className="text-xl font-bold text-white">86 Active</div>
            </div>
          </div>

          <div className="mt-12 text-center max-w-sm">
            <h3 className="text-2xl font-bold text-white mb-2">Empowering Education</h3>
            <p className="text-emerald-200 text-sm leading-relaxed">
              Streamline operations, manage institutions, and drive academic excellence from a single, powerful platform.
            </p>
          </div>
        </div>

        {/* Mobile Title (visible only on small screens) */}
        <div className="lg:hidden relative z-10 flex flex-col items-center justify-center h-full text-center px-6">
          <div className="mb-4">
            <img src={logo} alt="ClassTrack Logo" className="w-16 h-16 object-contain" />
          </div>
          <h1 className="text-2xl font-bold text-white">ClassTrack</h1>
          <p className="text-emerald-200 text-sm mt-1">Super Admin Portal</p>
        </div>
      </div>

      {/* Right Side: Login Form */}
      <div className="w-full lg:w-1/2 flex flex-col items-center justify-center p-6 sm:p-12 lg:p-24 bg-slate-50 relative">
        {/* Subtle background gradient for the right side */}
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-emerald-50 via-slate-50 to-slate-50 opacity-70 pointer-events-none"></div>

        <div className="w-full max-w-md relative z-10">
          {/* Logo & Header */}
          <div className="mb-10 text-center lg:text-left">
            <div className="flex items-center justify-center lg:justify-start gap-3 mb-2">
              <div className="flex items-center justify-center">
                <img src={logo} alt="ClassTrack Logo" className="w-12 h-12 object-contain" />
              </div>
              <h1 className="text-3xl font-black text-slate-900 tracking-tight">ClassTrack</h1>
            </div>

            <div className="flex items-center justify-center lg:justify-start gap-2 mb-4">
              <span className="px-2.5 py-1 bg-teal-100 text-teal-800 text-[10px] font-bold uppercase tracking-widest rounded-md border border-teal-200">
                Super Admin
              </span>
            </div>

            <p className="text-slate-500 text-sm font-medium">
              Central control panel for ClassTrack
            </p>
          </div>

          {/* Login Card */}
          <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white p-8 sm:p-10">
            <form onSubmit={handleLogin} className="space-y-6">

              {/* Error Message */}
              {error && (
                <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm font-medium border border-red-100">
                  {error}
                </div>
              )}

              {/* Username Field */}
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 block">
                  Super Admin Username
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Users className="h-5 w-5 text-slate-400 group-focus-within:text-emerald-600 transition-colors" />
                  </div>
                  <input
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="block w-full pl-11 pr-4 py-3.5 bg-slate-50/50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-600/20 focus:border-emerald-600 transition-all"
                    placeholder="Enter Username"
                  />
                </div>
              </div>

              {/* Password Field */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-bold text-slate-700 block">
                    Password
                  </label>
                  <a href="#" className="text-xs font-bold text-emerald-600 hover:text-emerald-700 transition-colors">

                  </a>
                </div>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-slate-400 group-focus-within:text-emerald-600 transition-colors" />
                  </div>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="block w-full pl-11 pr-4 py-3.5 bg-slate-50/50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-600/20 focus:border-emerald-600 transition-all"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 py-3.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-bold shadow-lg shadow-emerald-600/25 transition-all hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50"
              >
                {loading ? "Authenticating..." : "Sign in as Super Admin"}
                {!loading && <ArrowRight className="w-4 h-4" />}
              </button>
            </form>
          </div>

          {/* Footer Note */}
          <div className="mt-8 text-center">
            <p className="text-xs font-medium text-slate-400 flex items-center justify-center gap-1.5">


            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SuLoginPage;