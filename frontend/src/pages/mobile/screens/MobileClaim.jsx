import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ChevronLeft, ImagePlus, AlertCircle, ShieldAlert, 
  CloudRain, Camera, FileText, CheckCircle2, Loader2,
  AlertTriangle
} from 'lucide-react';
import { useMobile } from '../context/MobileContext';

const MobileClaim = () => {
  const { t, farmerId } = useMobile();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  
  const [data, setData] = useState(null);
  const [damageType, setDamageType] = useState('');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errorVisible, setErrorVisible] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [offlineResult, setOfflineResult] = useState(null);

  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const getOfflineDecision = (type, desc) => {
    const text = `${type} ${desc}`.toLowerCase();
    if (text.includes('severe') || text.includes('destroyed') || text.includes('flood') || text.includes('critical')) {
      return { status: 'Approved', confidence: 'High', reason: 'High severity keywords detected.' };
    } else if (text.includes('moderate') || text.includes('drought') || text.includes('medium') || text.includes('partial')) {
      return { status: 'Review', confidence: 'Medium', reason: 'Requires manual verification.' };
    }
    return { status: 'Rejected', confidence: 'Low', reason: 'Damage does not meet minimum severity.' };
  };

  useEffect(() => {
    const fetchFarmer = async () => {
      try {
        const res = await fetch(`/api/v1/mobile/farmer/${farmerId}`);
        const json = await res.json();
        setData(json.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchFarmer();
  }, [farmerId]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorVisible(null);
    if (!damageType) return setErrorVisible(t('error_damage_type'));

    setSubmitting(true);
    try {
      let imageUrls = ["https://images.unsplash.com/photo-1583245553131-0e7d36409271"]; 
      const farmId = data?.linkedFarmIds?.[0] || 'NEW-REG';

      if (!navigator.onLine) {
        const decision = getOfflineDecision(damageType, description);
        const newClaim = {
          claimId: 'OFF-' + Math.floor(10000 + Math.random() * 90000),
          farmerId,
          farmId,
          damageType,
          description,
          claimAmount: 0,
          createdAt: new Date().toISOString(),
          status: decision.status,
          isOffline: true,
          offlineReason: decision.reason
        };

        const existingClaims = JSON.parse(localStorage.getItem(`offline_claims_${farmerId}`) || '[]');
        existingClaims.push(newClaim);
        localStorage.setItem(`offline_claims_${farmerId}`, JSON.stringify(existingClaims));
        
        setOfflineResult(newClaim);
        setSubmitting(false);
        return;
      }

      const payload = {
        farmerId,
        farmId,
        damageType,
        description,
        images: imageUrls
      };

      const res = await fetch('/api/v1/mobile/claim', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const json = await res.json();
      
      if (!res.ok) throw new Error(json.error || json.message || 'Failed to submit claim');
      
      navigate('/mobile/status');
    } catch (err) {
      console.error(err);
      setErrorVisible(err.message || 'Failed to submit claim.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="w-full min-h-screen bg-gray-50 text-gray-900 font-sans pb-24 overflow-x-hidden">
      
      {/* Header */}
      <div className="bg-white pt-10 px-6 pb-6 border-b border-gray-100">
        <div className="flex items-center gap-4 mb-1">
          <button onClick={() => navigate(-1)} className="p-2 -ml-2 rounded-full hover:bg-gray-100 transition-colors">
            <ChevronLeft size={24} />
          </button>
          <h2 className="text-sm font-bold text-green-600 tracking-widest uppercase">
            {t('file_crop_claim')}
          </h2>
        </div>
        <p className="text-xs text-gray-500">
          {t('file_claim_desc')}
        </p>
      </div>

      <div className="px-6 space-y-6 pt-6">
        
        {isOffline && (
          <div className="bg-orange-50 border border-orange-100 rounded-[24px] p-5 flex gap-4 items-start relative overflow-hidden">
            <div className="w-10 h-10 rounded-2xl bg-orange-500 flex items-center justify-center shrink-0 shadow-lg shadow-orange-100">
              <ShieldAlert className="text-white" size={20} />
            </div>
            <div className="flex-1">
              <h3 className="text-[11px] font-bold text-orange-800 uppercase tracking-[0.2em] mb-1">{t('offline_mode_active')}</h3>
              <p className="text-[10px] text-orange-700 font-medium leading-relaxed">
                {t('offline_mode_desc')}
              </p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Damage Type */}
          <div className="space-y-3">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">{t('damage_type')}</label>
            <input 
              type="text" 
              placeholder={t('damage_placeholder')}
              className="w-full bg-white border border-gray-200 rounded-2xl py-4 px-5 text-sm font-bold text-gray-900 outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500 transition-all shadow-sm"
              value={damageType}
              onChange={(e) => setDamageType(e.target.value)}
            />
          </div>

          {/* Description */}
          <div className="space-y-3">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">{t('description_optional')}</label>
            <textarea 
              placeholder={t('desc_placeholder')}
              rows="4"
              className="w-full bg-white border border-gray-200 rounded-2xl py-4 px-5 text-sm font-bold text-gray-900 outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500 transition-all resize-none shadow-sm"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          {/* Evidence Upload */}
          <div className="space-y-3">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">{t('upload_evidence')}</label>
            <div 
              className={`w-full aspect-video rounded-[28px] border-2 border-dashed transition-all flex flex-col items-center justify-center group cursor-pointer relative overflow-hidden ${
                previewUrl ? 'border-green-500 bg-green-50' : 'border-gray-200 bg-white hover:border-gray-300'
              }`}
              onClick={() => fileInputRef.current?.click()}
            >
              {previewUrl ? (
                <div className="w-full h-full relative">
                  <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <span className="text-xs font-bold text-white tracking-widest uppercase">{t('click_to_upload')}</span>
                  </div>
                </div>
              ) : (
                <>
                  <div className="w-16 h-16 bg-gray-50 rounded-3xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300 border border-gray-100">
                    <Camera className="text-gray-400 group-hover:text-green-600" size={32} />
                  </div>
                  <span className="text-[10px] font-bold text-gray-900 uppercase tracking-[0.2em] mb-1">{t('tap_to_upload')}</span>
                  <span className="text-[9px] text-gray-400 font-medium uppercase tracking-widest">{t('upload_limits')}</span>
                </>
              )}
              <input 
                type="file" 
                ref={fileInputRef} 
                className="hidden" 
                accept="image/*"
                onChange={handleFileChange}
              />
            </div>
          </div>

          {errorVisible && (
            <div className="p-4 bg-red-50 border border-red-100 rounded-2xl flex gap-3 items-center">
              <AlertTriangle className="text-red-500 shrink-0" size={18} />
              <p className="text-[10px] font-bold text-red-600 uppercase tracking-wide">{errorVisible}</p>
            </div>
          )}

          <div className="pt-4">
            <button 
              type="submit"
              disabled={submitting}
              className="w-full bg-green-600 hover:bg-green-500 text-white py-4 rounded-[20px] font-bold text-xs tracking-[0.2em] uppercase transition-all shadow-xl shadow-green-100 active:scale-95 flex items-center justify-center gap-3"
            >
              {submitting ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  {t('submitting')}
                </>
              ) : (
                <>
                  <FileText size={18} />
                  {t('submit_claim')}
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Offline Decision Modal */}
      {offlineResult && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-6 z-50 animate-in fade-in duration-300">
          <div className="w-full max-w-sm bg-white rounded-[40px] p-8 shadow-2xl relative overflow-hidden border border-gray-100">
            <div className={`w-16 h-16 rounded-3xl flex items-center justify-center mb-6 mx-auto ${
              offlineResult.status === 'Approved' ? 'bg-green-100 text-green-600' :
              offlineResult.status === 'Review' ? 'bg-yellow-100 text-yellow-600' :
              'bg-red-100 text-red-600'
            }`}>
              <CheckCircle2 size={32} />
            </div>

            <h2 className="text-xl font-bold text-gray-900 text-center mb-2">{t('instant_decision')}</h2>
            <p className="text-xs text-gray-500 text-center mb-8 uppercase tracking-widest">{t('offline_estimate')}</p>

            <div className="space-y-4 mb-10">
              <div className="bg-gray-50 border border-gray-100 rounded-3xl p-5 flex flex-col items-center">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">{t('estimated_status')}</span>
                <span className={`text-2xl font-black uppercase tracking-tighter ${
                  offlineResult.status === 'Approved' ? 'text-green-600' :
                  offlineResult.status === 'Review' ? 'text-yellow-600' :
                  'text-red-600'
                }`}>{offlineResult.status}</span>
              </div>
            </div>

            <div className="space-y-3">
              <button
                onClick={() => navigate('/mobile/status')}
                className="w-full bg-green-600 hover:bg-green-500 text-white py-4 rounded-2xl font-bold text-[10px] tracking-widest uppercase transition-all"
              >
                {t('go_to_claims')}
              </button>
              <button
                onClick={() => setOfflineResult(null)}
                className="w-full bg-gray-100 hover:bg-gray-200 text-gray-600 py-4 rounded-2xl font-bold text-[10px] tracking-widest uppercase transition-all"
              >
                {t('close')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MobileClaim;
