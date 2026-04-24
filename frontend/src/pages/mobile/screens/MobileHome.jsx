import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, Activity, LayoutGrid, CloudRain, ChevronRight, Sparkles, TrendingUp, ShieldCheck, Camera, Loader2 } from 'lucide-react';
import { useMobile } from '../context/MobileContext';

const MobileHome = () => {
  const { t, farmerId } = useMobile();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // AI Crop Advisor State
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);

  const fetchFarmerData = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/v1/mobile/farmer/${farmerId}`);
      const json = await res.json();
      if (!res.ok) throw new Error(json.message);
      setData(json.data);
      setError(null);
    } catch (err) {
      console.log('Error fetching farmer data:', err);
      setError(t('error'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFarmerData();
  }, []);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAnalyze = async () => {
    if (!selectedImage) return;
    try {
      setAnalyzing(true);
      const formData = new FormData();
      formData.append('image', selectedImage);

      const res = await fetch('/api/analyze-crop', {
        method: 'POST',
        body: formData,
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message);
      setAnalysisResult(json.data);
    } catch (err) {
      console.error('Analysis failed:', err);
      alert('Failed to analyze crop image');
    } finally {
      setAnalyzing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex w-full h-full items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-10 w-10 border-b-4 border-green-600"></div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex flex-col w-full h-full items-center justify-center p-6 bg-gray-50">
        <p className="text-red-500 mb-4 text-center">{error || t('no_data')}</p>
        <button onClick={fetchFarmerData} className="px-6 py-3 bg-green-600 font-medium text-white rounded-2xl shadow-lg hover:bg-green-700 active:scale-95 transition-all">
          Retry
        </button>
      </div>
    );
  }

  const primaryFarm = data.farms && data.farms.length > 0 ? data.farms[0] : null;
  const latestClaim = data.activeClaims && data.activeClaims.length > 0 ? data.activeClaims[0] : null;

  return (
    <div className="w-full min-h-full bg-gradient-to-br from-green-50/50 via-gray-50 to-gray-100 p-4 pb-28 font-sans">
      
      {/* Header Section */}
      <div className="mb-6 mt-4 flex justify-between items-center px-1">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight leading-tight">
            Good Morning, {data.name?.split(' ')[0]} 👋
          </h1>
          <p className="text-gray-500 text-xs mt-1 font-medium">Your farm intelligence overview</p>
        </div>
        <div className="w-11 h-11 bg-white rounded-full shadow-sm flex items-center justify-center border border-gray-100 shrink-0">
          <span className="text-green-600 font-bold text-lg">{data.name?.charAt(0) || 'F'}</span>
        </div>
      </div>

      <div className="space-y-6">
        
        {/* Card 1: Farm Summary (Glass Card) */}
        {primaryFarm && (
          <div className="relative overflow-hidden bg-white/80 backdrop-blur-xl rounded-[16px] p-5 shadow-[0_4px_15px_rgb(0,0,0,0.03)] border border-white transition-all hover:shadow-[0_8px_20px_rgb(0,0,0,0.06)]">
            <div className="absolute -right-8 -top-8 w-28 h-28 bg-green-400/10 rounded-full blur-2xl"></div>
            
            <div className="flex justify-between items-center mb-5 relative z-10">
              <div>
                <h2 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">{t('farm_summary') || 'Farm Summary'}</h2>
                <h3 className="text-lg font-black text-gray-800 leading-none">{primaryFarm.cropType}</h3>
              </div>
              <div className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-widest
                  ${primaryFarm.riskLevel === 'low' ? 'bg-green-50 text-green-700 border border-green-100' :
                    primaryFarm.riskLevel === 'high' || primaryFarm.riskLevel === 'critical' ? 'bg-red-50 text-red-700 border border-red-100' :
                    'bg-yellow-50 text-yellow-700 border border-yellow-100'}`}>
                  {primaryFarm.riskLevel} Health
              </div>
            </div>

            <div className="flex justify-between items-center mb-6 relative z-10">
              <div className="flex-1">
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-0.5">Location</p>
                <p className="text-sm text-gray-800 font-bold">{primaryFarm.location.district}</p>
              </div>
              <div className="w-px h-8 bg-gray-100 mx-4"></div>
              <div className="flex-1">
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-0.5">Area</p>
                <p className="text-sm text-gray-800 font-bold">{primaryFarm.areaAcres} Acres</p>
              </div>
            </div>

            {/* NDVI Progress Bar */}
            <div className="relative z-10 bg-gray-50/50 p-3 rounded-xl border border-gray-100">
              <div className="flex justify-between items-end mb-2">
                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">NDVI Status</span>
                <span className="text-xs font-black text-green-600 leading-none">0.72 (Good)</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-1.5 overflow-hidden">
                <div className="bg-gradient-to-r from-green-400 to-green-600 h-1.5 rounded-full w-[72%]"></div>
              </div>
            </div>
          </div>
        )}

        {/* Card 2: Latest Claim */}
        {latestClaim && (
          <div 
            onClick={() => navigate(`/mobile/details/${latestClaim.id}`)}
            className="bg-white rounded-[16px] p-4 shadow-[0_4px_15px_rgb(0,0,0,0.03)] border border-gray-100 flex items-center justify-between active:scale-[0.98] transition-transform cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center shrink-0">
                <Activity className="text-orange-500" size={20} />
              </div>
              <div className="flex flex-col justify-center">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-sm font-bold text-gray-800 leading-none">Claim #{latestClaim.claimId}</h3>
                  <span className="text-[9px] font-black px-1.5 py-0.5 bg-yellow-50 border border-yellow-100 text-yellow-700 rounded uppercase tracking-wider leading-none">
                    {latestClaim.status}
                  </span>
                </div>
                <p className="text-xs text-gray-500 font-medium leading-none">{latestClaim.damagePercentage}% Damage</p>
              </div>
            </div>
            <div className="w-8 h-8 flex items-center justify-center text-gray-300">
              <ChevronRight size={20} />
            </div>
          </div>
        )}

        {/* Card: AI Crop Advisor */}
        <div className="bg-white rounded-[16px] p-5 shadow-[0_4px_15px_rgb(0,0,0,0.03)] border border-gray-100">
          <div className="flex items-center gap-2 mb-1">
            <Sparkles className="text-green-600" size={16} />
            <h2 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">AI Crop Advisor</h2>
          </div>
          <h3 className="text-sm font-black text-gray-800 mb-4">Upload crop image for smart suggestions</h3>

          {!analysisResult ? (
            <div className="space-y-4">
              {/* Image Preview / Placeholder */}
              <div 
                onClick={() => document.getElementById('crop-upload').click()}
                className="w-full aspect-video bg-gray-50 border-2 border-dashed border-gray-200 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:bg-gray-100 transition-colors relative overflow-hidden"
              >
                {imagePreview ? (
                  <img src={imagePreview} alt="Crop" className="w-full h-full object-cover" />
                ) : (
                  <>
                    <Camera className="text-gray-400 mb-2" size={32} />
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Tap to upload</p>
                  </>
                )}
                <input 
                  id="crop-upload"
                  type="file" 
                  accept="image/*" 
                  className="hidden" 
                  onChange={handleImageChange}
                />
              </div>

              {selectedImage && (
                <button 
                  onClick={handleAnalyze}
                  disabled={analyzing}
                  className="w-full py-3 bg-green-600 text-white text-xs font-black uppercase tracking-widest rounded-xl shadow-md flex items-center justify-center gap-2 active:scale-95 transition-all disabled:opacity-50 disabled:active:scale-100"
                >
                  {analyzing ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    'Analyze Crop'
                  )}
                </button>
              )}
            </div>
          ) : (
            /* Result UI */
            <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-500">
              <div className={`p-4 rounded-xl border ${
                analysisResult.severity === 'Green' ? 'bg-green-50 border-green-100' :
                analysisResult.severity === 'Yellow' ? 'bg-yellow-50 border-yellow-100' :
                'bg-red-50 border-red-100'
              }`}>
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-0.5">Detected Condition</p>
                    <p className={`text-lg font-black leading-none ${
                      analysisResult.severity === 'Green' ? 'text-green-700' :
                      analysisResult.severity === 'Yellow' ? 'text-yellow-700' :
                      'text-red-700'
                    }`}>
                      {analysisResult.disease}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-0.5">Confidence</p>
                    <p className="text-sm font-black text-gray-800">{analysisResult.confidence}</p>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-3">Expert Suggestions</p>
                <ul className="space-y-2">
                  {analysisResult.suggestions.map((s, i) => (
                    <li key={i} className="flex items-start gap-2 text-xs text-gray-700 font-medium">
                      <div className="w-1.5 h-1.5 rounded-full bg-green-500 mt-1.5 shrink-0" />
                      {s}
                    </li>
                  ))}
                </ul>
              </div>

              <button 
                onClick={() => {
                  setAnalysisResult(null);
                  setSelectedImage(null);
                  setImagePreview(null);
                }}
                className="w-full py-2.5 text-xs font-bold text-gray-500 uppercase tracking-widest border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
              >
                Reset
              </button>
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-4">
          <button onClick={() => navigate('/mobile/claim')} className="bg-white p-4 rounded-[16px] shadow-[0_4px_15px_rgb(0,0,0,0.02)] border border-gray-100 flex flex-col items-center justify-center gap-2 active:scale-95 transition-transform">
            <div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center">
              <FileText className="text-green-600" size={20} />
            </div>
            <span className="text-xs font-bold text-gray-800">File Claim</span>
          </button>
          
          <button onClick={() => {
            const weatherLoc = primaryFarm?.location?.district || primaryFarm?.location?.state || 'Pune';
            const farmId = primaryFarm?.farmId;
            navigate(`/mobile/weather/${weatherLoc}${farmId ? `?farmId=${farmId}` : ''}`);
          }} className="bg-white p-4 rounded-[16px] shadow-[0_4px_15px_rgb(0,0,0,0.02)] border border-gray-100 flex flex-col items-center justify-center gap-2 active:scale-95 transition-transform">
            <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center">
              <CloudRain className="text-blue-500" size={20} />
            </div>
            <span className="text-xs font-bold text-gray-800">Weather</span>
          </button>
        </div>

        {/* Card 3: AI Insights */}
        <div className="bg-gradient-to-br from-indigo-50/80 to-blue-50/80 rounded-[16px] p-5 border border-indigo-100/50 shadow-[0_4px_15px_rgb(0,0,0,0.02)]">
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="text-indigo-500" size={16} />
            <h3 className="text-xs font-bold text-indigo-900 uppercase tracking-widest">AI Insights</h3>
          </div>
          <ul className="space-y-4">
            <li className="flex items-start gap-3 bg-white/60 p-3 rounded-xl">
              <div className="mt-0.5 shrink-0"><TrendingUp className="text-green-500" size={16} /></div>
              <p className="text-xs text-indigo-900 font-medium leading-relaxed">Vegetation index is stable. Crop growth is currently on track.</p>
            </li>
            <li className="flex items-start gap-3 bg-white/60 p-3 rounded-xl">
              <div className="mt-0.5 shrink-0"><ShieldCheck className="text-purple-500" size={16} /></div>
              <p className="text-xs text-indigo-900 font-medium leading-relaxed">Risk profile remains low. No fraud or weather anomalies detected.</p>
            </li>
          </ul>
        </div>
        
      </div>
    </div>
  );
};

export default MobileHome;
