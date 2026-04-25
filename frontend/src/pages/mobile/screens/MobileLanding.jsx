import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Tractor, ArrowRight, ShieldCheck, TrendingUp, Sparkles } from 'lucide-react';
import { useMobile } from '../context/MobileContext';

const MobileLanding = () => {
  const navigate = useNavigate();
  const { t } = useMobile();

  return (
    <div className="w-full h-screen bg-white text-gray-900 flex flex-col relative overflow-hidden font-sans">
      
      {/* Premium Background Image with soft light overlay */}
      <div 
        className="absolute inset-0 bg-cover bg-center z-0"
        style={{ 
          backgroundImage: "url('https://images.unsplash.com/photo-1592982537447-7440770cbfc9?q=80&w=1000&auto=format&fit=crop')" 
        }}
      />
      
      {/* Light Glassmorphism Overlay */}
      <div className="absolute inset-0 bg-white/80 backdrop-blur-[2px] z-10" />

      {/* Decorative gradients */}
      <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[40%] bg-green-100/40 rounded-full blur-[100px] z-10" />
      <div className="absolute bottom-[-5%] left-[-5%] w-[40%] h-[30%] bg-orange-100/40 rounded-full blur-[80px] z-10" />

      {/* Top Header */}
      <div className="relative w-full p-8 flex justify-between items-center z-30">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-green-600 rounded-xl flex items-center justify-center shadow-lg shadow-green-200">
            <Tractor className="text-white" size={20} />
          </div>
          <span className="text-gray-900 font-black text-xl tracking-tighter uppercase">{t('kisanclaim') || 'KisanClaim'}</span>
        </div>
        <button 
          onClick={() => navigate('/mobile/login')}
          className="text-gray-400 text-[10px] font-bold uppercase tracking-[0.2em] hover:text-green-600 transition-colors"
        >
          {t('sign_in') || 'Sign In'}
        </button>
      </div>

      {/* Hero Section */}
      <div className="relative z-20 w-full px-10 flex flex-col items-center justify-center flex-1 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-green-50 rounded-full mb-6 border border-green-100">
          <Sparkles size={12} className="text-green-600" />
          <span className="text-[10px] font-bold text-green-700 uppercase tracking-widest">Next-Gen Insurance</span>
        </div>
        
        <h1 className="text-5xl font-black text-green-600 tracking-tighter leading-[0.9] mb-6">
          {t('kisanclaim') || 'KisanClaim'}
        </h1>
        
        <p className="text-gray-500 text-sm font-medium leading-relaxed max-w-[240px] mx-auto">
          {t('smart_crop') || 'Smart crop intelligence & instant claim processing for modern farmers'}
        </p>
      </div>

      {/* Stats/Features Grid */}
      <div className="relative z-20 w-full px-8 pb-8 flex flex-col gap-6">
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white/60 backdrop-blur-md border border-white p-5 rounded-3xl shadow-sm">
            <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center mb-3 text-blue-600">
              <TrendingUp size={16} />
            </div>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">{t('live_yield') || 'Yield'}</p>
            <p className="text-lg font-black text-gray-900">8.4 t/h</p>
          </div>
          <div className="bg-white/60 backdrop-blur-md border border-white p-5 rounded-3xl shadow-sm">
            <div className="w-8 h-8 bg-orange-50 rounded-lg flex items-center justify-center mb-3 text-orange-600">
              <ShieldCheck size={16} />
            </div>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">{t('risk_index') || 'Risk'}</p>
            <p className="text-lg font-black text-gray-900">{t('low') || 'Low'}</p>
          </div>
        </div>

        {/* Primary Action */}
        <button 
          onClick={() => navigate('/mobile/login')}
          className="w-full group relative flex items-center justify-center gap-3 bg-gray-900 hover:bg-black text-white rounded-[24px] py-5 px-6 font-bold text-xs tracking-[0.2em] uppercase shadow-2xl active:scale-95 transition-all duration-300"
        >
          {t('get_started') || 'Get Started'}
          <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
        </button>
      </div>

      {/* Branding Footer */}
      <div className="relative z-20 w-full pb-10 text-center opacity-30">
        <p className="text-[9px] font-bold text-gray-400 uppercase tracking-[0.4em]">{t('powered_by') || 'Secured by'} KisanAI</p>
      </div>

    </div>
  );
};

export default MobileLanding;
