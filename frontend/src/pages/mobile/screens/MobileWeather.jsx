import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { ChevronLeft, CloudRain, Thermometer, Droplets, Zap, Calendar, AlertTriangle, Activity, Wind, Sun, CloudLightning } from 'lucide-react';
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
      <div className="flex w-full h-full items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-10 w-10 border-b-4 border-blue-500"></div>
      </div>
    );
  }

  if (!data) return <div className="p-6 text-center text-sm text-gray-500 font-medium bg-gray-50 h-full">{t('no_data')}</div>;

  const isRainy = data.condition?.toLowerCase().includes('rain') || data.rainfall > 0;
  const gradientClass = isRainy ? 'from-blue-600 to-indigo-800' : 'from-sky-400 to-blue-500';
  const WeatherIcon = isRainy ? CloudLightning : Sun;

  return (
    <div className="w-full min-h-full bg-gradient-to-b from-gray-50 to-gray-100 p-4 pb-28 font-sans overflow-x-hidden">
      
      {/* Header */}
      <div className="mb-6 mt-4 flex items-center justify-between px-1">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => navigate(-1)} 
            className="w-10 h-10 bg-white border border-gray-200 rounded-full flex items-center justify-center shadow-sm active:scale-95 transition-all"
          >
            <ChevronLeft size={20} className="text-gray-600" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-gray-900 tracking-tight leading-tight">{location}</h1>
            <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Current Location</p>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        {/* Main Weather Card (Glass/Gradient) */}
        <div className={`relative overflow-hidden rounded-[24px] p-6 shadow-[0_8px_30px_rgb(0,0,0,0.08)] bg-gradient-to-br ${gradientClass} text-white`}>
          {/* Decorative elements */}
          <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full blur-3xl -translate-y-10 translate-x-10"></div>
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-black/10 rounded-full blur-2xl translate-y-10 -translate-x-10"></div>
          
          <div className="relative z-10 flex flex-col items-center text-center">
            <div className="mb-2">
              <WeatherIcon size={56} className="text-white/90 drop-shadow-lg" strokeWidth={2} />
            </div>
            <h2 className="text-6xl font-black tracking-tighter drop-shadow-md mb-1 leading-none">{data.temperature}°</h2>
            <p className="text-sm font-bold text-white/90 capitalize mb-6 uppercase tracking-widest">{data.condition}</p>
            
            <div className="w-full bg-white/20 backdrop-blur-md rounded-[16px] p-4 flex justify-between items-center border border-white/20 shadow-sm">
              <div className="flex flex-col items-center flex-1">
                <Droplets size={16} className="text-white/80 mb-1.5" />
                <span className="text-sm font-black leading-none mb-1">{data.humidity}%</span>
                <span className="text-[8px] text-white/70 uppercase tracking-widest font-bold">Humidity</span>
              </div>
              <div className="w-px h-8 bg-white/20"></div>
              <div className="flex flex-col items-center flex-1">
                <Wind size={16} className="text-white/80 mb-1.5" />
                <span className="text-sm font-black leading-none mb-1">14 km/h</span>
                <span className="text-[8px] text-white/70 uppercase tracking-widest font-bold">Wind</span>
              </div>
              <div className="w-px h-8 bg-white/20"></div>
              <div className="flex flex-col items-center flex-1">
                <CloudRain size={16} className="text-white/80 mb-1.5" />
                <span className="text-sm font-black leading-none mb-1">{data.rainfall} mm</span>
                <span className="text-[8px] text-white/70 uppercase tracking-widest font-bold">Rainfall</span>
              </div>
            </div>
          </div>
        </div>

        {/* 5-Day Forecast (Horizontal Scroll) */}
        <div>
          <h2 className="text-xs font-bold text-gray-800 uppercase tracking-widest mb-3 px-1">5-Day Forecast</h2>
          <div className="flex overflow-x-auto gap-3 pb-2 no-scrollbar px-1">
            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri'].map((day, idx) => (
              <div key={idx} className="min-w-[72px] bg-white rounded-[16px] p-3 flex flex-col items-center shadow-[0_4px_15px_rgb(0,0,0,0.02)] border border-gray-100 flex-shrink-0">
                <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-2">{day}</span>
                {idx % 2 === 0 ? <Sun size={20} className="text-amber-500 mb-2" /> : <CloudRain size={20} className="text-blue-500 mb-2" />}
                <span className="text-sm font-black text-gray-800">{Math.round(data.temperature - idx + 1)}°</span>
              </div>
            ))}
          </div>
        </div>

        {/* Intelligence Layer: Crop Risk Analysis */}
        {analysis && (
          <div>
            <div className="flex items-center gap-2 px-1 mb-3">
              <Zap size={16} className="text-amber-500" />
              <h2 className="text-xs font-bold text-gray-800 uppercase tracking-widest">{t('crop_risk_analysis') || 'Risk Analysis'}</h2>
            </div>

            <div className={`rounded-[16px] border border-white/80 p-4 space-y-4 shadow-[0_4px_15px_rgb(0,0,0,0.03)] backdrop-blur-md
              ${analysis.weather?.severity === 'Critical' || analysis.weather?.severity === 'High' ? 'bg-red-50/80' : 
                analysis.weather?.severity === 'Medium' ? 'bg-amber-50/80' : 'bg-green-50/80'}`}>
              
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">Event Detected</p>
                  <h3 className="text-sm font-black text-gray-900 leading-tight uppercase tracking-tight">{analysis.weather?.eventType}</h3>
                </div>
                <span className={`px-2.5 py-1 rounded-md text-[9px] font-black uppercase tracking-widest
                  ${analysis.weather?.severity === 'Critical' || analysis.weather?.severity === 'High' ? 'bg-red-600 text-white shadow-sm shadow-red-500/20' : 
                    analysis.weather?.severity === 'Medium' ? 'bg-amber-500 text-white shadow-sm shadow-amber-500/20' : 'bg-green-600 text-white shadow-sm shadow-green-500/20'}`}>
                  {analysis.weather?.severity} Risk
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                 <div className="bg-white/90 rounded-[12px] p-3 shadow-sm border border-white/50">
                    <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-1">Detection Date</p>
                    <p className="text-xs font-black text-gray-900 leading-none">{analysis.weather?.eventDate}</p>
                 </div>
                 <div className="bg-white/90 rounded-[12px] p-3 shadow-sm border border-white/50">
                    <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-1">Damage Est.</p>
                    <p className="text-xs font-black text-red-600 leading-none">{analysis.ndvi?.damagePercentage}%</p>
                 </div>
              </div>

              <div className="pt-3 border-t border-gray-200/50">
                 <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                   <Activity size={12} /> Analysis Window
                 </p>
                 <div className="flex items-center gap-2">
                    <div className="flex-1 bg-white/90 p-2 rounded-[10px] border border-white/50 flex justify-between items-center shadow-sm">
                      <span className="text-[8px] font-bold text-gray-400">BEFORE</span>
                      <span className="text-[10px] font-mono font-black text-gray-900">{analysis.analysisWindow?.beforeDate}</span>
                    </div>
                    <div className="w-2 h-px bg-gray-300"></div>
                    <div className="flex-1 bg-white/90 p-2 rounded-[10px] border border-white/50 flex justify-between items-center shadow-sm">
                      <span className="text-[8px] font-bold text-gray-400">AFTER</span>
                      <span className="text-[10px] font-mono font-black text-gray-900">{analysis.analysisWindow?.afterDate}</span>
                    </div>
                 </div>
              </div>
            </div>
          </div>
        )}

        {/* No Analysis Context */}
        {!analysis && farmId && (
          <div className="bg-white rounded-[16px] border border-gray-100 p-6 flex flex-col items-center justify-center text-center shadow-[0_4px_15px_rgb(0,0,0,0.02)]">
            <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center mb-3">
              <AlertTriangle className="text-gray-400" size={20} />
            </div>
            <p className="text-xs font-bold text-gray-800 uppercase tracking-widest mb-1">No Intelligence Data</p>
            <p className="text-[10px] text-gray-500 font-medium">Select a farm to view specialized risk analysis.</p>
          </div>
        )}

      </div>
    </div>
  );
};

export default MobileWeather;

