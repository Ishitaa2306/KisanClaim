import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

const MobileLanding = () => {
  const navigate = useNavigate();

  return (
    <div className="w-full h-screen relative flex flex-col justify-end overflow-hidden font-sans">
      {/* Background image */}
      <div 
        className="absolute inset-0 bg-cover bg-center z-0 animate-[scale_20s_ease-in-out_infinite]"
        style={{ backgroundImage: "url('https://images.unsplash.com/photo-1500382017468-9049fed747ef?q=80&w=1000&auto=format&fit=crop')" }}
      />
      
      {/* Light overlay with blur */}
      <div className="absolute inset-0 bg-white/30 backdrop-blur-[2px] z-10" />
      <div className="absolute inset-0 bg-gradient-to-t from-white/90 via-white/50 to-transparent z-10" />

      {/* Content */}
      <div className="relative z-20 w-full p-6 pb-12 flex flex-col items-center animate-[slide-up_0.8s_ease-out]">
        {/* Glass Card */}
        <div className="w-full bg-white/80 backdrop-blur-md border border-white/40 rounded-[20px] p-8 text-center shadow-[0_8px_30px_rgb(0,0,0,0.08)] mb-8 transform transition-all duration-500">
          <h1 className="text-4xl font-black tracking-tight mb-2" style={{ color: '#064e3b' }}>
            KisanClaim
          </h1>
          <p className="text-gray-600 text-sm font-medium leading-relaxed max-w-[240px] mx-auto">
            Smart crop intelligence & insurance
          </p>
        </div>

        {/* Get Started Button */}
        <button 
          onClick={() => navigate('/mobile/login')}
          className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl py-4 px-6 flex items-center justify-center font-bold text-lg shadow-[0_4px_15px_rgba(34,197,94,0.3)] active:scale-95 transition-all duration-300"
        >
          <span>Get Started</span>
          <ArrowRight className="w-5 h-5 ml-2" />
        </button>
      </div>
      
      <style>{`
        @keyframes slide-up {
          from { transform: translateY(30px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        @keyframes scale {
          0% { transform: scale(1); }
          50% { transform: scale(1.05); }
          100% { transform: scale(1); }
        }
      `}</style>
    </div>
  );
};

export default MobileLanding;
