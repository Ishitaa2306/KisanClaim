import React, { useState, useEffect } from 'react';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Loader2, AlertTriangle, TrendingUp, Map, Wheat, DollarSign, Activity, FileText } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, CartesianGrid } from 'recharts';

// Theme Colors
const COLORS = {
  emerald: '#10b981',
  blue: '#3b82f6',
  slate: '#64748b',
  amber: '#f59e0b',
  red: '#ef4444',
  teal: '#14b8a6',
  indigo: '#6366f1'
};

const PIE_COLORS = [COLORS.blue, COLORS.emerald, COLORS.amber, COLORS.teal, COLORS.indigo, COLORS.slate];

const formatCurrency = (amount) => {
  if (amount >= 10000000) return `₹${(amount / 10000000).toFixed(2)} Cr`;
  if (amount >= 100000) return `₹${(amount / 100000).toFixed(2)} L`;
  if (amount >= 1000) return `₹${(amount / 1000).toFixed(1)} K`;
  return `₹${amount.toFixed(0)}`;
};

export default function FinancialAnalytics() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [data, setData] = useState({
    totalPayout: 0,
    avgPayout: 0,
    totalClaims: 0,
    cropData: [],
    regionData: [],
    seasonData: [],
    topRegion: null,
    topCrop: null
  });

  useEffect(() => {
    async function loadAnalytics() {
      try {
        setLoading(true);
        // Fetch all claims and all farms to join them
        const [claimsData, page1, page2, page3] = await Promise.all([
          api.getClaims(),
          api.getFarms({ limit: 100, page: 1 }),
          api.getFarms({ limit: 100, page: 2 }),
          api.getFarms({ limit: 100, page: 3 })
        ]);

        const farms = [...(page1.data || []), ...(page2.data || []), ...(page3.data || [])];
        const claims = claimsData || [];

        // Build Farm dictionary for O(1) lookup
        const farmDict = {};
        farms.forEach(f => {
          farmDict[f.farmId] = f;
        });

        let totalAmount = 0;
        let validClaimsCount = 0;
        const cropTotals = {};
        const regionTotals = {};
        const seasonTotals = {};

        claims.forEach(claim => {
          // Only consider Approved or Pending claims for "Payout" (ignore rejected)
          if ((claim.status || '').toLowerCase() === 'rejected') return;

          const amount = claim.claimAmount || 0;
          totalAmount += amount;
          validClaimsCount++;

          const farm = farmDict[claim.farmId];
          if (farm) {
            // Crop Aggregation
            const crop = farm.cropType || 'Unknown';
            cropTotals[crop] = (cropTotals[crop] || 0) + amount;

            // Region Aggregation
            const region = farm.location?.state || 'Unknown';
            regionTotals[region] = (regionTotals[region] || 0) + amount;

            // Season Aggregation
            const season = farm.season || 'Unknown';
            seasonTotals[season] = (seasonTotals[season] || 0) + amount;
          }
        });

        // Format for Recharts
        const cropData = Object.keys(cropTotals)
          .map(name => ({ name, value: cropTotals[name] }))
          .sort((a, b) => b.value - a.value)
          .slice(0, 8); // Top 8

        const regionData = Object.keys(regionTotals)
          .map(name => ({ name, value: regionTotals[name] }))
          .sort((a, b) => b.value - a.value)
          .slice(0, 8); // Top 8

        const seasonData = Object.keys(seasonTotals)
          .map(name => ({ name, value: seasonTotals[name] }));

        setData({
          totalPayout: totalAmount,
          avgPayout: validClaimsCount > 0 ? totalAmount / validClaimsCount : 0,
          totalClaims: validClaimsCount,
          cropData,
          regionData,
          seasonData,
          topRegion: regionData[0]?.name || 'N/A',
          topCrop: cropData[0]?.name || 'N/A'
        });

      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    loadAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-10 h-10 animate-spin text-blue-600 opacity-50" />
      </div>
    );
  }

  if (error) {
    return (
      <Card className="p-8 text-center max-w-lg mx-auto mt-20 border-red-100 bg-red-50">
        <AlertTriangle className="w-10 h-10 text-red-500 mx-auto mb-4" />
        <h3 className="text-lg font-bold text-red-700">Analytics Error</h3>
        <p className="text-red-600 mt-2 text-sm">{error}</p>
      </Card>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-3">
             <Activity className="w-5 h-5 text-blue-600" />
             <Badge className="bg-blue-100 text-blue-700 font-bold uppercase tracking-wider px-3 py-1">
               FINANCIAL INTELLIGENCE
             </Badge>
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Payout Analytics</h1>
          <p className="text-sm text-slate-500 mt-2 max-w-xl">
            Macro-level breakdown of disbursed funds and pending liabilities across regions and crops.
          </p>
        </div>
        <button 
          onClick={() => navigate('/dashboard')}
          className="text-sm font-bold text-slate-600 bg-white border border-slate-200 px-4 py-2 rounded-lg shadow-sm hover:bg-slate-50"
        >
          Back to Dashboard
        </button>
      </div>

      {/* Top Aggregates */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6 border-l-4 border-l-blue-500 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-full bg-blue-50 text-blue-600">
              <DollarSign className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Total Liability</p>
              <p className="text-3xl font-extrabold text-slate-900 mt-1">{formatCurrency(data.totalPayout)}</p>
            </div>
          </div>
        </Card>
        
        <Card className="p-6 border-l-4 border-l-emerald-500 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-full bg-emerald-50 text-emerald-600">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Active Claims</p>
              <p className="text-3xl font-extrabold text-slate-900 mt-1">{data.totalClaims}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6 border-l-4 border-l-amber-500 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-full bg-amber-50 text-amber-600">
              <TrendingUp className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Avg Payout/Claim</p>
              <p className="text-3xl font-extrabold text-slate-900 mt-1">{formatCurrency(data.avgPayout)}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Region Payouts */}
        <Card className="p-6 shadow-sm flex flex-col h-96">
          <div className="flex items-center gap-2 mb-6">
            <Map className="w-5 h-5 text-slate-400" />
            <h3 className="text-lg font-bold text-slate-800 tracking-tight">Payout by Region</h3>
          </div>
          <div className="flex-1 min-h-0">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.regionData} layout="vertical" margin={{ top: 0, right: 30, left: 20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                <XAxis type="number" tickFormatter={(v) => formatCurrency(v)} tick={{fontSize: 12, fill: '#64748b'}} />
                <YAxis dataKey="name" type="category" width={80} tick={{fontSize: 12, fill: '#334155', fontWeight: 600}} />
                <Tooltip 
                  formatter={(val) => [formatCurrency(val), 'Payout']}
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Bar dataKey="value" fill={COLORS.blue} radius={[0, 4, 4, 0]} barSize={24} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Crop Payouts */}
        <Card className="p-6 shadow-sm flex flex-col h-96">
          <div className="flex items-center gap-2 mb-6">
            <Wheat className="w-5 h-5 text-slate-400" />
            <h3 className="text-lg font-bold text-slate-800 tracking-tight">Financial Impact by Crop</h3>
          </div>
          <div className="flex-1 min-h-0">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.cropData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#334155', fontSize: 12, fontWeight: 600}} dy={10} />
                <YAxis tickFormatter={(v) => formatCurrency(v)} axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 11}} />
                <Tooltip 
                  cursor={{fill: '#f8fafc'}}
                  formatter={(val) => [formatCurrency(val), 'Payout']}
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Bar dataKey="value" fill={COLORS.emerald} radius={[4, 4, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Season Pie Chart */}
        <Card className="p-6 shadow-sm lg:col-span-1">
          <h3 className="text-lg font-bold text-slate-800 tracking-tight mb-6">Seasonal Distribution</h3>
          <div className="h-64 relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data.seasonData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={5}
                  dataKey="value"
                  stroke="none"
                >
                  {data.seasonData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(val) => formatCurrency(val)} />
              </PieChart>
            </ResponsiveContainer>
            {/* Center text for donut */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
               <span className="text-2xl font-bold text-slate-800">{data.seasonData.length}</span>
               <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Seasons</span>
            </div>
          </div>
          {/* Custom Legend */}
          <div className="mt-4 flex flex-wrap justify-center gap-4">
            {data.seasonData.map((s, i) => (
               <div key={s.name} className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: PIE_COLORS[i % PIE_COLORS.length] }}></div>
                  <span className="text-xs font-bold text-slate-700">{s.name}</span>
               </div>
            ))}
          </div>
        </Card>

        {/* Top Insights Box */}
        <Card className="p-8 shadow-sm lg:col-span-2 bg-slate-900 text-white relative overflow-hidden">
          <div className="absolute -right-10 -bottom-10 opacity-10">
            <DollarSign className="w-64 h-64" />
          </div>
          <div className="relative z-10">
            <h3 className="text-xs font-bold text-blue-400 uppercase tracking-widest mb-8">AI Financial Insights</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <p className="text-sm text-slate-400 mb-1">Highest Liability Region</p>
                <p className="text-2xl font-bold text-white">{data.topRegion}</p>
                <p className="text-xs text-slate-400 mt-2">Requires immediate fund allocation to prevent settlement delays.</p>
              </div>
              
              <div>
                <p className="text-sm text-slate-400 mb-1">Most Affected Crop</p>
                <p className="text-2xl font-bold text-white">{data.topCrop}</p>
                <p className="text-xs text-slate-400 mt-2">Consider adjusting actuarial premium models for this crop next season.</p>
              </div>
            </div>
          </div>
        </Card>
      </div>

    </div>
  );
}
