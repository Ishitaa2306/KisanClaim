import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { ChevronLeft, CloudRain, Thermometer, Droplets, Zap, Calendar, AlertTriangle, Activity } from 'lucide-react';
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
      <div className="flex w-full h-64 items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
      </div>
    );
  }

  if (!data) return <div className="p-4 text-center text-sm text-gray-500">{t('no_data')}</div>;

  return (
    <div className="w-full space-y-6">
      <div className="mb-6 flex items-center gap-4 border-b border-gray-200 pb-4">
        <button 
          onClick={() => navigate(-1)} 
          className="p-2 border border-gray-200 rounded-md bg-white hover:bg-gray-50 text-gray-600 transition"
        >
          <ChevronLeft size={20} />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 leading-tight">Regional Weather</h1>
          <p className="text-sm text-gray-500 mt-1">{location}</p>
        </div>
      </div>

      {/* Weather Card */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex justify-between items-center w-full">
          <div className="flex flex-col items-center flex-1">
            <Thermometer size={24} className="text-green-600 mb-2" />
            <span className="text-lg font-bold text-gray-900">{data.temperature}°C</span>
            <span className="text-[10px] text-gray-500 uppercase tracking-wider font-bold">{t('temperature')}</span>
          </div>
          <div className="w-px h-10 bg-gray-100"></div>
          <div className="flex flex-col items-center flex-1">
            <CloudRain size={24} className="text-green-600 mb-2" />
            <span className="text-lg font-bold text-gray-900">{data.rainfall} mm</span>
            <span className="text-[10px] text-gray-500 uppercase tracking-wider font-bold">{t('rainfall')}</span>
          </div>
          <div className="w-px h-10 bg-gray-100"></div>
          <div className="flex flex-col items-center flex-1">
            <Droplets size={24} className="text-green-600 mb-2" />
            <span className="text-lg font-bold text-gray-900">{data.humidity}%</span>
            <span className="text-[10px] text-gray-500 uppercase tracking-wider font-bold">{t('humidity')}</span>
          </div>
        </div>
        
        <div className="mt-6 bg-gray-50 rounded-lg p-3 border border-gray-100 text-center">
          <p className="text-sm text-gray-900 font-medium">Condition: <span className="font-bold text-green-700">{data.condition}</span></p>
          <p className="text-[11px] text-gray-500 italic mt-0.5">{data.forecast}</p>
        </div>
      </div>

      {/* Intelligence Layer: Crop Risk Analysis */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 px-1">
          <Zap size={18} className="text-amber-500" />
          <h2 className="text-sm font-bold text-gray-800 uppercase tracking-wider">Crop Risk Analysis</h2>
        </div>

        {analysis ? (
          <div className={`rounded-xl border-2 p-5 space-y-4 transition-all
            ${analysis.weather?.severity === 'Critical' || analysis.weather?.severity === 'High' ? 'bg-red-50/50 border-red-200' : 
              analysis.weather?.severity === 'Medium' ? 'bg-amber-50/50 border-amber-200' : 'bg-green-50/50 border-green-200'}`}>
            
            <div className="flex justify-between items-start">
              <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Event Detected</p>
                <h3 className="text-lg font-black text-gray-900 leading-tight uppercase tracking-tight">{analysis.weather?.eventType}</h3>
              </div>
              <span className={`px-2.5 py-1 rounded text-[10px] font-black uppercase tracking-widest
                ${analysis.weather?.severity === 'Critical' || analysis.weather?.severity === 'High' ? 'bg-red-600 text-white' : 
                  analysis.weather?.severity === 'Medium' ? 'bg-amber-500 text-white' : 'bg-green-600 text-white'}`}>
                {analysis.weather?.severity} Risk
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4">
               <div className="bg-white/80 rounded-lg p-3 border border-gray-100/50">
                  <div className="flex items-center gap-1.5 mb-1.5">
                    <Calendar size={12} className="text-gray-400" />
                    <span className="text-[9px] font-bold text-gray-500 uppercase">Detection Date</span>
                  </div>
                  <p className="text-xs font-bold text-gray-900">{analysis.weather?.eventDate}</p>
               </div>
               <div className="bg-white/80 rounded-lg p-3 border border-gray-100/50">
                  <div className="flex items-center gap-1.5 mb-1.5">
                    <Zap size={12} className="text-gray-400" />
                    <span className="text-[9px] font-bold text-gray-500 uppercase">Damage Est.</span>
                  </div>
                  <p className="text-xs font-bold text-red-600">{analysis.ndvi?.damagePercentage}%</p>
               </div>
            </div>

            <div className="pt-2 border-t border-gray-200/50">
               <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                 <Activity size={12} /> Analysis Window
               </p>
               <div className="flex items-center gap-2">
                  <div className="flex-1 bg-white/60 p-2 rounded border border-gray-100 flex justify-between items-center">
                    <span className="text-[8px] font-bold text-gray-400">BEFORE</span>
                    <span className="text-[10px] font-mono font-bold text-gray-900">{analysis.analysisWindow?.beforeDate}</span>
                  </div>
                  <div className="w-2 h-px bg-gray-300"></div>
                  <div className="flex-1 bg-white/60 p-2 rounded border border-gray-100 flex justify-between items-center">
                    <span className="text-[8px] font-bold text-gray-400">AFTER</span>
                    <span className="text-[10px] font-mono font-bold text-gray-900">{analysis.analysisWindow?.afterDate}</span>
                  </div>
               </div>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-dashed border-gray-300 p-8 flex flex-col items-center justify-center text-center">
            <AlertTriangle className="text-gray-300 mb-2" size={24} />
            <p className="text-xs font-medium text-gray-500">No specific farm context found.</p>
            <p className="text-[10px] text-gray-400 mt-1">Select a farm to view automated risk analysis.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MobileWeather;

