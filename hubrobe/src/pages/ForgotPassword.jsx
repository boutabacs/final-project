import React, { useState } from 'react';
import AccountHero from '../components/AccountHero';
import { Link, useNavigate } from 'react-router-dom';
import { publicRequest } from '../requestMethods';

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);
    try {
      await publicRequest.post(
        "/auth/forgot-password",
        { email: email.trim() },
        { timeout: 45000 }
      );
      setMessage(
        "If an account exists for this email, you will receive a link to reset your password. The link expires in 10 minutes."
      );
      setTimeout(() => {
        navigate("/login");
      }, 3500);
    } catch (err) {
      console.error("Forgot password error:", err);
      let errorMessage = "Something went wrong. Please check your connection and try again.";

      if (err.code === "ECONNABORTED" || /timeout/i.test(err.message || "")) {
        errorMessage =
          "The request timed out. Check your inbox and spam folder—you may still have received the reset link.";
      } else if (err.response?.data) {
        if (typeof err.response.data === "string") {
          errorMessage = err.response.data;
        } else if (err.response.data.message) {
          errorMessage = err.response.data.message;
        }
      }

      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col w-full bg-white pb-20 md:pb-32">
      <AccountHero />
      <div className="max-w-7xl mx-auto px-6 md:px-12 w-full mt-16 md:mt-24">
        <h2 className="text-[32px] md:text-[40px] font-bold text-black mb-10 font-gt-walsheim">
          Lost Password
        </h2>
        <div className="max-w-2xl border border-gray-100 p-8 md:p-12">
          <p className="text-[14px] text-black/60 font-sofia-pro mb-8 leading-relaxed">
            Lost your password? Enter your email and we will send you a secure link to choose a new password.
          </p>
          <form className="flex flex-col gap-8" onSubmit={handleSubmit}>
            <div className="flex flex-col gap-2">
              <label className="text-[13px] font-bold uppercase tracking-widest text-black font-sofia-pro">
                Email address <span className="text-red-500">*</span>
              </label>
              <input 
                type="email" 
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
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
                {loading ? "Sending..." : "Reset password"}
              </button>
            </div>

            <div className="mt-4">
              <Link to="/login" className="text-[14px] text-black font-bold hover:underline font-sofia-pro">
                Back to Login
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
