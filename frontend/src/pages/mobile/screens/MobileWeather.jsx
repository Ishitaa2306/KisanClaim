import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { ChevronLeft, CloudRain, Thermometer, Droplet, Zap, AlertTriangle, Wind, Sun, CloudLightning, MapPin, Search, Bug, Leaf, Cloud } from 'lucide-react';
import { useMobile } from '../context/MobileContext';

const MobileWeather = () => {
  const { location } = useParams();
  const [searchParams] = useSearchParams();
  const farmId = searchParams.get('farmId');
  
  const navigate = useNavigate();
  const { t } = useMobile();
  const [data, setData] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch basic weather
        const weatherRes = await fetch(`/api/v1/mobile/weather/${location}`);
        const weatherJson = await weatherRes.json();
        setData(weatherJson.data);

        // Fetch Intelligence Analysis if farmId is available
        if (farmId) {
          const analysisRes = await fetch(`/api/farm/${farmId}/analysis`);
          const analysisJson = await analysisRes.json();
          if (analysisRes.ok) {
            setAnalysis(analysisJson.data);
          }
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [location, farmId]);

  if (loading) {
    return (
      <div className="flex w-full h-full items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-10 w-10 border-b-4 border-indigo-500"></div>
      </div>
    );
  }

  if (!data) return <div className="p-6 text-center text-sm text-slate-500 font-medium bg-slate-50 h-full min-h-screen">{t('no_data')}</div>;

  const isRainy = data.condition?.toLowerCase().includes('rain') || data.rainfall > 0;
  const WeatherIcon = isRainy ? CloudRain : Sun;

  return (
    <div className="w-full min-h-screen bg-[#F4F7F9] p-5 pb-28 font-sans text-slate-800 overflow-x-hidden">
      
      {/* Header */}
      <div className="flex items-center justify-between mb-8 mt-2">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => navigate(-1)} 
            className="text-slate-700 active:scale-95 transition-all p-1"
          >
            <ChevronLeft size={24} />
          </button>
          <div className="flex items-center gap-1.5">
            <MapPin size={20} className="text-indigo-500" />
            <span className="font-bold text-slate-800 text-lg">{location || 'Punjab, India'}</span>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <button className="text-slate-600 active:scale-95 transition-all">
            <Search size={22} />
          </button>
          <div className="w-9 h-9 rounded-full bg-white overflow-hidden border-2 border-white shadow-sm">
            <img src="https://ui-avatars.com/api/?name=User&background=6366f1&color=fff" alt="avatar" className="w-full h-full object-cover" />
          </div>
        </div>
      </div>

      <div className="space-y-8">
        {/* Main Weather Card (Vibrant Gradient) */}
        <div className="relative overflow-hidden rounded-[32px] p-8 shadow-[0_12px_40px_rgb(59,130,246,0.25)] bg-gradient-to-br from-sky-400 via-blue-500 to-indigo-600 text-white">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-16 translate-x-16"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-indigo-900/20 rounded-full blur-2xl translate-y-16 -translate-x-10"></div>
          
          <div className="relative z-10 flex flex-col items-center text-center">
            <p className="text-[11px] font-bold text-white/80 uppercase tracking-[0.2em] mb-4">
              Pune, Maharashtra
            </p>
            <div className="flex items-center justify-center gap-4 mb-2">
              <h1 className="text-[76px] font-black leading-none tracking-tighter drop-shadow-sm">{data.temperature || '28'}°</h1>
              <div className="w-16 h-16 flex items-center justify-center drop-shadow-md">
                <WeatherIcon size={64} className={isRainy ? "text-blue-100" : "text-yellow-300"} fill={isRainy ? "none" : "currentColor"} />
              </div>
            </div>
            <p className="text-sm font-bold text-white capitalize mb-10">
              {data.condition || 'Mostly Cloudy'}
            </p>
            
            <div className="w-full flex justify-between items-center px-4 bg-white/20 backdrop-blur-md rounded-[20px] p-4 border border-white/30 shadow-inner">
              <div className="flex flex-col items-center gap-1.5">
                <Droplet size={20} className="text-white mb-1" />
                <span className="text-[9px] text-white/90 uppercase tracking-wider font-bold">Humidity</span>
                <span className="text-sm font-black">{data.humidity || '64'}%</span>
              </div>
              <div className="w-px h-10 bg-white/30"></div>
              <div className="flex flex-col items-center gap-1.5">
                <Wind size={20} className="text-white mb-1" />
                <span className="text-[9px] text-white/90 uppercase tracking-wider font-bold">Wind</span>
                <span className="text-sm font-black">12 km/h</span>
              </div>
              <div className="w-px h-10 bg-white/30"></div>
              <div className="flex flex-col items-center gap-1.5">
                <CloudRain size={20} className="text-white mb-1" />
                <span className="text-[9px] text-white/90 uppercase tracking-wider font-bold">Precip</span>
                <span className="text-sm font-black">{data.rainfall > 0 ? data.rainfall + 'mm' : '10%'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* 5-Day Forecast */}
        <div>
          <h2 className="text-[16px] font-black text-slate-800 mb-4 px-1 tracking-tight">5-Day Forecast</h2>
          <div className="flex gap-4 overflow-x-auto no-scrollbar pb-2 px-1">
            <div className="bg-indigo-50 border border-indigo-100 rounded-[24px] p-5 flex flex-col items-center min-w-[80px] shadow-[0_8px_20px_rgb(99,102,241,0.12)]">
              <span className="text-[11px] text-indigo-600 font-black tracking-wider mb-3">MON</span>
              <Sun size={28} className="text-amber-500 mb-3 drop-shadow-sm" fill="currentColor" />
              <span className="font-black text-slate-800 text-base">31°</span>
            </div>
            <div className="bg-white border border-slate-100 rounded-[24px] p-5 flex flex-col items-center min-w-[80px] shadow-[0_4px_15px_rgb(0,0,0,0.03)]">
              <span className="text-[11px] text-slate-400 font-bold tracking-wider mb-3">TUE</span>
              <Cloud size={28} className="text-slate-400 mb-3" />
              <span className="font-bold text-slate-700 text-base">29°</span>
            </div>
            <div className="bg-white border border-slate-100 rounded-[24px] p-5 flex flex-col items-center min-w-[80px] shadow-[0_4px_15px_rgb(0,0,0,0.03)]">
              <span className="text-[11px] text-slate-400 font-bold tracking-wider mb-3">WED</span>
              <CloudRain size={28} className="text-sky-500 mb-3" />
              <span className="font-bold text-slate-700 text-base">26°</span>
            </div>
            <div className="bg-white border border-slate-100 rounded-[24px] p-5 flex flex-col items-center min-w-[80px] shadow-[0_4px_15px_rgb(0,0,0,0.03)]">
              <span className="text-[11px] text-slate-400 font-bold tracking-wider mb-3">THU</span>
              <Sun size={28} className="text-amber-500 mb-3" />
              <span className="font-bold text-slate-700 text-base">28°</span>
            </div>
            <div className="bg-white border border-slate-100 rounded-[24px] p-5 flex flex-col items-center min-w-[80px] shadow-[0_4px_15px_rgb(0,0,0,0.03)]">
              <span className="text-[11px] text-slate-400 font-bold tracking-wider mb-3">FRI</span>
              <Sun size={28} className="text-amber-500 mb-3" />
              <span className="font-bold text-slate-700 text-base">30°</span>
            </div>
          </div>
        </div>

        {/* Weather Insights */}
        <div>
          <h2 className="text-[16px] font-black text-slate-800 mb-4 px-1 tracking-tight">Weather Insights</h2>
          <div className="space-y-4">
            <div className="bg-white border border-slate-100 rounded-[24px] p-5 flex gap-5 items-start shadow-[0_8px_20px_rgb(0,0,0,0.03)]">
              <div className="w-12 h-12 rounded-[16px] bg-sky-100 flex items-center justify-center shrink-0 text-sky-600">
                <Droplet size={24} />
              </div>
              <div>
                <h3 className="text-[14px] font-bold text-slate-800 mb-1.5">Dry Spell Expected</h3>
                <p className="text-[12px] text-slate-500 leading-relaxed font-medium">
                  No rainfall expected in the next 3 days. Soil moisture levels are currently stable.
                </p>
              </div>
            </div>
            
            <div className="bg-white border border-slate-100 rounded-[24px] p-5 flex gap-5 items-start shadow-[0_8px_20px_rgb(0,0,0,0.03)]">
              <div className="w-12 h-12 rounded-[16px] bg-rose-100 flex items-center justify-center shrink-0 text-rose-500">
                <Thermometer size={24} />
              </div>
              <div>
                <h3 className="text-[14px] font-bold text-slate-800 mb-1.5">Thermal Warning</h3>
                <p className="text-[12px] text-slate-500 leading-relaxed font-medium">
                  High temperature peaks between 1PM-4PM may affect crop transpiration and moisture.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Impact on Crop */}
        <div>
          <h2 className="text-[16px] font-black text-slate-800 mb-4 px-1 tracking-tight">Impact on Crop</h2>
          <div className="space-y-4">
            
            {/* Dynamic Analysis Data if present */}
            {analysis && (
               <div className="bg-white border border-rose-100 rounded-[24px] p-6 relative overflow-hidden shadow-[0_8px_20px_rgb(244,63,94,0.08)]">
                 <div className="absolute -right-4 -bottom-4 opacity-10 pointer-events-none text-rose-500">
                   <AlertTriangle size={120} />
                 </div>
                 <div className={`inline-block px-3 py-1.5 rounded-xl text-[10px] font-black tracking-widest mb-3 ${
                   analysis.weather?.severity === 'Critical' || analysis.weather?.severity === 'High' ? 'bg-rose-100 text-rose-700' : 
                   analysis.weather?.severity === 'Medium' ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'
                 }`}>
                   {analysis.weather?.severity.toUpperCase()} RISK
                 </div>
                 <h3 className="text-[14px] font-bold text-slate-800 mb-1.5 relative z-10">{analysis.weather?.eventType} Detected</h3>
                 <p className="text-[12px] text-slate-500 leading-relaxed relative z-10 mb-4 font-medium">
                   Damage Estimate: {analysis.ndvi?.damagePercentage}%. Analysis based on recent telemetry.
                 </p>
                 <div className="flex items-center gap-4 pt-4 border-t border-slate-100 relative z-10">
                   <div className="flex-1 bg-slate-50 rounded-xl p-3 border border-slate-100">
                     <span className="text-[9px] text-slate-400 block mb-1 uppercase tracking-wider font-bold">Before</span>
                     <span className="text-[11px] font-black text-slate-700">{analysis.analysisWindow?.beforeDate}</span>
                   </div>
                   <div className="flex-1 bg-slate-50 rounded-xl p-3 border border-slate-100">
                     <span className="text-[9px] text-slate-400 block mb-1 uppercase tracking-wider font-bold">After</span>
                     <span className="text-[11px] font-black text-slate-700">{analysis.analysisWindow?.afterDate}</span>
                   </div>
                 </div>
               </div>
            )}

            <div className="bg-white border border-slate-100 rounded-[24px] p-6 relative overflow-hidden shadow-[0_8px_20px_rgb(0,0,0,0.03)]">
              <div className="absolute -right-4 -bottom-4 opacity-5 pointer-events-none text-slate-900">
                <Zap size={120} />
              </div>
              <div className="inline-block px-3 py-1.5 rounded-xl bg-indigo-100 text-indigo-700 text-[10px] font-black tracking-widest mb-3 relative z-10">
                ACTION REQUIRED
              </div>
              <h3 className="text-[14px] font-bold text-slate-800 mb-1.5 relative z-10">Irrigation Recommended</h3>
              <p className="text-[12px] text-slate-500 leading-relaxed relative z-10 font-medium">
                Initiate evening irrigation to counter tomorrow's predicted heat surge.
              </p>
            </div>

            <div className="bg-white border border-slate-100 rounded-[24px] p-6 relative overflow-hidden shadow-[0_8px_20px_rgb(0,0,0,0.03)]">
              <div className="absolute -right-4 -bottom-4 opacity-5 pointer-events-none text-slate-900">
                <Bug size={120} />
              </div>
              <div className="inline-block px-3 py-1.5 rounded-xl bg-amber-100 text-amber-700 text-[10px] font-black tracking-widest mb-3 relative z-10">
                LOW RISK
              </div>
              <h3 className="text-[14px] font-bold text-slate-800 mb-1.5 relative z-10">Pest & Disease</h3>
              <p className="text-[12px] text-slate-500 leading-relaxed relative z-10 font-medium">
                Low humidity and clear skies reduce the immediate risk of fungal growth.
              </p>
            </div>

            <div className="bg-white border border-slate-100 rounded-[24px] p-6 relative overflow-hidden shadow-[0_8px_20px_rgb(0,0,0,0.03)]">
              <div className="absolute -right-4 -bottom-4 opacity-5 pointer-events-none text-slate-900">
                <Leaf size={120} />
              </div>
              <div className="inline-block px-3 py-1.5 rounded-xl bg-emerald-100 text-emerald-700 text-[10px] font-black tracking-widest mb-3 relative z-10">
                OPTIMAL
              </div>
              <h3 className="text-[14px] font-bold text-slate-800 mb-1.5 relative z-10">Growth Conditions</h3>
              <p className="text-[12px] text-slate-500 leading-relaxed relative z-10 font-medium">
                Photosynthetic activity index is high. Excellent for nutrient absorption.
              </p>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
};

export default MobileWeather;


