import React, { useEffect, useState } from 'react';
import { 
  ChevronLeft, MapPin, TrendingUp, Info, 
  Wind, Droplets, Sun, Activity, ShieldCheck,
  BarChart3, Loader2
} from 'lucide-react';
import { useMobile } from '../context/MobileContext';
import { useNavigate } from 'react-router-dom';

const MobileFarm = () => {
  const { t, farmerId } = useMobile();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFarm = async () => {
      try {
        const res = await fetch(`/api/v1/mobile/farmer/${farmerId}`);
        const json = await res.json();
        setData(json.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchFarm();
  }, [farmerId]);

  if (loading) {
    return (
      <div className="flex w-full min-h-screen items-center justify-center bg-gray-50">
        <Loader2 className="animate-spin text-green-600" size={32} />
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-gray-50 text-gray-900 font-sans pb-24 overflow-x-hidden">
      
      {/* Header */}
      <div className="bg-white pt-10 px-6 pb-6 border-b border-gray-100">
        <div className="flex items-center gap-4 mb-1">
          <button onClick={() => navigate(-1)} className="p-2 -ml-2 rounded-full hover:bg-gray-100 transition-colors">
            <ChevronLeft size={24} />
          </button>
          <h2 className="text-sm font-bold text-green-600 tracking-widest uppercase">
            {t('farm_summary')}
          </h2>
        </div>
        <div className="flex items-center gap-2">
          <MapPin size={12} className="text-gray-400" />
          <p className="text-xs text-gray-500 font-medium">
            {data?.location || 'Rajasthan, India'}
          </p>
        </div>
      </div>

      <div className="px-6 space-y-6 pt-6">
        
        {/* NDVI Analysis Section */}
        <div className="bg-white rounded-[32px] p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-tight">{t('satellite_analysis')}</h3>
            <div className="bg-blue-50 px-3 py-1 rounded-full border border-blue-100 flex items-center gap-2">
              <Activity size={10} className="text-blue-600" />
              <span className="text-[9px] font-bold text-blue-600 uppercase tracking-widest">{t('live_ndvi')}</span>
            </div>
          </div>

          {/* Visual Chart Placeholder */}
          <div className="w-full h-32 flex items-end justify-between gap-1 mb-8 px-2">
            {[40, 65, 45, 80, 55, 90, 72].map((h, i) => (
              <div key={i} className="flex-1 bg-gray-100 rounded-full relative group">
                <div 
                  className={`absolute bottom-0 left-0 right-0 rounded-full transition-all duration-1000 ${i === 6 ? 'bg-green-500' : 'bg-green-600/30'}`}
                  style={{ height: `${h}%` }}
                />
              </div>
            ))}
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <span className="text-[8px] font-bold text-gray-400 uppercase tracking-widest block mb-1">{t('ndvi_before')}</span>
              <p className="text-sm font-bold text-gray-900">0.78</p>
            </div>
            <div className="text-center border-x border-gray-50 px-2">
              <span className="text-[8px] font-bold text-gray-400 uppercase tracking-widest block mb-1">{t('ndvi_after')}</span>
              <p className="text-sm font-bold text-gray-900">0.72</p>
            </div>
            <div className="text-center">
              <span className="text-[8px] font-bold text-red-500 uppercase tracking-widest block mb-1">{t('drop')}</span>
              <p className="text-sm font-bold text-red-500">-7.6%</p>
            </div>
          </div>
        </div>

        {/* Conditions Grid */}
        <div className="space-y-4">
          <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] px-1">{t('farm_conditions')}</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white p-5 rounded-[32px] border border-gray-100 shadow-sm">
              <Droplets className="text-blue-500 mb-3" size={20} />
              <p className="text-[9px] text-gray-500 font-bold uppercase tracking-widest mb-1">{t('soil_moisture')}</p>
              <p className="text-sm font-bold text-gray-900">42% <span className="text-[9px] text-green-600 font-medium ml-1">Optimal</span></p>
            </div>
            <div className="bg-white p-5 rounded-[32px] border border-gray-100 shadow-sm">
              <Sun className="text-yellow-500 mb-3" size={20} />
              <p className="text-[9px] text-gray-500 font-bold uppercase tracking-widest mb-1">{t('sunlight')}</p>
              <p className="text-sm font-bold text-gray-900">8.2 hrs</p>
            </div>
            <div className="bg-white p-5 rounded-[32px] border border-gray-100 shadow-sm">
              <ShieldCheck className="text-green-600 mb-3" size={20} />
              <p className="text-[9px] text-gray-500 font-bold uppercase tracking-widest mb-1">{t('soil_quality')}</p>
              <p className="text-sm font-bold text-gray-900">pH 6.8</p>
            </div>
            <div className="bg-white p-5 rounded-[32px] border border-gray-100 shadow-sm">
              <Wind className="text-indigo-500 mb-3" size={20} />
              <p className="text-[9px] text-gray-500 font-bold uppercase tracking-widest mb-1">{t('wind_speed')}</p>
              <p className="text-sm font-bold text-gray-900">12 km/h</p>
            </div>
          </div>
        </div>

        {/* Coverage Card */}
        <div className="bg-gray-900 rounded-[32px] p-6 shadow-xl shadow-gray-200">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-white/10 rounded-2xl flex items-center justify-center text-green-400">
              <BarChart3 size={20} />
            </div>
            <h3 className="text-sm font-bold text-white uppercase tracking-tight">{t('coverage_details')}</h3>
          </div>
          
          <div className="space-y-4">
            <div className="flex justify-between items-center border-b border-white/10 pb-3">
              <span className="text-[10px] text-white/50 font-bold uppercase tracking-widest">{t('total_insured_value')}</span>
              <span className="text-sm font-bold text-white">₹4,50,000</span>
            </div>
            <div className="flex justify-between items-center border-b border-white/10 pb-3">
              <span className="text-[10px] text-white/50 font-bold uppercase tracking-widest">{t('area')}</span>
              <span className="text-sm font-bold text-white">12.4 {t('acres')}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-[10px] text-white/50 font-bold uppercase tracking-widest">{t('risk')}</span>
              <span className="text-sm font-bold text-green-400 uppercase tracking-widest">{t('low')}</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default MobileFarm;
