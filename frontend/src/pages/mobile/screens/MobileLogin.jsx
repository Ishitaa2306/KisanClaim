import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, AlertCircle, ArrowLeft, Loader2 } from 'lucide-react';
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
    <div className="w-full h-screen bg-gray-50 flex flex-col justify-center items-center font-sans relative">
      
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
        className="absolute top-6 left-6 p-2 rounded-full hover:bg-gray-200 transition-colors z-20"
      >
        <ArrowLeft className="w-6 h-6 text-gray-700" />
      </button>

      <div className="w-full max-w-md p-8 relative z-10 animate-[fade-in_0.6s_ease-out]">
        
        <div className="text-center mb-10">
          <h1 className="text-3xl font-black tracking-tight mb-2" style={{ color: '#064e3b' }}>
            {step === 1 ? 'Login' : 'Verify OTP'}
          </h1>
          <p className="text-gray-500 text-sm font-medium">
            {step === 1 
              ? 'Enter your details to continue' 
              : `Code sent to +91 ${phone}`}
          </p>
        </div>

        {errorVisible && (
          <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-xl flex items-start gap-3">
            <AlertCircle className="text-red-500 shrink-0 mt-0.5" size={18} />
            <p className="text-sm font-medium text-red-700">{errorVisible}</p>
          </div>
        )}

        {step === 1 ? (
          <form onSubmit={handleSendOtp} className="space-y-5">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5 ml-1">Full Name</label>
              <input 
                type="text" 
                className="w-full bg-white border border-gray-200 rounded-xl py-3.5 px-4 text-base font-medium text-gray-900 outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/20 transition-all shadow-sm"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={loading}
                placeholder="Enter your full name"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5 ml-1">Phone Number</label>
              <div className="relative flex items-center">
                <span className="absolute left-4 text-gray-500 font-medium">+91</span>
                <input 
                  type="tel" 
                  maxLength={10}
                  className="w-full bg-white border border-gray-200 rounded-xl py-3.5 pl-12 pr-4 text-base font-medium text-gray-900 outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/20 transition-all shadow-sm"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                  disabled={loading}
                  placeholder="Mobile number"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5 ml-1">PMFBY / Aadhaar ID</label>
              <input 
                type="text" 
                className="w-full bg-white border border-gray-200 rounded-xl py-3.5 px-4 text-base font-medium text-gray-900 outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/20 transition-all shadow-sm"
                value={aadhaar}
                onChange={(e) => setAadhaar(e.target.value)}
                disabled={loading}
                placeholder="Optional"
              />
            </div>

            <button 
              type="submit"
              disabled={loading || phone.length < 10 || !name}
              className="w-full mt-6 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl py-4 flex items-center justify-center font-bold text-lg shadow-[0_4px_15px_rgba(34,197,94,0.3)] active:scale-95 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <Loader2 className="w-6 h-6 animate-spin" />
              ) : (
                'Send OTP'
              )}
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerifyOtp} className="space-y-6 flex flex-col items-center">
            
            {demoOtpBox && (
              <div className="w-full bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-2 text-center shadow-sm">
                <p className="text-[10px] text-yellow-600 uppercase font-bold tracking-wider mb-1">Demo OTP Received</p>
                <p className="text-2xl font-mono font-black text-yellow-800 tracking-widest">{demoOtpBox}</p>
              </div>
            )}

            <input 
              ref={otpInputRef}
              type="tel" 
              maxLength={6}
              placeholder="• • • • • •"
              className="w-full text-center tracking-[0.75em] text-3xl font-mono font-black bg-white border border-gray-200 rounded-xl py-5 px-3 outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/20 transition-all shadow-sm"
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
              disabled={loading}
            />
            
            <button 
              type="submit"
              disabled={loading || otp.length < 6}
              className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl py-4 flex items-center justify-center font-bold text-lg shadow-[0_4px_15px_rgba(34,197,94,0.3)] active:scale-95 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <Loader2 className="w-6 h-6 animate-spin" />
              ) : (
                'Verify OTP'
              )}
            </button>
            
            <p className="text-sm font-medium text-gray-500 mt-4">
              Didn't receive code? <button type="button" className="text-green-600 font-semibold hover:text-green-700">Resend</button>
            </p>
          </form>
        )}
      </div>
      
      <style>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};

export default MobileLogin;
