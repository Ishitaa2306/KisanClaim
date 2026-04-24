import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, FileText, BarChart2, Activity } from 'lucide-react';
import { useMobile } from '../context/MobileContext';

const MobileDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t } = useMobile();
  const [claim, setClaim] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchClaim = async () => {
      try {
        const res = await fetch(`/api/v1/mobile/claim/${id}`);
        const json = await res.json();
        setClaim(json.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchClaim();
  }, [id]);

  if (loading) {
    return (
      <div className="flex w-full h-64 items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
      </div>
    );
  }

  if (!claim) return <div className="p-4 text-center text-sm text-gray-500">{t('no_data')}</div>;

  return (
    <div className="w-full">
      <div className="mb-6 flex items-center gap-4">
        <button 
          onClick={() => navigate(-1)} 
          className="p-2 border border-gray-200 rounded-md bg-white hover:bg-gray-50 text-gray-600 transition"
        >
          <ChevronLeft size={20} />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 leading-tight"><span data-i18n="claim_number">{t('claim_number')}</span> {claim.claimId}</h1>
          <p className="text-sm text-gray-500 mt-1" data-i18n="detailed_status_desc">{t('detailed_status_desc')}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column (Overview & Intelligence) */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Overview */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-4 border-b border-gray-100 bg-gray-50/50 rounded-t-lg flex items-center gap-2">
              <FileText size={18} className="text-gray-500" />
              <h2 className="text-sm font-semibold text-gray-800 uppercase tracking-wider" data-i18n="overview">{t('overview')}</h2>
            </div>
            <div className="p-0">
              <table className="w-full text-sm">
                <tbody>
                  <tr className="border-b border-gray-100 last:border-0 hover:bg-gray-50/50">
                    <td className="py-3 px-4 text-gray-500 font-medium whitespace-nowrap">{t('status')}</td>
                    <td className="py-3 px-4 text-right">
                      <span className={`px-2.5 py-0.5 rounded text-xs font-semibold uppercase ring-1 
                        ${claim.status === 'Pending' ? 'bg-yellow-50 text-yellow-700 ring-yellow-600/20' : 
                          claim.status === 'Approved' ? 'bg-green-50 text-green-700 ring-green-600/20' : 
                          'bg-red-50 text-red-700 ring-red-600/20'}`} data-i18n={claim.status?.toLowerCase()}>
                        {t(claim.status?.toLowerCase() || claim.status)}
                      </span>
                    </td>
                  </tr>
                  <tr className="border-b border-gray-100 last:border-0 hover:bg-gray-50/50">
                    <td className="py-3 px-4 text-gray-500 font-medium">{t('damage_type')}</td>
                    <td className="py-3 px-4 text-right font-medium text-gray-900" data-i18n={claim.damageType?.toLowerCase().replace(' ', '_')}>{t(claim.damageType?.toLowerCase().replace(' ', '_') || claim.damageType)}</td>
                  </tr>
                  <tr className="border-b border-gray-100 last:border-0 hover:bg-gray-50/50">
                    <td className="py-3 px-4 text-gray-500 font-medium">{t('claim_amount')}</td>
                    <td className="py-3 px-4 text-right font-bold text-green-600">₹{claim.claimAmount?.toLocaleString()}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* AI Analysis */}
          {claim.explanation && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="p-4 border-b border-gray-100 bg-gray-50/50 rounded-t-lg flex items-center gap-2">
                <BarChart2 size={18} className="text-gray-500" />
                <h2 className="text-sm font-semibold text-gray-800 uppercase tracking-wider" data-i18n="intelligence_analysis">{t('intelligence_analysis')}</h2>
              </div>
              <div className="p-4 space-y-4">
                <div className="flex gap-4">
                  <div className="flex-1 bg-gray-50 rounded-md p-3 border border-gray-100">
                    <p className="text-xs text-gray-500 font-medium uppercase tracking-wider mb-1">{t('damage_percent')}</p>
                    <p className="text-lg font-bold text-red-600">{claim.explanation.ndviDrop}%</p>
                  </div>
                  <div className="flex-1 bg-gray-50 rounded-md p-3 border border-gray-100">
                    <p className="text-xs text-gray-500 font-medium uppercase tracking-wider mb-1">{t('fraud_score')}</p>
                    <p className="text-lg font-bold text-gray-900">{claim.fraudAnalysis?.fraudScore || 'N/A'}/100</p>
                  </div>
                </div>
                
                <div className="bg-green-50 border border-green-100 rounded-md p-4">
                  <span className="text-xs font-semibold uppercase text-green-800 tracking-wider mb-2 block">{t('explanation')}</span>
                  <p className="text-sm text-green-900 leading-relaxed">{claim.explanation.reason}</p>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Right Column (Timeline) */}
        <div className="lg:col-span-1">
          {claim.timeline && claim.timeline.length > 0 && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 h-full">
               <div className="p-4 border-b border-gray-100 bg-gray-50/50 rounded-t-lg flex items-center gap-2">
                <Activity size={18} className="text-gray-500" />
                <h2 className="text-sm font-semibold text-gray-800 uppercase tracking-wider">{t('timeline')}</h2>
              </div>
              <div className="p-6">
                <div className="relative border-l-2 border-gray-100 ml-2 pl-6 space-y-8">
                  {claim.timeline.map((item, idx) => (
                    <div key={idx} className="relative">
                      <div className="absolute -left-[31px] top-1 w-3 h-3 rounded-full bg-green-500 ring-4 ring-white"></div>
                      <p className="font-semibold text-sm text-gray-900 mb-0.5" data-i18n={item.action?.toLowerCase().replace(/\s+/g, '_')}>{t(item.action?.toLowerCase().replace(/\s+/g, '_') || item.action)}</p>
                      <p className="text-xs text-gray-600 mb-1 leading-snug">{item.detail}</p>
                      <p className="text-[10px] text-gray-400 font-mono font-medium">{new Date(item.timestamp).toLocaleString()}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default MobileDetails;
