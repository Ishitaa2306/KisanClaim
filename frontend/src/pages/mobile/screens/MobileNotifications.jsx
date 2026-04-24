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
      <div className="flex w-full h-64 items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="mb-6 flex items-center gap-4 border-b border-gray-200 pb-4">
        <button 
          onClick={() => navigate(-1)} 
          className="p-2 border border-gray-200 rounded-md bg-white hover:bg-gray-50 text-gray-600 transition"
        >
          <ChevronLeft size={20} />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 leading-tight" data-i18n="notifications">{t('notifications')}</h1>
          <p className="text-sm text-gray-500 mt-1" data-i18n="notifications_desc">{t('notifications_desc')}</p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden max-w-4xl">
        {data.length === 0 ? (
          <div className="p-8 text-center text-sm text-gray-500">{t('no_data')}</div>
        ) : (
          <div className="divide-y divide-gray-100">
            {data.map((item) => (
              <div key={item.id} className={`p-4 flex gap-4 hover:bg-gray-50 transition-colors ${!item.read ? 'bg-green-50/20 relative' : ''}`}>
                {!item.read && <div className="absolute left-0 top-0 bottom-0 w-1 bg-green-500 rounded-r"></div>}
                <div className="shrink-0 mt-0.5">
                  {getIcon(item.type)}
                </div>
                <div className="flex-1">
                  <p className={`text-sm text-gray-900 leading-snug ${!item.read ? 'font-semibold' : 'font-medium'}`}>{item.message}</p>
                  <p className="text-xs text-gray-500 mt-1 font-mono">{new Date(item.timestamp).toLocaleString()}</p>
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
