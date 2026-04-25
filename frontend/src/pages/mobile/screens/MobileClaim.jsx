import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ChevronLeft, ImagePlus, AlertCircle, ShieldAlert, 
  CloudRain, Camera, FileText, CheckCircle2, Loader2,
  AlertTriangle, Lightbulb, X, Plus
} from 'lucide-react';
import { useMobile } from '../context/MobileContext';
import SmartVoiceInput from '../../../components/voice/SmartVoiceInput';

const MobileClaim = () => {
  const { t, farmerId } = useMobile();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  
  const [data, setData] = useState(null);
  const [damageType, setDamageType] = useState('');
  const [description, setDescription] = useState('');
  const [advisoryReport, setAdvisoryReport] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [errorVisible, setErrorVisible] = useState(null);
  const [uploadedImages, setUploadedImages] = useState([]); // Array of { id, file, preview }
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
    const files = Array.from(e.target.files);
    if (files.length > 0) {
      const newImages = files.map(file => ({
        id: Math.random().toString(36).substr(2, 9),
        file,
        preview: URL.createObjectURL(file)
      }));
      setUploadedImages(prev => [...prev, ...newImages].slice(0, 5)); // Max 5 images
    }
    // Reset input so same file can be uploaded again if deleted
    e.target.value = '';
  };

  const removeImage = (id) => {
    setUploadedImages(prev => {
      const filtered = prev.filter(img => img.id !== id);
      // Clean up object URL
      const removed = prev.find(img => img.id === id);
      if (removed) URL.revokeObjectURL(removed.preview);
      return filtered;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorVisible(null);

    if (!damageType) return setErrorVisible(t('error_damage_type'));
    if (uploadedImages.length === 0) return setErrorVisible(t('error_image_required') || 'Please upload at least one image');

    setSubmitting(true);
    try {
      // In a real app, we would upload these files to S3/Cloudinary and get URLs
      // For this demo, we simulate image URLs
      const imageUrls = uploadedImages.map((img, idx) => `https://images.unsplash.com/photo-1583245553131-0e7d36409271?idx=${idx}`); 
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
          images: imageUrls,
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
            <SmartVoiceInput 
              onResult={(text, analysis) => {
                setDescription((prev) => prev ? prev + ' ' + text : text);
                if (analysis) setAdvisoryReport(analysis);
              }}
            />
            <textarea 
              placeholder={t('desc_placeholder')}
              rows="4"
              className="w-full bg-white border border-gray-200 rounded-2xl py-4 px-5 text-sm font-bold text-gray-900 outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500 transition-all resize-none shadow-sm"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
            {advisoryReport && (
              <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 mt-2 animate-in fade-in zoom-in duration-300 shadow-sm">
                <div className="flex items-center gap-2 mb-2">
                  <Lightbulb className="w-4 h-4 text-blue-600" />
                  <span className="text-[10px] font-bold text-blue-800 uppercase tracking-widest">Smart Advisory</span>
                </div>
                <div className="text-xs text-blue-900 space-y-1">
                  <p><span className="font-bold">Core Issue:</span> {advisoryReport.problem}</p>
                  <div className="mt-2 text-blue-800 font-medium">
                    <p className="mb-1 text-[10px] uppercase font-bold tracking-wider text-blue-600">Suggested Action Plan:</p>
                    <ul className="list-disc pl-4 space-y-1">
                      {advisoryReport.solution.map((sol, idx) => (
                        <li key={idx}>{sol}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Evidence Upload */}
          <div className="space-y-3">
            <div className="flex justify-between items-center px-1">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{t('upload_evidence')}</label>
              <span className={`text-[9px] font-bold uppercase tracking-widest ${uploadedImages.length > 0 ? 'text-green-600' : 'text-red-500'}`}>
                {uploadedImages.length}/5 {t('images')}
              </span>
            </div>

            {/* Image Preview Grid */}
            {uploadedImages.length > 0 && (
              <div className="grid grid-cols-3 gap-3 mb-4">
                {uploadedImages.map((img) => (
                  <div key={img.id} className="relative aspect-square rounded-2xl overflow-hidden border border-gray-100 shadow-sm group">
                    <img src={img.preview} alt="Evidence" className="w-full h-full object-cover" />
                    <button 
                      type="button"
                      onClick={() => removeImage(img.id)}
                      className="absolute top-1 right-1 w-6 h-6 bg-black/60 backdrop-blur-md rounded-full flex items-center justify-center text-white border border-white/20 active:scale-90 transition-all"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))}
                {uploadedImages.length < 5 && (
                  <div 
                    onClick={() => fileInputRef.current?.click()}
                    className="aspect-square rounded-2xl border-2 border-dashed border-gray-200 bg-white flex flex-col items-center justify-center text-gray-400 hover:border-green-500 hover:text-green-600 transition-all"
                  >
                    <Plus size={20} />
                    <span className="text-[8px] font-bold uppercase mt-1">Add More</span>
                  </div>
                )}
              </div>
            )}

            {uploadedImages.length === 0 && (
              <div 
                className="w-full aspect-video rounded-[28px] border-2 border-dashed border-gray-200 bg-white transition-all flex flex-col items-center justify-center group cursor-pointer relative overflow-hidden hover:border-gray-300"
                onClick={() => fileInputRef.current?.click()}
              >
                <div className="w-16 h-16 bg-gray-50 rounded-3xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300 border border-gray-100">
                  <Camera className="text-gray-400 group-hover:text-green-600" size={32} />
                </div>
                <span className="text-[10px] font-bold text-gray-900 uppercase tracking-[0.2em] mb-1">{t('tap_to_upload')}</span>
                <span className="text-[9px] text-gray-400 font-medium uppercase tracking-widest">{t('at_least_one_image')}</span>
              </div>
            )}

            <input 
              type="file" 
              ref={fileInputRef} 
              className="hidden" 
              accept="image/*"
              multiple
              onChange={handleFileChange}
            />
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
              disabled={submitting || uploadedImages.length === 0}
              className={`w-full py-4 rounded-[20px] font-bold text-xs tracking-[0.2em] uppercase transition-all flex items-center justify-center gap-3 active:scale-95 ${
                uploadedImages.length === 0 
                  ? 'bg-gray-200 text-gray-400 cursor-not-allowed' 
                  : 'bg-green-600 hover:bg-green-500 text-white shadow-xl shadow-green-100'
              }`}
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
            {uploadedImages.length === 0 && (
              <p className="text-center text-[9px] font-bold text-red-500 uppercase tracking-widest mt-4 animate-pulse">
                {t('error_image_required') || 'Please upload at least one image'}
              </p>
            )}
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
