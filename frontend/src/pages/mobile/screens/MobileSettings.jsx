import React from 'react';
import { User, LogOut, Globe } from 'lucide-react';
import { useMobile } from '../context/MobileContext';
import { useNavigate } from 'react-router-dom';

const MobileSettings = () => {
  const { lang, changeLang, t, logoutSession, farmerId, farmerName } = useMobile();
  const navigate = useNavigate();

  const languages = [
    { code: 'en', label: 'English' },
    { code: 'hi', label: 'हिंदी (Hindi)' },
    { code: 'mr', label: 'मराठी (Marathi)' },
    { code: 'ta', label: 'தமிழ் (Tamil)' },
    { code: 'te', label: 'తెలుగు (Telugu)' },
    { code: 'kn', label: 'ಕನ್ನಡ (Kannada)' }
  ];

  return (
    <div className="w-full">
      <div className="mb-6 pb-4 border-b border-gray-200">
        <h1 className="text-2xl font-bold text-gray-900 leading-tight">{t('account_settings')}</h1>
        <p className="text-sm text-gray-500 mt-1">{t('account_settings_desc')}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl">
        
        <section>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-4 border-b border-gray-100 bg-gray-50/50 rounded-t-lg flex items-center gap-2">
              <User size={18} className="text-gray-500" />
              <h2 className="text-sm font-semibold text-gray-800 uppercase tracking-wider">{t('profile_info')}</h2>
            </div>
            <div className="p-6">
              <p className="text-xl font-bold text-gray-900 font-mono">{farmerId}</p>
              <p className="text-sm text-gray-500 mt-1">{t('account_label')}: {farmerName || 'Authenticated'}</p>
              
              <button 
                onClick={() => {
                  logoutSession();
                  navigate('/mobile/login');
                }}
                className="w-full sm:w-auto mt-6 flex items-center justify-center gap-2 px-5 py-2.5 bg-white border border-red-200 rounded-md text-sm text-red-600 font-semibold shadow-sm hover:bg-red-50 transition"
              >
                <LogOut size={16} />
                {t('logout')}
              </button>
            </div>
          </div>
        </section>

        <section>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
             <div className="p-4 border-b border-gray-100 bg-gray-50/50 rounded-t-lg flex items-center gap-2">
              <Globe size={18} className="text-gray-500" />
              <h2 className="text-sm font-semibold text-gray-800 uppercase tracking-wider">{t('language_selector')}</h2>
            </div>
            <div className="p-0 flex flex-col">
              {languages.map((l) => (
                <button 
                  key={l.code}
                  onClick={() => changeLang(l.code)}
                  className={`p-4 text-sm text-left transition-colors border-b border-gray-100 last:border-0
                    ${lang === l.code ? 'bg-green-50/50 text-green-700 font-bold' : 'text-gray-700 font-medium hover:bg-gray-50'}
                  `}
                >
                  {l.label}
                  {lang === l.code && <span className="float-right text-green-600 mt-0.5">✔</span>}
                </button>
              ))}
            </div>
          </div>
        </section>

      </div>
    </div>
  );
};

export default MobileSettings;
