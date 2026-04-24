import React, { useEffect, useState, useRef } from 'react';
import { 
  Tractor, CloudRain, ShieldCheck, 
  ChevronRight, Camera, ArrowRight, Loader2,
  CheckCircle2, AlertCircle, Info, Sparkles,
  Search, Bell, User, MapPin, TrendingUp
} from 'lucide-react';
import { useMobile } from '../context/MobileContext';
import { useNavigate } from 'react-router-dom';

const MobileHome = () => {
  const { t, farmerId, farmerName } = useMobile();
  const navigate = useNavigate();
  
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    const fetchHome = async () => {
      try {
        const res = await fetch(`/api/v1/mobile/home/${farmerId}`);
        const json = await res.json();
        setData(json.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchHome();
  }, [farmerId]);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      simulateAnalysis();
    }
  };

  const simulateAnalysis = () => {
    setIsAnalyzing(true);
    setAnalysisResult(null);
    setTimeout(() => {
      setIsAnalyzing(false);
      setAnalysisResult({
        condition: 'Healthy Rice Crop',
        confidence: '94.2%',
        recommendation: 'Crop health is optimal. No immediate pesticide required. Maintain current irrigation levels.'
      });
    }, 2500);
  };

  if (loading) {
    return (
      <div className="flex w-full min-h-screen items-center justify-center bg-gray-50">
        <Loader2 className="animate-spin text-green-600" size={32} />
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-gray-50 text-gray-900 font-sans pb-24 overflow-x-hidden">
      
      {/* Top Header */}
      <div className="bg-white px-6 pt-12 pb-6 flex justify-between items-center border-b border-gray-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center text-green-600 border border-green-100">
            <User size={20} />
          </div>
          <div>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none mb-1">{t('good_morning')}</p>
            <h1 className="text-sm font-black text-gray-900 uppercase tracking-tight">{farmerName || 'Farmer'}</h1>
          </div>
        </div>
        <div className="flex gap-2">
          <button onClick={() => navigate('/mobile/notifications')} className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-gray-600 hover:bg-gray-100 transition-colors relative">
            <Bell size={18} />
            <div className="absolute top-2.5 right-2.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white" />
          </button>
          <button onClick={() => navigate('/mobile/settings')} className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-gray-600 hover:bg-gray-100 transition-colors">
            <Search size={18} />
          </button>
        </div>
      </div>

      <div className="px-6 space-y-6 pt-6">
        
        {/* Farm Intelligence Card */}
        <div 
          className="w-full bg-white rounded-[32px] p-6 shadow-sm border border-gray-100 overflow-hidden relative"
        >
          <div className="flex justify-between items-start mb-6">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                <span className="text-[9px] font-bold text-green-600 uppercase tracking-[0.2em]">{t('live')}</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 uppercase tracking-tight">{t('farm_intelligence')}</h3>
            </div>
            <div className="bg-green-50 px-3 py-1 rounded-full border border-green-100">
              <span className="text-[10px] font-bold text-green-600 uppercase tracking-widest">{t('good')}</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
              <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-1">{t('health')}</p>
              <p className="text-lg font-bold text-gray-900">84%</p>
            </div>
            <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
              <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-1">{t('ndvi_status')}</p>
              <p className="text-lg font-bold text-gray-900">0.72</p>
            </div>
          </div>
        </div>

        {/* Quick Actions Grid */}
        <div className="grid grid-cols-2 gap-4">
          <button 
            onClick={() => navigate('/mobile/claim')}
            className="bg-green-600 p-5 rounded-[32px] text-left group active:scale-95 transition-all shadow-lg shadow-green-100"
          >
            <div className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center text-white mb-4">
              <ShieldCheck size={20} />
            </div>
            <h4 className="text-white font-bold text-sm uppercase tracking-tight mb-1">{t('file_claim')}</h4>
            <p className="text-white/60 text-[9px] font-bold uppercase tracking-widest">{t('status')}: {t('pending')}</p>
          </button>

          <button 
            onClick={() => navigate('/mobile/weather')}
            className="bg-white p-5 rounded-[32px] text-left border border-gray-100 shadow-sm group active:scale-95 transition-all"
          >
            <div className="w-10 h-10 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600 mb-4">
              <CloudRain size={20} />
            </div>
            <h4 className="text-gray-900 font-bold text-sm uppercase tracking-tight mb-1">{t('weather')}</h4>
            <p className="text-gray-400 text-[9px] font-bold uppercase tracking-widest">28°C • {t('mostly_cloudy')}</p>
          </button>
        </div>

        {/* AI Crop Advisor Section */}
        <div className="bg-white rounded-[32px] p-6 border border-gray-100 shadow-sm overflow-hidden">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600 border border-indigo-100">
              <Sparkles size={20} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-gray-900 uppercase tracking-tight">{t('ai_crop_advisor')}</h3>
              <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">{t('upload_crop_image')}</p>
            </div>
          </div>

          {!analysisResult ? (
            <div 
              onClick={() => fileInputRef.current.click()}
              className="w-full py-10 bg-gray-50 border-2 border-dashed border-gray-200 rounded-[24px] flex flex-col items-center justify-center group cursor-pointer hover:border-indigo-400 transition-colors"
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="text-indigo-600 animate-spin mb-3" size={32} />
                  <p className="text-xs font-bold text-indigo-600 uppercase tracking-widest animate-pulse">{t('analyzing')}</p>
                </>
              ) : (
                <>
                  <div className="w-14 h-14 bg-white rounded-full flex items-center justify-center shadow-sm mb-4 group-hover:scale-110 transition-transform">
                    <Camera className="text-gray-400" size={24} />
                  </div>
                  <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">{t('tap_to_upload')}</p>
                </>
              )}
              <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleImageUpload} />
            </div>
          ) : (
            <div className="space-y-4 animate-in fade-in slide-in-from-top-4 duration-500">
              <div className="bg-green-50 p-4 rounded-2xl border border-green-100">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-bold text-green-600 uppercase tracking-widest">{t('detected_condition')}</span>
                  <span className="text-[10px] font-bold text-green-600 uppercase tracking-widest">{analysisResult.confidence} {t('confidence')}</span>
                </div>
                <p className="text-sm font-bold text-gray-900">{analysisResult.condition}</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
                <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-2">{t('expert_suggestions')}</p>
                <p className="text-xs text-gray-600 leading-relaxed font-medium">{analysisResult.recommendation}</p>
              </div>
              <button 
                onClick={() => setAnalysisResult(null)}
                className="w-full py-3 bg-white border border-gray-200 rounded-xl text-[10px] font-bold uppercase tracking-widest text-gray-500 hover:bg-gray-50 transition-colors"
              >
                {t('reset')}
              </button>
            </div>
          )}
        </div>

        {/* Latest Claim Banner */}
        {data?.claims?.[0] && (
          <div 
            onClick={() => navigate('/mobile/status')}
            className="w-full bg-gray-900 p-6 rounded-[32px] flex items-center justify-between group active:scale-95 transition-all shadow-xl shadow-gray-200"
          >
            <div>
              <p className="text-[9px] font-bold text-green-400 uppercase tracking-[0.2em] mb-1">{t('latest_claim_status')}</p>
              <h4 className="text-white font-bold text-sm tracking-tight">{t('claim_number')} {data.claims[0].claimId}</h4>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold text-white uppercase tracking-widest">{t('view_status')}</span>
              <div className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center text-white group-hover:translate-x-1 transition-transform">
                <ArrowRight size={16} />
              </div>
            </div>
          </div>
        )}

      </div>

      {/* Navigation Padding */}
      <div className="h-20" />
    </div>
  );
};

export default MobileHome;
