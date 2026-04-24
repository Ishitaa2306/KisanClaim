import React, { useState } from 'react';
import { User, LogOut, Globe, Moon, Sun, Bell, RefreshCw, Info, ChevronRight } from 'lucide-react';
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
    { code: 'mr', label: 'मराठी (Marathi)' },
    { code: 'ta', label: 'தமிழ் (Tamil)' },
    { code: 'te', label: 'తెలుగు (Telugu)' },
    { code: 'kn', label: 'ಕನ್ನಡ (Kannada)' }
  ];

  return (
    <div className="w-full min-h-full bg-gradient-to-b from-gray-50 to-gray-100 p-4 pb-28 font-sans overflow-y-auto">
      
      <div className="mb-6 mt-4 px-1">
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight leading-tight">{t('settings') || 'Settings'}</h1>
      </div>

      <div className="space-y-6">
        {/* Profile Section */}
        <div className="bg-white/90 backdrop-blur-md rounded-[16px] p-4 shadow-[0_4px_15px_rgb(0,0,0,0.02)] border border-white">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-green-50 flex items-center justify-center text-green-600 border border-green-100 shrink-0">
              <User size={28} />
            </div>
            <div>
              <h2 className="text-lg font-black text-gray-900 leading-none mb-1.5">{farmerName || 'Manoj Kumar'}</h2>
              <p className="text-xs text-gray-500 font-medium leading-none mb-1.5">+91 98765 43210</p>
              <p className="text-[10px] text-green-600 font-bold uppercase tracking-widest leading-none">ID: {farmerId}</p>
            </div>
          </div>
        </div>

        {/* Preferences Section */}
        <div>
          <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3 px-2">Preferences</h3>
          <div className="bg-white rounded-[16px] shadow-[0_4px_15px_rgb(0,0,0,0.02)] border border-gray-100 overflow-hidden divide-y divide-gray-50">
            
            {/* Language Selector */}
            <div className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-500">
                  <Globe size={20} />
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-800 leading-none mb-1">Language</p>
                  <p className="text-[10px] text-gray-500 font-medium leading-none">{languages.find(l => l.code === lang)?.label || 'English'}</p>
                </div>
              </div>
              <select 
                value={lang} 
                onChange={(e) => changeLang(e.target.value)}
                className="bg-transparent text-sm font-bold text-gray-700 outline-none cursor-pointer appearance-none text-right pr-4 bg-chevron"
                style={{ backgroundImage: `url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="%239ca3af" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6"/></svg>')`, backgroundPosition: 'right center', backgroundRepeat: 'no-repeat' }}
              >
                {languages.map(l => (
                  <option key={l.code} value={l.code}>{l.label}</option>
                ))}
              </select>
            </div>

            {/* Appearance Toggle */}
            <div className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-500">
                  {isDarkMode ? <Moon size={20} /> : <Sun size={20} />}
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-800 leading-none mb-1">Appearance</p>
                  <p className="text-[10px] text-gray-500 font-medium leading-none">{isDarkMode ? 'Dark Mode' : 'Light Mode'}</p>
                </div>
              </div>
              <button 
                onClick={() => setIsDarkMode(!isDarkMode)}
                className={`w-12 h-6 rounded-full transition-colors relative ${isDarkMode ? 'bg-indigo-500' : 'bg-gray-200'}`}
              >
                <div className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-transform shadow-sm ${isDarkMode ? 'translate-x-6.5 left-0.5' : 'translate-x-0.5 left-0'}`}></div>
              </button>
            </div>

          </div>
        </div>

        {/* App Settings Section */}
        <div>
          <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3 px-2">App Settings</h3>
          <div className="bg-white rounded-[16px] shadow-[0_4px_15px_rgb(0,0,0,0.02)] border border-gray-100 overflow-hidden divide-y divide-gray-50">
            
            {/* Notifications */}
            <div className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center text-amber-500">
                  <Bell size={20} />
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-800 leading-none mb-1">Notifications</p>
                  <p className="text-[10px] text-gray-500 font-medium leading-none">Alerts & updates</p>
                </div>
              </div>
              <button 
                onClick={() => setNotifications(!notifications)}
                className={`w-12 h-6 rounded-full transition-colors relative ${notifications ? 'bg-green-500' : 'bg-gray-200'}`}
              >
                <div className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-transform shadow-sm ${notifications ? 'translate-x-6.5 left-0.5' : 'translate-x-0.5 left-0'}`}></div>
              </button>
            </div>

            {/* Data Sync */}
            <div className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-cyan-50 flex items-center justify-center text-cyan-500">
                  <RefreshCw size={20} />
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-800 leading-none mb-1">Data Sync</p>
                  <p className="text-[10px] text-gray-500 font-medium leading-none">Last synced: Just now</p>
                </div>
              </div>
              <button className="text-[10px] font-bold text-green-600 bg-green-50 px-3 py-1.5 rounded-md uppercase tracking-wider">Sync Now</button>
            </div>

          </div>
        </div>

        {/* About & Logout */}
        <div className="bg-white rounded-[16px] shadow-[0_4px_15px_rgb(0,0,0,0.02)] border border-gray-100 overflow-hidden divide-y divide-gray-50">
          <div className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-gray-400">
              <Info size={20} />
            </div>
            <div className="flex-1">
              <p className="text-sm font-bold text-gray-800 leading-none mb-1">About</p>
              <p className="text-[10px] text-gray-500 font-medium leading-none">Version 2.4.0</p>
            </div>
          </div>

          <button 
            onClick={() => {
              logoutSession();
              navigate('/mobile/login');
            }}
            className="w-full p-4 flex items-center justify-center gap-2 text-red-500 hover:bg-red-50 transition-colors active:bg-red-100"
          >
            <LogOut size={18} />
            <span className="text-xs font-bold uppercase tracking-widest">Logout</span>
          </button>
        </div>

        <div className="text-center mt-8 mb-4">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Powered by</p>
          <p className="text-sm font-black text-gray-300 tracking-widest uppercase mt-1">KisanClaim AI</p>
        </div>

      </div>
    </div>
  );
};

export default MobileSettings;
