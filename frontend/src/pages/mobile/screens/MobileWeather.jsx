import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, CloudRain, Thermometer, Droplets } from 'lucide-react';
import { useMobile } from '../context/MobileContext';

const MobileWeather = () => {
  const { location } = useParams();
  const navigate = useNavigate();
  const { t } = useMobile();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWeather = async () => {
      try {
        const res = await fetch(`/api/v1/mobile/weather/${location}`);
        const json = await res.json();
        setData(json.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchWeather();
  }, [location]);

  if (loading) {
    return (
      <div className="flex w-full h-64 items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
      </div>
    );
  }

  if (!data) return <div className="p-4 text-center text-sm text-gray-500">{t('no_data')}</div>;

  return (
    <div className="w-full">
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

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 max-w-3xl">
        <div className="flex justify-between items-center mb-10 w-full px-4">
          <div className="flex flex-col items-center">
            <Thermometer size={32} className="text-green-600 mb-3" />
            <span className="text-xl font-bold text-gray-900">{data.temperature}°C</span>
            <span className="text-xs text-gray-500 mt-1 uppercase tracking-wider font-medium">{t('temperature')}</span>
          </div>
          <div className="w-px h-16 bg-gray-100 hidden sm:block"></div>
          <div className="flex flex-col items-center">
            <CloudRain size={32} className="text-green-600 mb-3" />
            <span className="text-xl font-bold text-gray-900">{data.rainfall} mm</span>
            <span className="text-xs text-gray-500 mt-1 uppercase tracking-wider font-medium">{t('rainfall')}</span>
          </div>
          <div className="w-px h-16 bg-gray-100 hidden sm:block"></div>
          <div className="flex flex-col items-center">
            <Droplets size={32} className="text-green-600 mb-3" />
            <span className="text-xl font-bold text-gray-900">{data.humidity}%</span>
            <span className="text-xs text-gray-500 mt-1 uppercase tracking-wider font-medium">{t('humidity')}</span>
          </div>
        </div>
        
        <div className="bg-gray-50 rounded-md p-4 border border-gray-100 text-center">
          <p className="text-gray-900 font-medium">Condition: <span className="font-bold text-green-700">{data.condition}</span></p>
          <p className="text-sm text-gray-500 italic mt-1">{data.forecast}</p>
        </div>
      </div>
    </div>
  );
};

export default MobileWeather;
