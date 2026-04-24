import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ChevronRight, FileText, Filter, Check, X, 
  Clock, Shield, Search, ChevronLeft, Loader2
} from 'lucide-react';
import { useMobile } from '../context/MobileContext';

const MobileStatus = () => {
  const { t, farmerId } = useMobile();
  const navigate = useNavigate();
  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

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

  const filteredClaims = claims.filter(c => {
    if (filter === 'all') return true;
    return c.status.toLowerCase() === filter.toLowerCase();
  });

  if (loading) {
    return (
      <div className="flex w-full min-h-screen items-center justify-center bg-gray-50">
        <Loader2 className="animate-spin text-green-600" size={32} />
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-gray-50 text-gray-900 font-sans pb-24 overflow-x-hidden">
      
      {/* Header */}
      <div className="bg-white pt-10 px-6 pb-6 border-b border-gray-100">
        <div className="flex items-center gap-4 mb-1">
          <button onClick={() => navigate(-1)} className="p-2 -ml-2 rounded-full hover:bg-gray-100 transition-colors">
            <ChevronLeft size={24} />
          </button>
          <h2 className="text-sm font-bold text-green-600 tracking-widest uppercase">
            {t('my_claims')}
          </h2>
        </div>
        <p className="text-xs text-gray-500">
          {claims.length} {t('total_claims_filed')}
        </p>
      </div>

      {/* Filters */}
      <div className="bg-white px-6 py-4 mb-6 border-b border-gray-100 overflow-x-auto flex gap-3 no-scrollbar">
        {['all', 'pending', 'approved', 'rejected'].map((f) => (
          <button 
            key={f}
            onClick={() => setFilter(f)}
            className={`px-6 py-2.5 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all border whitespace-nowrap ${
              filter === f 
                ? 'bg-green-600 text-white border-green-600 shadow-lg shadow-green-100' 
                : 'bg-gray-50 text-gray-500 border-gray-200 hover:border-gray-300'
            }`}
          >
            {t(f)}
          </button>
        ))}
      </div>

      {/* Claims List */}
      <div className="px-6 space-y-4">
        {filteredClaims.length > 0 ? (
          filteredClaims.map((claim) => (
            <div 
              key={claim._id || claim.claimId}
              onClick={() => navigate(`/mobile/details/${claim.claimId}`)}
              className="bg-white border border-gray-100 rounded-[28px] p-5 active:scale-[0.98] transition-all flex items-center gap-4 shadow-sm group hover:border-green-200"
            >
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 border ${
                claim.status === 'Approved' ? 'bg-green-50 border-green-100 text-green-600' :
                claim.status === 'Rejected' ? 'bg-red-50 border-red-100 text-red-600' :
                'bg-yellow-50 border-yellow-100 text-yellow-600'
              }`}>
                {claim.status === 'Approved' ? <Check size={24} /> :
                 claim.status === 'Rejected' ? <X size={24} /> :
                 <Clock size={24} />}
              </div>

              <div className="flex-1">
                <div className="flex justify-between items-center mb-1">
                  <h4 className="text-sm font-bold text-gray-900 uppercase tracking-tight">#{claim.claimId}</h4>
                  <span className={`text-[9px] font-bold uppercase tracking-widest ${
                    claim.status === 'Approved' ? 'text-green-600' :
                    claim.status === 'Rejected' ? 'text-red-600' :
                    'text-yellow-600'
                  }`}>{t(claim.status.toLowerCase())}</span>
                </div>
                <div className="flex items-center gap-3 text-[10px] text-gray-400 font-bold uppercase tracking-tighter">
                  <span>{new Date(claim.createdAt || Date.now()).toLocaleDateString()}</span>
                  <div className="w-1 h-1 rounded-full bg-gray-200" />
                  <span>₹{claim.claimAmount?.toLocaleString() || '0'}</span>
                </div>
              </div>

              <ChevronRight className="text-gray-300 group-hover:text-green-600 transition-colors" size={20} />
            </div>
          ))
        ) : (
          <div className="py-20 flex flex-col items-center text-center">
            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-6 text-gray-200 border border-gray-100">
              <Shield size={32} />
            </div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-[0.2em]">{t('no_data')}</p>
          </div>
        )}
      </div>

    </div>
  );
};

export default MobileStatus;
