import React, { useEffect, useState } from 'react';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Loader2, Activity, Server, AlertTriangle, FileText, Satellite } from 'lucide-react';
import { api } from '../services/api';
import { useNavigate } from 'react-router-dom';

export default function ClaimLogs() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    async function loadLogs() {
      try {
        setLoading(true);
        const res = await api.getSystemLogs(); // Maps to /api/v1/activity
        setLogs(res);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadLogs();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-10 h-10 animate-spin text-primary opacity-50" />
      </div>
    );
  }

  const getLogStyle = (type) => {
    switch (type) {
      case 'fraud alert': return { border: 'border-red-500', bg: 'bg-red-50', text: 'text-red-700', icon: <AlertTriangle className="w-4 h-4 text-red-600"/> };
      case 'ndvi update': return { border: 'border-emerald-500', bg: 'bg-emerald-50', text: 'text-emerald-700', icon: <Satellite className="w-4 h-4 text-emerald-600"/> };
      default: return { border: 'border-blue-500', bg: 'bg-blue-50', text: 'text-blue-700', icon: <FileText className="w-4 h-4 text-blue-600"/> };
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-end mb-8">
        <div>
           <div className="flex items-center gap-2 mb-2 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
             <Activity className="w-4 h-4 text-blue-600" />
             <span>System Activity</span>
           </div>
           <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">Platform Event Logs</h1>
        </div>
        <div className="text-right">
           <Badge className="bg-[#005c8a] text-white px-4 py-2 font-bold tracking-widest uppercase mb-1">
             {logs.length} Events Captured
           </Badge>
           <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">REAL-TIME TELEMETRY</p>
        </div>
      </div>

      <div className="space-y-4 relative before:content-[''] before:absolute before:left-8 before:top-4 before:bottom-4 before:w-0.5 before:bg-slate-200">
        {logs.map((log, idx) => {
           const style = getLogStyle(log.type);
           return (
             <Card 
               key={idx} 
               className="p-4 flex gap-6 items-start relative z-10 border-l-0 shadow-sm ml-10 hover:shadow-md transition-all cursor-pointer"
               onClick={() => log.farmId && navigate(`/farm/${log.farmId}`)}
             >
               <div className={`absolute -left-[45px] w-8 h-8 rounded-full border-2 border-white top-5 shadow-sm flex items-center justify-center ${style.bg}`}>
                 {style.icon}
               </div>
               <div className="flex-1">
                  <div className="flex justify-between items-center mb-1">
                     <h4 className="font-bold text-slate-800">{log.desc}</h4>
                     <span className="text-xs font-mono text-slate-500 font-medium">
                       {new Date(log.timestamp).toLocaleString()}
                     </span>
                  </div>
                  <div className="flex items-center gap-3 mt-3">
                     <Badge className={`px-3 py-1 font-bold text-[9px] uppercase tracking-widest inline-flex items-center gap-1 border ${style.border} ${style.bg} ${style.text}`}>
                       {log.type}
                     </Badge>
                     {log.farmId && (
                       <span className="text-xs font-bold text-slate-400 uppercase tracking-widest hover:text-blue-500 transition-colors">
                         REF: {log.farmId}
                       </span>
                     )}
                  </div>
               </div>
             </Card>
           );
        })}
        {logs.length === 0 && (
           <div className="text-center py-10 text-slate-500">No telemetry logs available.</div>
        )}
      </div>
    </div>
  );
}
