import React, { useEffect, useState } from 'react';
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
      <div className="flex w-full h-64 items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
      </div>
    );
  }

  if (!data) return <div className="p-4 text-sm text-gray-500">{t('no_data')}</div>;

  let severityClass = 'bg-green-50 text-green-700 ring-green-600/20';
  if (data.severity === 'high' || data.severity === 'severe') {
    severityClass = 'bg-red-50 text-red-700 ring-red-600/20';
  }
  else if (data.severity === 'moderate') {
    severityClass = 'bg-yellow-50 text-yellow-700 ring-yellow-600/20';
  }

  return (
    <div className="w-full">
      <div className="mb-6 pb-4 border-b border-gray-200 flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 leading-tight" data-i18n="farm_intelligence">{t('farm_intelligence')}</h1>
          <p className="text-sm text-gray-500 mt-1"><span data-i18n="id_label">{t('id_label')}</span>: {data.farmId}</p>
        </div>
        <span className={`px-3 py-1 rounded text-xs font-semibold uppercase ring-1 ${severityClass}`} data-i18n={data.severity?.toLowerCase()}>
          {t(data.severity?.toLowerCase() || data.severity)} Risk
        </span>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-4 border-b border-gray-100 bg-gray-50/50 rounded-t-lg">
            <h2 className="text-sm font-semibold text-gray-800 uppercase tracking-wider" data-i18n="demographics">{t('demographics')}</h2>
          </div>
          <div className="p-0">
            <table className="w-full text-sm">
              <tbody>
                <tr className="border-b border-gray-100 last:border-0 hover:bg-gray-50/50">
                  <td className="py-3 px-4 text-gray-500 font-medium">{t('crop_type')}</td>
                  <td className="py-3 px-4 text-gray-900 text-right">{data.cropType}</td>
                </tr>
                <tr className="border-b border-gray-100 last:border-0 hover:bg-gray-50/50">
                  <td className="py-3 px-4 text-gray-500 font-medium">{t('location')}</td>
                  <td className="py-3 px-4 text-gray-900 text-right">{data.location.district}, {data.location.state}</td>
                </tr>
                <tr className="border-b border-gray-100 last:border-0 hover:bg-gray-50/50">
                  <td className="py-3 px-4 text-gray-500 font-medium">{t('farm_area')}</td>
                  <td className="py-3 px-4 text-gray-900 text-right">{data.areaAcres} Acres</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-4 border-b border-gray-100 bg-gray-50/50 rounded-t-lg">
            <h2 className="text-sm font-semibold text-gray-800 uppercase tracking-wider" data-i18n="satellite_analysis">{t('satellite_analysis')}</h2>
          </div>
          <div className="p-0">
            <table className="w-full text-sm">
              <tbody>
                <tr className="border-b border-gray-100 last:border-0 hover:bg-gray-50/50">
                  <td className="py-3 px-4 text-gray-500 font-medium">{t('ndvi_before_after')}</td>
                  <td className="py-3 px-4 text-gray-900 text-right font-mono">{data.ndviBefore} / {data.ndviAfter}</td>
                </tr>
                <tr className="border-b border-gray-100 last:border-0 hover:bg-gray-50/50">
                  <td className="py-3 px-4 text-gray-500 font-medium" data-i18n="damage_percent">{t('damage_percent')}</td>
                  <td className="py-3 px-4 font-bold text-right text-red-600">{data.damagePercentage}% <span data-i18n="drop">{t('drop')}</span></td>
                </tr>
                <tr className="border-b border-gray-100 last:border-0 hover:bg-gray-50/50">
                  <td className="py-3 px-4 text-gray-500 font-medium whitespace-nowrap" data-i18n="insured_value">{t('insured_value')}</td>
                  <td className="py-3 px-4 text-gray-900 text-right font-mono">₹{data.insuredAmount?.toLocaleString()}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
};

export default MobileFarm;
