import React, { useState } from 'react';
import AccountHero from '../components/AccountHero';
import { useLocation, useNavigate } from 'react-router-dom';
import { FiEye, FiEyeOff } from 'react-icons/fi';
import { publicRequest } from '../requestMethods';

const ResetPassword = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const emailFromState = location.state?.email || "";

  const [email, setEmail] = useState(emailFromState);
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      return setError("Passwords do not match!");
    }
    if (code.length !== 6) {
      return setError("Please enter the 6-digit verification code.");
    }

    setLoading(true);
    setError(null);
    try {
      await publicRequest.post("/auth/reset-password", { email, code, newPassword });
      setMessage("Password reset successfully! Redirecting to login...");
      setTimeout(() => {
        navigate("/login");
      }, 3000);
    } catch (err) {
      setError(err.response?.data || "Failed to reset password. Please check your code.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col w-full bg-white pb-20 md:pb-32">
      <AccountHero />
      <div className="max-w-7xl mx-auto px-6 md:px-12 w-full mt-16 md:mt-24">
        <h2 className="text-[32px] md:text-[40px] font-bold text-black mb-10 font-gt-walsheim">
          Reset Password
        </h2>
        <div className="max-w-2xl border border-gray-100 p-8 md:p-12">
          <form className="flex flex-col gap-8" onSubmit={handleSubmit}>
            <div className="flex flex-col gap-2">
              <label className="text-[13px] font-bold uppercase tracking-widest text-black font-sofia-pro">
                Email address
              </label>
              <input 
                type="email" 
                readOnly
                value={email}
                className="w-full border border-gray-100 p-4 bg-gray-50 outline-none font-sofia-pro text-[14px] cursor-not-allowed"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-[13px] font-bold uppercase tracking-widest text-black font-sofia-pro">
                Verification Code <span className="text-red-500">*</span>
              </label>
              <input 
                type="text" 
                required
                maxLength="6"
                placeholder="6-digit code"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="w-full border border-gray-100 p-4 outline-none focus:border-black transition-colors font-sofia-pro text-[14px] tracking-[5px] text-center font-bold"
              />
            </div>

            <div className="flex flex-col gap-2 relative">
              <label className="text-[13px] font-bold uppercase tracking-widest text-black font-sofia-pro">
                New Password <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input 
                  type={showPassword ? "text" : "password"} 
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
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

            <div className="flex flex-col gap-2">
              <label className="text-[13px] font-bold uppercase tracking-widest text-black font-sofia-pro">
                Confirm New Password <span className="text-red-500">*</span>
              </label>
              <input 
                type={showPassword ? "text" : "password"} 
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full border border-gray-100 p-4 outline-none focus:border-black transition-colors font-sofia-pro text-[14px]"
              />
            </div>

            {error && (
              <p className="text-red-500 text-[13px] font-sofia-pro bg-red-50 p-4 border border-red-100 rounded-sm">
                {error}
              </p>
            )}

            {message && (
              <p className="text-green-600 text-[13px] font-sofia-pro bg-green-50 p-4 border border-green-100 rounded-sm">
                {message}
              </p>
            )}

            <div>
              <button 
                type="submit" 
                disabled={loading}
                className="px-10 py-4 bg-black text-white text-[13px] font-bold uppercase tracking-widest font-sofia-pro hover:bg-black/80 transition-all disabled:bg-black/50"
              >
                {loading ? "Resetting..." : "Save New Password"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
