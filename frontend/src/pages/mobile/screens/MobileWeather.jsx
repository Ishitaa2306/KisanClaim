import React, { useEffect, useState } from 'react';
import { 
  ChevronLeft, Cloud, CloudRain, Sun, Wind, 
  Droplets, Thermometer, AlertTriangle, ChevronRight,
  Loader2, Activity, Info
} from 'lucide-react';
import { useMobile } from '../context/MobileContext';
import { useNavigate } from 'react-router-dom';

const MobileWeather = () => {
  const { t, farmerId } = useMobile();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setTimeout(() => setLoading(false), 800);
  }, []);

  if (loading) {
    return (
      <div className="flex w-full min-h-screen items-center justify-center bg-gray-50">
        <Loader2 className="animate-spin text-green-600" size={32} />
      </div>
    );
  }

  const forecast = [
    { day: t('mon'), temp: '32°', icon: <Sun size={20} className="text-yellow-500" /> },
    { day: t('tue'), temp: '31°', icon: <Cloud size={20} className="text-gray-400" /> },
    { day: t('wed'), temp: '29°', icon: <CloudRain size={20} className="text-blue-500" /> },
    { day: t('thu'), temp: '30°', icon: <Sun size={20} className="text-yellow-500" /> },
    { day: t('fri'), temp: '32°', icon: <Sun size={20} className="text-yellow-500" /> },
  ];

  return (
    <div className="w-full min-h-screen bg-gray-50 text-gray-900 font-sans pb-24 overflow-x-hidden">
      
      {/* Header */}
      <div className="bg-white pt-10 px-6 pb-8 border-b border-gray-100">
        <div className="flex items-center gap-4 mb-8">
          <button onClick={() => navigate(-1)} className="p-2 -ml-2 rounded-full hover:bg-gray-100 transition-colors">
            <ChevronLeft size={24} />
          </button>
          <h2 className="text-sm font-bold text-green-600 tracking-widest uppercase">
            {t('weather')}
          </h2>
        </div>

        <div className="flex justify-between items-end">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <MapPin size={14} className="text-gray-400" />
              <p className="text-xs text-gray-500 font-bold uppercase tracking-widest">Rajasthan, IN</p>
            </div>
            <h1 className="text-6xl font-black text-gray-900 tracking-tighter">28°C</h1>
            <p className="text-sm font-bold text-gray-500 uppercase tracking-widest mt-1">{t('mostly_cloudy')}</p>
          </div>
          <div className="w-24 h-24 bg-blue-50 rounded-[32px] flex items-center justify-center text-blue-500 border border-blue-100 shadow-sm">
            <CloudRain size={48} />
          </div>
        </div>
      </div>

      <div className="px-6 space-y-6 pt-6">
        
        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-white p-4 rounded-[28px] border border-gray-100 shadow-sm text-center">
            <Wind size={18} className="text-indigo-500 mx-auto mb-2" />
            <p className="text-[8px] text-gray-400 font-bold uppercase tracking-widest mb-0.5">{t('wind')}</p>
            <p className="text-xs font-bold text-gray-900">12km/h</p>
          </div>
          <div className="bg-white p-4 rounded-[28px] border border-gray-100 shadow-sm text-center">
            <Droplets size={18} className="text-blue-500 mx-auto mb-2" />
            <p className="text-[8px] text-gray-400 font-bold uppercase tracking-widest mb-0.5">{t('humidity')}</p>
            <p className="text-xs font-bold text-gray-900">64%</p>
          </div>
          <div className="bg-white p-4 rounded-[28px] border border-gray-100 shadow-sm text-center">
            <CloudRain size={18} className="text-cyan-500 mx-auto mb-2" />
            <p className="text-[8px] text-gray-400 font-bold uppercase tracking-widest mb-0.5">{t('precip')}</p>
            <p className="text-xs font-bold text-gray-900">10%</p>
          </div>
        </div>

        {/* 5-Day Forecast */}
        <div className="bg-white rounded-[32px] p-6 border border-gray-100 shadow-sm">
          <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-6 px-1">{t('five_day_forecast')}</h3>
          <div className="space-y-6">
            {forecast.map((item, i) => (
              <div key={i} className="flex items-center justify-between">
                <span className="text-xs font-bold text-gray-500 uppercase w-12">{item.day}</span>
                <div className="flex-1 flex justify-center">
                  {item.icon}
                </div>
                <span className="text-xs font-bold text-gray-900 w-12 text-right">{item.temp}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Weather Insights / Analysis */}
        <div className="space-y-4">
          <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] px-1">{t('weather_insights')}</h3>
          
          <div className="bg-orange-50 border border-orange-100 rounded-[32px] p-6 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-24 h-24 bg-orange-200/20 rounded-full -mr-8 -mt-8" />
            <div className="flex items-center gap-4 mb-4 relative z-10">
              <div className="w-10 h-10 bg-orange-500 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-orange-200">
                <AlertTriangle size={20} />
              </div>
              <div>
                <h4 className="text-sm font-bold text-orange-800 uppercase tracking-tight">{t('thermal_warning')}</h4>
                <p className="text-[10px] text-orange-600 font-bold uppercase tracking-widest">{t('detected')}</p>
              </div>
            </div>
            <p className="text-xs text-orange-900 font-medium leading-relaxed relative z-10 mb-4">
              {t('thermal_warning_desc')}
            </p>
            <div className="bg-white/50 backdrop-blur-sm rounded-2xl p-4 border border-orange-200 relative z-10">
              <div className="flex items-center gap-2 mb-1">
                <Info size={12} className="text-orange-700" />
                <span className="text-[10px] font-bold text-orange-800 uppercase tracking-widest">{t('action_required')}</span>
              </div>
              <p className="text-xs font-bold text-orange-900">{t('irrigation_recommended')}</p>
            </div>
          </div>

          <div className="bg-green-50 border border-green-100 rounded-[32px] p-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-10 h-10 bg-green-600 rounded-2xl flex items-center justify-center text-white">
                <Activity size={20} />
              </div>
              <div>
                <h4 className="text-sm font-bold text-green-800 uppercase tracking-tight">{t('growth_conditions')}</h4>
                <p className="text-[10px] text-green-600 font-bold uppercase tracking-widest">{t('optimal')}</p>
              </div>
            </div>
            <p className="text-xs text-green-900 font-medium leading-relaxed">
              {t('growth_desc')}
            </p>
          </div>
        </div>

      </div>
    </div>
  );
};

// MapPin helper
const MapPin = ({ className, size }) => (
  <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
);

export default MobileWeather;
