import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ImagePlus, AlertCircle } from 'lucide-react';
import { useMobile } from '../context/MobileContext';

const MobileClaim = () => {
  const { t, farmerId } = useMobile();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [damageType, setDamageType] = useState('');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errorVisible, setErrorVisible] = useState(null);

  useEffect(() => {
    const fetchFarmer = async () => {
      const res = await fetch(`/api/v1/mobile/farmer/${farmerId}`);
      const json = await res.json();
      setData(json.data);
    };
    fetchFarmer();
  }, [farmerId]);

  const handleImageUpload = () => {
    alert('This is a demo. We are mocking the image upload feature.');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorVisible(null);
    if (!damageType) return setErrorVisible('Please specify the type of damage.');

    setSubmitting(true);
    try {
      const payload = {
        farmerId,
        farmId: data?.linkedFarmIds?.[0] || 'NEW-REG',
        damageType,
        description,
        images: ["https://images.unsplash.com/photo-1583245553131-0e7d36409271"]
      };

      const res = await fetch('/api/v1/mobile/claim', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const json = await res.json();
      
      if (!res.ok) throw new Error(json.error || json.message || 'Failed to submit claim');
      
      alert(`Claim submitted successfully! ID: ${json.data.claimId}`);
      navigate('/mobile/status');
    } catch (err) {
      console.error(err);
      setErrorVisible(err.message || 'Failed to submit claim.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="w-full">
      <div className="mb-6 pb-4 border-b border-gray-200">
        <h1 className="text-2xl font-bold text-gray-900 leading-tight">File Crop Claim</h1>
        <p className="text-sm text-gray-500 mt-1">Submit a new damage report for your primary farm.</p>
      </div>

      <div className="max-w-2xl bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        
        {errorVisible && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md flex items-start gap-3">
            <AlertCircle className="text-red-500 shrink-0 mt-0.5" size={18} />
            <p className="text-sm text-red-700">{errorVisible}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-gray-800 mb-2">{t('damage_type')}</label>
            <input 
              type="text" 
              placeholder="e.g. Drought, Hailstorm, Pest Attack"
              className="w-full bg-white border border-gray-300 rounded-md py-2 px-3 text-sm text-gray-900 outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500 transition-shadow"
              value={damageType}
              onChange={(e) => setDamageType(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-800 mb-2">{t('description')} (Optional)</label>
            <textarea 
              placeholder="Briefly describe the extent of the damage..."
              rows="4"
              className="w-full bg-white border border-gray-300 rounded-md py-2 px-3 text-sm text-gray-900 outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500 transition-shadow resize-y"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-800 mb-2">{t('upload_images')}</label>
            <button 
              type="button"
              onClick={handleImageUpload}
              className="w-full bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-6 flex flex-col items-center justify-center hover:bg-gray-100 hover:border-gray-400 transition-colors group"
            >
              <div className="p-3 bg-white rounded-full shadow-sm mb-3 group-hover:scale-105 transition-transform">
                <ImagePlus className="text-gray-500" size={24} />
              </div>
              <span className="text-sm text-gray-600 font-medium">Click to upload satellite or field imagery</span>
              <span className="text-xs text-gray-400 mt-1">PNG, JPG, up to 10MB</span>
            </button>
          </div>

          <div className="pt-4 border-t border-gray-100 flex justify-end gap-3">
            <button 
              type="button"
              onClick={() => navigate('/mobile/home')}
              className="px-5 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Cancel
            </button>
            <button 
              type="submit"
              disabled={submitting}
              className="px-6 py-2 text-sm font-medium text-white bg-green-600 rounded-md shadow-sm hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-75 disabled:cursor-not-allowed flex items-center justify-center min-w-[120px]"
            >
              {submitting ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              ) : t('submit')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default MobileClaim;
