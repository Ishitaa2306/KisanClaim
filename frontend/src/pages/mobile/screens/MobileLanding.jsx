import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Tractor, ShieldCheck, TrendingUp } from 'lucide-react';
import { useMobile } from '../context/MobileContext';

const MobileLanding = () => {
  const navigate = useNavigate();
  const { t } = useMobile();

  return (
    <div className="w-full h-screen relative flex flex-col items-center justify-center overflow-hidden font-sans bg-white">
      {/* Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center z-0"
        style={{ 
          backgroundImage: "url('https://images.unsplash.com/photo-1592982537447-7440770cbfc9?q=80&w=1000&auto=format&fit=crop')", 
          filter: 'blur(2px)' 
        }}
      />
      
      {/* Light overlay */}
      <div className="absolute inset-0 bg-white/70 z-10" />

      {/* Top Header */}
      <div className="absolute top-0 left-0 w-full p-6 flex justify-between items-center z-30">
        <div className="flex items-center gap-2">
          <Tractor className="text-green-600" size={24} />
          <span className="text-gray-900 font-bold text-xl tracking-tight">{t('kisanclaim')}</span>
        </div>
        <button 
          onClick={() => navigate('/mobile/login')}
          className="bg-white/80 backdrop-blur-md text-gray-900 px-5 py-2 rounded-full text-xs font-bold uppercase tracking-widest transition-all border border-gray-200 active:scale-95 shadow-sm"
        >
          {t('sign_in')}
        </button>
      </div>

      {/* Main Content Area */}
      <div className="relative z-20 w-full px-8 flex flex-col items-center">
        
        {/* Center Content */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-black text-gray-900 tracking-tighter mb-4 animate-in fade-in slide-in-from-bottom-4 duration-700 uppercase">
            {t('welcome_title')}
          </h1>
          <p className="text-gray-600 text-sm font-medium leading-relaxed max-w-[280px] mx-auto opacity-80 animate-in fade-in slide-in-from-bottom-6 duration-1000">
            {t('smart_crop')}
          </p>
        </div>

        {/* Info Grid */}
        <div className="grid grid-cols-2 gap-4 w-full mb-12 animate-in fade-in slide-in-from-bottom-8 duration-1000">
          <div className="bg-white/40 backdrop-blur-xl border border-white rounded-[32px] p-6 shadow-xl shadow-gray-200/50">
            <div className="w-8 h-8 rounded-xl bg-green-50 flex items-center justify-center mb-3">
              <TrendingUp className="text-green-600" size={16} />
            </div>
            <p className="text-[10px] text-gray-400 font-bold tracking-widest uppercase mb-1">{t('live_yield')}</p>
            <p className="text-lg font-bold text-gray-900">84.2%</p>
          </div>
          
          <div className="bg-white/40 backdrop-blur-xl border border-white rounded-[32px] p-6 shadow-xl shadow-gray-200/50">
            <div className="w-8 h-8 rounded-xl bg-blue-50 flex items-center justify-center mb-3">
              <ShieldCheck className="text-blue-600" size={16} />
            </div>
            <p className="text-[10px] text-gray-400 font-bold tracking-widest uppercase mb-1">{t('risk_index')}</p>
            <p className="text-lg font-bold text-gray-900">{t('low')}</p>
          </div>
        </div>

        {/* Get Started Button */}
        <button 
          onClick={() => navigate('/mobile/login')}
          className="w-full flex items-center justify-center gap-3 bg-green-600 hover:bg-green-700 text-white rounded-[24px] py-5 px-6 font-bold text-xs tracking-[0.2em] uppercase shadow-2xl shadow-green-100 active:scale-95 transition-all duration-300 animate-in fade-in slide-in-from-bottom-10 duration-1000"
        >
          {t('get_started')}
          <ArrowRight className="w-4 h-4" />
        </button>

      </div>

      {/* Footer Branding */}
      <div className="absolute bottom-10 left-0 w-full text-center z-20 opacity-40">
        <p className="text-[10px] font-bold text-gray-400 tracking-[0.5em] uppercase">{t('powered_by')} AI</p>
      </div>

    </div>
  );
};

export default MobileLanding;
