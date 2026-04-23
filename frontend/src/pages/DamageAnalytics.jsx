import React, { useState, useEffect } from 'react';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Loader2, AlertTriangle, Activity, Target, AlertOctagon, MapPin, Wheat } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell } from 'recharts';

// Theme Colors adhering to Slate/Blue/Emerald
const COLORS = {
  emerald: '#10b981', // Low damage
  amber: '#f59e0b',   // Medium damage
  red: '#ef4444',     // High damage
  slate: '#64748b',
  blue: '#3b82f6'
};

export default function DamageAnalytics() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [data, setData] = useState({
    avgDamage: 0,
    totalFarms: 0,
    distribution: [],
    regionData: [],
    cropData: [],
    mostDamagedRegion: null,
    mostVulnerableCrop: null
  });

  useEffect(() => {
    async function loadAnalytics() {
      try {
        setLoading(true);
        const [page1, page2, page3] = await Promise.all([
          api.getFarms({ limit: 100, page: 1 }),
          api.getFarms({ limit: 100, page: 2 }),
          api.getFarms({ limit: 100, page: 3 })
        ]);

        const farms = [...(page1.data || []), ...(page2.data || []), ...(page3.data || [])];

        let totalDamage = 0;
        let validFarmsCount = 0;
        
        const buckets = { low: 0, medium: 0, high: 0 };
        const regionStats = {};
        const cropStats = {};

        farms.forEach(farm => {
          const damage = farm.summary?.damagePercentage || farm.ndviDrop || 0;
          totalDamage += damage;
          validFarmsCount++;

          // Bucketing
          if (damage <= 30) buckets.low++;
          else if (damage <= 60) buckets.medium++;
          else buckets.high++;

          // Regional
          const region = farm.location?.state || 'Unknown';
          if (!regionStats[region]) regionStats[region] = { total: 0, count: 0 };
          regionStats[region].total += damage;
          regionStats[region].count++;

          // Crop
          const crop = farm.cropType || 'Unknown';
          if (!cropStats[crop]) cropStats[crop] = { total: 0, count: 0 };
          cropStats[crop].total += damage;
          cropStats[crop].count++;
        });

        // Format for Recharts
        const distributionData = [
          { name: 'Low (0-30%)', value: buckets.low, color: COLORS.emerald },
          { name: 'Medium (30-60%)', value: buckets.medium, color: COLORS.amber },
          { name: 'High (60-100%)', value: buckets.high, color: COLORS.red }
        ];

        const regionData = Object.keys(regionStats)
          .map(name => ({ 
            name, 
            avgDamage: regionStats[name].total / regionStats[name].count 
          }))
          .sort((a, b) => b.avgDamage - a.avgDamage)
          .slice(0, 8); // Top 8

        const cropData = Object.keys(cropStats)
          .map(name => ({ 
            name, 
            avgDamage: cropStats[name].total / cropStats[name].count 
          }))
          .sort((a, b) => b.avgDamage - a.avgDamage)
          .slice(0, 8); // Top 8

        setData({
          avgDamage: validFarmsCount > 0 ? totalDamage / validFarmsCount : 0,
          totalFarms: validFarmsCount,
          distribution: distributionData,
          regionData,
          cropData,
          mostDamagedRegion: regionData[0]?.name || 'N/A',
          mostVulnerableCrop: cropData[0]?.name || 'N/A'
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
        <Loader2 className="w-10 h-10 animate-spin text-red-500 opacity-50" />
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

  // Custom Bar Cell coloring based on damage percentage
  const getDamageColor = (val) => {
    if (val > 60) return COLORS.red;
    if (val > 30) return COLORS.amber;
    return COLORS.emerald;
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-3">
             <Target className="w-5 h-5 text-red-500" />
             <Badge className="bg-red-100 text-red-700 font-bold uppercase tracking-wider px-3 py-1">
               DAMAGE INTELLIGENCE
             </Badge>
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Crop Loss Analytics</h1>
          <p className="text-sm text-slate-500 mt-2 max-w-xl">
            Satellite-derived severity mapping and spatial damage distribution across all monitored assets.
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
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="p-6 border-l-4 border-l-red-500 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-full bg-red-50 text-red-600">
              <AlertOctagon className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">System Avg Damage</p>
              <div className="flex items-baseline gap-2">
                 <p className="text-3xl font-extrabold text-slate-900 mt-1">{data.avgDamage.toFixed(1)}%</p>
                 <span className="text-xs font-bold text-red-500">CRITICAL AVERAGE</span>
              </div>
            </div>
          </div>
        </Card>
        
        <Card className="p-6 border-l-4 border-l-slate-400 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-full bg-slate-100 text-slate-600">
              <Activity className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Total Monitored Farms</p>
              <p className="text-3xl font-extrabold text-slate-900 mt-1">{data.totalFarms}</p>
            </div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
         {/* Damage Distribution Histogram */}
         <Card className="p-6 shadow-sm lg:col-span-1">
          <h3 className="text-lg font-bold text-slate-800 tracking-tight mb-6">Severity Distribution</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.distribution} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 11}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 11}} />
                <Tooltip 
                  cursor={{fill: '#f8fafc'}}
                  formatter={(val) => [val, 'Farms']}
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Bar dataKey="value" radius={[4, 4, 0, 0]} barSize={40}>
                   {data.distribution.map((entry, index) => (
                     <Cell key={`cell-${index}`} fill={entry.color} />
                   ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Top Insights Box */}
        <Card className="p-8 shadow-sm lg:col-span-2 bg-slate-900 text-white relative overflow-hidden">
          <div className="absolute -right-10 -bottom-10 opacity-10">
            <Target className="w-64 h-64" />
          </div>
          <div className="relative z-10">
            <h3 className="text-xs font-bold text-red-400 uppercase tracking-widest mb-8">AI Damage Insights</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <p className="text-sm text-slate-400 mb-1 flex items-center gap-2"><MapPin className="w-4 h-4"/> Most Damaged Region</p>
                <p className="text-2xl font-bold text-white">{data.mostDamagedRegion}</p>
                <p className="text-xs text-slate-400 mt-2">Ground validation teams should prioritize deployments in this state.</p>
              </div>
              
              <div>
                <p className="text-sm text-slate-400 mb-1 flex items-center gap-2"><Wheat className="w-4 h-4"/> Most Vulnerable Crop</p>
                <p className="text-2xl font-bold text-white">{data.mostVulnerableCrop}</p>
                <p className="text-xs text-slate-400 mt-2">Showing lowest NDVI retention across the board compared to baseline.</p>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Regional & Crop Comparisons */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Regional Bar Chart */}
        <Card className="p-6 shadow-sm flex flex-col h-96">
          <div className="flex items-center gap-2 mb-6">
            <MapPin className="w-5 h-5 text-slate-400" />
            <h3 className="text-lg font-bold text-slate-800 tracking-tight">Average Damage by Region</h3>
          </div>
          <div className="flex-1 min-h-0">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.regionData} layout="vertical" margin={{ top: 0, right: 30, left: 20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                <XAxis type="number" tickFormatter={(v) => `${v}%`} domain={[0, 100]} tick={{fontSize: 12, fill: '#64748b'}} />
                <YAxis dataKey="name" type="category" width={80} tick={{fontSize: 12, fill: '#334155', fontWeight: 600}} />
                <Tooltip 
                  formatter={(val) => [`${val.toFixed(1)}%`, 'Avg Damage']}
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Bar dataKey="avgDamage" radius={[0, 4, 4, 0]} barSize={24}>
                   {data.regionData.map((entry, index) => (
                     <Cell key={`cell-${index}`} fill={getDamageColor(entry.avgDamage)} />
                   ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Crop Bar Chart */}
        <Card className="p-6 shadow-sm flex flex-col h-96">
          <div className="flex items-center gap-2 mb-6">
            <Wheat className="w-5 h-5 text-slate-400" />
            <h3 className="text-lg font-bold text-slate-800 tracking-tight">Average Damage by Crop</h3>
          </div>
          <div className="flex-1 min-h-0">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.cropData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#334155', fontSize: 12, fontWeight: 600}} dy={10} />
                <YAxis tickFormatter={(v) => `${v}%`} domain={[0, 100]} axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 11}} />
                <Tooltip 
                  cursor={{fill: '#f8fafc'}}
                  formatter={(val) => [`${val.toFixed(1)}%`, 'Avg Damage']}
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Bar dataKey="avgDamage" radius={[4, 4, 0, 0]} barSize={40}>
                   {data.cropData.map((entry, index) => (
                     <Cell key={`cell-${index}`} fill={getDamageColor(entry.avgDamage)} />
                   ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

    </div>
  );
}
