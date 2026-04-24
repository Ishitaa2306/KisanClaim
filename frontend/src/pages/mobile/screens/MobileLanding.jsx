import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Tractor, ArrowRight } from 'lucide-react';
import { useMobile } from '../context/MobileContext';

const MobileLanding = () => {
  const navigate = useNavigate();
  const { t } = useMobile();

  return (
    <div className="w-full h-screen relative flex flex-col items-center justify-between overflow-hidden font-sans">
      
      {/* Clean Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center z-0"
        style={{ 
          backgroundImage: "url('https://images.unsplash.com/photo-1592982537447-7440770cbfc9?q=80&w=1000&auto=format&fit=crop')" 
        }}
      />
      
      {/* Warm natural gradient overlay to ensure text readability without heavy blurring */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/20 to-black/80 z-10" />

      {/* Top Header */}
      <div className="relative w-full p-6 flex justify-between items-center z-30">
        <div className="flex items-center gap-2">
          <Tractor className="text-white" size={24} />
          <span className="text-white font-bold text-xl tracking-tight">{t('kisanclaim') || 'KisanClaim'}</span>
        </div>
        <button 
          onClick={() => navigate('/mobile/login')}
          className="bg-transparent text-white px-5 py-2 rounded-full text-sm font-bold uppercase tracking-widest transition-all border border-white/30 active:scale-95 hover:bg-white/10"
        >
          {t('sign_in') || 'Sign In'}
        </button>
      </div>

      {/* Main Content Area - Center */}
      <div className="relative z-20 w-full px-8 flex flex-col items-center justify-center flex-1">
        <div className="text-center">
          <h1 className="text-5xl font-black text-white tracking-tighter mb-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {t('kisanclaim') || 'KisanClaim'}
          </h1>
          <p className="text-white/90 text-base font-medium leading-relaxed max-w-[280px] mx-auto animate-in fade-in slide-in-from-bottom-6 duration-1000">
            {t('smart_crop') || 'Smart crop intelligence & insurance'}
          </p>
        </div>
      </div>

      {/* Bottom Area - Get Started Button */}
      <div className="relative z-20 w-full px-8 pb-10 flex flex-col items-center animate-in fade-in slide-in-from-bottom-8 duration-1000">
        <button 
          onClick={() => navigate('/mobile/login')}
          className="w-full flex items-center justify-center gap-3 text-white rounded-[24px] py-5 px-6 font-bold text-sm tracking-widest uppercase shadow-2xl active:scale-95 transition-all duration-300"
          style={{
            background: 'linear-gradient(to right, #16a34a, #f97316)' // Green to Orange gradient
          }}
        >
          {t('get_started') || 'Get Started'}
          <ArrowRight className="w-5 h-5" />
        </button>
      </div>

    </div>
  );
};

export default MobileLanding;
