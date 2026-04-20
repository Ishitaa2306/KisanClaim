import React, { useState, useEffect } from 'react';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Loader2, FileText, Printer, CheckCircle, AlertTriangle } from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { api } from '../services/api';

export default function Report() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadReport() {
      try {
        setLoading(true);
        const data = await api.getFarmReport(id);
        setReport(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    if (id) loadReport();
  }, [id]);

  if (loading || !report) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-10 h-10 animate-spin text-primary opacity-50" />
      </div>
    );
  }

  const { farmDetails, damageAnalysis, fraudAnalysis, finalDecision, timeline } = report;

  const trendData = damageAnalysis.trend?.map((val, i) => ({
    name: `T-${damageAnalysis.trend.length - i}`,
    damage: val
  })) || [];

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      
      {/* Report Header */}
      <div className="flex justify-between items-start border-b-2 border-slate-900 pb-6 mb-8">
        <div>
           <div className="flex items-center gap-2 mb-2 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
             <FileText className="w-4 h-4 text-slate-800" />
             <span>OFFICIAL AUDIT REPORT</span>
           </div>
           <h1 className="text-4xl font-black text-slate-900 mb-1">Claim Assessment</h1>
           <p className="text-sm font-bold text-slate-500 font-mono">FILE REF: {farmDetails.farmId} // {new Date().toLocaleDateString()}</p>
        </div>
        <div className="flex flex-col items-end gap-2">
           <Badge className={`px-4 py-2 uppercase tracking-widest font-black text-sm border-2 ${finalDecision.decision === 'Approved' ? 'bg-green-100 text-green-800 border-green-800' : finalDecision.decision === 'Flagged' ? 'bg-orange-100 text-orange-800 border-orange-800' : 'bg-red-100 text-red-800 border-red-800'}`}>
             {finalDecision.decision}
           </Badge>
           <button onClick={() => window.print()} className="mt-2 text-xs font-bold text-blue-600 flex items-center gap-1 hover:underline"><Printer className="w-3 h-3"/> Print Record</button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-8">
         <div className="space-y-6">
            <h3 className="text-sm font-black uppercase tracking-widest text-slate-400 border-b border-slate-200 pb-2">1. Identity & Location</h3>
            <div className="space-y-4">
               <div>
                 <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Primary Beneficiary</p>
                 <p className="font-bold text-slate-800 text-lg">{farmDetails.farmerName}</p>
               </div>
               <div className="grid grid-cols-2 gap-4">
                 <div>
                   <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">State</p>
                   <p className="font-medium text-slate-800">{farmDetails.location.state}</p>
                 </div>
                 <div>
                   <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">District</p>
                   <p className="font-medium text-slate-800">{farmDetails.location.district}</p>
                 </div>
               </div>
            </div>
         </div>

         <div className="space-y-6">
            <h3 className="text-sm font-black uppercase tracking-widest text-slate-400 border-b border-slate-200 pb-2">2. Policy Summary</h3>
            <div className="space-y-4">
               <div>
                 <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Insured Crop</p>
                 <p className="font-bold text-slate-800 text-lg">{farmDetails.cropType}</p>
               </div>
               <div>
                 <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Max Liability Assigned</p>
                 <p className="font-medium text-slate-800">₹{farmDetails.insuredAmount?.toLocaleString()}</p>
               </div>
            </div>
         </div>
      </div>

      <div className="space-y-6 pt-6">
         <h3 className="text-sm font-black uppercase tracking-widest text-slate-400 border-b border-slate-200 pb-2">3. Multispectral Damage Analysis</h3>
         
         <div className="grid grid-cols-3 gap-4">
            <Card className="p-4 bg-slate-50 border-none">
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">NDVI Baseline</p>
              <p className="text-2xl font-bold font-mono text-slate-800">{damageAnalysis.ndviBefore?.toFixed(2)}</p>
            </Card>
            <Card className="p-4 bg-slate-50 border-none">
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">NDVI Post-Event</p>
              <p className="text-2xl font-bold font-mono text-slate-800">{damageAnalysis.ndviAfter?.toFixed(2)}</p>
            </Card>
            <Card className={`p-4 border-none text-white ${damageAnalysis.ndviDrop > 30 ? 'bg-[#991b1b]' : damageAnalysis.ndviDrop > 10 ? 'bg-[#b45309]' : 'bg-[#166534]'}`}>
              <p className="text-[10px] font-bold uppercase tracking-widest opacity-80">Calculated Drop</p>
              <p className="text-3xl font-black">{damageAnalysis.ndviDrop}%</p>
            </Card>
         </div>

         <div className="h-[200px] mt-4 w-full border border-slate-100 rounded-lg p-4 bg-white">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Damage Progression Curve</p>
            <ResponsiveContainer width="100%" height="100%">
               <LineChart data={trendData}>
                 <XAxis dataKey="name" fontSize={10} tickLine={false} axisLine={false} />
                 <YAxis fontSize={10} tickLine={false} axisLine={false} />
                 <Tooltip />
                 <Line type="stepAfter" dataKey="damage" stroke="#334155" strokeWidth={2} dot={{r: 4}} />
               </LineChart>
            </ResponsiveContainer>
         </div>
      </div>

      <div className="space-y-6 pt-6">
         <h3 className="text-sm font-black uppercase tracking-widest text-slate-400 border-b border-slate-200 pb-2">4. Core Fraud Mechanics</h3>
         <div className="flex gap-12 items-center bg-slate-50 p-6 rounded-lg">
            <div>
               <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center mb-1">Behavioral Score</p>
               <p className={`text-5xl font-black ${fraudAnalysis.riskScore > 50 ? 'text-danger' : 'text-primary'}`}>{fraudAnalysis.riskScore}</p>
            </div>
            <div className="flex-1 space-y-2">
               {fraudAnalysis.alerts && fraudAnalysis.alerts.length > 0 ? (
                 fraudAnalysis.alerts.map((alert, idx) => (
                   <div key={idx} className="flex gap-2 items-center text-sm font-bold text-red-700 bg-red-50 p-2 rounded">
                     <AlertTriangle className="w-4 h-4"/> {alert} Triggered
                   </div>
                 ))
               ) : (
                 <div className="flex gap-2 items-center text-sm font-bold text-green-700 bg-green-50 p-2 rounded">
                   <CheckCircle className="w-4 h-4"/> No critical anomalies detected
                 </div>
               )}
            </div>
         </div>
      </div>

      <div className="space-y-6 pt-6">
         <h3 className="text-sm font-black uppercase tracking-widest text-slate-400 border-b border-slate-200 pb-2">5. Final Adjudication</h3>
         <div className="p-6 border-2 border-slate-800 bg-slate-50 rounded-lg">
            <p className="text-sm text-slate-800 leading-relaxed italic mb-4">"{finalDecision.reason}"</p>
            <div className="flex justify-between items-center border-t border-slate-200 pt-4">
               <div>
                 <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Authorization</p>
                 <p className="font-black text-slate-800">Automated System Underwriting (A.G.)</p>
               </div>
               <Badge className="bg-slate-800 text-white font-bold tracking-widest uppercase py-2 px-6">
                 {finalDecision.decision}
               </Badge>
            </div>
         </div>
      </div>
      
    </div>
  );
}
