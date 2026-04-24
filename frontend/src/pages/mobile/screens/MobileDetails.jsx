import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, FileText, BarChart2, Activity, Banknote, CheckCircle2, Loader2, AlertTriangle, Clock } from 'lucide-react';
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

  // ── Payment Status: fetch only for Approved claims ──
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

    // Auto-refresh every 15s while still in-flight
    const interval = setInterval(() => {
      if (paymentStatus?.status === 'COMPLETED') return;
      fetchPayment();
    }, 15000);

    return () => { cancelled = true; clearInterval(interval); };
  }, [claim]);

  if (loading) {
    return (
      <div className="flex w-full h-full items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-10 w-10 border-b-4 border-green-500"></div>
      </div>
    );
  }

  if (!claim) return <div className="p-6 text-center text-sm text-gray-500 font-medium bg-gray-50 h-full">{t('no_data')}</div>;

  // Payment status helpers
  const paymentSteps = [
    { key: 'approved', label: 'Claim Approved' },
    { key: 'processing', label: 'Processing' },
    { key: 'verification', label: 'Verification' },
    { key: 'disbursed', label: 'Disbursed' },
  ];

  const getStepState = (stepKey) => {
    const ps = paymentStatus?.status;
    if (!ps) return 'inactive';
    if (stepKey === 'approved') return 'done';
    if (stepKey === 'processing') {
      if (ps === 'PROCESSING') return 'active';
      if (['DELAYED', 'COMPLETED'].includes(ps)) return 'done';
      return 'inactive';
    }
    if (stepKey === 'verification') {
      if (ps === 'DELAYED') return 'delayed';
      if (ps === 'COMPLETED') return 'done';
      return 'inactive';
    }
    if (stepKey === 'disbursed') {
      if (ps === 'COMPLETED') return 'done';
      return 'inactive';
    }
    return 'inactive';
  };

  const stepStyles = {
    done: 'bg-green-500 text-white shadow-md shadow-green-500/20',
    active: 'bg-blue-500 text-white animate-pulse shadow-md shadow-blue-500/20',
    delayed: 'bg-red-500 text-white animate-pulse shadow-md shadow-red-500/20',
    inactive: 'bg-gray-100 text-gray-400',
  };

  const connectorColor = (fromKey, toKey) => {
    const fromState = getStepState(fromKey);
    const toState = getStepState(toKey);
    if (fromState === 'done' && (toState === 'done' || toState === 'active')) return 'bg-green-400';
    if (fromState === 'done' && toState === 'delayed') return 'bg-red-400';
    return 'bg-gray-200';
  };

  return (
    <div className="w-full min-h-full bg-gradient-to-b from-gray-50 to-gray-100 p-4 pb-28 font-sans">
      
      <div className="mb-6 mt-4 flex items-center gap-3 px-1">
        <button 
          onClick={() => navigate(-1)} 
          className="w-10 h-10 bg-white border border-gray-200 rounded-full flex items-center justify-center shadow-sm active:scale-95 transition-all shrink-0"
        >
          <ChevronLeft size={20} className="text-gray-600" />
        </button>
        <div>
          <h1 className="text-xl font-bold text-gray-900 tracking-tight leading-tight"><span data-i18n="claim_number">{t('claim_number')}</span> {claim.claimId}</h1>
          <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mt-0.5" data-i18n="detailed_status_desc">{t('detailed_status_desc')}</p>
        </div>
      </div>

      <div className="space-y-6">
        
        {/* Overview */}
        <div className="bg-white rounded-[16px] shadow-[0_4px_15px_rgb(0,0,0,0.02)] border border-gray-100 overflow-hidden">
          <div className="p-4 border-b border-gray-50 flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center shrink-0">
              <FileText size={16} className="text-gray-500" />
            </div>
            <h2 className="text-[10px] font-bold text-gray-800 uppercase tracking-widest" data-i18n="overview">{t('overview')}</h2>
          </div>
          <div className="p-4">
            <div className="space-y-4">
              <div className="flex justify-between items-center pb-3 border-b border-gray-50">
                <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{t('status')}</span>
                <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-widest
                  ${claim.status === 'Pending' ? 'bg-yellow-50 text-yellow-700 border border-yellow-100' : 
                    claim.status === 'Approved' ? 'bg-green-50 text-green-700 border border-green-100' : 
                    'bg-red-50 text-red-700 border border-red-100'}`} data-i18n={claim.status?.toLowerCase()}>
                  {t(claim.status?.toLowerCase() || claim.status)}
                </span>
              </div>
              <div className="flex justify-between items-center pb-3 border-b border-gray-50">
                <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{t('damage_type')}</span>
                <span className="text-sm font-black text-gray-900" data-i18n={claim.damageType?.toLowerCase().replace(' ', '_')}>{t(claim.damageType?.toLowerCase().replace(' ', '_') || claim.damageType)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{t('claim_amount')}</span>
                <span className="text-lg font-black text-green-600 leading-none">₹{claim.claimAmount?.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>

        {/* AI Analysis */}
        {claim.explanation && (
          <div className="bg-white rounded-[16px] shadow-[0_4px_15px_rgb(0,0,0,0.02)] border border-gray-100 overflow-hidden">
            <div className="p-4 border-b border-gray-50 flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-indigo-50 flex items-center justify-center shrink-0">
                <BarChart2 size={16} className="text-indigo-500" />
              </div>
              <h2 className="text-[10px] font-bold text-gray-800 uppercase tracking-widest" data-i18n="intelligence_analysis">{t('intelligence_analysis')}</h2>
            </div>
            <div className="p-4 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-red-50/50 rounded-[12px] p-3 border border-red-100/50">
                  <p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest mb-1">{t('damage_percent')}</p>
                  <p className="text-xl font-black text-red-600 leading-none">{claim.explanation.ndviDrop}%</p>
                </div>
                <div className="bg-gray-50/50 rounded-[12px] p-3 border border-gray-100">
                  <p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest mb-1">{t('fraud_score')}</p>
                  <p className="text-xl font-black text-gray-900 leading-none">{claim.fraudAnalysis?.fraudScore || 'N/A'}/100</p>
                </div>
              </div>
              
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-[12px] p-4 border border-green-100 shadow-[0_4px_15px_rgb(0,0,0,0.02)]">
                <span className="text-[9px] font-bold uppercase text-green-700 tracking-widest mb-1.5 block flex items-center gap-1.5">
                  <Activity size={12} /> {t('explanation')}
                </span>
                <p className="text-xs text-green-900 font-bold leading-relaxed">{claim.explanation.reason}</p>
              </div>
            </div>
          </div>
        )}

        {/* ── Payment Status Card (only for Approved claims) ── */}
        {claim.status === 'Approved' && (
          <div className="bg-white rounded-[16px] shadow-[0_4px_15px_rgb(0,0,0,0.02)] border border-gray-100 overflow-hidden">
            {/* Header */}
            <div className="p-4 border-b border-gray-50 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-green-50 flex items-center justify-center shrink-0">
                  <Banknote size={16} className="text-green-600" />
                </div>
                <h2 className="text-[10px] font-bold text-gray-800 uppercase tracking-widest">Payment Status</h2>
              </div>
              {paymentLoading && !paymentStatus ? (
                <Loader2 size={16} className="animate-spin text-gray-400" />
              ) : paymentStatus ? (
                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[9px] font-black uppercase tracking-widest ${
                  paymentStatus.status === 'COMPLETED'
                    ? 'bg-green-50 text-green-700 border border-green-100'
                    : paymentStatus.status === 'PROCESSING'
                    ? 'bg-blue-50 text-blue-700 border border-blue-100'
                    : paymentStatus.status === 'DELAYED'
                    ? 'bg-red-50 text-red-700 border border-red-100'
                    : 'bg-gray-50 text-gray-600 border border-gray-100'
                }`}>
                  {paymentStatus.status === 'COMPLETED' && <CheckCircle2 size={10} />}
                  {paymentStatus.status === 'PROCESSING' && <Loader2 size={10} className="animate-spin" />}
                  {paymentStatus.status === 'DELAYED' && <AlertTriangle size={10} />}
                  {paymentStatus.status.replace('_', ' ')}
                </span>
              ) : null}
            </div>

            {/* Body */}
            <div className="p-4">
              {paymentStatus ? (
                <div className="space-y-6">
                  {/* Stepper */}
                  <div className="flex items-center justify-between px-1">
                    {paymentSteps.map((step, idx) => (
                      <React.Fragment key={step.key}>
                        {/* Step circle */}
                        <div className="flex flex-col items-center relative z-10">
                          <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold transition-all duration-500 shadow-sm ${stepStyles[getStepState(step.key)]}`}>
                            {getStepState(step.key) === 'done' ? (
                              <CheckCircle2 size={12} />
                            ) : getStepState(step.key) === 'active' ? (
                              <Loader2 size={12} className="animate-spin" />
                            ) : getStepState(step.key) === 'delayed' ? (
                              <AlertTriangle size={12} />
                            ) : (
                              <span>{idx + 1}</span>
                            )}
                          </div>
                          <p className={`text-[8px] font-black uppercase tracking-wider mt-2 text-center leading-tight absolute top-6 w-16 -ml-4 ${
                            getStepState(step.key) === 'done' ? 'text-green-600'
                            : getStepState(step.key) === 'active' ? 'text-blue-600'
                            : getStepState(step.key) === 'delayed' ? 'text-red-600'
                            : 'text-gray-400'
                          }`}>{step.label}</p>
                        </div>
                        {/* Connector */}
                        {idx < paymentSteps.length - 1 && (
                          <div className={`flex-1 h-0.5 rounded-full mx-1 transition-all duration-700 ${connectorColor(paymentSteps[idx].key, paymentSteps[idx + 1].key)}`} />
                        )}
                      </React.Fragment>
                    ))}
                  </div>

                  {/* Footer info */}
                  <div className="flex items-center justify-between pt-8 border-t border-gray-50">
                    <div className="flex items-center gap-1.5 text-[9px] font-bold text-gray-400 uppercase tracking-widest">
                      <Clock size={10} />
                      <span>
                        {paymentStatus.lastUpdated
                          ? new Date(paymentStatus.lastUpdated).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })
                          : 'N/A'}
                      </span>
                    </div>
                    {paymentStatus.status === 'PROCESSING' && (
                      <span className="text-[9px] font-black text-blue-500 uppercase tracking-widest flex items-center gap-1">
                        <Loader2 size={10} className="animate-spin" /> Live
                      </span>
                    )}
                    {paymentStatus.status === 'DELAYED' && (
                      <span className="text-[9px] font-black text-red-500 uppercase tracking-widest flex items-center gap-1">
                        <AlertTriangle size={10} /> Verification pending
                      </span>
                    )}
                    {paymentStatus.status === 'COMPLETED' && (
                      <span className="text-[9px] font-black text-green-600 uppercase tracking-widest flex items-center gap-1">
                        <CheckCircle2 size={10} /> Settlement complete
                      </span>
                    )}
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-center py-6 text-gray-400 text-xs font-bold uppercase tracking-widest">
                  <Loader2 size={16} className="animate-spin mr-2" /> Loading payment info...
                </div>
              )}
            </div>
          </div>
        )}

        {/* Timeline */}
        {claim.timeline && claim.timeline.length > 0 && (
          <div className="bg-white rounded-[16px] shadow-[0_4px_15px_rgb(0,0,0,0.02)] border border-gray-100 overflow-hidden">
             <div className="p-4 border-b border-gray-50 flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-orange-50 flex items-center justify-center shrink-0">
                <Activity size={16} className="text-orange-500" />
              </div>
              <h2 className="text-[10px] font-bold text-gray-800 uppercase tracking-widest">{t('timeline')}</h2>
            </div>
            <div className="p-5">
              <div className="relative border-l-2 border-gray-100 ml-2.5 pl-5 space-y-5">
                {claim.timeline.map((item, idx) => (
                  <div key={idx} className="relative">
                    <div className="absolute -left-[27px] top-0.5 w-3 h-3 rounded-full bg-green-500 ring-4 ring-white shadow-sm"></div>
                    <p className="font-black text-xs text-gray-900 mb-1 leading-none uppercase tracking-widest" data-i18n={item.action?.toLowerCase().replace(/\s+/g, '_')}>{t(item.action?.toLowerCase().replace(/\s+/g, '_') || item.action)}</p>
                    <p className="text-[11px] font-medium text-gray-500 mb-1.5 leading-snug">{item.detail}</p>
                    <p className="text-[9px] text-gray-400 font-mono font-bold uppercase tracking-widest">{new Date(item.timestamp).toLocaleString()}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default MobileDetails;

