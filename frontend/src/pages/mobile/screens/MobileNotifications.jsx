import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ChevronLeft, Bell, AlertTriangle, Info, 
  ShieldAlert, CheckCircle2, MessageSquare, Loader2
} from 'lucide-react';
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
    if (type === 'alert' || type === 'weather_warning') return <AlertTriangle className="text-red-500" size={18} />;
    if (type === 'claim_update') return <CheckCircle2 className="text-green-600" size={18} />;
    return <MessageSquare className="text-blue-600" size={18} />;
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
      
      {/* Header */}
      <div className="bg-white pt-10 px-6 pb-6 border-b border-gray-100">
        <div className="flex items-center gap-4 mb-1">
          <button onClick={() => navigate(-1)} className="p-2 -ml-2 rounded-full hover:bg-gray-100 transition-colors">
            <ChevronLeft size={24} />
          </button>
          <h2 className="text-sm font-bold text-green-600 tracking-widest uppercase">
            {t('notifications_label')}
          </h2>
        </div>
        <p className="text-xs text-gray-500">
          {t('alerts_updates')}
        </p>
      </div>

      <div className="px-6 space-y-4 pt-6">
        {data.length === 0 ? (
          <div className="py-20 flex flex-col items-center text-center">
            <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mb-6 text-gray-200 border border-gray-100 shadow-sm">
              <Bell size={32} />
            </div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-[0.2em]">{t('no_data')}</p>
          </div>
        ) : (
          data.map((item) => (
            <div 
              key={item.id} 
              className={`bg-white border border-gray-100 rounded-[28px] p-5 flex gap-4 relative overflow-hidden transition-all active:scale-[0.98] shadow-sm ${!item.read ? 'border-l-4 border-l-green-600' : ''}`}
            >
              <div className="w-12 h-12 rounded-2xl bg-gray-50 flex items-center justify-center shrink-0 border border-gray-100">
                {getIcon(item.type)}
              </div>
              <div className="flex-1">
                <p className={`text-sm leading-tight mb-2 ${!item.read ? 'text-gray-900 font-bold' : 'text-gray-500 font-medium'}`}>{item.message}</p>
                <p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest">{new Date(item.timestamp).toLocaleString()}</p>
              </div>
              {!item.read && (
                <div className="absolute top-4 right-4 w-2 h-2 bg-green-500 rounded-full" />
              )}
            </div>
          ))
        )}
      </div>

    </div>
  );
};

export default MobileNotifications;
