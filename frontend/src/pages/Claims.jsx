import React, { useState, useEffect } from 'react'
import { Card } from '../components/ui/Card'
import { Badge } from '../components/ui/Badge'
import { Search, Filter, Loader2, AlertTriangle, FileText } from 'lucide-react'
import { useNavigate, useLocation } from 'react-router-dom'
import { api } from '../services/api'

// Status badge helper
const getStatusProps = (status) => {
  const normStatus = (status || '').toLowerCase();
  if (normStatus === 'approved') return { label: 'Approved', variant: 'success', color: 'bg-green-100 text-green-700' };
  if (normStatus === 'rejected') return { label: 'Rejected', variant: 'danger', color: 'bg-red-100 text-red-700' };
  if (normStatus === 'flagged' || normStatus === 'review') return { label: 'Flagged', variant: 'danger', color: 'bg-red-100 text-red-700' };
  return { label: 'Pending', variant: 'warning', color: 'bg-yellow-100 text-yellow-700' }; // Default / Pending
};

export default function Claims() {
  const navigate = useNavigate();
  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState('All');
  
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const statusFilter = queryParams.get('status');

  useEffect(() => {
    async function loadClaims() {
      try {
        setLoading(true);
        const claimsData = await api.getClaims();
        
        let filteredClaims = claimsData || [];
        
        // Filter by URL param if provided initially, otherwise by activeFilter state
        const currentFilter = statusFilter ? statusFilter.toLowerCase() : activeFilter.toLowerCase();
        
        if (currentFilter !== 'all') {
          filteredClaims = filteredClaims.filter(c => {
            const status = (c.status || '').toLowerCase();
            // Dashboard sends "approved" or "flagged"
            if (currentFilter === 'approved') return status === 'approved';
            if (currentFilter === 'flagged') return status === 'flagged' || status === 'rejected' || status === 'review';
            if (currentFilter === 'pending') return status === 'pending';
            return true;
          });
        }

        // Apply text search
        if (search) {
          filteredClaims = filteredClaims.filter(c => 
            (c.claimId && c.claimId.toLowerCase().includes(search.toLowerCase())) || 
            (c.farmId && c.farmId.toLowerCase().includes(search.toLowerCase())) ||
            (c.farmerName && c.farmerName.toLowerCase().includes(search.toLowerCase()))
          );
        }

        setClaims(filteredClaims);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    
    const timer = setTimeout(() => {
      loadClaims();
    }, 300);
    return () => clearTimeout(timer);
  }, [search, statusFilter, activeFilter]);

  // Sync state if URL query changes
  useEffect(() => {
    if (statusFilter) {
      const formatted = statusFilter.charAt(0).toUpperCase() + statusFilter.slice(1);
      if (['Approved', 'Flagged', 'Pending'].includes(formatted)) {
        setActiveFilter(formatted);
      }
    }
  }, [statusFilter]);

  if (error) {
    return (
      <Card className="p-8 text-center max-w-lg mx-auto mt-20 border-red-100 bg-red-50">
        <AlertTriangle className="w-10 h-10 text-red-500 mx-auto mb-4" />
        <h3 className="text-lg font-bold text-red-700">Failed to load Claims</h3>
        <p className="text-red-600 mt-2 text-sm">{error}</p>
      </Card>
    );
  }

  const formatCurrency = (amount) => {
    if (!amount) return '₹0';
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount);
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-3">
             <FileText className="w-5 h-5 text-blue-600" />
             <Badge className="bg-blue-100 text-blue-700 font-bold uppercase tracking-wider px-3 py-1">
               CLAIMS LEDGER
             </Badge>
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Active Claims</h1>
          <p className="text-sm text-slate-500 mt-2 max-w-xl">
            Complete list of submitted insurance claims. Select any claim to open its detailed satellite audit report.
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
            <input 
              type="text" 
              placeholder="Search Claim or Farm ID" 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-white border border-slate-200 text-sm font-medium text-slate-700 rounded-full pl-10 pr-4 py-2.5 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 w-64 transition-all shadow-sm"
            />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2">
        {['All', 'Pending', 'Approved', 'Flagged'].map((filter) => (
          <button
            key={filter}
            onClick={() => {
               setActiveFilter(filter);
               // Also clear the URL param so user can switch freely
               navigate('/claims', { replace: true });
            }}
            className={`px-5 py-2 rounded-full text-sm font-bold transition-all whitespace-nowrap ${
              activeFilter === filter 
                ? 'bg-slate-800 text-white shadow-md' 
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50 hover:text-slate-900'
            }`}
          >
            {filter} Claims
          </button>
        ))}
      </div>

      {/* Table Card */}
      <Card className="p-0 overflow-hidden min-h-[400px] relative shadow-sm border-slate-200">
        {loading && (
          <div className="absolute inset-0 bg-white/60 backdrop-blur-sm z-10 flex items-center justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600 opacity-80" />
          </div>
        )}
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/50">
                <th className="py-5 px-6 text-xs font-bold text-slate-400 uppercase tracking-widest whitespace-nowrap">CLAIM ID</th>
                <th className="py-5 px-6 text-xs font-bold text-slate-400 uppercase tracking-widest whitespace-nowrap">FARM / FARMER</th>
                <th className="py-5 px-6 text-xs font-bold text-slate-400 uppercase tracking-widest whitespace-nowrap">DAMAGE %</th>
                <th className="py-5 px-6 text-xs font-bold text-slate-400 uppercase tracking-widest whitespace-nowrap">CLAIM AMOUNT</th>
                <th className="py-5 px-6 text-xs font-bold text-slate-400 uppercase tracking-widest whitespace-nowrap">STATUS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 bg-white">
              {!loading && claims.length === 0 && (
                 <tr>
                    <td colSpan={5} className="py-12 text-center text-slate-500 font-medium bg-slate-50/50">
                       No claims found matching your criteria.
                    </td>
                 </tr>
              )}
              {claims.map((claim) => {
                const damage = claim.ndviAnalysis?.ndviDrop || 0;
                const statusInfo = getStatusProps(claim.status);
                
                return (
                <tr 
                  key={claim.claimId} 
                  onClick={() => navigate(`/farm/${claim.farmId}`)}
                  className="hover:bg-blue-50/30 transition-colors group cursor-pointer"
                >
                  <td className="py-4 px-6 text-sm font-bold text-slate-900 tracking-tight">
                    {claim.claimId}
                  </td>
                  
                  <td className="py-4 px-6">
                    <div className="flex flex-col">
                      <span className="text-sm font-bold text-blue-600">{claim.farmId}</span>
                      <span className="text-xs font-medium text-slate-500 mt-0.5 truncate max-w-[200px]">{claim.farmerName || 'Unknown'}</span>
                    </div>
                  </td>
                  
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-3 w-40">
                      <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div 
                          className={`h-full rounded-full ${damage > 50 ? 'bg-red-500' : damage > 20 ? 'bg-yellow-400' : 'bg-green-500'}`} 
                          style={{ width: `${Math.min(100, Math.max(0, damage))}%` }} 
                        />
                      </div>
                      <span className="text-sm font-bold text-slate-800 w-10 text-right">{damage.toFixed(1)}%</span>
                    </div>
                  </td>
                  
                  <td className="py-4 px-6 text-sm font-bold text-slate-800">
                    {formatCurrency(claim.claimAmount)}
                  </td>
                  
                  <td className="py-4 px-6">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-[11px] font-bold uppercase tracking-wider ${statusInfo.color}`}>
                      <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${statusInfo.color.replace('bg-', 'bg-').replace('100', '500').split(' ')[0]}`}></span>
                      {statusInfo.label}
                    </span>
                  </td>
                </tr>
              )})}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}
