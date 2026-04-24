import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ChevronLeft, FileText, BarChart2, Activity, Banknote, 
  CheckCircle2, Loader2, AlertTriangle, Clock, ShieldCheck,
  TrendingUp, MapPin
} from 'lucide-react';
import { useMobile } from '../context/MobileContext';

const MobileDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t } = useMobile();
  const [claim, setClaim] = useState(null);
  const [loading, setLoading] = useState(true);
  const [paymentStatus, setPaymentStatus] = useState(null);
  const [paymentLoading, setPaymentLoading] = useState(false);

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

  useEffect(() => {
    if (!claim || claim.status !== 'Approved') {
      setPaymentStatus(null);
      return;
    }

    let cancelled = false;

    async function fetchPayment() {
      try {
        setPaymentLoading(true);
        const res = await fetch(`/api/v1/mobile/payment-status/${claim.claimId}`);
        const json = await res.json();
        if (!cancelled) setPaymentStatus(json.data);
      } catch (err) {
        console.error('Payment status fetch failed:', err);
      } finally {
        if (!cancelled) setPaymentLoading(false);
      }
    }

    fetchPayment();

    const interval = setInterval(() => {
      if (paymentStatus?.status === 'COMPLETED') return;
      fetchPayment();
    }, 15000);

    return () => { cancelled = true; clearInterval(interval); };
  }, [claim]);

  if (loading) {
    return (
      <div className="flex w-full min-h-screen items-center justify-center bg-gray-50">
        <Loader2 className="animate-spin text-green-600" size={32} />
      </div>
    );
  }

  if (!claim) return (
    <div className="p-6 text-center text-sm text-gray-500 font-medium bg-gray-50 h-full min-h-screen flex items-center justify-center">
      {t('no_data')}
    </div>
  );

  const getStatusColor = (status) => {
    if (status === 'Approved') return 'text-green-600';
    if (status === 'Rejected') return 'text-red-600';
    return 'text-yellow-600';
  };

  return (
    <div className="w-full min-h-screen bg-gray-50 text-gray-900 font-sans pb-24 overflow-x-hidden">
      
      {/* Header */}
      <div className="bg-white pt-10 px-6 pb-6 border-b border-gray-100">
        <div className="flex items-center gap-4 mb-1">
          <button onClick={() => navigate(-1)} className="p-2 -ml-2 rounded-full hover:bg-gray-100 transition-colors">
            <ChevronLeft size={24} />
          </button>
          <h2 className="text-sm font-bold text-green-600 tracking-widest uppercase">
            {t('claim_number')} {claim.claimId}
          </h2>
        </div>
        <p className="text-xs text-gray-500">
          {t('detailed_status_desc')}
        </p>
      </div>

      <div className="px-6 space-y-6 pt-6">
        
        {/* Main Status Overview */}
        <div className="w-full bg-white p-6 rounded-[32px] border border-gray-100 shadow-sm">
          <div className="flex justify-between items-start mb-8">
            <div>
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-1">{t('overview')}</p>
              <h3 className="text-xl font-bold text-gray-900 uppercase tracking-tight">{claim.damageType}</h3>
            </div>
            <div className="text-right">
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-1">{t('status')}</p>
              <p className={`text-sm font-black uppercase tracking-widest ${getStatusColor(claim.status)}`}>
                {t(claim.status?.toLowerCase())}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
              <span className="text-[9px] text-gray-500 font-bold uppercase tracking-widest block mb-1">{t('claim_amount')}</span>
              <p className="text-lg font-bold text-green-600">₹{claim.claimAmount?.toLocaleString() || '0'}</p>
            </div>
            <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
              <span className="text-[9px] text-gray-500 font-bold uppercase tracking-widest block mb-1">{t('date')}</span>
              <p className="text-sm font-bold text-gray-900">{new Date(claim.createdAt).toLocaleDateString()}</p>
            </div>
          </div>
        </div>

        {/* Intelligence Analysis Section */}
        <div className="space-y-4">
          <div className="flex items-center gap-3 px-1">
            <div className="bg-green-50 p-1.5 rounded-lg border border-green-100">
              <ShieldCheck className="text-green-600" size={16} />
            </div>
            <h3 className="text-xs font-bold text-gray-900 tracking-widest uppercase">{t('intelligence_analysis')}</h3>
          </div>

          <div className="bg-white border border-gray-100 rounded-[32px] p-6 space-y-6 shadow-sm">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tight mb-0.5">{t('damage_estimate')}</p>
                <p className="text-xl font-bold text-gray-900">{claim.damagePercentage || claim.explanation?.ndviDrop}%</p>
              </div>
              <div className="text-right">
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tight mb-0.5">{t('fraud_score')}</p>
                <p className={`text-xl font-bold ${claim.fraudScore > 30 ? 'text-red-600' : 'text-green-600'}`}>{claim.fraudScore || claim.fraudAnalysis?.fraudScore || '0'}%</p>
              </div>
            </div>

            <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-2">{t('explanation')}</p>
              <p className="text-xs text-gray-600 leading-relaxed font-medium">
                {claim.explanation?.reason || claim.explanation || t('no_explanation')}
              </p>
            </div>
          </div>
        </div>

        {/* Payment Tracking (for Approved) */}
        {claim.status === 'Approved' && (
          <div className="space-y-4">
            <div className="flex items-center gap-3 px-1">
              <div className="bg-blue-50 p-1.5 rounded-lg border border-blue-100">
                <Banknote className="text-blue-600" size={16} />
              </div>
              <h3 className="text-xs font-bold text-gray-900 tracking-widest uppercase">{t('payment_status')}</h3>
            </div>

            <div className="bg-white border border-gray-100 rounded-[32px] p-6 space-y-8 shadow-sm">
              <div className="flex items-center justify-between relative px-2">
                {/* Stepper Lines */}
                <div className="absolute top-4 left-10 right-10 h-0.5 bg-gray-100 z-0" />
                
                {[
                  { key: 'submitted', icon: <CheckCircle2 size={12} />, label: t('submitted') },
                  { key: 'verification', icon: <Activity size={12} />, label: t('verification') },
                  { key: 'disbursed', icon: <Banknote size={12} />, label: t('disbursed') },
                ].map((step, idx) => {
                  let status = 'inactive';
                  if (idx === 0) status = 'done';
                  if (idx === 1) status = paymentStatus?.status === 'COMPLETED' ? 'done' : 'active';
                  if (idx === 2) status = paymentStatus?.status === 'COMPLETED' ? 'done' : 'inactive';

                  return (
                    <div key={step.key} className="flex flex-col items-center gap-2 relative z-10">
                      <div className={`w-8 h-8 rounded-xl flex items-center justify-center border transition-all duration-500 shadow-sm ${
                        status === 'done' ? 'bg-green-600 border-green-600 text-white' :
                        status === 'active' ? 'bg-blue-600 border-blue-600 text-white animate-pulse' :
                        'bg-white border-gray-200 text-gray-400'
                      }`}>
                        {step.icon}
                      </div>
                      <span className={`text-[8px] font-bold uppercase tracking-widest ${status !== 'inactive' ? 'text-gray-900' : 'text-gray-400'}`}>
                        {step.label}
                      </span>
                    </div>
                  );
                })}
              </div>

              <div className="pt-4 border-t border-gray-50 flex justify-between items-center text-[10px]">
                <div className="flex items-center gap-2 text-gray-400">
                  <Clock size={10} />
                  <span className="font-bold uppercase tracking-widest">{t('last_updated')}</span>
                </div>
                <span className="text-gray-900 font-bold">{new Date().toLocaleTimeString()}</span>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default MobileDetails;
