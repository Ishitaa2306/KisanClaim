import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowRight, ChevronLeft, Loader2, User, 
  Smartphone, ShieldCheck, Lock, CheckCircle2,
  AlertTriangle
} from 'lucide-react';
import { useMobile } from '../context/MobileContext';

const MobileLogin = () => {
  const navigate = useNavigate();
  const { loginSession, t } = useMobile();
  
  const [step, setStep] = useState(1);
  const [name, setName] = useState('Manoj Rajput');
  const [phone, setPhone] = useState('9876543210');
  const [otp, setOtp] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [errorVisible, setErrorVisible] = useState(null);
  const [demoOtpBox, setDemoOtpBox] = useState(null);

  const otpInputRef = useRef(null);

  useEffect(() => {
    if (step === 2 && otpInputRef.current) {
      setTimeout(() => otpInputRef.current.focus(), 300);
    }
  }, [step]);

  const handleSendOtp = async (e) => {
    e.preventDefault();
    setErrorVisible(null);
    
    if (!name || !phone || phone.length < 10) {
      return setErrorVisible('error_credentials');
    }

    setLoading(true);
    try {
      const res = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, phone })
      });
      const json = await res.json();
      
      if (!res.ok) throw new Error(json.error || json.message || 'Failed to request OTP');
      
      setDemoOtpBox(json.data.otp);
      setStep(2);
    } catch (err) {
      console.error(err);
      setErrorVisible(err.message || 'Server error occurred.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setErrorVisible(null);

    if (!otp) return setErrorVisible('error_otp');

    setLoading(true);
    try {
      const res = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, otp })
      });
      const json = await res.json();
      
      if (!res.ok) throw new Error(json.error || json.message || 'OTP Verification failed');
      
      loginSession(json.data.farmerId, json.data.name);
      navigate('/mobile/home', { replace: true });

    } catch (err) {
      console.error(err);
      setErrorVisible('error_invalid_otp');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full h-screen bg-white text-gray-900 font-sans flex flex-col relative overflow-hidden">
      
      {/* Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center z-0"
        style={{ 
          backgroundImage: "url('https://images.unsplash.com/photo-1592982537447-7440770cbfc9?q=80&w=1000&auto=format&fit=crop')", 
          filter: 'blur(4px)' 
        }}
      />
      
      {/* Light overlay */}
      <div className="absolute inset-0 bg-white/80 z-10" />

      {/* Header */}
      <div className="pt-10 px-6 pb-12 flex items-center justify-between z-20">
        <button 
          onClick={() => step === 2 ? setStep(1) : navigate('/mobile/landing')} 
          className="p-2 -ml-2 rounded-full hover:bg-white/50 transition-colors"
        >
          <ChevronLeft size={24} />
        </button>
        <div className="flex items-center gap-2">
          <ShieldCheck className="text-green-600" size={18} />
          <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">{t('secure_login')}</span>
        </div>
      </div>

      {/* Content */}
      <div className="px-8 flex-1 z-20 flex flex-col">
        <div className="mb-10">
          <h1 className="text-4xl font-black text-gray-900 tracking-tight mb-2 uppercase">
            {step === 1 ? t('login_title') : t('verify_otp')}
          </h1>
          <p className="text-gray-500 text-sm font-medium">
            {step === 1 ? t('login_subtitle') : t('enter_otp')}
          </p>
        </div>

        {step === 1 ? (
          <form onSubmit={handleSendOtp} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">{t('farmer_name')}</label>
              <div className="relative group">
                <User className="absolute left-4 top-4 text-gray-300 group-focus-within:text-green-600 transition-colors" size={18} />
                <input 
                  type="text" 
                  className="w-full bg-white border border-gray-200 rounded-2xl py-4 pl-12 pr-5 text-sm font-bold text-gray-900 outline-none focus:border-green-600 transition-all shadow-sm"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Full Name"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">{t('phone_number')}</label>
              <div className="relative group">
                <Smartphone className="absolute left-4 top-4 text-gray-300 group-focus-within:text-green-600 transition-colors" size={18} />
                <input 
                  type="tel" 
                  maxLength={10}
                  className="w-full bg-white border border-gray-200 rounded-2xl py-4 pl-12 pr-5 text-sm font-bold text-gray-900 outline-none focus:border-green-600 transition-all shadow-sm"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                  placeholder="10-digit number"
                />
              </div>
            </div>

            <button 
              type="submit"
              disabled={loading || phone.length < 10}
              className="w-full mt-8 bg-green-600 hover:bg-green-700 text-white py-5 rounded-[24px] font-bold text-xs tracking-[0.2em] uppercase shadow-2xl shadow-green-100 active:scale-95 transition-all flex items-center justify-center gap-3"
            >
              {loading ? <Loader2 size={18} className="animate-spin" /> : <><ArrowRight size={18} /> {t('send_otp')}</>}
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerifyOtp} className="space-y-8">
            {demoOtpBox && (
              <div className="bg-green-50 border border-green-100 rounded-2xl p-4 flex items-center justify-between">
                <div>
                  <p className="text-[9px] font-bold text-green-600 uppercase tracking-widest mb-0.5">Demo OTP</p>
                  <p className="text-xl font-mono font-black text-gray-900 tracking-widest">{demoOtpBox}</p>
                </div>
                <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                  <CheckCircle2 className="text-green-600" size={20} />
                </div>
              </div>
            )}

            <div className="space-y-4">
              <div className="flex justify-between items-center px-1">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{t('otp_placeholder')}</label>
                <button type="button" className="text-[10px] font-bold text-green-600 uppercase tracking-widest">{t('resend')}</button>
              </div>
              <div className="relative group">
                <Lock className="absolute left-4 top-5 text-gray-300 group-focus-within:text-green-600 transition-colors" size={18} />
                <input 
                  ref={otpInputRef}
                  type="tel" 
                  maxLength={6}
                  className="w-full bg-white border border-gray-200 rounded-2xl py-5 pl-12 pr-5 text-2xl font-mono font-black text-gray-900 tracking-[0.5em] outline-none focus:border-green-600 transition-all text-center shadow-sm"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                  placeholder="••••••"
                />
              </div>
            </div>

            <button 
              type="submit"
              disabled={loading || otp.length < 6}
              className="w-full mt-4 bg-green-600 hover:bg-green-700 text-white py-5 rounded-[24px] font-bold text-xs tracking-[0.2em] uppercase shadow-2xl shadow-green-100 active:scale-95 transition-all flex items-center justify-center gap-3"
            >
              {loading ? <Loader2 size={18} className="animate-spin" /> : <><CheckCircle2 size={18} /> {t('verify_otp')}</>}
            </button>
          </form>
        )}

        {errorVisible && (
          <div className="mt-6 p-4 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-3">
            <AlertTriangle className="text-red-600 shrink-0" size={18} />
            <p className="text-[10px] font-bold text-red-600 uppercase tracking-wide">{t(errorVisible) || errorVisible}</p>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-8 text-center opacity-30">
        <p className="text-[9px] font-bold text-gray-400 uppercase tracking-[0.3em]">{t('kisanclaim')} v2.4.0</p>
      </div>

    </div>
  );
};

export default MobileLogin;
