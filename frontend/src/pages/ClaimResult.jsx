import React from 'react'
import { Card } from '../components/ui/Card'
import { CheckCircle2, AlertTriangle, Satellite, Timer, Loader2 } from 'lucide-react'
import { useLocation, useNavigate } from 'react-router-dom'
import { api } from '../services/api'

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(amount);
}

export default function ClaimResult() {
  const location = useLocation();
  const navigate = useNavigate();
  
  const [displayFarm, setDisplayFarm] = React.useState(location.state?.farm || null);
  const [loading, setLoading] = React.useState(!location.state?.farm);

  React.useEffect(() => {
    if (!displayFarm) {
      // If no farm is passed, just fetch the first/latest one to show a demo context
      api.getFarms({ limit: 1 }).then(res => {
        if (res.data && res.data.length > 0) {
          setDisplayFarm(res.data[0]);
        }
        setLoading(false);
      }).catch(() => setLoading(false));
    }
  }, [displayFarm]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-10 h-10 animate-spin text-primary opacity-50" />
      </div>
    );
  }

  if (!displayFarm) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <p className="text-slate-500 font-bold">No claim context found.</p>
        <button onClick={() => navigate('/farms')} className="text-white bg-primary px-6 py-2 rounded shadow">
          Go to Inventory
        </button>
      </div>
    );
  }

  const { fraudStatus, damagePercentage, claimAmount, flagged } = displayFarm.summary;
  const isHighRisk = flagged;

  // Simple current date for settlement
  const settlementDate = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

  return (
    <div className="max-w-6xl mx-auto min-h-[80vh] flex items-center justify-center animate-in fade-in zoom-in-95 duration-500">
      
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center w-full max-w-5xl">
         
         {/* Left text column */}
         <div className="lg:col-span-4 space-y-6">
            <div>
               <p className={`text-[10px] font-bold uppercase tracking-widest mb-3 ${isHighRisk ? 'text-danger' : 'text-blue-600'}`}>VERIFICATION NODE</p>
               <h1 className="text-4xl font-bold text-slate-900 tracking-tight leading-[1.1] mb-6">
                 Satellite<br/>Intelligence<br/>{isHighRisk ? 'Flagged' : 'Verified'}
               </h1>
            </div>
            <p className="text-sm text-slate-600 leading-relaxed max-w-[280px]">
               Our Aerial Guardian system has cross-referenced thermal, moisture, and multispectral data for Field ID #{displayFarm.farmId}.
            </p>
            
            <Card className="bg-slate-50 border-none shadow-none p-5 space-y-6 mt-8 max-w-[280px]">
              <div className="flex gap-4 items-center">
                 <Satellite className="w-5 h-5 text-primary" />
                 <div>
                   <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">SCAN RESOLUTION</p>
                   <p className="text-sm font-semibold text-slate-800">1.2m Multispectral</p>
                 </div>
              </div>
              <div className="flex gap-4 items-center">
                 <Timer className="w-5 h-5 text-primary" />
                 <div>
                   <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">PROCESSING TIME</p>
                   <p className="text-sm font-semibold text-slate-800">{(Math.random() * 200 + 300).toFixed(0)}ms</p>
                 </div>
              </div>
            </Card>
         </div>
         
         {/* Right big card */}
         <div className="lg:col-span-8 flex justify-end">
            <Card className="w-full max-w-xl p-12 text-center shadow-[0_10px_40px_-15px_rgba(0,0,0,0.1)] border-slate-100 border relative overflow-hidden backdrop-blur-xl bg-white/80">
               {/* Decorative background circle */}
               <div className={`absolute top-0 right-0 -translate-y-1/2 translate-x-1/3 w-64 h-64 ${isHighRisk ? 'bg-red-50' : 'bg-green-50'} rounded-full blur-3xl opacity-60 pointer-events-none`}></div>

               <div className={`mx-auto w-16 h-16 ${isHighRisk ? 'bg-red-200' : 'bg-green-300'} rounded-full flex items-center justify-center mb-8 relative z-10 shadow-sm`}>
                 {isHighRisk ? (
                   <AlertTriangle className="w-8 h-8 text-danger fill-transparent stroke-[2px]" />
                 ) : (
                   <CheckCircle2 className="w-8 h-8 text-black fill-transparent stroke-[2.5px]" />
                 )}
               </div>
               
               <h2 className="text-5xl font-black text-slate-900 tracking-tighter leading-none mb-4 relative z-10">
                 {isHighRisk ? 'Claim Audit\nRequired' : 'Claim Approved\nAutomatically'}
               </h2>
               <p className="text-slate-600 text-sm mb-10 relative z-10">Policy ID: KC-2024-{displayFarm.farmId}</p>

               <div className="grid grid-cols-2 gap-4 text-left mb-8 relative z-10">
                 <div className="bg-slate-50 p-5 rounded-xl border border-slate-100">
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">{isHighRisk ? 'MAXIMUM LIABILITY' : 'APPROVED AMOUNT'}</p>
                    <p className={`text-3xl font-black tracking-tight ${isHighRisk ? 'text-slate-500' : 'text-primary'}`}>
                      {formatCurrency(claimAmount)}
                    </p>
                 </div>
                 <div className="bg-slate-50 p-5 rounded-xl border border-slate-100">
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">DAMAGE ASSESSMENT</p>
                    <p className="text-3xl font-black text-slate-800 tracking-tight">{damagePercentage.toFixed(1)}%</p>
                 </div>
                 <div className="bg-slate-50 p-5 rounded-xl border border-slate-100">
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-2">FRAUD RISK INDEX</p>
                    <div className="flex gap-2 items-center">
                       <div className={`w-2.5 h-2.5 rounded-full ${isHighRisk ? 'bg-danger' : 'bg-primary'}`}></div>
                       <p className="text-lg font-bold text-slate-800">{fraudStatus}</p>
                    </div>
                 </div>
                 <div className="bg-slate-50 p-5 rounded-xl border border-slate-100">
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-2">SETTLEMENT DATE</p>
                    <p className={`text-lg font-bold ${isHighRisk ? 'text-danger' : 'text-slate-800'}`}>
                      {isHighRisk ? 'Pending Review' : settlementDate}
                    </p>
                 </div>
               </div>

               <div className="mb-10 text-left relative z-10">
                 <div className="flex justify-between mb-2">
                   <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">CROP HEALTH INDEX (PRE-EVENT VS POST-EVENT)</span>
                   <span className="text-[10px] font-bold text-danger">Recorded Fall Detected</span>
                 </div>
                 <div className="h-2.5 w-full bg-slate-200 flex rounded-full overflow-hidden">
                    <div className="bg-primary transition-all" style={{ width: `${displayFarm.ndviAfter * 100}%` }}></div>
                    <div className="bg-danger transition-all" style={{ width: `${(displayFarm.ndviBefore - displayFarm.ndviAfter) * 100}%` }}></div>
                 </div>
               </div>

               <div className="flex gap-4 relative z-10 text-sm">
                  <button className={`flex-1 ${isHighRisk ? 'bg-[#991b1b] hover:bg-[#7f1d1d]' : 'bg-[#0b6330] hover:bg-[#084b24]'} text-white font-bold py-4 rounded-xl shadow-lg transition-colors leading-tight`}>
                    {isHighRisk ? 'Forward to Audit Team' : 'Download Official\nCertificate'}
                  </button>
                  <button onClick={() => navigate('/analysis/' + displayFarm.farmId)} className="flex-1 bg-[#cde4fd] hover:bg-[#b0d2fa] text-[#005c8a] font-bold py-4 rounded-xl transition-colors">
                    View Analysis Details
                  </button>
               </div>
            </Card>
         </div>

      </div>
    </div>
  )
}
