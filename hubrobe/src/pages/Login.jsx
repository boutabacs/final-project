import React, { useState } from 'react';
import AccountHero from '../components/AccountHero';
import { Link, useNavigate } from 'react-router-dom';
import { FiEye, FiEyeOff } from 'react-icons/fi';
import { publicRequest } from '../requestMethods';

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(false);
    try {
      const res = await publicRequest.post("/auth/login", { username, password });
      localStorage.setItem("user", JSON.stringify(res.data));
      if (res.data.isAdmin) {
        // Rediriger vers le dashboard admin si c'est un admin
        window.location.href = "http://localhost:5173/"; // Port standard de Vite
      } else {
        navigate("/");
        window.location.reload(); // Pour mettre à jour la Navbar
      }
    } catch (err) {
      setError(true);
      console.log("Login error:", err);
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="flex flex-col w-full bg-white pb-20 md:pb-32">
      {/* Hero Section */}
      <AccountHero />

      <div className="max-w-7xl mx-auto px-6 md:px-12 w-full mt-16 md:mt-24">
        <h2 className="text-[32px] md:text-[40px] font-bold text-black mb-10 font-gt-walsheim">
          Login
        </h2>

        {/* Login Form Container */}
        <div className="max-w-7xl mx-auto border border-gray-100 p-8 md:p-12">
          <form className="flex flex-col gap-8" onSubmit={handleLogin}>
            {/* Username/Email Field */}
            <div className="flex flex-col gap-2">
              <label className="text-[13px] font-bold uppercase tracking-widest text-black font-sofia-pro">
                Username or email address <span className="text-red-500">*</span>
              </label>
              <input 
                type="text" 
                required
                onChange={(e) => setUsername(e.target.value)}
                className="w-full border border-gray-100 p-4 outline-none focus:border-black transition-colors font-sofia-pro text-[14px]"
              />
            </div>

            {/* Password Field */}
            <div className="flex flex-col gap-2 relative">
              <label className="text-[13px] font-bold uppercase tracking-widest text-black font-sofia-pro">
                Password <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input 
                  type={showPassword ? "text" : "password"} 
                  required
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full border border-gray-100 p-4 outline-none focus:border-black transition-colors font-sofia-pro text-[14px]"
                />
                <button 
                  type="button" 
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-black/40 hover:text-black"
                >
                  {showPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                </button>
              </div>
            </div>

            {error && (
              <p className="text-red-500 text-[13px] font-sofia-pro bg-red-50 p-4 border border-red-100 rounded-sm">
                Invalid credentials. Please check your username and password.
              </p>
            )}

            {/* Remember Me & Log In Button Row */}
            <div className="flex flex-wrap items-center gap-6">
              <button 
                type="submit" 
                disabled={loading}
                className="px-10 py-4 bg-black text-white text-[13px] font-bold uppercase tracking-widest font-sofia-pro hover:bg-black/80 transition-all disabled:bg-black/50"
              >
                {loading ? "Logging in..." : "Log in"}
              </button>
              <label className="flex items-center gap-3 cursor-pointer group">
                <input type="checkbox" className="w-4 h-4 accent-black cursor-pointer" />
                <span className="text-[14px] text-black/60 font-sofia-pro group-hover:text-black transition-colors">Remember me</span>
              </label>
            </div>

            {/* Lost Password & Register Links */}
            <div className="flex flex-col gap-4 mt-2">
              <Link to="/forgot-password" size="sm" className="text-[14px] text-blue-500 hover:underline font-sofia-pro text-left">
                Lost your password?
              </Link>
              <p className="text-[14px] text-black/60 font-sofia-pro">
                Don't have an account? <Link to="/register" className="text-black font-bold hover:underline">Register</Link>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
