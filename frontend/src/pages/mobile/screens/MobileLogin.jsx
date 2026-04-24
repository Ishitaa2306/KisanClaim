import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, ArrowLeft, Loader2, User, Smartphone, Badge } from 'lucide-react';
import { useMobile } from '../context/MobileContext';

const MobileLogin = () => {
  const navigate = useNavigate();
  const { loginSession, t } = useMobile();
  
  const [step, setStep] = useState(1);
  const [name, setName] = useState('Manoj Rajput');
  const [phone, setPhone] = useState('9876543210');
  const [aadhaar, setAadhaar] = useState('');
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
    setDemoOtpBox(null);
    
    if (!name || !phone || phone.length < 10) {
      return setErrorVisible('Name and valid phone number are required.');
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

    if (!otp) return setErrorVisible('Please enter the OTP.');

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
      setErrorVisible(err.message || 'Invalid OTP.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full h-screen relative flex flex-col justify-center items-center overflow-hidden font-sans bg-black">
      
      {/* Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center z-0 scale-105"
        style={{ 
          backgroundImage: "url('https://images.unsplash.com/photo-1592982537447-7440770cbfc9?q=80&w=1000&auto=format&fit=crop')", 
          filter: 'blur(4px)' 
        }}
      />
      
      {/* Dark overlay */}
      <div 
        className="absolute inset-0 z-10" 
        style={{ backgroundColor: 'rgba(0, 0, 0, 0.25)' }} 
      />

      {/* Back Button */}
      <button 
        onClick={() => {
          if (step === 2) {
            setStep(1);
            setOtp('');
          } else {
            navigate('/mobile/landing');
          }
        }}
        className="absolute top-6 left-6 p-2 rounded-full hover:bg-white/10 transition-colors z-30 flex items-center gap-2"
      >
        <ArrowLeft className="w-5 h-5 text-white" />
        <span className="text-white text-xs font-semibold tracking-wider">EXIT</span>
      </button>

      {/* Main Content Area */}
      <div className="relative z-20 w-full px-6 flex flex-col items-center max-w-md animate-[fade-in_0.6s_ease-out]">
        
        {/* Glass Card */}
        <div 
          className="w-full p-8 flex flex-col items-center"
          style={{
            background: 'rgba(255, 255, 255, 0.18)',
            backdropFilter: 'blur(18px)',
            WebkitBackdropFilter: 'blur(18px)',
            borderRadius: '24px',
            border: '1px solid rgba(255, 255, 255, 0.25)',
            boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.15)'
          }}
        >
          
          <div className="text-center mb-8 w-full">
            <h1 className="text-4xl font-normal text-white tracking-tight mb-2">
              KisanClaim
            </h1>
            <p className="text-gray-100 text-[10px] font-bold tracking-[0.25em] uppercase opacity-90">
              INTELLIGENCE PLATFORM
            </p>
          </div>

          {errorVisible && (
            <div className="w-full mb-6 p-3 bg-red-500/20 border border-red-500/50 rounded-xl flex items-center justify-center">
              <p className="text-xs font-medium text-red-100">{errorVisible}</p>
            </div>
          )}

          {step === 1 ? (
            <form onSubmit={handleSendOtp} className="w-full space-y-5">
              
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-gray-100 uppercase tracking-widest ml-1">
                  Full Name
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-white/70" />
                  </div>
                  <input 
                    type="text" 
                    className="w-full rounded-xl py-3.5 pl-12 pr-4 text-base font-medium text-white placeholder-white/50 outline-none transition-all"
                    style={{
                      background: 'rgba(255, 255, 255, 0.12)',
                      border: '1px solid rgba(255, 255, 255, 0.25)'
                    }}
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    disabled={loading}
                    placeholder="Enter your credentials"
                    onFocus={(e) => {
                      e.target.style.borderColor = '#4ade80';
                      e.target.style.boxShadow = '0 0 0 1px rgba(74, 222, 128, 0.5)';
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = 'rgba(255, 255, 255, 0.25)';
                      e.target.style.boxShadow = 'none';
                    }}
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-gray-100 uppercase tracking-widest ml-1">
                  Phone Number
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Smartphone className="h-5 w-5 text-white/70" />
                  </div>
                  <input 
                    type="tel" 
                    maxLength={10}
                    className="w-full rounded-xl py-3.5 pl-12 pr-4 text-base font-medium text-white placeholder-white/50 outline-none transition-all"
                    style={{
                      background: 'rgba(255, 255, 255, 0.12)',
                      border: '1px solid rgba(255, 255, 255, 0.25)'
                    }}
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                    disabled={loading}
                    placeholder="+91 00000 00000"
                    onFocus={(e) => {
                      e.target.style.borderColor = '#4ade80';
                      e.target.style.boxShadow = '0 0 0 1px rgba(74, 222, 128, 0.5)';
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = 'rgba(255, 255, 255, 0.25)';
                      e.target.style.boxShadow = 'none';
                    }}
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5 mb-2">
                <label className="text-[10px] font-bold text-gray-100 uppercase tracking-widest ml-1">
                  Aadhaar ID
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Badge className="h-5 w-5 text-white/70" />
                  </div>
                  <input 
                    type="text" 
                    className="w-full rounded-xl py-3.5 pl-12 pr-4 text-base font-medium text-white placeholder-white/50 outline-none transition-all"
                    style={{
                      background: 'rgba(255, 255, 255, 0.12)',
                      border: '1px solid rgba(255, 255, 255, 0.25)'
                    }}
                    value={aadhaar}
                    onChange={(e) => setAadhaar(e.target.value)}
                    disabled={loading}
                    placeholder="0000 0000 0000"
                    onFocus={(e) => {
                      e.target.style.borderColor = '#4ade80';
                      e.target.style.boxShadow = '0 0 0 1px rgba(74, 222, 128, 0.5)';
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = 'rgba(255, 255, 255, 0.25)';
                      e.target.style.boxShadow = 'none';
                    }}
                  />
                </div>
              </div>

              <button 
                type="submit"
                disabled={loading || phone.length < 10 || !name}
                className="w-full mt-4 text-white rounded-full py-4 flex items-center justify-center gap-2 font-bold text-sm tracking-wider shadow-lg active:scale-95 transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed"
                style={{
                  background: 'linear-gradient(to right, #16a34a, #22c55e)'
                }}
              >
                {loading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    SECURE LOGIN
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>
            </form>
          ) : (
            <form onSubmit={handleVerifyOtp} className="w-full space-y-6 flex flex-col items-center">
              
              {demoOtpBox && (
                <div className="w-full bg-white/10 border border-white/20 rounded-xl p-4 mb-2 text-center shadow-sm">
                  <p className="text-[10px] text-green-300 uppercase font-bold tracking-wider mb-1">Demo OTP Received</p>
                  <p className="text-2xl font-mono font-black text-white tracking-widest">{demoOtpBox}</p>
                </div>
              )}

              <div className="flex flex-col gap-1.5 w-full">
                <label className="text-[10px] font-bold text-gray-100 uppercase tracking-widest ml-1 text-center">
                  Enter Verification Code
                </label>
                <input 
                  ref={otpInputRef}
                  type="tel" 
                  maxLength={6}
                  placeholder="• • • • • •"
                  className="w-full text-center tracking-[0.5em] text-3xl font-mono font-black rounded-xl py-5 px-3 text-white placeholder-white/30 outline-none transition-all shadow-sm"
                  style={{
                    background: 'rgba(255, 255, 255, 0.12)',
                    border: '1px solid rgba(255, 255, 255, 0.25)'
                  }}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                  disabled={loading}
                  onFocus={(e) => {
                    e.target.style.borderColor = '#4ade80';
                    e.target.style.boxShadow = '0 0 0 1px rgba(74, 222, 128, 0.5)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = 'rgba(255, 255, 255, 0.25)';
                    e.target.style.boxShadow = 'none';
                  }}
                />
              </div>
              
              <button 
                type="submit"
                disabled={loading || otp.length < 6}
                className="w-full mt-2 text-white rounded-full py-4 flex items-center justify-center gap-2 font-bold text-sm tracking-wider shadow-lg active:scale-95 transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed"
                style={{
                  background: 'linear-gradient(to right, #16a34a, #22c55e)'
                }}
              >
                {loading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    VERIFY & LOGIN
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>
              
              <p className="text-xs font-medium text-gray-200 mt-2">
                Didn't receive code? <button type="button" className="text-green-400 font-bold hover:text-green-300 tracking-wider">RESEND</button>
              </p>
            </form>
          )}

          {/* Footer inside card */}
          <div className="mt-10 flex flex-col items-center gap-1.5 opacity-80">
            <span className="text-[9px] font-semibold text-gray-200 uppercase tracking-widest">
              AUTHORIZED ACCESS ONLY
            </span>
            <span className="text-[9px] font-semibold text-green-400 uppercase tracking-widest cursor-pointer hover:text-green-300">
              TERMS & CONDITIONS
            </span>
          </div>

        </div>

        {/* Secure Access Footer Line */}
        <div className="flex items-center gap-4 mt-8 opacity-60">
          <div className="h-px w-8 bg-white/40"></div>
          <span className="text-[10px] font-semibold text-white uppercase tracking-[0.3em]">
            SECURE ACCESS
          </span>
          <div className="h-px w-8 bg-white/40"></div>
        </div>

      </div>
      
      <style>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};

export default MobileLogin;
