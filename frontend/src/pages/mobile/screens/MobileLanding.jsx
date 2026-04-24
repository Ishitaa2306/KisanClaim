import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Tractor } from 'lucide-react';

const MobileLanding = () => {
  const navigate = useNavigate();

  return (
    <div className="w-full h-screen relative flex flex-col items-center justify-center overflow-hidden font-sans bg-black">
      {/* Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center z-0"
        style={{ backgroundImage: "url('https://images.unsplash.com/photo-1592982537447-7440770cbfc9?q=80&w=1000&auto=format&fit=crop')", filter: 'blur(2px)' }}
      />
      
      {/* Dark overlay */}
      <div className="absolute inset-0 bg-black/40 z-10" />

      {/* Top Header */}
      <div className="absolute top-0 left-0 w-full p-4 flex justify-between items-center z-30">
        <div className="flex items-center gap-2">
          <Tractor className="text-green-500" size={24} />
          <span className="text-white font-bold text-xl tracking-wide">KisanClaim</span>
        </div>
        <button 
          onClick={() => navigate('/mobile/login')}
          className="bg-green-600/80 hover:bg-green-600 text-white px-4 py-1.5 rounded-full text-sm font-medium transition-colors border border-green-500/50"
        >
          Sign In
        </button>
      </div>

      {/* Main Content Area */}
      <div className="relative z-20 w-full px-6 flex flex-col items-center">
        
        {/* Center Glass Card */}
        <div 
          className="w-full p-8 text-center mb-8"
          style={{
            background: 'rgba(255, 255, 255, 0.12)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            borderRadius: '24px',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.3)'
          }}
        >
          <h1 className="text-4xl font-bold text-white tracking-tight mb-3">
            KisanClaim
          </h1>
          <p className="text-gray-200 text-sm font-medium leading-relaxed max-w-[240px] mx-auto mb-8">
            Smart crop intelligence & insurance
          </p>

          {/* Stat Boxes */}
          <div className="flex justify-between gap-4 w-full">
            {/* Left Box */}
            <div className="flex-1 bg-white/5 border border-white/10 rounded-[16px] p-4 text-left backdrop-blur-md">
              <p className="text-[10px] text-green-400 font-bold tracking-widest uppercase mb-1">Live Yield</p>
              <p className="text-xl font-bold text-white">84.2%</p>
            </div>
            
            {/* Right Box */}
            <div className="flex-1 bg-white/5 border border-white/10 rounded-[16px] p-4 text-left backdrop-blur-md">
              <p className="text-[10px] text-yellow-500 font-bold tracking-widest uppercase mb-1">Risk Index</p>
              <p className="text-xl font-bold text-white">LOW</p>
            </div>
          </div>
        </div>

        {/* Get Started Button */}
        <button 
          onClick={() => navigate('/mobile/login')}
          className="w-full flex items-center justify-center gap-2 text-white rounded-full py-4 px-6 font-bold text-lg shadow-xl active:scale-95 transition-all duration-300 border border-white/10"
          style={{
            background: 'linear-gradient(90deg, #16a34a 0%, #ca8a04 100%)' // Green to Yellow gradient
          }}
        >
          Get Started
          <ArrowRight className="w-5 h-5 ml-1" />
        </button>

      </div>
    </div>
  );
};

export default MobileLanding;
