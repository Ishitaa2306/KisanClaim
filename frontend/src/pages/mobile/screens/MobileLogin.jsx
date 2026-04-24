import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, AlertCircle } from 'lucide-react';
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

  const handleSendOtp = async (e) => {
    e.preventDefault();
    setErrorVisible(null);
    setDemoOtpBox(null);
    
    if (!name || !phone) {
      return setErrorVisible('Name and phone number are required.');
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
      
      // Success! Login and navigate
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
    <div className="w-full h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
        <div className="p-8 text-center bg-green-50/50 border-b border-gray-100">
          <div className="w-16 h-16 bg-green-100/50 rounded-full flex items-center justify-center mx-auto mb-4 border border-green-200">
            <ShieldCheck size={32} className="text-green-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight" data-i18n="login_title">{t('login_title')}</h1>
          <p className="text-sm text-gray-500 mt-2" data-i18n="login_subtitle">{t('login_subtitle')}</p>
        </div>

        <div className="p-8">
          {errorVisible && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md flex items-start gap-3">
              <AlertCircle className="text-red-500 shrink-0 mt-0.5" size={18} />
              <p className="text-sm text-red-700">{errorVisible}</p>
            </div>
          )}

          {step === 1 ? (
            <form onSubmit={handleSendOtp} className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-2" data-i18n="fullname_label">{t('fullname_label')}</label>
                <input 
                  type="text" 
                  className="w-full bg-white border border-gray-300 rounded-md py-2.5 px-3 text-sm text-gray-900 outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500 transition-shadow"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={loading}
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-2" data-i18n="phone_label">{t('phone_label')}</label>
                <input 
                  type="text" 
                  maxLength={10}
                  className="w-full bg-white border border-gray-300 rounded-md py-2.5 px-3 text-sm text-gray-900 outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500 transition-shadow"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                  disabled={loading}
                />
              </div>
              <button 
                type="submit"
                disabled={loading}
                className="w-full mt-4 py-3 bg-green-600 text-white font-semibold rounded-md shadow-sm hover:bg-green-700 transition disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {loading ? <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div> : <span data-i18n="send_otp_btn">{t('send_otp_btn')}</span>}
              </button>
              
              <div className="mt-6 text-center text-xs text-gray-400">
                <p data-i18n="demo_prefill">{t('demo_prefill')}</p>
              </div>
            </form>
          ) : (
            <form onSubmit={handleVerifyOtp} className="space-y-5 flex flex-col items-center">
              <p className="text-sm text-gray-600 text-center mb-2"><span data-i18n="sms_sent_to">{t('sms_sent_to')}</span> <br/><span className="font-bold text-gray-900">+91 {phone}</span></p>
              
              {demoOtpBox && (
                <div className="w-full bg-yellow-50 border border-yellow-200 rounded p-3 mb-2 text-center shadow-sm">
                  <p className="text-xs text-yellow-800 uppercase font-bold tracking-wider mb-1" data-i18n="demo_sms_received">{t('demo_sms_received')}</p>
                  <p className="text-xl font-mono text-yellow-900 tracking-widest">{demoOtpBox}</p>
                </div>
              )}

              <input 
                type="text" 
                maxLength={6}
                placeholder="• • • • • •"
                className="w-full text-center tracking-[0.5em] text-2xl font-mono bg-white border border-gray-300 rounded-md py-3 px-3 outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500 transition-shadow"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                disabled={loading}
                autoFocus
              />
              
              <button 
                type="submit"
                disabled={loading || otp.length < 6}
                className="w-full mt-4 py-3 bg-green-600 text-white font-semibold rounded-md shadow-sm hover:bg-green-700 transition disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {loading ? <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div> : <span data-i18n="verify_login_btn">{t('verify_login_btn')}</span>}
              </button>
              
              <button
                type="button"
                onClick={() => setStep(1)}
                className="mt-4 text-sm font-medium text-green-600 hover:text-green-800 transition"
                data-i18n="back_to_login"
              >
                {t('back_to_login')}
              </button>
            </form>
          )}

        </div>
      </div>
    </div>
  );
};

export default MobileLogin;
