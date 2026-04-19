import React, { useState, useEffect } from 'react'
import { Card } from '../components/ui/Card'
import { Badge } from '../components/ui/Badge'
import { Tractor, FileText, CheckCircle, AlertTriangle, Banknote, BarChart2, Loader2 } from 'lucide-react'
import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import { api } from '../services/api'

function StatCard({ icon: Icon, label, value, iconColor }) {
  return (
    <Card className="flex flex-col p-6 items-start gap-4">
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
  const [stats, setStats] = useState(null);
  const [recentFarms, setRecentFarms] = useState([]);
  const [allFarms, setAllFarms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        // Fetch stats and latest high-risk farms simultaneously
        const [statsData, farmsData, page1, page2] = await Promise.all([
          api.getStats(),
          api.getFarms({ limit: 5, sortBy: 'fraudScore', order: 'desc' }), // Using high risk as recent anomalies
          api.getFarms({ limit: 100, page: 1 }), // Max limit is 100, so we fetch both pages
          api.getFarms({ limit: 100, page: 2 })
        ]);
        
        setStats(statsData);
        setRecentFarms(farmsData.data || []);
        
        // Combine the paginated results for iterative calculation
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
  const fraudBreakdown = stats.fraud.statusBreakdown || {};
  const approvedCount = fraudBreakdown.LOW || 0;
  const flaggedCount = (fraudBreakdown.HIGH || 0) + (fraudBreakdown.CRITICAL || 0) + (fraudBreakdown.MEDIUM || 0);
  
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
        <StatCard icon={Tractor} iconColor="text-primary" label="Total Farms" value={stats.totalFarms} />
        <StatCard icon={FileText} iconColor="text-blue-600" label="Total Claims" value={totalClaimsCount > 0 ? totalClaimsCount : stats.totalFarms} />
        <StatCard icon={CheckCircle} iconColor="text-primary" label="Approved" value={approvedCount} />
        <StatCard icon={AlertTriangle} iconColor="text-danger" label="Flagged" value={flaggedCount} />
        <StatCard icon={Banknote} iconColor="text-primary" label="Total Payout" value={formatCurrency(stats.totalClaimAmount)} />
        <StatCard icon={BarChart2} iconColor="text-purple-600" label="Avg Damage" value={`${stats.damage.average.toFixed(1)}%`} />
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

      {/* Intelligence Logs */}
      <Card className="p-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h3 className="text-lg font-bold text-slate-800">Recent Intelligence Logs</h3>
            <p className="text-sm text-slate-500">Satellite telemetry and claim anomaly detection</p>
          </div>
          <button className="text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-600 px-4 py-2 rounded-full tracking-wider transition-colors">
            VIEW FULL REGISTRY
          </button>
        </div>

        <div className="space-y-4">
          {recentFarms.map((farm, i) => {
            const isDanger = farm.summary.fraudScore > 30 || farm.summary.damagePercentage > 60;
            return (
              <div key={farm.farmId} className="flex items-center justify-between p-4 rounded-xl border border-slate-100 hover:bg-slate-50 transition-colors">
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-lg ${isDanger ? 'bg-teal-800' : 'bg-yellow-600'} overflow-hidden`}>
                    <div className={`w-full h-full opacity-60 bg-[repeating-linear-gradient(${isDanger ? '-45deg' : '45deg'},transparent,transparent_2px,#000_2px,#000_4px)]`}></div>
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-800 text-sm">Field {farm.farmId} - {farm.location.state}</h4>
                    <div className="flex items-center gap-3 mt-1 cursor-default">
                      <Badge variant={isDanger ? 'danger' : 'success'} className="text-[10px] px-2 py-0.5">
                        {isDanger ? 'HIGH RISK' : 'LOW RISK'}
                      </Badge>
                      <span className="text-xs text-slate-500">Claim Value: {formatCurrency(farm.summary.claimAmount)}</span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-slate-800 text-sm">{farm.summary.damagePercentage.toFixed(1)}% Damage Detected</p>
                  <p className="text-xs text-slate-400 mt-1">Recently Analyzed</p>
                </div>
              </div>
            );
          })}
        </div>
      </Card>

    </div>
  )
}
