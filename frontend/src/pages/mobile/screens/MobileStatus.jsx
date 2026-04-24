import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRight, FileText, Filter } from 'lucide-react';
import { useMobile } from '../context/MobileContext';

const MobileStatus = () => {
  const { t, farmerId, farmerName } = useMobile();
  const navigate = useNavigate();
  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('All');

  const fetchClaims = async () => {
    try {
      const res = await fetch(`/api/v1/mobile/claims/${farmerId}`);
      const json = await res.json();
      
      const backendClaims = json.data || [];
      const offlineClaims = JSON.parse(localStorage.getItem(`offline_claims_${farmerId}`) || '[]');
      
      setClaims([...offlineClaims, ...backendClaims]);
    } catch (err) {
      console.error('Error fetching claims:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClaims();
  }, []);

  const getStatusBadgeClass = (status) => {
    if (status === 'Pending') return 'bg-yellow-50 text-yellow-700 border border-yellow-100';
    if (status === 'Approved') return 'bg-green-50 text-green-700 border border-green-100';
    if (status === 'Rejected') return 'bg-red-50 text-red-700 border border-red-100';
    return 'bg-gray-50 text-gray-700 border border-gray-100';
  };

  const filteredClaims = claims.filter(c => filter === 'All' || c.status === filter);

  if (loading) {
    return (
      <div className="flex w-full h-full items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-10 w-10 border-b-4 border-green-600"></div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-full bg-gradient-to-b from-gray-50 to-gray-100 p-4 pb-28 font-sans">
      
      {/* Header */}
      <div className="mb-6 mt-4 flex justify-between items-center px-1">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight leading-tight">{t('claim_activity') || 'My Claims'}</h1>
          <p className="text-gray-500 text-xs mt-1 font-medium">{claims.length} total claims filed</p>
        </div>
        <div className="w-11 h-11 bg-white rounded-full shadow-sm flex items-center justify-center border border-gray-100 shrink-0">
          <FileText className="text-green-600" size={20} />
        </div>
      </div>

      {/* Filters */}
      <div className="flex overflow-x-auto gap-2 pb-2 mb-6 no-scrollbar px-1">
        {['All', 'Pending', 'Approved', 'Rejected'].map(f => (
          <button 
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all
              ${filter === f 
                ? 'bg-green-600 text-white shadow-[0_4px_10px_rgba(22,163,74,0.3)]' 
                : 'bg-white text-gray-500 border border-gray-200 hover:bg-gray-50'}`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Claims List */}
      <div className="space-y-4">
        {filteredClaims.length === 0 ? (
          <div className="bg-white rounded-[16px] p-8 text-center text-gray-500 font-medium shadow-[0_4px_15px_rgb(0,0,0,0.02)] border border-gray-100">
            {t('no_data')}
          </div>
        ) : (
          filteredClaims.map((item) => (
            <div 
              key={item.claimId}
              onClick={() => navigate(`/mobile/details/${item.claimId}`)}
              className="bg-white/90 backdrop-blur-md rounded-[16px] p-4 shadow-[0_4px_15px_rgb(0,0,0,0.02)] border border-white flex items-center justify-between active:scale-[0.98] transition-all cursor-pointer hover:shadow-[0_4px_20px_rgb(0,0,0,0.05)]"
            >
              <div className="flex items-center justify-between w-full">
                
                {/* Left Side: Claim ID & Status */}
                <div className="flex flex-col gap-1.5">
                  <h3 className="text-sm font-bold text-gray-800 leading-none">#{item.claimId}</h3>
                  <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider w-max ${getStatusBadgeClass(item.status)}`}>
                    {item.status}
                  </span>
                </div>

                {/* Middle: Damage & Amount */}
                <div className="flex items-center gap-6">
                  <div className="text-right">
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-0.5">Damage</p>
                    <p className="text-xs font-black text-red-500 leading-none">{item.damagePercentage || '--'}%</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-0.5">Amount</p>
                    <p className="text-xs font-black text-green-600 leading-none">₹{item.claimAmount?.toLocaleString()}</p>
                  </div>
                </div>

                {/* Right Side: Arrow */}
                <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center text-gray-300 ml-2">
                  <ChevronRight size={18} />
                </div>
              </div>
            </div>
          ))
        )}
      </div>

    </div>
  );
};

export default MobileStatus;
