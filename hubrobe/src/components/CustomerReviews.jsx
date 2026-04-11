import React, { useEffect, useState } from 'react';
import { publicRequest } from '../requestMethods';
import { FiStar, FiMessageSquare } from 'react-icons/fi';

const CustomerReviews = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const res = await publicRequest.get("/reviews/site");
        setReviews(res.data.slice(0, 6)); // Prendre les 6 derniers avis
      } catch (err) {
        console.error("Fetch site reviews error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchReviews();
  }, []);

  if (loading || reviews.length === 0) return null;

  return (
    <section className="py-24 bg-[#FCFCFC] overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        <div className="text-center mb-16">
          <h2 className="text-[12px] font-bold uppercase tracking-[0.3em] text-black/40 mb-4 font-sofia-pro">
            Community Voices
          </h2>
          <h3 className="text-[32px] md:text-[48px] font-bold text-black font-gt-walsheim uppercase">
            What our customers say
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {reviews.map((review, idx) => (
            <div key={idx} className="bg-white p-10 border border-gray-100 rounded-sm relative group hover:shadow-xl transition-all duration-500">
              <FiMessageSquare className="absolute top-8 right-8 text-black/5 text-4xl" />
              
              <div className="flex gap-1 mb-6">
                {[...Array(5)].map((_, i) => (
                  <FiStar 
                    key={i} 
                    className={`text-sm ${i < review.rating ? 'fill-black text-black' : 'text-black/10'}`} 
                  />
                ))}
              </div>

              <p className="text-[15px] text-black/70 font-sofia-pro leading-relaxed mb-8 italic">
                "{review.comment}"
              </p>

              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-[14px] font-bold text-black font-gt-walsheim">
                  {review.username.charAt(0).toUpperCase()}
                </div>
                <div className="flex flex-col">
                  <span className="text-[13px] font-bold text-black font-sofia-pro uppercase tracking-widest">
                    {review.username}
                  </span>
                  <span className="text-[11px] text-black/30 font-sofia-pro uppercase tracking-widest">
                    Verified Customer
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CustomerReviews;
