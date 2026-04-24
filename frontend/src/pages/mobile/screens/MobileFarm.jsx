import React, { useEffect, useState } from 'react';
import { Leaf, MapPin, TrendingDown, Layers, Droplet, Sun, Wind, Activity } from 'lucide-react';
import { useMobile } from '../context/MobileContext';

const MobileFarm = () => {
  const { t, farmerId } = useMobile();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchFarmData = async () => {
    try {
      const farmerRes = await fetch(`/api/v1/mobile/farmer/${farmerId}`);
      const farmerData = await farmerRes.json();
      if (farmerData.data?.linkedFarmIds?.length > 0) {
        const farmRes = await fetch(`/api/v1/mobile/farm/${farmerData.data.linkedFarmIds[0]}`);
        const farmData = await farmRes.json();
        setData(farmData.data);
      }
    } catch (err) {
      console.log('Error fetching farm data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFarmData();
  }, []);

  if (loading) {
    return (
      <div className="flex w-full h-full items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-10 w-10 border-b-4 border-green-600"></div>
      </div>
    );
  }

  if (!data) return <div className="p-6 text-center text-gray-500 font-medium bg-gray-50 h-full">{t('no_data')}</div>;

  let severityClass = 'bg-green-50 text-green-700 border border-green-100';
  if (data.severity === 'high' || data.severity === 'severe') {
    severityClass = 'bg-red-50 text-red-700 border border-red-100';
  }
  else if (data.severity === 'moderate') {
    severityClass = 'bg-yellow-50 text-yellow-700 border border-yellow-100';
  }

  return (
    <div className="w-full min-h-full bg-gradient-to-b from-gray-50 to-gray-100 p-4 pb-28 font-sans">
      
      {/* Header */}
      <div className="mb-6 mt-4 flex justify-between items-center px-1">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight leading-tight">{t('farm_intelligence') || 'Farm Intelligence'}</h1>
          <p className="text-gray-500 text-xs mt-1 font-medium">{data.cropType} • {data.areaAcres} Acres</p>
        </div>
        <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-widest ${severityClass}`}>
          {data.severity} Risk
        </span>
      </div>

      <div className="space-y-6">
        {/* Main Imagery / Map Placeholder Card */}
        <div className="relative overflow-hidden bg-white rounded-[16px] shadow-[0_4px_15px_rgb(0,0,0,0.03)] border border-gray-100 h-40 group">
          <div className="absolute inset-0 bg-green-900/10 z-10 mix-blend-multiply"></div>
          {/* Placeholder for actual satellite map */}
          <div className="absolute inset-0 bg-gradient-to-tr from-green-600/20 to-blue-500/20 backdrop-blur-3xl flex items-center justify-center">
             <MapPin className="text-green-600/50 w-12 h-12" />
          </div>
          
          <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/60 to-transparent z-20">
            <p className="text-white font-medium text-xs flex items-center gap-2">
              <MapPin size={14} />
              {data.location.district}, {data.location.state}
            </p>
          </div>
        </div>

        {/* Health Trends / Satellite Analysis */}
        <div className="bg-white rounded-[16px] p-4 shadow-[0_4px_15px_rgb(0,0,0,0.02)] border border-gray-100">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-sm font-bold text-gray-800 flex items-center gap-2 leading-none">
              <Activity className="text-blue-500" size={16} />
              Satellite Analysis
            </h2>
            <span className="text-[10px] font-bold text-gray-500 bg-gray-50 border border-gray-100 px-2 py-0.5 rounded uppercase tracking-wider">Live NDVI</span>
          </div>

          {/* Pseudo Chart */}
          <div className="h-24 mb-4 relative flex items-end justify-between gap-1.5 border-b border-gray-50 pb-2">
            {/* Bars represent NDVI over time */}
            {[60, 70, 75, 80, 85, 82, 78, 65, 45, 40].map((h, i) => (
               <div key={i} className="w-full bg-green-50 rounded-t-[4px] relative group" style={{ height: `${h}%` }}>
                 <div className={`absolute bottom-0 left-0 right-0 rounded-t-[4px] transition-all ${h < 50 ? 'bg-red-400' : 'bg-green-500'}`} style={{ height: '100%' }}></div>
               </div>
            ))}
            {/* Damage Drop Highlight */}
            {data.damagePercentage > 0 && (
               <div className="absolute right-0 top-0 bottom-2 w-[20%] bg-red-500/10 border-l border-red-200 flex items-center justify-center rounded-r-[4px]">
                 <TrendingDown className="text-red-500" size={16} />
               </div>
            )}
          </div>

          <div className="flex justify-between items-center text-center">
            <div>
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-0.5">NDVI Before</p>
              <p className="text-sm font-black text-gray-800 leading-none">{data.ndviBefore}</p>
            </div>
            <div>
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-0.5">NDVI After</p>
              <p className="text-sm font-black text-gray-800 leading-none">{data.ndviAfter}</p>
            </div>
            <div>
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-0.5">Damage</p>
              <p className="text-sm font-black text-red-500 leading-none">{data.damagePercentage}%</p>
            </div>
          </div>
        </div>

        {/* Soil & Weather Indicators */}
        <h2 className="text-xs font-bold text-gray-800 uppercase tracking-widest px-1">Farm Conditions</h2>
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white rounded-[16px] p-4 shadow-[0_4px_15px_rgb(0,0,0,0.02)] border border-gray-100 flex flex-col justify-center items-start">
            <Droplet className="text-blue-500 mb-2" size={20} />
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-0.5">Soil Moisture</p>
            <p className="text-sm font-black text-gray-800 leading-none">42%</p>
          </div>
          
          <div className="bg-white rounded-[16px] p-4 shadow-[0_4px_15px_rgb(0,0,0,0.02)] border border-gray-100 flex flex-col justify-center items-start">
            <Sun className="text-orange-500 mb-2" size={20} />
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-0.5">Sunlight</p>
            <p className="text-sm font-black text-gray-800 leading-none">High</p>
          </div>

          <div className="bg-white rounded-[16px] p-4 shadow-[0_4px_15px_rgb(0,0,0,0.02)] border border-gray-100 flex flex-col justify-center items-start">
            <Layers className="text-amber-600 mb-2" size={20} />
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-0.5">Soil Quality</p>
            <p className="text-sm font-black text-gray-800 leading-none">Optimal</p>
          </div>

          <div className="bg-white rounded-[16px] p-4 shadow-[0_4px_15px_rgb(0,0,0,0.02)] border border-gray-100 flex flex-col justify-center items-start">
            <Wind className="text-cyan-500 mb-2" size={20} />
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-0.5">Wind Speed</p>
            <p className="text-sm font-black text-gray-800 leading-none">12 km/h</p>
          </div>
        </div>

        {/* Financial Details */}
        <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-[16px] p-4 border border-green-100 shadow-[0_4px_15px_rgb(0,0,0,0.02)]">
          <h3 className="text-xs font-bold text-green-800 uppercase tracking-widest mb-2">Coverage Details</h3>
          <div className="flex justify-between items-center bg-white/60 p-3 rounded-xl border border-white/50">
            <p className="text-[10px] text-green-700/80 font-bold uppercase tracking-wider">Total Insured Value</p>
            <p className="text-sm font-black text-green-900 leading-none">₹{data.insuredAmount?.toLocaleString()}</p>
          </div>
        </div>
      </div>

    </div>
  );
};

export default MobileFarm;
