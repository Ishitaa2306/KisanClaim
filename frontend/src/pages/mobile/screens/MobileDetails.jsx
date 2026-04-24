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
      <div className="flex w-full h-64 items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
      </div>
    );
  }

  if (!claim) return <div className="p-4 text-center text-sm text-gray-500">{t('no_data')}</div>;

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
    done: 'bg-green-500 text-white',
    active: 'bg-blue-500 text-white animate-pulse',
    delayed: 'bg-red-500 text-white animate-pulse',
    inactive: 'bg-gray-200 text-gray-400',
  };

  const connectorColor = (fromKey, toKey) => {
    const fromState = getStepState(fromKey);
    const toState = getStepState(toKey);
    if (fromState === 'done' && (toState === 'done' || toState === 'active')) return 'bg-green-400';
    if (fromState === 'done' && toState === 'delayed') return 'bg-red-400';
    return 'bg-gray-200';
  };

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

          {/* ── Payment Status Card (only for Approved claims) ── */}
          {claim.status === 'Approved' && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              {/* Header */}
              <div className="p-4 border-b border-gray-100 bg-gray-50/50 rounded-t-lg flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Banknote size={18} className="text-green-600" />
                  <h2 className="text-sm font-semibold text-gray-800 uppercase tracking-wider">Payment Status</h2>
                </div>
                {paymentLoading && !paymentStatus ? (
                  <Loader2 size={16} className="animate-spin text-gray-400" />
                ) : paymentStatus ? (
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-xs font-semibold uppercase ring-1 ${
                    paymentStatus.status === 'COMPLETED'
                      ? 'bg-green-50 text-green-700 ring-green-600/20'
                      : paymentStatus.status === 'PROCESSING'
                      ? 'bg-blue-50 text-blue-700 ring-blue-600/20'
                      : paymentStatus.status === 'DELAYED'
                      ? 'bg-red-50 text-red-700 ring-red-600/20'
                      : 'bg-gray-50 text-gray-600 ring-gray-600/20'
                  }`}>
                    {paymentStatus.status === 'COMPLETED' && <CheckCircle2 size={12} />}
                    {paymentStatus.status === 'PROCESSING' && <Loader2 size={12} className="animate-spin" />}
                    {paymentStatus.status === 'DELAYED' && <AlertTriangle size={12} />}
                    {paymentStatus.status.replace('_', ' ')}
                  </span>
                ) : null}
              </div>

              {/* Body */}
              <div className="p-5">
                {paymentStatus ? (
                  <div className="space-y-5">
                    {/* Stepper */}
                    <div className="flex items-center">
                      {paymentSteps.map((step, idx) => (
                        <React.Fragment key={step.key}>
                          {/* Step circle */}
                          <div className="flex flex-col items-center" style={{ flex: '0 0 auto' }}>
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-500 ${stepStyles[getStepState(step.key)]}`}>
                              {getStepState(step.key) === 'done' ? (
                                <CheckCircle2 size={14} />
                              ) : getStepState(step.key) === 'active' ? (
                                <Loader2 size={14} className="animate-spin" />
                              ) : getStepState(step.key) === 'delayed' ? (
                                <AlertTriangle size={14} />
                              ) : (
                                <span>{idx + 1}</span>
                              )}
                            </div>
                            <p className={`text-[9px] font-semibold uppercase tracking-wider mt-1.5 text-center leading-tight w-16 ${
                              getStepState(step.key) === 'done' ? 'text-green-600'
                              : getStepState(step.key) === 'active' ? 'text-blue-600'
                              : getStepState(step.key) === 'delayed' ? 'text-red-600'
                              : 'text-gray-400'
                            }`}>{step.label}</p>
                          </div>
                          {/* Connector */}
                          {idx < paymentSteps.length - 1 && (
                            <div className={`flex-1 h-0.5 rounded-full mx-1 -mt-4 transition-all duration-700 ${connectorColor(paymentSteps[idx].key, paymentSteps[idx + 1].key)}`} />
                          )}
                        </React.Fragment>
                      ))}
                    </div>

                    {/* Footer info */}
                    <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                      <div className="flex items-center gap-1.5 text-xs text-gray-500">
                        <Clock size={12} />
                        <span className="font-medium">
                          {paymentStatus.lastUpdated
                            ? new Date(paymentStatus.lastUpdated).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })
                            : 'N/A'}
                        </span>
                      </div>
                      {paymentStatus.status === 'PROCESSING' && (
                        <span className="text-[10px] font-semibold text-blue-500 uppercase tracking-wider flex items-center gap-1">
                          <Loader2 size={10} className="animate-spin" /> Live
                        </span>
                      )}
                      {paymentStatus.status === 'DELAYED' && (
                        <span className="text-[10px] font-semibold text-red-500 uppercase tracking-wider flex items-center gap-1">
                          <AlertTriangle size={10} /> Verification pending
                        </span>
                      )}
                      {paymentStatus.status === 'COMPLETED' && (
                        <span className="text-[10px] font-semibold text-green-600 uppercase tracking-wider flex items-center gap-1">
                          <CheckCircle2 size={10} /> Settlement complete
                        </span>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-center py-4 text-gray-400 text-sm">
                    <Loader2 size={16} className="animate-spin mr-2" /> Loading payment info...
                  </div>
                )}
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

