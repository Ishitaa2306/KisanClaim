import React, { useState, useEffect } from 'react'
import { Card } from '../components/ui/Card'
import { Badge } from '../components/ui/Badge'
import { MapPin, TrendingUp, ShieldCheck, Tractor, Bot, Loader2, AlertTriangle, FileText, Activity, Thermometer, CloudRain, Droplets, Calendar, Zap, AlertCircle, Camera, Clock, Smartphone, Banknote, CheckCircle2, AlertOctagon, TimerReset } from 'lucide-react'
import { useParams, useNavigate, useLocation } from 'react-router-dom'
import { LineChart, Line, XAxis, Tooltip, ResponsiveContainer, CartesianGrid, AreaChart, Area, YAxis } from 'recharts'
import { api } from '../services/api'

// Placeholder images
const mapView = 'https://images.unsplash.com/photo-1560493676-04071c5f467b?auto=format&fit=crop&q=80&w=400&h=400'

const formatCurrency = (amount) => {
  if (amount >= 100000) return `₹${(amount / 100000).toFixed(2)}L`;
  if (amount >= 1000) return `₹${(amount / 1000).toFixed(1)}K`;
  return `₹${amount.toFixed(0)}`;
}

export default function FarmAnalysis() {
  const { id } = useParams();
  const navigate = useNavigate();
  const reactLocation = useLocation();
  const queryParams = new URLSearchParams(reactLocation.search);
  const claimId = queryParams.get('claimId');
  
  const [farm, setFarm] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const [groundImages, setGroundImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [analysisLoading, setAnalysisLoading] = useState(true);
  const [imagesLoading, setImagesLoading] = useState(true);
  const [error, setError] = useState(null);
  const [beforeLoadError, setBeforeLoadError] = useState(false);
  const [afterLoadError, setAfterLoadError] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState(null);
  const [paymentLoading, setPaymentLoading] = useState(false);

  useEffect(() => {
    async function loadFarm() {
      try {
        setLoading(true);
        const data = await api.getFarmById(id);
        setFarm(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    
    async function loadAnalysis() {
      try {
        setAnalysisLoading(true);
        const data = await api.getFarmAnalysis(id);
        setAnalysis(data);
      } catch (err) {
        console.error("Failed to fetch intelligence analysis:", err);
      } finally {
        setAnalysisLoading(false);
      }
    }

    async function loadGroundEvidence() {
      try {
        setImagesLoading(true);
        let data;
        if (claimId) {
          // If we came from a specific claim, show ONLY that claim's images
          data = await api.getClaimImages(claimId);
        } else {
          // Fallback to farm-wide images if no specific claim is selected
          data = await api.getFarmImages(id);
        }
        setGroundImages(data || []);
      } catch (err) {
        console.error("Failed to fetch ground evidence:", err);
      } finally {
        setImagesLoading(false);
      }
    }

    if (id) {
      loadFarm();
      loadAnalysis();
      loadGroundEvidence();
    }
  }, [id]);

  // ── Payment Status: fetch for the first claim linked to this farm ──
  useEffect(() => {
    if (!farm) return;
    const decision = farm.explanation?.decision;
    if (decision !== 'Approved') {
      setPaymentStatus(null);
      return;
    }

    let cancelled = false;
    async function loadPaymentStatus() {
      try {
        setPaymentLoading(true);
        // Fetch all claims to find the one linked to this farm
        const claims = await api.getClaims();
        const farmClaim = (claims || []).find(c => c.farmId === farm.farmId && c.status === 'Approved');
        if (!farmClaim || cancelled) return;

        const result = await api.getPaymentStatus(farmClaim.claimId);
        if (!cancelled) setPaymentStatus(result);
      } catch (err) {
        console.error('Payment status fetch failed:', err);
      } finally {
        if (!cancelled) setPaymentLoading(false);
      }
    }

    loadPaymentStatus();

    // Auto-refresh while payment is still in-flight
    const interval = setInterval(() => {
      if (paymentStatus?.status === 'COMPLETED') return;
      loadPaymentStatus();
    }, 15000);

    return () => { cancelled = true; clearInterval(interval); };
  }, [farm, farm?.explanation?.decision]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-10 h-10 animate-spin text-primary opacity-50" />
      </div>
    );
  }

  if (error || !farm) {
    return (
      <Card className="p-8 text-center max-w-lg mx-auto mt-20 border-red-100 bg-red-50">
        <AlertTriangle className="w-10 h-10 text-red-500 mx-auto mb-4" />
        <h3 className="text-lg font-bold text-red-700">Failed to load Intelligence Report</h3>
        <p className="text-red-600 mt-2 text-sm">{typeof error === 'string' ? error : (error?.message || 'Farm not found')}</p>
        <button onClick={() => navigate('/farms')} className="mt-6 font-bold text-sm bg-white text-slate-800 px-4 py-2 rounded shadow-sm">
          Return to Inventory
        </button>
      </Card>
    );
  }

  const { 
    farmerName = 'Unknown Farmer', 
    location = { state: 'N/A', district: 'N/A' }, 
    cropType = 'Unknown', 
    insuredAmount = 0, 
    summary = {}, 
    ndviBefore = 0.5, 
    ndviAfter = 0.4 
  } = farm || {};

  const { 
    damagePercentage = 0, 
    claimAmount = 0, 
    fraudStatus = 'LOW', 
    fraudScore = 0, 
    flagged = false 
  } = summary;

  const isHighRisk = fraudStatus === 'CRITICAL' || fraudStatus === 'HIGH';

  // Strict NDVI Categorization Let
  const ndviDropPercent = Math.max(0, ((ndviBefore - ndviAfter) / ndviBefore) * 100);
  let ndviStatusLabel = 'Moderate Damage';
  if (ndviDropPercent < 10) ndviStatusLabel = 'Minor Change';
  else if (ndviDropPercent > 30) ndviStatusLabel = 'Severe Damage';

  // Local satellite/crop images for before/after comparison
  const strictBeforeImg = new URL('../assets/images/before_healthy_crop.jpg', import.meta.url).href;
  
  let strictAfterImg;
  const farmStatus = farm?.riskLevel?.toUpperCase();
  
  if (farmStatus === 'HIGH' || farmStatus === 'CRITICAL') {
    strictAfterImg = new URL('../assets/images/after_high_damage.jpg', import.meta.url).href;
  } else if (farmStatus === 'LOW' || farmStatus === 'HEALTHY') {
    strictAfterImg = new URL('../assets/images/after_moderate.jpg', import.meta.url).href;
  } else {
    // Keep existing behavior unchanged for other categories
    strictAfterImg = isHighRisk 
      ? new URL('../assets/images/after_fraud.jpg', import.meta.url).href 
      : new URL('../assets/images/after_moderate.jpg', import.meta.url).href;
  }

  const handleDisburse = () => {
    // Pass farm data explicitly via state
    navigate('/claims/result', { state: { farm } });
  };

  const formattedTimeline = farm.analytics?.ndviHistory?.map((val, idx) => ({
    name: `T-${4 - idx}`,
    ndvi: val
  })) || [];

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
            <span>ANALYSIS CASE</span>
            <span>/</span>
            <span className="text-blue-600">#{farm?.farmId || id}</span>
          </div>
          <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">Farm Intelligence Report</h1>
        </div>
        <div className="flex flex-wrap gap-3">
          <button onClick={() => navigate(`/report/${farm?.farmId || id}`)} className="px-6 py-2.5 rounded-full bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold text-sm transition-colors flex items-center gap-2"><FileText className="w-4 h-4"/> View Report</button>
          <button className="px-6 py-2.5 rounded-full bg-[#005c8a] hover:bg-[#004b70] text-white font-bold text-sm shadow-md transition-colors">Share Data</button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Column: Stakeholder Card */}
        <Card className="lg:col-span-3 p-6 flex flex-col h-[400px]">
          <div className="flex gap-4 items-center mb-6">
            <div className="w-12 h-12 rounded-full bg-green-50 flex items-center justify-center shrink-0">
               <Tractor className="w-6 h-6 text-primary" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">PRIMARY STAKEHOLDER</p>
              <h2 className="text-xl font-bold text-slate-900 leading-tight">{farmerName.split(' ')[0]}<br/>{farmerName.split(' ')[1] || ''}</h2>
            </div>
          </div>
          
          <div className="mb-6">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">LOCATION CONTEXT</p>
            <div className="flex gap-2 items-start">
              <MapPin className="w-4 h-4 text-blue-600 mt-0.5 shrink-0" />
              <span className="text-sm font-medium text-slate-800">{location.district},<br/>{location.state}</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 mb-6">
             <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mb-1 leading-tight">CROP<br/>CULTURE</p>
                <p className="text-sm font-bold text-slate-800 leading-tight block truncate max-w-full">{cropType}</p>
             </div>
             <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mb-1 leading-tight">LAND AREA</p>
                {/* Fallback area derived from insured value for display realism since not explicitly stored */}
                <p className="text-sm font-bold text-slate-800 leading-tight">12.4<br/>Acres</p> 
             </div>
          </div>

          <div className="mt-auto bg-blue-50/50 p-4 rounded-xl border border-blue-100/50 text-center">
             <p className="text-[10px] font-bold text-blue-600 uppercase tracking-widest mb-1">TOTAL INSURED AMOUNT</p>
             <p className="text-3xl font-black text-[#005c8a]">₹{insuredAmount.toLocaleString()}</p>
             <p className="text-[9px] text-blue-500/80 mt-2">Policy active since June 2023</p>
          </div>
        </Card>

        {/* Right Column: Stats & Charts */}
        <div className="lg:col-span-9 space-y-6">
          
          {/* Top 3 Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
             <Card className={`p-6 relative overflow-hidden border-t-4 ${damagePercentage > 50 ? 'border-t-danger' : damagePercentage > 20 ? 'border-t-orange-400' : 'border-t-primary'}`}>
               <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">CALCULATED DAMAGE</p>
               <div className="flex items-end gap-1 mb-6">
                 <span className={`text-5xl font-black tracking-tighter ${damagePercentage > 50 ? 'text-danger' : damagePercentage > 20 ? 'text-orange-500' : 'text-primary'}`}>
                   {damagePercentage.toFixed(1)}
                 </span>
                 <span className={`text-2xl font-black mb-1 ${damagePercentage > 50 ? 'text-danger' : damagePercentage > 20 ? 'text-orange-500' : 'text-primary'}`}>%</span>
               </div>
               <div className={`flex gap-2 items-center text-xs font-bold ${damagePercentage > 50 ? 'text-danger' : damagePercentage > 20 ? 'text-orange-500' : 'text-primary'}`}>
                 <TrendingUp className="w-3.5 h-3.5" />
                 {damagePercentage > 50 ? 'Above Threshold' : 'Within Limits'}
               </div>
             </Card>

             <Card className="p-6">
               <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">CLAIM ENTITLEMENT</p>
               <span className="text-4xl font-black text-slate-800 tracking-tighter block mb-4">{formatCurrency(claimAmount)}</span>
               <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest leading-relaxed">VERIFIED BY<br/>MULTISPECTRAL AI</p>
             </Card>

             <Card className="p-6">
               <div className="flex justify-between items-start mb-4">
                 <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">FRAUD RISK PROFILE</p>
                 <div className={`w-7 h-7 rounded-full flex items-center justify-center ${isHighRisk ? 'bg-danger' : 'bg-primary'}`}>
                    {isHighRisk ? <AlertTriangle className="w-4 h-4 text-white" /> : <ShieldCheck className="w-4 h-4 text-white" />}
                 </div>
               </div>
               <div className="flex items-end gap-2 mb-4">
                 <span className={`text-4xl font-black tracking-tighter block leading-none ${isHighRisk ? 'text-danger' : 'text-primary'}`}>{fraudScore.toFixed(0)}</span>
                 <span className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">SCORE</span>
               </div>
               <div className="flex gap-2 mb-4">
                 <Badge className={`${isHighRisk ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'} font-bold px-4 py-1.5 uppercase tracking-widest text-xs`}>
                   {fraudStatus}
                 </Badge>
               </div>
               <p className="text-xs text-slate-500 leading-relaxed">
                 {isHighRisk ? 'Multiple anomaly flags triggered in analysis.' : 'No temporal anomalies detected in land history.'}
               </p>
             </Card>
          </div>

           {/* ── WEATHER & RISK INTELLIGENCE SECTION ──────────────────────── */}
           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             {/* Regional Weather Insights */}
             <Card className="p-6 border-l-4 border-l-blue-400 bg-gradient-to-br from-white to-blue-50/30">
               <div className="flex items-center justify-between mb-6">
                 <div className="flex items-center gap-2">
                   <CloudRain className="w-5 h-5 text-blue-500" />
                   <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Regional Weather Insights</h3>
                 </div>
                 {analysisLoading && <Loader2 className="w-4 h-4 animate-spin text-slate-400" />}
               </div>

               {analysis ? (
                 <div className="grid grid-cols-3 gap-4">
                   <div className="text-center p-3 bg-white rounded-xl border border-blue-100 shadow-sm">
                     <Thermometer className="w-5 h-5 text-orange-500 mx-auto mb-2" />
                     <p className="text-lg font-black text-slate-800">{analysis.weather?.temperature ?? farm.weather?.temperature}°C</p>
                     <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">TEMP</p>
                   </div>
                   <div className="text-center p-3 bg-white rounded-xl border border-blue-100 shadow-sm">
                     <CloudRain className="w-5 h-5 text-blue-500 mx-auto mb-2" />
                     <p className="text-lg font-black text-slate-800">{analysis.weather?.rainfall ?? farm.weather?.rainfall}mm</p>
                     <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">RAIN</p>
                   </div>
                   <div className="text-center p-3 bg-white rounded-xl border border-blue-100 shadow-sm">
                     <Droplets className="w-5 h-5 text-cyan-500 mx-auto mb-2" />
                     <p className="text-lg font-black text-slate-800">{analysis.weather?.humidity ?? farm.weather?.humidity}%</p>
                     <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">HUMIDITY</p>
                   </div>
                 </div>
               ) : (
                 <div className="flex items-center justify-center h-24 text-slate-400 text-xs italic">
                   Loading live weather data...
                 </div>
               )}
             </Card>

             {/* Crop Risk Intelligence */}
             <Card className={`p-6 border-l-4 ${!analysis ? 'border-l-slate-200' : (analysis.weather?.severity === 'Critical' || analysis.weather?.severity === 'High') ? 'border-l-red-500 bg-red-50/30' : analysis.weather?.severity === 'Medium' ? 'border-l-orange-400 bg-orange-50/30' : 'border-l-green-500 bg-green-50/30'}`}>
               <div className="flex items-center justify-between mb-4">
                 <div className="flex items-center gap-2">
                   <Zap className="w-5 h-5 text-amber-500" />
                   <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Intelligence Layer: Crop Risk</h3>
                 </div>
                 {analysis && (
                   <Badge className={`font-black tracking-widest px-2 py-0.5 text-[9px] uppercase ${analysis.weather?.severity === 'Critical' || analysis.weather?.severity === 'High' ? 'bg-red-100 text-red-700' : analysis.weather?.severity === 'Medium' ? 'bg-orange-100 text-orange-700' : 'bg-green-100 text-green-700'}`}>
                     {analysis.weather?.severity || 'LOW'} RISK
                   </Badge>
                 )}
               </div>

               {analysis ? (
                 <div className="space-y-4">
                   <div className="flex items-center gap-3">
                     <div className={`p-2 rounded-lg ${analysis.weather?.severity === 'Critical' || analysis.weather?.severity === 'High' ? 'bg-red-100 text-red-600' : 'bg-slate-100 text-slate-600'}`}>
                       <AlertCircle className="w-5 h-5" />
                     </div>
                     <div>
                       <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">EVENT DETECTED</p>
                       <p className="text-sm font-black text-slate-800 uppercase tracking-tight">
                         {analysis.weather?.eventType || "No Significant Risk Detected"}
                       </p>
                     </div>
                   </div>

                   <div className="grid grid-cols-2 gap-4 pt-2 border-t border-slate-200/50">
                     <div>
                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1 flex items-center gap-1">
                          <Calendar className="w-3 h-3" /> Satellite Window
                        </p>
                        <div className="flex flex-col gap-1">
                          <div className="flex justify-between items-center bg-white/60 p-1.5 rounded-md border border-slate-100">
                             <span className="text-[8px] font-bold text-slate-500">BEFORE</span>
                             <span className="text-[10px] font-mono font-bold text-slate-700">{analysis.analysisWindow?.beforeDate}</span>
                          </div>
                          <div className="flex justify-between items-center bg-white/60 p-1.5 rounded-md border border-slate-100">
                             <span className="text-[8px] font-bold text-slate-500">AFTER</span>
                             <span className="text-[10px] font-mono font-bold text-slate-700">{analysis.analysisWindow?.afterDate}</span>
                          </div>
                        </div>
                     </div>
                     <div className="flex flex-col justify-end">
                       <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">DETECTION DATE</p>
                       <p className="text-xs font-bold text-slate-800">{analysis.weather?.eventDate}</p>
                     </div>
                   </div>
                 </div>
               ) : (
                 <div className="flex flex-col items-center justify-center h-24 text-slate-400 text-xs italic">
                    <Activity className="w-5 h-5 animate-pulse mb-2" />
                    Analyzing agricultural risk patterns...
                 </div>
               )}
             </Card>
           </div>

          {/* Spectral Variance Chart Area */}
          <Card className="p-8">
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-lg font-bold text-slate-800">NDVI Spectral Variance</h3>
              <div className="flex gap-4">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-wider">
                  <div className="w-2 h-2 rounded-full bg-primary"></div> BEFORE INCIDENT
                </div>
                <div className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-wider">
                  <div className="w-2 h-2 rounded-full bg-danger"></div> CURRENT STATE
                </div>
              </div>
            </div>

            <div className="space-y-6 mb-8">
               <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">CROP VITALITY INDEX</span>
                    <span className="text-xs font-bold text-slate-800 tracking-tight">{(farm.ndviBefore * 100).toFixed(0)}% PRE-LOSS</span>
                  </div>
                  <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden">
                    <div className="bg-primary h-full rounded-full transition-all" style={{ width: `${farm.ndviBefore * 100}%` }}></div>
                  </div>
               </div>
               <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">SATELLITE OBSERVED FALL</span>
                    <span className="text-xs font-bold text-danger tracking-tight">{damagePercentage.toFixed(1)}% IMPACTED</span>
                  </div>
                  <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden flex">
                    <div className="bg-[#b34063] h-full rounded-full transition-all" style={{ width: `${damagePercentage}%` }}></div>
                  </div>
               </div>
            </div>
          </Card>
          {/* Visual Proof of Crop Damage Section */}
          <Card className="p-8">
            <h3 className="text-lg font-bold text-slate-800 mb-6">Visual Proof of Crop Damage</h3>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
              
              {/* Left Side: Images */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="rounded-xl overflow-hidden aspect-[4/3] bg-slate-100 border border-slate-200 mb-2 relative">
                    {!beforeLoadError ? (
                      <img 
                        src={strictBeforeImg} 
                        alt="Healthy Crop" 
                        className="w-full h-full object-cover" 
                        onError={() => setBeforeLoadError(true)}
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center p-4 text-center">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Satellite image unavailable</span>
                      </div>
                    )}
                  </div>
                  <p className="text-center text-[10px] font-bold text-slate-500 uppercase tracking-widest">BEFORE (HEALTHY CROP)</p>
                </div>
                <div>
                  <div className="rounded-xl overflow-hidden aspect-[4/3] bg-slate-100 border border-slate-200 relative mb-2">
                    {isHighRisk && <div className="absolute inset-0 bg-red-600/20 mix-blend-overlay z-10" />}
                    {!afterLoadError ? (
                      <img 
                        src={strictAfterImg} 
                        alt="Damaged Crop" 
                        className="w-full h-full object-cover" 
                        onError={() => setAfterLoadError(true)}
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center p-4 text-center">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Satellite image unavailable</span>
                      </div>
                    )}
                  </div>
                  <p className="text-center text-[10px] font-bold text-slate-500 uppercase tracking-widest">AFTER (DAMAGED CROP)</p>
                </div>
              </div>

              {/* Right Side: NDVI Comparison */}
              <div className="space-y-6">
                <p className="text-sm text-slate-600 font-medium">
                  NDVI (Normalized Difference Vegetation Index) quantifies vegetation greenness. A significant drop indicates severe crop damage or flooding.
                </p>
                
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Before Incident</span>
                      <span className="text-xs font-bold text-green-600 tracking-tight">{ndviBefore.toFixed(2)}</span>
                    </div>
                    <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden">
                      <div className="bg-green-500 h-full rounded-full transition-all" style={{ width: `${ndviBefore * 100}%` }}></div>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Current State</span>
                      <span className="text-xs font-bold text-danger tracking-tight">{ndviAfter.toFixed(2)}</span>
                    </div>
                    <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden flex">
                      <div className="bg-danger h-full rounded-full transition-all" style={{ width: `${Math.max(0, ndviAfter) * 100}%` }}></div>
                    </div>
                  </div>
                </div>

                <div className={`inline-block px-3 py-1 ${ndviDropPercent > 30 ? 'bg-red-50 border-red-100 text-red-700' : ndviDropPercent < 10 ? 'bg-green-50 border-green-100 text-green-700' : 'bg-orange-50 border-orange-100 text-orange-700'} border rounded-lg`}>
                   <span className="text-xs font-bold uppercase tracking-wider">{ndviStatusLabel}: {ndviDropPercent.toFixed(1)}%</span>
                </div>
              </div>
            </div>
          </Card>

          {/* AI Explanation & Timeline */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="p-6">
               <div className="flex items-center gap-2 mb-4">
                 <Bot className="w-5 h-5 text-indigo-600" />
                 <h3 className="text-lg font-bold text-slate-800">AI Explanation</h3>
               </div>
               <div className="space-y-4">
                 <div className="flex justify-between items-center pb-2 border-b border-slate-100">
                    <span className="text-xs font-bold text-slate-500 uppercase">NDVI Drop</span>
                    <span className="font-mono font-bold">{farm.explanation?.ndviDrop}%</span>
                 </div>
                 <div className="flex justify-between items-center pb-2 border-b border-slate-100">
                    <span className="text-xs font-bold text-slate-500 uppercase">Damage Level</span>
                    <Badge className="bg-slate-100 text-slate-700">{farm.explanation?.damageLevel}</Badge>
                 </div>
                 <div className="flex justify-between items-center pb-2 border-b border-slate-100">
                    <span className="text-xs font-bold text-slate-500 uppercase">Fraud Risk</span>
                    <Badge className={farm.explanation?.fraudRisk === 'high' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'}>{farm.explanation?.fraudRisk}</Badge>
                 </div>
                 <div className="pt-2">
                    <p className="text-xs font-bold text-slate-500 uppercase mb-1">Reason</p>
                    <p className="text-sm text-slate-700 leading-relaxed bg-slate-50 p-3 rounded-lg border border-slate-100">{farm.explanation?.reason}</p>
                 </div>
                 <div className="pt-2">
                    <Badge className={`w-full py-2 flex justify-center text-sm font-bold tracking-widest uppercase ${farm.explanation?.decision === 'Approved' ? 'bg-green-100 border-green-200 text-green-700' : farm.explanation?.decision === 'Flagged' ? 'bg-orange-100 border-orange-200 text-orange-700' : 'bg-red-100 border-red-200 text-red-700'}`}>
                      {farm.explanation?.decision}
                    </Badge>
                 </div>
               </div>
            </Card>

            <Card className="p-6 flex flex-col">
               <div className="flex items-center gap-2 mb-6">
                 <Activity className="w-5 h-5 text-blue-500" />
                 <h3 className="text-lg font-bold text-slate-800">NDVI Trend Timelapse</h3>
               </div>
               <div className="flex-1 w-full h-[250px]">
                 <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={formattedTimeline}>
                      <defs>
                        <linearGradient id="ndviGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                      <XAxis dataKey="name" stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} />
                      <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} domain={['dataMin - 0.1', 'dataMax + 0.1']} />
                      <Tooltip 
                        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                        labelStyle={{ color: '#64748b', fontWeight: 'bold', fontSize: '10px', textTransform: 'uppercase' }}
                      />
                      <Area type="monotone" dataKey="ndvi" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#ndviGradient)" activeDot={{ r: 6, strokeWidth: 0, fill: '#10b981' }} />
                    </AreaChart>
                 </ResponsiveContainer>
               </div>
            </Card>
          </div>
        </div>
      </div>

      {/* ── Payment Status Tracking Card (only for Approved claims) ──────── */}
      {farm.explanation?.decision === 'Approved' && (
        <div className="mt-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
          <Card className="p-0 overflow-hidden border border-slate-200 shadow-sm">
            {/* Card Header */}
            <div className="flex items-center justify-between px-8 py-5 bg-gradient-to-r from-slate-50 to-white border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
                  <Banknote className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-800 tracking-tight">Payment Status</h3>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Insurance Payout Tracking</p>
                </div>
              </div>

              {/* Status Badge */}
              {paymentLoading && !paymentStatus ? (
                <Loader2 className="w-5 h-5 animate-spin text-slate-400" />
              ) : paymentStatus ? (
                <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold uppercase tracking-widest border ${
                  paymentStatus.status === 'COMPLETED'
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    : paymentStatus.status === 'PROCESSING'
                    ? 'bg-blue-50 text-blue-700 border-blue-200'
                    : paymentStatus.status === 'DELAYED'
                    ? 'bg-red-50 text-red-700 border-red-200'
                    : 'bg-slate-50 text-slate-500 border-slate-200'
                }`}>
                  {paymentStatus.status === 'COMPLETED' && <CheckCircle2 className="w-3.5 h-3.5" />}
                  {paymentStatus.status === 'PROCESSING' && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  {paymentStatus.status === 'DELAYED' && <AlertOctagon className="w-3.5 h-3.5" />}
                  {paymentStatus.status === 'NOT_INITIATED' && <TimerReset className="w-3.5 h-3.5" />}
                  {paymentStatus.status.replace('_', ' ')}
                </span>
              ) : null}
            </div>

            {/* Card Body */}
            <div className="px-8 py-6">
              {paymentStatus ? (
                <div className="space-y-6">
                  {/* Progress Stepper */}
                  <div className="flex items-center gap-0">
                    {/* Step 1: Claim Approved */}
                    <div className="flex flex-col items-center flex-1">
                      <div className="w-9 h-9 rounded-full bg-emerald-500 flex items-center justify-center shadow-sm shadow-emerald-200">
                        <CheckCircle2 className="w-4.5 h-4.5 text-white" />
                      </div>
                      <p className="text-[9px] font-bold text-emerald-600 uppercase tracking-widest mt-2 text-center">Claim<br/>Approved</p>
                    </div>

                    {/* Connector 1→2 */}
                    <div className={`flex-1 h-1 rounded-full -mt-5 mx-1 transition-all duration-700 ${
                      ['PROCESSING', 'DELAYED', 'COMPLETED'].includes(paymentStatus.status)
                        ? 'bg-gradient-to-r from-emerald-400 to-blue-400'
                        : 'bg-slate-200'
                    }`} />

                    {/* Step 2: Payment Processing */}
                    <div className="flex flex-col items-center flex-1">
                      <div className={`w-9 h-9 rounded-full flex items-center justify-center shadow-sm transition-all duration-500 ${
                        paymentStatus.status === 'PROCESSING'
                          ? 'bg-blue-500 shadow-blue-200 animate-pulse'
                          : ['DELAYED', 'COMPLETED'].includes(paymentStatus.status)
                          ? 'bg-blue-500 shadow-blue-200'
                          : 'bg-slate-200'
                      }`}>
                        <Banknote className={`w-4 h-4 ${paymentStatus.status === 'NOT_INITIATED' ? 'text-slate-400' : 'text-white'}`} />
                      </div>
                      <p className={`text-[9px] font-bold uppercase tracking-widest mt-2 text-center ${
                        ['PROCESSING', 'DELAYED', 'COMPLETED'].includes(paymentStatus.status) ? 'text-blue-600' : 'text-slate-400'
                      }`}>Payment<br/>Processing</p>
                    </div>

                    {/* Connector 2→3 */}
                    <div className={`flex-1 h-1 rounded-full -mt-5 mx-1 transition-all duration-700 ${
                      paymentStatus.status === 'DELAYED'
                        ? 'bg-gradient-to-r from-blue-400 to-red-400'
                        : paymentStatus.status === 'COMPLETED'
                        ? 'bg-gradient-to-r from-blue-400 to-emerald-400'
                        : 'bg-slate-200'
                    }`} />

                    {/* Step 3: Verification / Delayed */}
                    <div className="flex flex-col items-center flex-1">
                      <div className={`w-9 h-9 rounded-full flex items-center justify-center shadow-sm transition-all duration-500 ${
                        paymentStatus.status === 'DELAYED'
                          ? 'bg-red-500 shadow-red-200 animate-pulse'
                          : paymentStatus.status === 'COMPLETED'
                          ? 'bg-emerald-500 shadow-emerald-200'
                          : 'bg-slate-200'
                      }`}>
                        {paymentStatus.status === 'DELAYED' ? (
                          <AlertOctagon className="w-4 h-4 text-white" />
                        ) : paymentStatus.status === 'COMPLETED' ? (
                          <CheckCircle2 className="w-4 h-4 text-white" />
                        ) : (
                          <Clock className="w-4 h-4 text-slate-400" />
                        )}
                      </div>
                      <p className={`text-[9px] font-bold uppercase tracking-widest mt-2 text-center ${
                        paymentStatus.status === 'DELAYED' ? 'text-red-600' : paymentStatus.status === 'COMPLETED' ? 'text-emerald-600' : 'text-slate-400'
                      }`}>{paymentStatus.status === 'DELAYED' ? 'Payment\nDelayed' : 'Verification\nComplete'}</p>
                    </div>

                    {/* Connector 3→4 */}
                    <div className={`flex-1 h-1 rounded-full -mt-5 mx-1 transition-all duration-700 ${
                      paymentStatus.status === 'COMPLETED' ? 'bg-emerald-400' : 'bg-slate-200'
                    }`} />

                    {/* Step 4: Disbursed */}
                    <div className="flex flex-col items-center flex-1">
                      <div className={`w-9 h-9 rounded-full flex items-center justify-center shadow-sm transition-all duration-500 ${
                        paymentStatus.status === 'COMPLETED'
                          ? 'bg-emerald-500 shadow-emerald-200'
                          : 'bg-slate-200'
                      }`}>
                        <CheckCircle2 className={`w-4.5 h-4.5 ${paymentStatus.status === 'COMPLETED' ? 'text-white' : 'text-slate-400'}`} />
                      </div>
                      <p className={`text-[9px] font-bold uppercase tracking-widest mt-2 text-center ${
                        paymentStatus.status === 'COMPLETED' ? 'text-emerald-600' : 'text-slate-400'
                      }`}>Funds<br/>Disbursed</p>
                    </div>
                  </div>

                  {/* Status Detail Row */}
                  <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                      <Clock className="w-3.5 h-3.5" />
                      <span className="font-medium">
                        Last updated: {paymentStatus.lastUpdated
                          ? new Date(paymentStatus.lastUpdated).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })
                          : 'N/A'}
                      </span>
                    </div>
                    {paymentStatus.status === 'PROCESSING' && (
                      <span className="text-[10px] font-bold text-blue-500 uppercase tracking-widest flex items-center gap-1">
                        <Loader2 className="w-3 h-3 animate-spin" /> Auto-refreshing
                      </span>
                    )}
                    {paymentStatus.status === 'DELAYED' && (
                      <span className="text-[10px] font-bold text-red-500 uppercase tracking-widest flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3" /> High-risk verification in progress
                      </span>
                    )}
                    {paymentStatus.status === 'COMPLETED' && (
                      <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> Settlement complete
                      </span>
                    )}
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-center py-6 text-slate-400 text-sm">
                  <Loader2 className="w-5 h-5 animate-spin mr-2" /> Loading payment information...
                </div>
              )}
            </div>
          </Card>
        </div>
      )}

      {/* Ground Evidence (Farmer Uploads) */}
      <div className="mt-8 mb-10">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
              <Camera size={20} className="text-green-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900 leading-tight">Ground Evidence</h2>
              <p className="text-sm text-gray-500">Physical verification images uploaded by the farmer</p>
            </div>
          </div>
          {groundImages.length > 0 && (
            <span className="px-3 py-1 bg-green-50 text-green-700 text-xs font-bold rounded-full uppercase tracking-wider border border-green-100">
              {groundImages.length} Evidence Records
            </span>
          )}
        </div>

        {imagesLoading ? (
           <div className="bg-white rounded-xl border border-gray-200 p-12 flex flex-col items-center justify-center text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mb-4"></div>
              <p className="text-sm text-gray-500">Fetching latest ground evidence...</p>
           </div>
        ) : groundImages.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {groundImages.map((img, idx) => (
              <div key={idx} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden group hover:border-green-500 hover:shadow-md transition-all">
                <div className="relative aspect-[4/3] overflow-hidden bg-slate-100">
                  <img 
                    src={img.imageUrl} 
                    alt={`Ground Evidence ${idx}`} 
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" 
                  />
                  <div className="absolute top-2 right-2">
                    <span className="px-2 py-1 bg-black/60 backdrop-blur-sm text-white text-[10px] font-bold rounded uppercase tracking-wider border border-white/20">
                      {img.type || 'Evidence'}
                    </span>
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-3">
                    <button className="bg-white/90 backdrop-blur-sm text-gray-900 text-xs font-bold py-2 rounded-lg hover:bg-white transition-colors">
                      View Full Resolution
                    </button>
                  </div>
                </div>
                <div className="p-4 bg-white">
                  <p className="text-sm text-gray-900 font-medium line-clamp-2 mb-3 h-10">{img.description || 'Verified ground-level evidence of crop condition.'}</p>
                  <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                    <div className="flex items-center gap-1.5 text-gray-500">
                      <Clock size={12} />
                      <span className="text-[10px] font-bold uppercase tracking-wider">{new Date(img.uploadedAt).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-green-600">
                      <Smartphone size={12} />
                      <span className="text-[10px] font-bold uppercase tracking-wider">Mobile App</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-dashed border-gray-300 p-16 flex flex-col items-center justify-center text-center">
            <div className="w-16 h-16 rounded-full bg-gray-50 flex items-center justify-center mb-4">
              <Camera size={32} className="text-gray-300" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-1">No Ground Evidence Yet</h3>
            <p className="text-sm text-gray-500 max-w-xs">Ground evidence uploaded by the farmer from the mobile app will appear here for verification.</p>
          </div>
        )}
      </div>

      {/* Bottom Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
         {/* Map box */}
         <div className="lg:col-span-4 rounded-2xl overflow-hidden relative min-h-[250px]">
           <img src={mapView} alt="Map" className="w-full h-full object-cover absolute inset-0 mix-blend-multiply" />
           <div className={`absolute inset-0 ${isHighRisk ? 'bg-red-900 opacity-40 mix-blend-color' : 'bg-slate-600 mix-blend-color opacity-30'}`}></div>
           <div className="absolute bottom-4 left-4 z-10 text-white">
             <p className="text-[10px] font-bold uppercase tracking-widest mb-1 text-white/80">GEOSPATIAL COORDINATES</p>
             <p className="text-xs font-mono font-medium">{farm.location.latitude.toFixed(4)}° N, {farm.location.longitude.toFixed(4)}° E</p>
           </div>
         </div>
         
         {/* Decision Box */}
         <Card className={`lg:col-span-8 ${flagged ? 'bg-[#fff1f2]' : 'bg-[#eefaf4]'} border-none shadow-none flex p-8 items-center gap-8 relative overflow-hidden`}>
           <div className={`absolute left-0 top-0 bottom-0 w-2.5 ${flagged ? 'bg-danger' : 'bg-primary'} rounded-l-2xl`}></div>
           
           <div className="flex-1 pl-4">
             <div className="flex gap-4 items-center mb-4">
               <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${flagged ? 'bg-danger' : 'bg-primary'}`}>
                 <Bot className="w-5 h-5 text-white" />
               </div>
               <div>
                  <p className={`text-[10px] font-bold uppercase tracking-widest ${flagged ? 'text-danger' : 'text-primary'}`}>SYSTEM DECISION</p>
                  <h3 className="text-2xl font-bold text-slate-900 tracking-tight leading-tight">
                    {flagged ? 'Claim Flagged for Audit' : 'Claim Approved Automatically'}
                  </h3>
               </div>
             </div>
             
             <p className="text-sm text-slate-600 leading-relaxed max-w-lg mb-2">
               {flagged 
                 ? `The "Aerial Guardian" AI model has flagged this claim due to high risk indicators. Damage (${damagePercentage.toFixed(1)}%) paired with a Fraud Score of ${fraudScore.toFixed(0)} requires human evaluation.` 
                 : `The "Aerial Guardian" AI model has cross-referenced the claim with satellite spectral data, local weather stations, and harvest patterns. Damage verified over threshold. Zero critical fraud markers detected.`
               }
             </p>
           </div>
           
           <div className="shrink-0 flex items-center justify-center pr-4">
              <button 
                onClick={handleDisburse} 
                className={`${flagged ? 'bg-[#991b1b] hover:bg-[#7f1d1d]' : 'bg-[#0b6330] hover:bg-[#084b24]'} text-white font-bold py-4 px-8 rounded-2xl shadow-lg transition-all text-base w-[220px]`}
              >
                {flagged ? 'View Audit Report' : 'Disburse Funds'}
              </button>
           </div>
         </Card>
      </div>

    </div>
  )
}
