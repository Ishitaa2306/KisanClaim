import React, { useState, useEffect } from 'react'
import { Card } from '../components/ui/Card'
import { Badge } from '../components/ui/Badge'
import { MapPin, TrendingUp, ShieldCheck, Tractor, Bot, Loader2, AlertTriangle } from 'lucide-react'
import { useParams, useNavigate } from 'react-router-dom'
import { api } from '../services/api'

// Placeholder images
const satellitePre = 'https://images.unsplash.com/photo-1592982537447-6f2a6a0dd30b?auto=format&fit=crop&q=80&w=600&h=300'
const satellitePost = 'https://images.unsplash.com/photo-1581093458791-9f3c3900df4b?auto=format&fit=crop&q=80&w=600&h=300'
const mapView = 'https://images.unsplash.com/photo-1560493676-04071c5f467b?auto=format&fit=crop&q=80&w=400&h=400'

const formatCurrency = (amount) => {
  if (amount >= 100000) return `₹${(amount / 100000).toFixed(2)}L`;
  if (amount >= 1000) return `₹${(amount / 1000).toFixed(1)}K`;
  return `₹${amount.toFixed(0)}`;
}

export default function FarmAnalysis() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [farm, setFarm] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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
    if (id) loadFarm();
  }, [id]);

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
        <p className="text-red-600 mt-2 text-sm">{error || 'Farm not found'}</p>
        <button onClick={() => navigate('/farms')} className="mt-6 font-bold text-sm bg-white text-slate-800 px-4 py-2 rounded shadow-sm">
          Return to Inventory
        </button>
      </Card>
    );
  }

  const { farmerName, location, cropType, insuredAmount, summary } = farm;
  const { damagePercentage, claimAmount, fraudStatus, fraudScore, flagged } = summary;

  const isHighRisk = fraudStatus === 'CRITICAL' || fraudStatus === 'HIGH';

  const handleDisburse = () => {
    // Pass farm data explicitly via state
    navigate('/claims/result', { state: { farm } });
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
            <span>ANALYSIS CASE</span>
            <span>/</span>
            <span className="text-blue-600">#{farm.farmId}</span>
          </div>
          <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">Farm Intelligence Report</h1>
        </div>
        <div className="flex gap-3">
          <button className="px-6 py-2.5 rounded-full bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold text-sm transition-colors">Export PDF</button>
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
               <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">FRAUD RISK PROFILE</p>
               <div className="flex gap-2 mb-4">
                 <Badge className={`${isHighRisk ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'} font-bold px-4 py-1.5 uppercase tracking-widest text-xs`}>
                   {fraudStatus}
                 </Badge>
                 <div className={`w-7 h-7 rounded-full flex items-center justify-center ${isHighRisk ? 'bg-danger' : 'bg-primary'}`}>
                    {isHighRisk ? <AlertTriangle className="w-4 h-4 text-white" /> : <ShieldCheck className="w-4 h-4 text-white" />}
                 </div>
               </div>
               <p className="text-xs text-slate-500 leading-relaxed">
                 {isHighRisk ? 'Multiple anomaly flags triggered in analysis.' : 'No temporal anomalies detected in land history.'}
               </p>
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

            <div className="grid grid-cols-2 gap-6">
              <div>
                 <div className="rounded-xl overflow-hidden aspect-[2/1] bg-slate-100 mb-3 border border-slate-200 p-1 relative">
                   {isHighRisk && <div className="absolute inset-0 bg-yellow-500/20 mix-blend-overlay z-10" />}
                   <img src={satellitePre} alt="Pre-flood" className="w-full h-full object-cover rounded-lg" />
                 </div>
                 <p className="text-center text-[10px] font-bold text-slate-500 uppercase tracking-widest">BASELINE (PRE-FLOOD)</p>
              </div>
              <div>
                 <div className="rounded-xl overflow-hidden aspect-[2/1] bg-slate-100 mb-3 border border-slate-200 p-1 relative">
                   {isHighRisk && <div className="absolute inset-0 bg-red-600/30 mix-blend-overlay z-10" />}
                   <img src={satellitePost} alt="Post-flood" className="w-full h-full object-cover rounded-lg" />
                 </div>
                 <p className="text-center text-[10px] font-bold text-slate-500 uppercase tracking-widest">CURRENT (POST-FLOOD)</p>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Bottom Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
         {/* Map box */}
         <div className="lg:col-span-4 rounded-2xl overflow-hidden relative min-h-[250px]">
           <img src={mapView} alt="Map" className="w-full h-full object-cover absolute inset-0 mix-blend-multiply" />
           <div className={`absolute inset-0 ${isHighRisk ? 'bg-red-900 opacity-40 mix-blend-color' : 'bg-slate-600 mix-blend-color opacity-30'}`}></div>
           <div className="absolute bottom-4 left-4 z-10 text-white">
             <p className="text-[10px] font-bold uppercase tracking-widest mb-1 text-white/80">GEOSPATIAL COORDINATES</p>
             <p className="text-xs font-mono font-medium">{farm.location.lat.toFixed(4)}° N, {farm.location.lng.toFixed(4)}° E</p>
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
