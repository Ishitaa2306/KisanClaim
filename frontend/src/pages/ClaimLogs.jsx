import React, { useEffect, useState, useMemo } from 'react';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { 
  Loader2, Activity, AlertTriangle, FileText, Satellite, 
  CloudLightning, Shield, Fingerprint, Search, Filter, 
  ArrowRight, CheckCircle2, XCircle, Info
} from 'lucide-react';
import { api } from '../services/api';
import { useNavigate } from 'react-router-dom';

const EVENT_TYPES = [
  { id: 'ALL', label: 'All Events', icon: Activity },
  { id: 'NDVI', label: 'NDVI', icon: Satellite, color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-200' },
  { id: 'WEATHER', label: 'Weather', icon: CloudLightning, color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-200' },
  { id: 'RISK', label: 'Risk', icon: Shield, color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-200' },
  { id: 'CLAIM', label: 'Claims', icon: FileText, color: 'text-indigo-600', bg: 'bg-indigo-50', border: 'border-indigo-200' },
  { id: 'FRAUD', label: 'Fraud', icon: Fingerprint, color: 'text-red-600', bg: 'bg-red-50', border: 'border-red-200' },
];

export default function ClaimLogs() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL');
  const [search, setSearch] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    async function loadLogs() {
      try {
        setLoading(true);
        const res = await api.getSystemLogs();
        setLogs(res || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadLogs();
  }, []);

  const filteredLogs = useMemo(() => {
    return logs.filter(log => {
      const matchesFilter = filter === 'ALL' || log.eventType === filter;
      const matchesSearch = !search || 
        log.title.toLowerCase().includes(search.toLowerCase()) || 
        log.referenceId?.toLowerCase().includes(search.toLowerCase());
      return matchesFilter && matchesSearch;
    });
  }, [logs, filter, search]);

  const getEventConfig = (type, severity) => {
    const config = EVENT_TYPES.find(t => t.id === type) || { icon: Info, color: 'text-slate-600', bg: 'bg-slate-50', border: 'border-slate-200' };
    
    // Override icon for specific claims
    let Icon = config.icon;
    if (type === 'CLAIM') {
      if (severity === 'High') Icon = XCircle;
      else if (severity === 'Low') Icon = CheckCircle2;
    }

    return { ...config, Icon };
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-10 h-10 animate-spin text-[#005c8a] opacity-50" />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-20 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <div className="flex items-center gap-2 mb-2 text-[10px] font-bold text-[#005c8a] uppercase tracking-[0.2em]">
            <div className="w-2 h-2 rounded-full bg-[#005c8a] animate-pulse" />
            <span>Platform Intelligence Audit</span>
          </div>
          <h1 className="text-4xl font-black tracking-tight text-slate-900 mb-1">Platform Event Logs</h1>
          <p className="text-slate-500 font-medium text-sm">Real-time audit trail of system decisions and satellite telemetry.</p>
        </div>
        <div className="flex flex-col items-end">
          <Badge className="bg-slate-900 text-white px-4 py-2 font-bold tracking-widest uppercase mb-1 border-none shadow-lg">
            {filteredLogs.length} Events Logged
          </Badge>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Live Synchronized Stream</p>
        </div>
      </div>

      {/* Control Bar */}
      <Card className="p-4 bg-white/80 backdrop-blur shadow-sm border-slate-200 flex flex-col md:flex-row gap-4 sticky top-4 z-50">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input 
            type="text"
            placeholder="Search by Farm ID, Event or District..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#005c8a]/20 focus:border-[#005c8a] transition-all"
          />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1 md:pb-0 scrollbar-hide">
          {EVENT_TYPES.map(t => (
            <button
              key={t.id}
              onClick={() => setFilter(t.id)}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all whitespace-nowrap flex items-center gap-2 border ${
                filter === t.id 
                  ? 'bg-slate-900 text-white border-slate-900 shadow-md transform scale-105' 
                  : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300 hover:bg-slate-50'
              }`}
            >
              <t.icon className="w-3.5 h-3.5" />
              {t.label}
            </button>
          ))}
        </div>
      </Card>

      {/* Timeline List */}
      <div className="space-y-4 relative before:content-[''] before:absolute before:left-8 before:top-4 before:bottom-4 before:w-0.5 before:bg-slate-200">
        {filteredLogs.map((log) => {
          const config = getEventConfig(log.eventType, log.severity);
          return (
            <Card 
              key={log.activityId} 
              className="p-5 flex gap-6 items-start relative z-10 border-l-0 shadow-sm ml-10 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer group group-hover:border-slate-300"
              onClick={() => log.referenceId && navigate(`/farm/${log.referenceId}`)}
            >
              {/* Timeline Indicator */}
              <div className={`absolute -left-[45px] w-9 h-9 rounded-xl border-4 border-slate-50 top-5 shadow-lg flex items-center justify-center transition-transform group-hover:scale-110 ${config.bg}`}>
                <config.Icon className={`w-4 h-4 ${config.color}`} />
              </div>

              <div className="flex-1">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <Badge className={`px-2 py-0.5 font-black text-[9px] uppercase tracking-widest border ${config.border} ${config.bg} ${config.color}`}>
                        {log.eventType}
                      </Badge>
                      {log.severity === 'High' && (
                        <Badge className="bg-red-500 text-white border-none text-[8px] px-1.5 py-0">URGENT</Badge>
                      )}
                    </div>
                    <h4 className="font-bold text-slate-900 text-lg group-hover:text-[#005c8a] transition-colors">{log.title}</h4>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] font-mono text-slate-500 font-bold block mb-1">
                      {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                    </span>
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">
                      {new Date(log.timestamp).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                <p className="text-sm text-slate-500 leading-relaxed mb-4">{log.description}</p>

                <div className="flex items-center justify-between pt-4 border-t border-slate-50">
                  <div className="flex items-center gap-4">
                    {log.referenceId && (
                      <div className="flex items-center gap-1.5 bg-slate-100 px-3 py-1.5 rounded-full">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">REF:</span>
                        <span className="text-xs font-bold text-slate-700">{log.referenceId}</span>
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-[#005c8a] font-bold text-xs group-hover:translate-x-1 transition-transform">
                    Trace Back Assets
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </div>
              </div>
            </Card>
          );
        })}

        {filteredLogs.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-slate-400 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200 ml-10">
            <Search className="w-12 h-12 mb-4 opacity-20" />
            <p className="font-bold uppercase tracking-widest text-sm">No matching telemetry found</p>
            <button 
              onClick={() => {setFilter('ALL'); setSearch('');}}
              className="mt-4 text-xs font-bold text-[#005c8a] underline"
            >
              Reset all filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
