import React, { useState, useEffect } from 'react'
import { Card } from '../components/ui/Card'
import { Badge } from '../components/ui/Badge'
import { Tractor, FileText, CheckCircle, AlertTriangle, Banknote, BarChart2, Loader2, MapPin, Activity, Clock } from 'lucide-react'
import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, YAxis, CartesianGrid } from 'recharts'
import { useNavigate } from 'react-router-dom'
import { api } from '../services/api'

function StatCard({ icon: Icon, label, value, iconColor, onClick }) {
  return (
    <Card 
      className={`flex flex-col p-6 items-start gap-4 ${onClick ? 'cursor-pointer hover:shadow-md transition-all hover:border-slate-300' : ''}`}
      onClick={onClick}
    >
      <div className={`p-2 rounded-lg bg-slate-50 ${iconColor}`}>
        <Icon className="w-6 h-6" />
      </div>
      <div>
        <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">{label}</p>
        <p className="text-3xl font-bold mt-1 text-slate-800">{value}</p>
      </div>
    </Card>
  )
}

// Function to format Indian Rupees safely
const formatCurrency = (amount) => {
  if (amount >= 100000) return `₹${(amount / 100000).toFixed(2)}L`;
  if (amount >= 1000) return `₹${(amount / 1000).toFixed(1)}K`;
  return `₹${amount.toFixed(0)}`;
}

export default function Dashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [recentFarms, setRecentFarms] = useState([]);
  const [recentClaims, setRecentClaims] = useState([]);
  const [allFarms, setAllFarms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        // Fetch stats, latest high-risk farms, paginated farms, AND live claims
        const [statsData, farmsData, page1, page2, claimsData] = await Promise.all([
          api.getStats(),
          api.getFarms({ limit: 5, sortBy: 'fraudScore', order: 'desc' }), 
          api.getFarms({ limit: 100, page: 1 }), 
          api.getFarms({ limit: 100, page: 2 }),
          api.getClaims()
        ]);
        
        setStats(statsData);
        setRecentFarms(farmsData.data || []);
        setRecentClaims(claimsData || []);
        
        const allFarmsResp = [...(page1.data || []), ...(page2.data || [])];
        setAllFarms(allFarmsResp);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const handleClaimStatusUpdate = async (e, claimId, newStatus) => {
    e.stopPropagation(); // Prevent row click
    try {
      await api.updateClaimStatus(claimId, newStatus);
      // Optimistically update the UI
      setRecentClaims(prev => 
        prev.map(c => c.claimId === claimId ? { ...c, status: newStatus } : c)
      );
    } catch (err) {
      console.error("Failed to update claim status", err);
      alert("Failed to update status. See console for details.");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-10 h-10 animate-spin text-primary opacity-50" />
      </div>
    );
  }

  if (error) {
    return (
      <Card className="p-8 text-center max-w-lg mx-auto mt-20 border-red-100 bg-red-50">
        <AlertTriangle className="w-10 h-10 text-red-500 mx-auto mb-4" />
        <h3 className="text-lg font-bold text-red-700">Failed to load Dashboard</h3>
        <p className="text-red-600 mt-2 text-sm">{error}</p>
      </Card>
    );
  }

  // Safely extract stats with fallbacks
  const fraudDistributionData = [
    { name: 'Low Risk', value: stats.fraud.statusBreakdown?.LOW || 0, color: '#10b981' },
    { name: 'Medium Risk', value: stats.fraud.statusBreakdown?.MEDIUM || 0, color: '#f59e0b' },
    { name: 'High Risk', value: (stats.fraud.statusBreakdown?.HIGH || 0) + (stats.fraud.statusBreakdown?.CRITICAL || 0), color: '#ef4444' }
  ].filter(d => d.value > 0);

  // Compute Regional Damage Averages
  const regionsObj = {};
  allFarms.forEach(f => {
    const s = f.location.state;
    if (!regionsObj[s]) regionsObj[s] = { name: s, totalDamage: 0, count: 0 };
    regionsObj[s].totalDamage += f.summary.damagePercentage || 0;
    regionsObj[s].count++;
  });
  const regionalData = Object.values(regionsObj).map(r => ({
    name: r.name,
    avgDamage: Number((r.totalDamage / r.count).toFixed(1))
  })).sort((a,b) => b.avgDamage - a.avgDamage).slice(0, 7);

  // Compute generic Timeline/Trend (first 30 farms for noise reduction)
  const timelineData = allFarms.slice(0, 30).map((f, i) => ({
    name: `T-${30 - i}`,
    damage: f.summary.damagePercentage?.toFixed(1) || 0
  }));
  
  // Transform Damage Distribution for Bar Chart - Counting properly by iterating
  const severityCounts = { none: 0, minimal: 0, low: 0, moderate: 0, high: 0, severe: 0 };
  
  allFarms.forEach(farm => {
    // Extract: analysis.damageAssessment.severity and normalize to lowercase
    const rawSeverity = farm?.analysis?.damageAssessment?.severity || farm?.summary?.severity || 'none';
    const severity = rawSeverity.toLowerCase();
    
    // Map strictly to valid categories
    if (severityCounts[severity] !== undefined) {
      severityCounts[severity]++;
    }
  });

  const damageData = [
    { name: 'None', count: severityCounts.none, fill: '#e2e8f0' },       // light grey
    { name: 'Minimal', count: severityCounts.minimal, fill: '#86efac' }, // light green
    { name: 'Low', count: severityCounts.low, fill: '#22c55e' },         // green
    { name: 'Moderate', count: severityCounts.moderate, fill: '#eab308' },// yellow
    { name: 'High', count: severityCounts.high, fill: '#f97316' },       // orange
    { name: 'Severe', count: severityCounts.severe, fill: '#ef4444' },   // red
  ];

  const fraudBreakdown = stats.fraud.statusBreakdown || {};
  const approvedCount = fraudBreakdown.LOW || 0;
  const flaggedCount = (fraudBreakdown.HIGH || 0) + (fraudBreakdown.CRITICAL || 0) + (fraudBreakdown.MEDIUM || 0);

  // Pie chart data
  const claimStatusData = [
    { name: 'Approved', value: approvedCount, color: '#0D7A3A' },
    { name: 'Review / Flagged', value: flaggedCount, color: '#DC2626' },
  ];

  const totalClaimsCount = approvedCount + flaggedCount; // Approximating total claims process
  
  // Risk intelligence
  const lowRiskPct = ((approvedCount / stats.totalFarms) * 100).toFixed(1);
  const highRiskPct = ((flaggedCount / stats.totalFarms) * 100).toFixed(1);
  const riskIntelligenceData = [
    { name: 'Low Risk', value: parseFloat(lowRiskPct), color: '#0D7A3A' },
    { name: 'High Risk', value: parseFloat(highRiskPct), color: '#DC2626' },
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-bold text-primary tracking-widest uppercase mb-1">System Overview</p>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Precision Dashboard</h1>
        </div>
        <div className="flex items-center gap-2 bg-green-50 text-primary px-3 py-1.5 rounded-full text-xs font-semibold">
          <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
          Live Satellite Link: Stable
        </div>
      </div>

      {/* Top Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <StatCard icon={Tractor} iconColor="text-primary" label="Total Farms" value={stats.totalFarms} onClick={() => navigate('/farms')} />
        <StatCard icon={FileText} iconColor="text-blue-600" label="Total Claims" value={totalClaimsCount > 0 ? totalClaimsCount : stats.totalFarms} onClick={() => navigate('/claims')} />
        <StatCard icon={CheckCircle} iconColor="text-primary" label="Approved" value={approvedCount} onClick={() => navigate('/claims?status=Approved')} />
        <StatCard icon={AlertTriangle} iconColor="text-danger" label="Flagged" value={flaggedCount} onClick={() => navigate('/claims?status=Flagged')} />
        <StatCard icon={Banknote} iconColor="text-primary" label="Total Payout" value={formatCurrency(stats.totalClaimAmount)} onClick={() => navigate('/analytics/financial')} />
        <StatCard icon={BarChart2} iconColor="text-purple-600" label="Avg Damage" value={`${stats.damage.average.toFixed(1)}%`} onClick={() => navigate('/analytics/damage')} />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Damage Distribution Bar Chart */}
        <Card className="lg:col-span-2 p-8 shadow-sm">
          <div className="flex justify-between items-start mb-8">
            <div>
              <h3 className="text-xl font-extrabold text-slate-900 tracking-tight">Damage Distribution</h3>
              <p className="text-sm font-medium text-slate-500 mt-1">Spatially verified crop loss intensity levels</p>
            </div>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={damageData} barSize={48} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{fill: '#1e293b', fontSize: 13, fontWeight: 700}} 
                  dy={12} 
                />
                <Tooltip 
                  cursor={{fill: '#f1f5f9'}} 
                  contentStyle={{ 
                    borderRadius: '8px', 
                    border: '1px solid #e2e8f0', 
                    boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
                    fontWeight: 'bold',
                    padding: '8px 12px'
                  }} 
                />
                <Bar 
                  dataKey="count" 
                  radius={[6, 6, 0, 0]} 
                  isAnimationActive={true}
                  animationDuration={1500}
                >
                  {damageData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} style={{ filter: 'drop-shadow(0px 2px 3px rgba(0,0,0,0.15))' }} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Donuts Column */}
        <div className="space-y-6">
          <Card className="p-8 pb-10">
            <h3 className="text-sm font-bold text-slate-800 mb-6">Claim Status Distribution</h3>
            <div className="flex items-center justify-center relative h-40">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={claimStatusData}
                    innerRadius={50}
                    outerRadius={70}
                    paddingAngle={2}
                    dataKey="value"
                    stroke="none"
                  >
                    {claimStatusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-2xl font-bold text-slate-800">{stats.totalFarms}</span>
                <span className="text-[10px] font-bold text-slate-400 tracking-wider">CLAIMS</span>
              </div>
            </div>
            <div className="mt-4 space-y-2">
              {claimStatusData.map(item => (
                <div key={item.name} className="flex items-center text-sm">
                  <div className="w-2.5 h-2.5 rounded-full mr-2" style={{ backgroundColor: item.color }} />
                  <span className="text-slate-600 font-medium">{item.name} ({item.value})</span>
                </div>
              ))}
            </div>
          </Card>

          <Card className="p-8 pb-10">
            <h3 className="text-sm font-bold text-slate-800 mb-6">Risk Intelligence Analysis</h3>
            <div className="flex items-center justify-center relative h-40">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={riskIntelligenceData}
                    innerRadius={55}
                    outerRadius={75}
                    paddingAngle={0}
                    startAngle={90}
                    endAngle={450}
                    dataKey="value"
                    stroke="none"
                  >
                    <Cell fill="#0D7A3A" />
                    <Cell fill="#DC2626" />
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center">
                  <CheckCircle className="w-4 h-4 text-primary" />
                </div>
              </div>
            </div>
            <div className="mt-4 space-y-3">
              <div className="flex justify-between items-center text-sm">
                <div>
                  <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Low Risk</p>
                  <p className="text-primary font-bold">{lowRiskPct}% Reliable</p>
                </div>
              </div>
              <div className="flex justify-between items-center text-sm">
                <div>
                  <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">High Risk</p>
                  <p className="text-danger font-bold">{highRiskPct}% Flagged</p>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Advanced Analytics */}
      <h2 className="text-xl font-extrabold text-slate-800 tracking-tight mt-10 mb-6">Advanced Analytics</h2>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
         <Card className="p-8">
            <h3 className="text-sm font-bold text-slate-800 mb-6">Regional Damage Overview</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={regionalData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" fontSize={10} tickLine={false} axisLine={false} />
                  <YAxis fontSize={10} tickLine={false} axisLine={false} />
                  <Tooltip cursor={{fill: '#f8fafc'}} contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
                  <Bar dataKey="avgDamage" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
         </Card>
         
         <Card className="p-8">
            <h3 className="text-sm font-bold text-slate-800 mb-6">Global Damage Occurrence Trend</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={timelineData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" fontSize={10} tickLine={false} axisLine={false} />
                  <YAxis fontSize={10} tickLine={false} axisLine={false} />
                  <Tooltip contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
                  <Line type="monotone" dataKey="damage" stroke="#f43f5e" strokeWidth={3} dot={{r: 2, fill: '#f43f5e'}} activeDot={{r: 6}} />
                </LineChart>
              </ResponsiveContainer>
            </div>
         </Card>
      </div>

          {/* Live Claim Registry */}
      <h2 className="text-xl font-extrabold text-slate-800 tracking-tight mt-12 mb-6 flex items-center gap-2">
        <Activity className="w-5 h-5 text-primary" />
        Live Claim Submissions
      </h2>
      <Card className="p-0 overflow-hidden shadow-sm border-slate-200">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200">
                <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Farmer Name</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Claim ID</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Damage Type</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest text-center">Status</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest text-right">Verification</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {recentClaims.length > 0 ? (
                recentClaims.slice(0, 10).map((claim) => (
                  <tr key={claim.claimId} className="hover:bg-slate-50/50 transition-colors cursor-pointer group" onClick={() => navigate(`/farm/${claim.farmId}`)}>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-bold text-slate-600">
                          {claim.farmerName?.charAt(0) || 'F'}
                        </div>
                        <span className="font-bold text-slate-800 text-sm whitespace-nowrap">{claim.farmerName}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-xs font-mono font-bold text-slate-500 uppercase">{claim.claimId}</td>
                    <td className="px-6 py-4 text-sm text-slate-600">{claim.damageType}</td>
                    <td className="px-6 py-4 text-center">
                      <Badge variant={claim.status === 'Approved' ? 'success' : claim.status === 'Rejected' ? 'danger' : 'warning'} className="text-[9px] px-2 py-0.5 font-bold uppercase tracking-wider">
                        {claim.status}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex flex-col items-end">
                        <span className={`text-[10px] font-bold ${claim.fraudAnalysis?.fraudRisk === 'high' ? 'text-red-500' : 'text-primary'}`}>
                          {claim.ndviAnalysis?.ndviDrop?.toFixed(1)}% LOSS
                        </span>
                        {claim.status === 'Pending' ? (
                          <div className="flex flex-col gap-2 mt-2">
                            <div className="flex items-center gap-1.5">
                              <span className="text-[8px] font-bold text-slate-400 uppercase tracking-tighter">AI SUGGESTS:</span>
                              <Badge variant={claim.explanation?.decision === 'Approved' ? 'success' : claim.explanation?.decision === 'Rejected' ? 'danger' : 'warning'} className="text-[8px] px-1.5 py-0 font-bold uppercase">
                                {claim.explanation?.decision || 'Review'}
                              </Badge>
                            </div>
                            <div className="flex gap-2">
                              <button onClick={(e) => handleClaimStatusUpdate(e, claim.claimId, 'Approved')} className="text-[9px] bg-green-50 text-green-600 hover:bg-green-100 font-bold px-2 py-1 rounded">APPROVE</button>
                              <button onClick={(e) => handleClaimStatusUpdate(e, claim.claimId, 'Rejected')} className="text-[9px] bg-red-50 text-red-600 hover:bg-red-100 font-bold px-2 py-1 rounded">REJECT</button>
                            </div>
                          </div>
                        ) : (
                          <span className="text-[9px] text-slate-400 font-medium">Verified by Satellite</span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="px-6 py-20 text-center text-slate-400 font-medium italic">
                    No claim submissions detected in current session.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Intelligence Logs (Secondary Feed) */}
      <div className="mt-12 flex justify-between items-center mb-6">
        <div>
          <h3 className="text-xl font-extrabold text-slate-800 tracking-tight">System Discovery Logs</h3>
          <p className="text-sm text-slate-500">Global satellite telemetry and farm enrollment feed</p>
        </div>
        <button onClick={() => navigate('/logs')} className="text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-600 px-4 py-2 rounded-full tracking-wider transition-colors">
          VIEW FULL REGISTRY
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pb-12">
        {recentFarms.map((farm, i) => {
          const isDanger = farm.summary.fraudScore > 30 || farm.summary.damagePercentage > 60;
          return (
            <div 
              key={farm.farmId} 
              onClick={() => navigate(`/farm/${farm.farmId}`)} 
              className="flex items-center justify-between p-4 bg-white rounded-xl border border-slate-100 hover:shadow-sm transition-all cursor-pointer group"
            >
              <div className="flex items-center gap-4">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${isDanger ? 'bg-red-50 text-red-500' : 'bg-blue-50 text-blue-500'}`}>
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-800 text-sm">{farm.farmerName}</h4>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{farm.location.state}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-bold text-slate-800 text-xs">{farm.summary.damagePercentage.toFixed(1)}% Damage</p>
                <Badge variant={isDanger ? 'danger' : 'success'} className="text-[8px] px-1.5 py-0">
                  {isDanger ? 'ANOMALY' : 'STABLE'}
                </Badge>
              </div>
            </div>
          );
        })}
      </div>

    </div>
  )
}
