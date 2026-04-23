import React, { useEffect, useState } from 'react';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Loader2, AlertTriangle, ShieldCheck, Target, Map } from 'lucide-react';
import { api } from '../services/api';
import { useNavigate } from 'react-router-dom';

export default function RiskMatrix() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    async function loadRiskData() {
      try {
        setLoading(true);
        const res = await api.getRiskData();
        setData(res);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    loadRiskData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-10 h-10 animate-spin text-primary opacity-50" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <Card className="p-8 text-center max-w-lg mx-auto border-red-100 bg-red-50 mt-10">
        <AlertTriangle className="w-10 h-10 text-red-500 mx-auto mb-4" />
        <h3 className="text-lg font-bold text-red-700">Failed to load Risk Data</h3>
        <p className="text-red-600 mt-2 text-sm">{error}</p>
      </Card>
    );
  }

  const { distribution, targetNodes, totalAssessed } = data;

  const RiskQuadrant = ({ title, level, count, total, color, bg, border, icon: Icon }) => (
    <Card 
      onClick={() => navigate(`/risk/list?level=${level}`)}
      className={`p-6 border-l-4 ${border} ${bg} flex flex-col cursor-pointer hover:shadow-md hover:-translate-y-1 transition-all duration-200 group`}
    >
      <div className="flex justify-between items-start mb-4">
        <div>
          <h4 className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-1 group-hover:text-slate-700 transition-colors">{title}</h4>
          <span className={`text-4xl font-black ${color}`}>{count}</span>
        </div>
        <div className={`p-3 rounded-xl bg-white shadow-sm border ${border.replace('border-l-4', 'border')}`}>
          <Icon className={`w-6 h-6 ${color}`} />
        </div>
      </div>
      <div className="w-full bg-slate-200 h-2 rounded-full mt-auto">
        <div className={`h-full rounded-full transition-all ${color.replace('text-', 'bg-')}`} style={{ width: `${total > 0 ? (count/total)*100 : 0}%` }}></div>
      </div>
      <p className="text-[10px] font-bold text-slate-400 mt-2 text-right">{total > 0 ? ((count/total)*100).toFixed(1) : 0}% DISTRIBUTION</p>
    </Card>
  );

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 mb-2">Active Risk Matrix</h1>
          <p className="text-slate-500 font-medium text-sm max-w-2xl">Geospatial probability modeling of active vulnerabilities. Approved and settled claims are excluded.</p>
        </div>
        <Badge className="bg-slate-100 text-slate-700 px-4 py-2 font-bold uppercase tracking-widest border border-slate-200">
           {totalAssessed} Active Nodes
        </Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <RiskQuadrant level="critical" title="Critical Risk" count={distribution.critical || 0} total={totalAssessed} color="text-red-600" border="border-red-500" bg="bg-red-50/50" icon={AlertTriangle} />
        <RiskQuadrant level="high" title="High Risk" count={distribution.high || 0} total={totalAssessed} color="text-orange-500" border="border-orange-500" bg="bg-orange-50/30" icon={Target} />
        <RiskQuadrant level="medium" title="Medium Risk" count={distribution.medium || 0} total={totalAssessed} color="text-blue-500" border="border-blue-500" bg="bg-blue-50/50" icon={Map} />
        <RiskQuadrant level="low" title="Low Risk" count={distribution.low || 0} total={totalAssessed} color="text-green-600" border="border-green-500" bg="bg-green-50/50" icon={ShieldCheck} />
      </div>

      <Card className="p-0 overflow-hidden shadow-sm border-danger">
         <div className="bg-[#991b1b] p-4 text-white flex justify-between items-center">
            <h3 className="text-sm font-bold tracking-widest uppercase">Target Action Board: Critical & High Risk Nodes</h3>
            <span className="text-xs font-bold bg-white/20 px-2 py-1 rounded">REQUIRES ATTENTION</span>
         </div>
         <div className="divide-y divide-slate-100">
            {targetNodes?.map(farm => (
              <div key={farm.farmId} onClick={() => navigate(`/farm/${farm.farmId}`)} className="p-4 flex items-center justify-between hover:bg-slate-50 cursor-pointer transition-colors group">
                 <div className="flex items-center gap-6">
                    <div className={`w-12 h-12 rounded-lg flex items-center justify-center font-black ${farm.riskLevel === 'critical' ? 'bg-red-100 text-red-600' : 'bg-orange-100 text-orange-600'}`}>
                       {farm.riskScore || farm.damagePercentage?.toFixed(0)}
                    </div>
                    <div>
                       <div className="flex items-center gap-2">
                          <h4 className="font-bold text-slate-800 text-sm">{farm.farmerName || farm.farmId}</h4>
                          <Badge className={`text-[9px] uppercase tracking-wider ${farm.riskLevel === 'critical' ? 'bg-red-50 text-red-700 border-red-200' : 'bg-orange-50 text-orange-700 border-orange-200'}`}>
                             {farm.riskLevel}
                          </Badge>
                       </div>
                       <p className="text-xs text-slate-500 mb-1">{farm.district}, {farm.state}</p>
                       <div className="flex gap-2">
                          {farm.alerts?.map((a, i) => (
                             <Badge key={i} className="bg-slate-100 text-slate-600 text-[9px] uppercase tracking-wider border-slate-100">{a}</Badge>
                          ))}
                       </div>
                    </div>
                 </div>
                 <div className="text-right">
                    <p className="text-[10px] font-bold tracking-widest uppercase text-slate-400 mb-1">RECORDED DAMAGE</p>
                    <p className={`font-black ${farm.damagePercentage > 60 ? 'text-danger' : 'text-orange-500'}`}>{farm.damagePercentage?.toFixed(1)}%</p>
                    <button className="text-xs font-bold text-[#005c8a] mt-2 group-hover:underline">View Analysis &rarr;</button>
                 </div>
              </div>
            ))}
            {(!targetNodes || targetNodes.length === 0) && (
               <div className="p-8 text-center text-slate-500">No critical or high risk nodes detected.</div>
            )}
         </div>
      </Card>
    </div>
  );
}
