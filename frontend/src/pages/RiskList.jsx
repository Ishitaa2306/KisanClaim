import React, { useState, useEffect } from 'react';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Loader2, AlertTriangle, MapPin, Target, ShieldCheck, Map, Search, ArrowLeft } from 'lucide-react';
import { api } from '../services/api';
import { useNavigate, useSearchParams } from 'react-router-dom';

const RISK_COLORS = {
  critical: { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200', icon: AlertTriangle },
  high: { bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-200', icon: Target },
  medium: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200', icon: Map },
  low: { bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-200', icon: ShieldCheck }
};

export default function RiskList() {
  const [searchParams] = useSearchParams();
  const level = searchParams.get('level') || 'critical';
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [farms, setFarms] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    async function fetchRiskList() {
      try {
        setLoading(true);
        const res = await api.getRiskData(level);
        setFarms(res.farms || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchRiskList();
  }, [level]);

  const filteredFarms = farms.filter(farm => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      (farm.farmId || '').toLowerCase().includes(term) ||
      (farm.farmerName || '').toLowerCase().includes(term) ||
      (farm.district || '').toLowerCase().includes(term)
    );
  });

  const Theme = RISK_COLORS[level.toLowerCase()] || RISK_COLORS.critical;
  const Icon = Theme.icon;

  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <button onClick={() => navigate('/risk')} className="flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-slate-800 mb-4 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back to Risk Matrix
          </button>
          <div className="flex items-center gap-3 mb-2">
            <div className={`p-2 rounded-lg ${Theme.bg} ${Theme.text}`}>
              <Icon className="w-6 h-6" />
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 capitalize">
              {level} Risk Nodes
            </h1>
            <Badge className={`${Theme.bg} ${Theme.text} px-3 py-1 font-bold`}>
              {farms.length} Active Risks
            </Badge>
          </div>
          <p className="text-slate-500 font-medium text-sm">
            Investigating active liabilities. Approved claims have been automatically filtered out of this view.
          </p>
        </div>
        
        {/* Search Bar */}
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input 
            type="text" 
            placeholder="Search Farm ID, Name, District..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm font-medium text-slate-700 bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
          />
        </div>
      </div>

      {/* Content */}
      <Card className="shadow-sm border-slate-200 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center min-h-[40vh]">
            <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
          </div>
        ) : error ? (
          <div className="p-8 text-center bg-red-50">
            <AlertTriangle className="w-8 h-8 text-red-500 mx-auto mb-2" />
            <p className="text-sm font-bold text-red-700">{error}</p>
          </div>
        ) : filteredFarms.length === 0 ? (
          <div className="p-16 text-center">
            <ShieldCheck className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-slate-700">No matching risks found</h3>
            <p className="text-sm text-slate-500 mt-1">All {level} risk cases are either approved or not present.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-500 uppercase tracking-wider">
                  <th className="p-4 pl-6">Farm / Farmer</th>
                  <th className="p-4">Location</th>
                  <th className="p-4 text-right">Damage %</th>
                  <th className="p-4 text-center">Status</th>
                  <th className="p-4">Risk Factors</th>
                  <th className="p-4 pr-6 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredFarms.map((farm) => (
                  <tr 
                    key={farm.farmId} 
                    onClick={() => navigate(`/farm/${farm.farmId}`)}
                    className="hover:bg-slate-50/80 cursor-pointer transition-colors group"
                  >
                    <td className="p-4 pl-6">
                      <div className="font-bold text-slate-900">{farm.farmId}</div>
                      <div className="text-xs text-slate-500 mt-1">{farm.farmerName}</div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-1.5 text-sm text-slate-700">
                        <MapPin className="w-3 h-3 text-slate-400" />
                        {farm.district}, {farm.state}
                      </div>
                    </td>
                    <td className="p-4 text-right">
                      <span className={`font-black ${farm.damagePercentage > 60 ? 'text-red-600' : farm.damagePercentage > 30 ? 'text-orange-500' : 'text-slate-700'}`}>
                        {farm.damagePercentage?.toFixed(1)}%
                      </span>
                    </td>
                    <td className="p-4 text-center">
                      <Badge className={`px-2 py-1 text-[10px] uppercase font-bold tracking-wider
                        ${farm.status === 'Flagged' ? 'bg-red-100 text-red-700 border-red-200' : 
                          farm.status === 'Pending' ? 'bg-amber-100 text-amber-700 border-amber-200' : 
                          'bg-slate-100 text-slate-700 border-slate-200'}`}>
                        {farm.status}
                      </Badge>
                    </td>
                    <td className="p-4">
                      <div className="flex flex-wrap gap-1.5">
                        {farm.alerts?.length > 0 ? (
                          farm.alerts.map((alert, idx) => (
                            <Badge key={idx} className="bg-slate-100 text-slate-600 text-[9px] uppercase tracking-wider border-slate-200">
                              {alert}
                            </Badge>
                          ))
                        ) : (
                          <span className="text-xs text-slate-400 font-medium">Monitoring Normal</span>
                        )}
                      </div>
                    </td>
                    <td className="p-4 pr-6 text-right">
                      <button className="text-sm font-bold text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity">
                        Audit &rarr;
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
