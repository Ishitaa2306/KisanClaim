import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Bell, AlertTriangle, Info } from 'lucide-react';
import { useMobile } from '../context/MobileContext';

const MobileNotifications = () => {
  const navigate = useNavigate();
  const { t, farmerId } = useMobile();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNotifs = async () => {
      try {
        const res = await fetch(`/api/v1/mobile/notifications/${farmerId}`);
        const json = await res.json();
        setData(json.data?.all || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchNotifs();
  }, [farmerId]);

  const getIcon = (type) => {
    if (type === 'alert' || type === 'weather_warning') return <AlertTriangle className="text-red-500" size={20} />;
    if (type === 'claim_update') return <Info className="text-green-600" size={20} />;
    return <Bell className="text-gray-400" size={20} />;
  };

  if (loading) {
    return (
      <div className="flex w-full h-full items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-10 w-10 border-b-4 border-green-600"></div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-full bg-gradient-to-b from-gray-50 to-gray-100 p-4 pb-28 font-sans">
      
      <div className="mb-6 mt-4 flex items-center gap-3 px-1">
        <button 
          onClick={() => navigate(-1)} 
          className="w-10 h-10 bg-white border border-gray-200 rounded-full flex items-center justify-center shadow-sm active:scale-95 transition-all shrink-0"
        >
          <ChevronLeft size={20} className="text-gray-600" />
        </button>
        <div>
          <h1 className="text-xl font-bold text-gray-900 tracking-tight leading-tight" data-i18n="notifications">{t('notifications') || 'Notifications'}</h1>
          <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mt-0.5" data-i18n="notifications_desc">{t('notifications_desc')}</p>
        </div>
      </div>

      <div className="bg-white rounded-[16px] shadow-[0_4px_15px_rgb(0,0,0,0.02)] border border-gray-100 overflow-hidden">
        {data.length === 0 ? (
          <div className="p-8 text-center text-xs font-bold text-gray-500 uppercase tracking-widest">{t('no_data')}</div>
        ) : (
          <div className="divide-y divide-gray-50">
            {data.map((item) => (
              <div key={item.id} className={`p-4 flex gap-3 hover:bg-gray-50 transition-colors ${!item.read ? 'bg-green-50/30 relative' : ''}`}>
                {!item.read && <div className="absolute left-0 top-0 bottom-0 w-1 bg-green-500 rounded-r"></div>}
                <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 bg-gray-50 border border-gray-100">
                  {getIcon(item.type)}
                </div>
                <div className="flex-1">
                  <p className={`text-sm text-gray-900 leading-tight mb-1 ${!item.read ? 'font-black' : 'font-medium'}`}>{item.message}</p>
                  <p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest">{new Date(item.timestamp).toLocaleString()}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MobileNotifications;
