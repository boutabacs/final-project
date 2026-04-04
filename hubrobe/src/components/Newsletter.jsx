import React, { useState } from 'react';
import { publicRequest } from '../requestMethods';

const Newsletter = () => {
  const [email, setEmail] = useState("");
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isFlying, setIsFlying] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setIsFlying(true);
    setError("");
    
    try {
      const res = await publicRequest.post("/newsletter", { email });
      setIsSubscribed(true);
    } catch (err) {
      setError("An error occurred. Please try again.");
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="py-24 px-6 md:px-12 bg-white border-t border-gray-100">
      <div className="max-w-4xl mx-auto flex flex-col items-center text-center">
        {/* Title */}
        <h2 className="text-[28px] md:text-[36px] font-sofia-pro font-semibold text-black leading-tight mb-16 max-w-lg">
          {isSubscribed ? "Thank you for subscribing!" : "Subscribe and get 20% off your first purchase."}
        </h2>

        {/* Success Message or Form */}
        <div className="relative w-full max-w-2xl">
          {isSubscribed ? (
            <div className="animate-in fade-in zoom-in duration-500">
              <p className="text-[18px] font-sofia-pro text-black/70 mb-4">
                Your 20% discount code is:
              </p>
              <div className="bg-black text-white px-8 py-4 inline-block rounded-md shadow-lg transform transition-transform hover:scale-105">
                <span className="text-[24px] font-bold tracking-[0.2em]">WELCOME20</span>
              </div>
              <p className="mt-6 text-[14px] font-sofia-pro text-black/50">
                Use this code at checkout. A confirmation email has been sent to <strong>{email}</strong>.
              </p>
              <button 
                onClick={() => {
                  setIsSubscribed(false);
                  setIsFlying(false);
                  setEmail("");
                }}
                className="mt-8 text-[12px] font-bold uppercase tracking-widest text-black/40 hover:text-black transition-colors underline"
              >
                Back to newsletter
              </button>
            </div>
          ) : (
            <>
              {/* Plane Icon */}
              <div className={`absolute -top-12 right-0 md:right-4 w-16 h-10 ${isFlying ? 'animate-fly-off' : 'animate-fly-idle'}`}>
                <img 
                  src="/assets/avion.svg" 
                  alt="Avion" 
                  className="w-full h-full object-contain"
                />
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="relative flex flex-col items-center w-full">
                <div className="flex items-end w-full border-b border-black pb-2">
                  <input 
                    type="email" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email address" 
                    className="flex-1 bg-transparent border-none outline-none text-[14px] font-sofia-pro text-black placeholder:text-black/60 py-1"
                    required
                  />
                  <button 
                    type="submit" 
                    disabled={loading}
                    className={`text-[14px] font-sofia-pro font-semibold text-black uppercase tracking-wider hover:opacity-70 transition-opacity pb-1 ${loading ? 'opacity-30 cursor-not-allowed' : ''}`}
                  >
                    {loading ? "Submitting..." : "Submit"}
                  </button>
                </div>
                {error && <p className="text-red-500 text-[12px] mt-2 font-sofia-pro">{error}</p>}
              </form>
            </>
          )}
        </div>
      </div>
    </section>
  );
};

export default Newsletter;
