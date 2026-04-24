import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { useMobile } from '../context/MobileContext';

const MobileStatus = () => {
  const { t, farmerId } = useMobile();
  const navigate = useNavigate();
  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchClaims = async () => {
    try {
      const res = await fetch(`/api/v1/mobile/claims/${farmerId}`);
      const json = await res.json();
      setClaims(json.data || []);
    } catch (err) {
      console.error('Error fetching claims:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClaims();
  }, []);

  const getStatusBadge = (status) => {
    if (status === 'Pending') return 'bg-yellow-50 text-yellow-700 ring-yellow-600/20';
    if (status === 'Approved') return 'bg-green-50 text-green-700 ring-green-600/20';
    if (status === 'Rejected') return 'bg-red-50 text-red-700 ring-red-600/20';
    return 'bg-gray-50 text-gray-700 ring-gray-600/20';
  };

  if (loading) {
    return (
      <div className="flex w-full h-64 items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="mb-6 pb-4 border-b border-gray-200">
        <h1 className="text-2xl font-bold text-gray-900 leading-tight" data-i18n="claim_activity">{t('claim_activity')}</h1>
        <p className="text-sm text-gray-500 mt-1" data-i18n="claim_activity_desc">{t('claim_activity_desc')}</p>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        {claims.length === 0 ? (
          <div className="p-8 text-center text-sm text-gray-500">{t('no_data')}</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-gray-50/50 border-b border-gray-200 uppercase text-xs font-semibold text-gray-600 tracking-wider">
                <tr>
                  <th className="px-6 py-3" data-i18n="claim_id">{t('claim_id')}</th>
                  <th className="px-6 py-3" data-i18n="damage_type">{t('damage_type')}</th>
                  <th className="px-6 py-3" data-i18n="claim_amount">{t('claim_amount')}</th>
                  <th className="px-6 py-3" data-i18n="date">{t('date')}</th>
                  <th className="px-6 py-3" data-i18n="status">{t('status')}</th>
                  <th className="px-6 py-3 text-right" data-i18n="action">{t('action')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {claims.map((item) => (
                  <tr 
                    key={item.claimId} 
                    onClick={() => navigate(`/mobile/details/${item.claimId}`)}
                    className="hover:bg-gray-50 cursor-pointer transition-colors"
                  >
                    <td className="px-6 py-4 font-mono font-medium text-gray-900">{item.claimId}</td>
                    <td className="px-6 py-4 text-gray-700" data-i18n={item.damageType?.toLowerCase().replace(' ', '_')}>
                      {t(item.damageType?.toLowerCase().replace(' ', '_') || item.damageType)}
                    </td>
                    <td className="px-6 py-4 text-green-600 font-medium">₹{item.claimAmount?.toLocaleString()}</td>
                    <td className="px-6 py-4 text-gray-500">{new Date(item.createdAt).toLocaleDateString()}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-0.5 rounded text-xs font-semibold uppercase ring-1 ${getStatusBadge(item.status)}`} data-i18n={item.status?.toLowerCase()}>
                        {t(item.status?.toLowerCase() || item.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <ChevronRight className="text-gray-400 inline-block" size={18} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default MobileStatus;
