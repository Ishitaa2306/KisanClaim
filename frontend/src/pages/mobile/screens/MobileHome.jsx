import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, Activity, LayoutGrid, CloudRain } from 'lucide-react';
import { useMobile } from '../context/MobileContext';

const MobileHome = () => {
  const { t, farmerId } = useMobile();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchFarmerData = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/v1/mobile/farmer/${farmerId}`);
      const json = await res.json();
      if (!res.ok) throw new Error(json.message);
      setData(json.data);
      setError(null);
    } catch (err) {
      console.log('Error fetching farmer data:', err);
      setError(t('error'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFarmerData();
  }, []);

  if (loading) {
    return (
      <div className="flex w-full h-64 items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex flex-col w-full h-64 items-center justify-center bg-white rounded-lg shadow-sm border border-gray-200">
        <p className="text-red-500 mb-4 text-sm">{error || t('no_data')}</p>
        <button onClick={fetchFarmerData} className="px-4 py-2 bg-green-600 font-medium text-white rounded text-sm hover:bg-green-700 transition">
          {t('success')} (Retry)
        </button>
      </div>
    );
  }

  const primaryFarm = data.farms && data.farms.length > 0 ? data.farms[0] : null;

  return (
    <div className="w-full">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 leading-tight" data-i18n="dashboard_overview">{t('dashboard_overview')}</h1>
        <p className="text-gray-500 text-sm mt-1"><span data-i18n="hello">{t('hello')}</span>, {data.name}</p>
      </div>

      {primaryFarm && (
        <div className="bg-white rounded-lg p-5 mb-6 shadow-sm border border-gray-200">
          <h2 className="text-sm font-semibold text-gray-800 mb-4 uppercase tracking-wider">{t('farm_summary')}</h2>
          <div className="flex flex-wrap gap-8 items-center">
            <div>
              <p className="text-xs text-gray-500 mb-1 font-medium select-none">{t('crop_type')}</p>
              <p className="text-sm text-gray-900 font-medium">{primaryFarm.cropType}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-1 font-medium select-none">{t('location')}</p>
              <p className="text-sm text-gray-900 font-medium">{primaryFarm.location.district}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-1 font-medium select-none" data-i18n="farm_area">{t('farm_area')}</p>
              <p className="text-sm text-gray-900 font-medium">{primaryFarm.areaAcres} <span data-i18n="acres">{t('acres')}</span></p>
            </div>
            <div className="ml-auto flex items-center gap-3">
              <span className="text-xs text-gray-500 font-medium">{t('health_indicator')}</span>
              <span className={`px-2.5 py-0.5 rounded text-xs font-semibold uppercase ring-1
                ${primaryFarm.riskLevel === 'low' ? 'bg-green-50 text-green-700 ring-green-600/20' :
                  primaryFarm.riskLevel === 'high' || primaryFarm.riskLevel === 'critical' ? 'bg-red-50 text-red-700 ring-red-600/20' :
                  'bg-yellow-50 text-yellow-700 ring-yellow-600/20'}`}
                data-i18n={primaryFarm.riskLevel?.toLowerCase()}>
                {t(primaryFarm.riskLevel?.toLowerCase() || primaryFarm.riskLevel)}
              </span>
            </div>
          </div>
        </div>
      )}

      {data.activeClaims && data.activeClaims.length > 0 && (
        <div className="bg-white rounded-lg p-5 mb-8 shadow-sm border border-gray-200 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-semibold text-gray-800 uppercase tracking-wider mb-1">{t('latest_claim')}</h2>
            <p className="text-sm text-gray-500 font-mono">{data.activeClaims[0].claimId}</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500 font-medium" data-i18n="status">{t('status')}</span>
            <span className="text-xs font-semibold px-2.5 py-0.5 bg-yellow-50 text-yellow-700 ring-1 ring-yellow-600/20 rounded uppercase"
              data-i18n={data.activeClaims[0].status?.toLowerCase()}>
              {t(data.activeClaims[0].status?.toLowerCase() || data.activeClaims[0].status)}
            </span>
          </div>
        </div>
      )}

      <h2 className="text-sm font-semibold text-gray-800 uppercase tracking-wider mb-4">{t('quick_actions')}</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        <button onClick={() => navigate('/mobile/claim')} className="bg-white p-4 rounded-lg flex items-center gap-4 shadow-sm border border-gray-200 hover:border-green-500 hover:shadow transition-all group text-left">
          <div className="p-3 bg-green-50 rounded-lg group-hover:bg-green-100 transition-colors">
            <FileText className="text-green-600" size={20} />
          </div>
          <div>
            <span className="block text-sm font-semibold text-gray-900" data-i18n="file_claim">{t('file_claim')}</span>
            <span className="block text-xs text-gray-500 mt-0.5 whitespace-nowrap" data-i18n="report_damage_desc">{t('report_damage_desc')}</span>
          </div>
        </button>

        <button onClick={() => navigate('/mobile/status')} className="bg-white p-4 rounded-lg flex items-center gap-4 shadow-sm border border-gray-200 hover:border-green-500 hover:shadow transition-all group text-left">
          <div className="p-3 bg-green-50 rounded-lg group-hover:bg-green-100 transition-colors">
            <Activity className="text-green-600" size={20} />
          </div>
          <div>
            <span className="block text-sm font-semibold text-gray-900" data-i18n="view_status">{t('view_status')}</span>
            <span className="block text-xs text-gray-500 mt-0.5 whitespace-nowrap" data-i18n="track_claims_desc">{t('track_claims_desc')}</span>
          </div>
        </button>

        <button onClick={() => navigate('/mobile/farm')} className="bg-white p-4 rounded-lg flex items-center gap-4 shadow-sm border border-gray-200 hover:border-green-500 hover:shadow transition-all group text-left">
          <div className="p-3 bg-green-50 rounded-lg group-hover:bg-green-100 transition-colors">
            <LayoutGrid className="text-green-600" size={20} />
          </div>
          <div>
            <span className="block text-sm font-semibold text-gray-900" data-i18n="farm">{t('farm')}</span>
            <span className="block text-xs text-gray-500 mt-0.5 whitespace-nowrap" data-i18n="view_metrics_desc">{t('view_metrics_desc')}</span>
          </div>
        </button>

        <button onClick={() => {
          const weatherLoc = primaryFarm?.location?.district || primaryFarm?.location?.state || 'Pune';
          const farmId = primaryFarm?.farmId;
          navigate(`/mobile/weather/${weatherLoc}${farmId ? `?farmId=${farmId}` : ''}`);
        }} className="bg-white p-4 rounded-lg flex items-center gap-4 shadow-sm border border-gray-200 hover:border-green-500 hover:shadow transition-all group text-left">
          <div className="p-3 bg-green-50 rounded-lg group-hover:bg-green-100 transition-colors">
            <CloudRain className="text-green-600" size={20} />
          </div>
          <div>
            <span className="block text-sm font-semibold text-gray-900" data-i18n="weather">{t('weather')}</span>
            <span className="block text-xs text-gray-500 mt-0.5 whitespace-nowrap" data-i18n="local_forecasts_desc">{t('local_forecasts_desc')}</span>
          </div>
        </button>

      </div>
    </div>
  );
};

export default MobileHome;
