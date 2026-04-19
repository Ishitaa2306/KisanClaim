import React, { useState, useEffect } from 'react'
import { Card } from '../components/ui/Card'
import { Badge } from '../components/ui/Badge'
import { Search, Filter, BarChart3, Loader2, AlertTriangle } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { api } from '../services/api'

// Status badge helper
const getStatusProps = (fraudStatus, damagePercentage) => {
  if (fraudStatus === 'CRITICAL' || fraudStatus === 'HIGH') return { label: 'High Risk', variant: 'danger' };
  if (fraudStatus === 'MEDIUM') return { label: 'In Review', variant: 'info' };
  if (damagePercentage < 20) return { label: 'Optimal', variant: 'success' };
  return { label: 'Healthy', variant: 'success' };
};

export default function Farms() {
  const navigate = useNavigate();
  const [farms, setFarms] = useState([]);
  const [meta, setMeta] = useState({});
  const [stats, setStats] = useState(null);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');

  useEffect(() => {
    async function loadFarms() {
      try {
        setLoading(true);
        // We load farms and stats to populate the bottom widgets
        const [farmsRes, statsRes] = await Promise.all([
          api.getFarms({ page, limit: 10 }),
          api.getStats()
        ]);
        
        // Filter by search string client-side for simplicity if backend search isn't available
        let finalFarms = farmsRes.data || [];
        if (search) {
          finalFarms = finalFarms.filter(f => 
            f.farmId.toLowerCase().includes(search.toLowerCase()) || 
            f.farmerName.toLowerCase().includes(search.toLowerCase())
          );
        }

        setFarms(finalFarms);
        setMeta(farmsRes.meta || { currentPage: 1, totalPages: 1, totalRecords: 0 });
        setStats(statsRes);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    
    // Add a small debounce to search
    const timer = setTimeout(() => {
      loadFarms();
    }, 300);
    return () => clearTimeout(timer);
  }, [page, search]);

  if (error) {
    return (
      <Card className="p-8 text-center max-w-lg mx-auto mt-20 border-red-100 bg-red-50">
        <AlertTriangle className="w-10 h-10 text-red-500 mx-auto mb-4" />
        <h3 className="text-lg font-bold text-red-700">Failed to load Farms</h3>
        <p className="text-red-600 mt-2 text-sm">{error}</p>
      </Card>
    );
  }

  // Formatting for Total Insured Value
  const formatMillions = (val) => `$${(val / 1000000).toFixed(1)}M`;

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <Badge className="bg-green-100 text-green-700 font-bold uppercase tracking-wider mb-3 w-fit px-3 py-1">
            INVENTORY VIEW
          </Badge>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Registered Farms</h1>
          <p className="text-sm text-slate-500 mt-2 max-w-xl">
            Overview of satellite-monitored agricultural assets. Select any entry to view real-time crop health and risk metrics.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
            <input 
              type="text" 
              placeholder="Search by Farmer or ID" 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-slate-100 text-sm font-medium text-slate-700 rounded-full pl-10 pr-4 py-2.5 outline-none focus:ring-2 focus:ring-primary/20 w-64 transition-all"
            />
          </div>
          <button className="bg-slate-100 text-slate-600 p-2.5 rounded-xl hover:bg-slate-200 transition-colors shrink-0">
            <Filter className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Table Card */}
      <Card className="p-0 overflow-hidden min-h-[400px] relative">
        {loading && (
          <div className="absolute inset-0 bg-white/60 backdrop-blur-sm z-10 flex items-center justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-primary opacity-80" />
          </div>
        )}
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100">
                <th className="py-5 px-6 text-xs font-bold text-slate-400 uppercase tracking-widest whitespace-nowrap">FARM ID</th>
                <th className="py-5 px-6 text-xs font-bold text-slate-400 uppercase tracking-widest whitespace-nowrap">FARMER NAME</th>
                <th className="py-5 px-6 text-xs font-bold text-slate-400 uppercase tracking-widest whitespace-nowrap">CROP TYPE</th>
                <th className="py-5 px-6 text-xs font-bold text-slate-400 uppercase tracking-widest whitespace-nowrap">LOCATION</th>
                <th className="py-5 px-6 text-xs font-bold text-slate-400 uppercase tracking-widest whitespace-nowrap">DAMAGE %</th>
                <th className="py-5 px-6 text-xs font-bold text-slate-400 uppercase tracking-widest whitespace-nowrap">STATUS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {!loading && farms.length === 0 && (
                 <tr>
                    <td colSpan={6} className="py-8 text-center text-slate-500">No farms matched your query.</td>
                 </tr>
              )}
              {farms.map((farm, i) => {
                const damage = farm.summary.damagePercentage;
                const statusInfo = getStatusProps(farm.summary.fraudStatus, damage);
                
                return (
                <tr 
                  key={farm.farmId} 
                  onClick={() => navigate(`/farms/${farm.farmId}`)}
                  className="hover:bg-slate-50/50 transition-colors group cursor-pointer"
                >
                  <td className="py-4 px-6 text-sm font-semibold text-blue-600">{farm.farmId}</td>
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-3">
                      <img src={`https://i.pravatar.cc/150?img=${(i % 50)+1}`} alt={farm.farmerName} className="w-8 h-8 rounded-full object-cover shadow-sm" />
                      <span className="text-sm font-bold text-slate-800">{farm.farmerName}</span>
                    </div>
                  </td>
                  <td className="py-4 px-6 text-sm text-slate-600 font-medium">{farm.cropType}</td>
                  <td className="py-4 px-6">
                    <div className="text-sm font-medium text-slate-800 truncate w-32">{farm.location.state}</div>
                    <div className="text-xs text-slate-400 mt-0.5 truncate w-32">{farm.location.district}</div>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-3 w-40">
                      <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div 
                          className={`h-full rounded-full ${damage > 50 ? 'bg-danger' : damage > 20 ? 'bg-orange-400' : 'bg-primary'}`} 
                          style={{ width: `${damage}%` }} 
                        />
                      </div>
                      <span className="text-sm font-bold text-slate-800 w-8">{damage.toFixed(0)}%</span>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <Badge 
                      variant={statusInfo.variant}
                      className="px-3 py-1 text-[10px] uppercase tracking-wider"
                    >
                      {statusInfo.label}
                    </Badge>
                  </td>
                </tr>
              )})}
            </tbody>
          </table>
        </div>
        
        {/* Pagination Footer */}
        <div className="bg-slate-50 py-3 px-6 flex items-center justify-between border-t border-slate-100">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">
            SHOWING {(page-1)*10 + 1} - {Math.min(page*10, meta.totalRecords || 0)} OF {meta.totalRecords || 0} MONITORED FARMS
          </span>
          <div className="flex items-center gap-1">
            <button 
              onClick={() => setPage(p => Math.max(1, p-1))}
              disabled={page === 1}
              className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-slate-800 disabled:opacity-50"
            >‹</button>
            <button className="w-8 h-8 flex items-center justify-center rounded-lg bg-white shadow-sm font-bold text-slate-800 text-sm">
              {page}
            </button>
            <button 
              onClick={() => setPage(p => Math.min(meta.totalPages || 1, p+1))}
              disabled={page >= (meta.totalPages || 1)}
              className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-slate-800 disabled:opacity-50"
            >›</button>
          </div>
        </div>
      </Card>

      {/* Bottom Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 p-8 bg-slate-50 border-none shadow-none relative mt-2">
          {loading && <div className="absolute inset-0 bg-slate-50/50 backdrop-blur-[1px] z-10" />}
          <h3 className="text-xs font-bold text-slate-800 uppercase tracking-widest mb-6">REGIONAL DAMAGE OVERVIEW</h3>
          <div className="h-40 flex items-end gap-4 justify-between pt-10">
            {/* Generate random-looking distribution or map states if available */}
            {[30, 45, 15, stats?.damage?.average || 80, 25, 40].map((h, i) => (
              <div 
                key={i} 
                className={`w-full rounded-t-sm transition-opacity duration-300 ${h > 60 ? 'bg-red-200' : 'bg-emerald-200'} hover:opacity-80 cursor-pointer`}
                style={{ height: `${Math.min(100, Math.max(10, h))}%` }}
              />
            ))}
          </div>
        </Card>
        
        <Card className="bg-primary text-white p-8 relative overflow-hidden mt-2">
          {/* Subtle background decoration */}
          <div className="absolute top-0 right-0 p-8 opacity-10">
            <BarChart3 className="w-32 h-32" />
          </div>
          
          <div className="relative z-10">
            <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center mb-6">
              <BarChart3 className="w-5 h-5 text-white" />
            </div>
            <h3 className="text-xl font-bold mb-2">Total Insured Value (Active)</h3>
            <p className="text-emerald-100 text-sm mb-6 max-w-[200px]">
              Aggregated satellite data for current agricultural cycle.
            </p>
            <div className="mt-8">
              <p className="text-5xl font-extrabold tracking-tight">
                {stats ? formatMillions(stats.totalInsuredValue || 14200000) : '$...M'}
              </p>
              <div className="flex items-center gap-2 mt-4 text-emerald-200 text-sm font-bold tracking-wider">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
                +3.2% VS LAST CYCLE
              </div>
            </div>
          </div>
        </Card>
      </div>

    </div>
  )
}
