import React, { useState, useEffect } from 'react'
import { Card } from '../components/ui/Card'
import { Badge } from '../components/ui/Badge'
import { AlertTriangle, Activity, Map, Droplet, ChevronRight, Loader2 } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { api } from '../services/api'

// Placeholder map
const mapImage = 'https://images.unsplash.com/photo-1581093458791-9f3c3900df4b?auto=format&fit=crop&q=80&w=800&h=800'

export default function FraudDetection() {
  const navigate = useNavigate();
  const [farms, setFarms] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        // We only care about anomalies, so filter by HIGH or MEDIUM, and sort by fraudScore
        const [farmsRes, statsRes] = await Promise.all([
          api.getFarms({ limit: 10, sortBy: 'fraudScore', order: 'desc' }), // Backend doesn't support multiselect status directly, so sort by score and filter
          api.getStats()
        ]);
        
        let anomalous = farmsRes.data.filter(f => 
          ['CRITICAL', 'HIGH', 'MEDIUM'].includes(f.summary.fraudStatus)
        );
        
        setFarms(anomalous);
        setStats(statsRes);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const totalFlagged = stats?.totalFlagged || (stats ? (stats.fraud.statusBreakdown.HIGH || 0) + (stats.fraud.statusBreakdown.CRITICAL || 0) + (stats.fraud.statusBreakdown.MEDIUM || 0) : 0);
  const meanAccuracy = stats ? (100 - (totalFlagged / stats.totalFarms)*100).toFixed(1) : 98.4;

  if (loading) {
     return (
       <div className="flex items-center justify-center min-h-[60vh]">
         <Loader2 className="w-10 h-10 animate-spin text-primary opacity-50" />
       </div>
     );
  }

  // Pick the top anomaly for the showcase
  const showcaseFarm = farms[0] || null;

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
        <div>
          <div className="flex items-center gap-3 mb-3">
            <Badge className="bg-red-50 text-red-600 font-bold uppercase tracking-wider px-3 py-1 text-[10px]">
              ACTIVE MONITORING
            </Badge>
            <span className="text-sm font-medium text-slate-400">System Status: Optimal</span>
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">AI Fraud Detection Engine</h1>
          <p className="text-sm text-slate-500 mt-2 max-w-xl">
            Analyzing multi-spectral satellite telemetry and historical claim patterns to isolate anomalies in real-time.
          </p>
        </div>
        <Card className="bg-slate-50 border border-slate-100 shadow-none px-6 py-4 flex items-center gap-4 shrink-0">
          <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
            <AlertTriangle className="w-5 h-5 text-red-600" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">TOTAL FLAGGED</p>
            <p className="text-2xl font-extrabold text-slate-800">{totalFlagged}</p>
          </div>
        </Card>
      </div>

      {/* Top Cards Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Confidence Distribution */}
        <Card className="lg:col-span-2 p-8 border border-green-50">
          <p className="text-[10px] font-bold text-primary uppercase tracking-widest mb-6">CONFIDENCE SCORE DISTRIBUTION</p>
          <div className="flex items-end gap-3 mb-8">
            <span className="text-6xl font-black text-slate-900 tracking-tighter">{meanAccuracy}<span className="text-3xl">%</span></span>
            <span className="text-sm font-bold text-slate-500 pb-2">Normal Distribution</span>
          </div>
          
          <div className="space-y-2">
            <div className="h-2 flex rounded-full overflow-hidden">
              <div className="bg-primary hover:opacity-80 transition-opacity" style={{ width: `${meanAccuracy}%` }} />
              <div className="bg-danger hover:opacity-80 transition-opacity" style={{ width: `${100 - meanAccuracy}%` }} />
            </div>
            <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest text-slate-400">
              <span>NORMALIZED</span>
              <span>ANOMALOUS</span>
            </div>
          </div>
        </Card>

        {/* Live Scanning */}
        <Card className="bg-[#1f2937] text-white p-8 relative overflow-hidden flex flex-col justify-between">
          <Activity className="w-6 h-6 text-emerald-400 mb-8 animate-pulse" />
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">LIVE SCANNING</p>
            <h3 className="text-xl font-bold leading-tight">
              Scanning active farm grids across states...
            </h3>
          </div>
        </Card>
      </div>

      {/* Recent Anomalies List */}
      <div className="space-y-4">
        <div className="flex justify-between items-end mb-2">
          <h2 className="text-lg font-bold text-slate-800">Recent Anomalies</h2>
          <div className="flex gap-4 text-sm font-bold text-blue-600">
            <button className="text-slate-600 hover:text-slate-800 transition-colors">Clear Resolved</button>
          </div>
        </div>

        {farms.length === 0 && (
          <Card className="p-10 text-center text-slate-500">
            No active anomalies detected in the current monitoring cycle.
          </Card>
        )}

        {/* List Items */}
        {farms.map((farm, i) => {
          const s = farm.summary.fraudStatus;
          const isCritical = s === 'CRITICAL' || s === 'HIGH';
          
          return (
          <Card key={farm.farmId} onClick={() => navigate(`/farm/${farm.farmId}`)} className="p-4 flex items-center justify-between hover:border-red-200 transition-colors cursor-pointer group">
            <div className="flex items-center gap-4 w-1/3">
              <div className="w-12 h-12 rounded-xl bg-slate-200 overflow-hidden relative">
                 <div className={`w-full h-full bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] ${isCritical ? 'from-yellow-300 to-red-600' : 'from-yellow-300 to-orange-500'} opacity-80`} />
                 <div className="absolute bottom-1 right-1 w-2 h-2 rounded-full bg-white shadow-sm" />
              </div>
              <div>
                <h4 className="font-bold text-slate-800">{farm.farmerName}</h4>
                <div className="text-xs text-slate-500 mt-1 truncate max-w-[200px]">{farm.location.district} • ID: {farm.farmId}</div>
              </div>
            </div>
            
            <div className="text-center w-1/4">
               <p className="text-[10px] items-center justify-center font-bold text-slate-400 uppercase tracking-widest mb-1">FRAUD SCORE</p>
               <p className={`text-2xl font-black ${isCritical ? 'text-danger' : 'text-orange-500'}`}>{farm.summary.fraudScore.toFixed(0)}</p>
            </div>

            <div className="text-center w-1/4">
               <p className="text-[10px] items-center justify-center font-bold text-slate-400 uppercase tracking-widest mb-1">PRIMARY FLAG</p>
               <div className="flex justify-center text-xs font-bold text-slate-600">
                 {farm.analysis?.fraudAssessment?.checks?.neighborAnomaly?.score > 50 ? 'Neighbor Anomaly' : 
                  farm.analysis?.fraudAssessment?.checks?.statisticalOutlier?.score > 50 ? 'Stats Outlier' : 'Multi-Factor Variance'}
               </div>
            </div>

            <div className="w-1/4 flex justify-end items-center gap-4">
              <Badge className={`${isCritical ? 'bg-red-100 text-red-700 hover:bg-red-200' : 'bg-orange-100 text-orange-700 hover:bg-orange-200'} font-bold px-4 py-1.5 uppercase tracking-wider text-xs`}>
                {s === 'MEDIUM' ? 'ELEVATED' : 'CRITICAL RISK'}
              </Badge>
              <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center group-hover:bg-slate-200 transition-colors">
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </div>
            </div>
          </Card>
        )})}
      </div>

      {/* Surface Displacement Map Section */}
      {showcaseFarm && (
      <Card className="p-0 overflow-hidden flex flex-col md:flex-row shadow-sm">
        <div className="p-10 md:w-1/2 flex flex-col justify-between">
          <div>
            <Badge className="bg-red-50 text-red-600 font-bold uppercase tracking-widest mb-4 px-2 py-0.5 text-[10px]">
              ACTIVE ANALYSIS CASE
            </Badge>
            <h3 className="text-3xl font-extrabold text-slate-900 tracking-tight leading-tight mb-4">
              Anomaly Triggers Detected
            </h3>
            <p className="text-slate-600 leading-relaxed text-sm mb-8">
              Multi-temporal analysis of field {showcaseFarm.farmId} shows extreme divergence in NDVI drop compared to surrounding 50km neighborhood patterns. High probability of synthetic damage claim.
            </p>
            
            <div className="flex gap-4 mb-8">
              <div className="bg-slate-50 p-4 rounded-xl flex-1 border border-slate-100">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">LOCAL AVERAGE</p>
                <p className="text-xl font-black text-primary">{(showcaseFarm.analysis?.fraudAssessment?.checks?.neighborAnomaly?.detail?.neighborMeanDamage || 22).toFixed(1)}%</p>
              </div>
              <div className="bg-slate-50 p-4 rounded-xl flex-1 border border-slate-100">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">SATELLITE OBSERVED</p>
                <p className="text-xl font-black text-danger">{showcaseFarm.summary.damagePercentage.toFixed(1)}%</p>
              </div>
            </div>
          </div>
          
          <button onClick={() => navigate(`/analysis/${showcaseFarm.farmId}`)} className="bg-[#1f2937] text-white hover:bg-black font-bold py-4 px-6 rounded-xl transition-colors text-sm text-center w-full shadow-lg">
            Review Case Details
          </button>
        </div>
        
        <div className="md:w-1/2 relative bg-slate-900 min-h-[400px]">
          {/* Simulated heat map */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-yellow-500/20 via-red-600/40 to-slate-900 opacity-80 mix-blend-overlay z-10" />
          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&q=80&w=1000')] bg-cover bg-center opacity-40 mix-blend-luminosity" />
          <div className="absolute inset-0 bg-[repeating-linear-gradient(45deg,transparent,transparent_10px,rgba(0,0,0,0.2)_10px,rgba(0,0,0,0.2)_20px)] opacity-30 z-20" />
          
          <div className="absolute bottom-6 left-6 z-30 flex items-center gap-2 text-white text-xs font-medium">
            <span className="w-2.5 h-2.5 rounded-full bg-red-400 animate-pulse shadow-[0_0_10px_rgba(248,113,113,0.8)]" />
            Vegetation variance exceeds {((showcaseFarm.analysis?.fraudAssessment?.checks?.neighborAnomaly?.detail?.zScore || 2.4)).toFixed(1)} standard deviations
          </div>
        </div>
      </Card>
      )}

    </div>
  )
}
