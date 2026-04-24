import React, { useState } from 'react';
import { 
  User, LogOut, Globe, Moon, Sun, Bell, 
  RefreshCw, Info, ChevronRight, ShieldCheck,
  Smartphone, Database, ChevronLeft
} from 'lucide-react';
import { useMobile } from '../context/MobileContext';
import { useNavigate } from 'react-router-dom';

const MobileSettings = () => {
  const { lang, changeLang, t, logoutSession, farmerId, farmerName } = useMobile();
  const navigate = useNavigate();

  const [isDarkMode, setIsDarkMode] = useState(false);
  const [notifications, setNotifications] = useState(true);

  const languages = [
    { code: 'en', label: 'English' },
    { code: 'hi', label: 'हिंदी (Hindi)' },
    { code: 'kn', label: 'ಕನ್ನಡ (Kannada)' },
    { code: 'mr', label: 'मराठी (Marathi)' },
    { code: 'te', label: 'తెలుగు (Telugu)' },
    { code: 'ta', label: 'தமிழ் (Tamil)' }
  ];

  const handleLogout = () => {
    logoutSession();
    navigate('/mobile/login');
  };

  return (
    <div className="w-full min-h-screen bg-gray-50 text-gray-900 font-sans pb-24 overflow-x-hidden">
      
      {/* Header */}
      <div className="bg-white pt-10 px-6 pb-6 border-b border-gray-100">
        <div className="flex items-center gap-4 mb-1">
          <button onClick={() => navigate(-1)} className="p-2 -ml-2 rounded-full hover:bg-gray-100 transition-colors">
            <ChevronLeft size={24} />
          </button>
          <h2 className="text-sm font-bold text-green-600 tracking-widest uppercase">
            {t('settings')}
          </h2>
        </div>
        <h1 className="text-2xl font-black text-gray-900 uppercase tracking-tight">
          {t('preferences')}
        </h1>
      </div>

      <div className="px-6 space-y-8 pt-6">
        
        {/* Profile Card */}
        <div className="w-full p-6 bg-white rounded-[32px] border border-gray-100 shadow-sm">
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 rounded-3xl bg-green-50 flex items-center justify-center border border-green-100 text-green-600 shadow-lg shadow-green-50">
              <User size={32} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-0.5">{farmerName || 'Manoj Kumar'}</h3>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">{t('account_label')}: {farmerId || 'ID-8293'}</p>
              <div className="bg-green-50 px-2 py-0.5 rounded-lg border border-green-100 inline-block">
                <span className="text-[9px] font-bold text-green-600 uppercase tracking-widest">Verified</span>
              </div>
            </div>
          </div>
        </div>

        {/* Settings Groups */}
        <div className="space-y-4">
          <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] px-1">{t('preferences')}</h3>
          
          <div className="bg-white border border-gray-100 rounded-[32px] overflow-hidden shadow-sm">
            
            {/* Language */}
            <div className="p-6 border-b border-gray-50 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600 border border-blue-100">
                  <Globe size={20} />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-gray-900 uppercase tracking-tight">{t('language')}</h4>
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{languages.find(l => l.code === lang)?.label}</p>
                </div>
              </div>
              <select 
                value={lang} 
                onChange={(e) => changeLang(e.target.value)}
                className="bg-transparent text-[10px] font-bold text-blue-600 uppercase tracking-widest outline-none cursor-pointer appearance-none text-right pr-4"
              >
                {languages.map(l => (
                  <option key={l.code} value={l.code} className="text-gray-900">{l.label}</option>
                ))}
              </select>
            </div>

            {/* Appearance */}
            <div className="p-6 border-b border-gray-50 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-2xl bg-purple-50 flex items-center justify-center text-purple-600 border border-purple-100">
                  <Sun size={20} />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-gray-900 uppercase tracking-tight">{t('appearance')}</h4>
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Light Mode</p>
                </div>
              </div>
              <div className="w-12 h-6 bg-gray-200 rounded-full p-1 flex justify-start">
                <div className="w-4 h-4 bg-white rounded-full shadow-sm" />
              </div>
            </div>

            {/* Notifications */}
            <div className="p-6 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-2xl bg-orange-50 flex items-center justify-center text-orange-600 border border-orange-100">
                  <Bell size={20} />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-gray-900 uppercase tracking-tight">{t('notifications_label')}</h4>
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{t('alerts_updates')}</p>
                </div>
              </div>
              <div className="w-12 h-6 bg-green-600 rounded-full p-1 flex justify-end">
                <div className="w-4 h-4 bg-white rounded-full shadow-sm" />
              </div>
            </div>

          </div>
        </div>

        {/* Data Sync Section */}
        <div className="space-y-4">
          <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] px-1">{t('data_sync')}</h3>
          
          <div className="bg-white border border-gray-100 rounded-[32px] p-6 flex items-center justify-between shadow-sm">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-2xl bg-cyan-50 flex items-center justify-center text-cyan-600 border border-cyan-100">
                <Database size={20} />
              </div>
              <div>
                <h4 className="text-sm font-bold text-gray-900 uppercase tracking-tight">{t('offline_mode_active')}</h4>
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{t('last_synced')}</p>
              </div>
            </div>
            <button className="bg-gray-50 p-3 rounded-2xl border border-gray-100 text-cyan-600 active:scale-95 transition-all">
              <RefreshCw size={18} />
            </button>
          </div>
        </div>

        {/* Logout Button */}
        <button 
          onClick={handleLogout}
          className="w-full p-6 bg-red-50 border border-red-100 rounded-[32px] flex items-center justify-center gap-3 active:scale-95 transition-all group shadow-sm"
        >
          <LogOut className="text-red-600 group-hover:scale-110 transition-transform" size={20} />
          <span className="text-xs font-bold text-red-600 uppercase tracking-[0.2em]">{t('logout')}</span>
        </button>

        {/* About Section */}
        <div className="text-center pt-8 space-y-2">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.4em]">{t('powered_by')}</p>
          <h4 className="text-lg font-black text-gray-900 tracking-[0.2em] uppercase">{t('kisanclaim')}</h4>
          <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">{t('version')}</p>
        </div>

      </div>
    </div>
  );
};

export default MobileSettings;
