import React from 'react';
import { Routes, Route, useNavigate, useLocation, Navigate } from 'react-router-dom';
import { Home, LayoutGrid, FileText, CheckCircle, Settings, Menu } from 'lucide-react';
import { MobileProvider, useMobile } from './context/MobileContext';

// Screens
import MobileHome from './screens/MobileHome';
import MobileFarm from './screens/MobileFarm';
import MobileClaim from './screens/MobileClaim';
import MobileStatus from './screens/MobileStatus';
import MobileDetails from './screens/MobileDetails';
import MobileWeather from './screens/MobileWeather';
import MobileSettings from './screens/MobileSettings';
import MobileNotifications from './screens/MobileNotifications';
import MobileLogin from './screens/MobileLogin';

const PrivateRoute = ({ children }) => {
  const { farmerId } = useMobile();
  if (!farmerId) return <Navigate to="/mobile/login" replace />;
  return children;
};

const SidebarNav = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { t, farmerName } = useMobile();

  // Hide sidebar entirely on login screen
  if (location.pathname === '/mobile/login') return null;

  const tabs = [
    { name: t('home'), path: '/mobile/home', icon: Home },
    { name: t('farm'), path: '/mobile/farm', icon: LayoutGrid },
    { name: t('file_claim'), path: '/mobile/claim', icon: FileText },
    { name: t('status'), path: '/mobile/status', icon: CheckCircle },
    { name: t('settings'), path: '/mobile/settings', icon: Settings },
  ];

  return (
    <div className="w-64 h-full bg-white border-r border-gray-200 flex flex-col hidden md:flex shrink-0">
      <div className="p-6 border-b border-gray-100 mb-4 flex items-center gap-2">
        <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center">
          <span className="text-white font-bold text-lg">K</span>
        </div>
        <span className="font-bold text-xl text-gray-900 tracking-tight">KisanClaim</span>
      </div>
      <div className="flex-1 px-4 space-y-1">
        {tabs.map((tab) => {
          const isActive = location.pathname.startsWith(tab.path);
          const Icon = tab.icon;
          return (
            <button 
              key={tab.name}
              onClick={() => navigate(tab.path)}
              className={`flex items-center gap-3 w-full px-4 py-3 rounded-md transition-colors font-medium text-sm ${isActive ? 'bg-green-50 text-green-700' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}`}
            >
              <Icon size={20} className={isActive ? 'opacity-100' : 'opacity-70'} />
              <span>{tab.name}</span>
            </button>
          );
        })}
      </div>
      <div className="p-4 border-t border-gray-100">
        <div className="bg-gray-50 rounded-lg p-3 flex items-center gap-3 overflow-hidden cursor-pointer hover:bg-gray-100 transition" onClick={() => navigate('/mobile/settings')}>
          <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-green-700 font-bold shrink-0">{farmerName.charAt(0) || 'F'}</div>
          <div className="min-w-0">
            <p className="text-xs font-bold text-gray-900 truncate">{farmerName || 'Farmer Portal'}</p>
            <p className="text-[10px] text-gray-500 truncate">Authenticated</p>
          </div>
        </div>
      </div>
    </div>
  );
};

const MobileAppRouter = () => {
  return (
    <div className="flex-1 h-full overflow-y-auto bg-gray-50 relative">
      <div className="max-w-6xl mx-auto p-4 md:p-8 w-full h-full pb-20">
        <Routes>
          <Route path="login" element={<MobileLogin />} />
          
          <Route path="/" element={<Navigate to="home" replace />} />
          <Route path="home" element={<PrivateRoute><MobileHome /></PrivateRoute>} />
          <Route path="farm" element={<PrivateRoute><MobileFarm /></PrivateRoute>} />
          <Route path="claim" element={<PrivateRoute><MobileClaim /></PrivateRoute>} />
          <Route path="status" element={<PrivateRoute><MobileStatus /></PrivateRoute>} />
          <Route path="details/:id" element={<PrivateRoute><MobileDetails /></PrivateRoute>} />
          <Route path="weather/:location" element={<PrivateRoute><MobileWeather /></PrivateRoute>} />
          <Route path="settings" element={<PrivateRoute><MobileSettings /></PrivateRoute>} />
          <Route path="notifications" element={<PrivateRoute><MobileNotifications /></PrivateRoute>} />
        </Routes>
      </div>

      {/* Floating Voice Assistant Button */}
      {!location.pathname.includes('/mobile/login') && (
        <button 
          onClick={() => alert("Voice assistant coming soon")}
          className="absolute bottom-6 right-6 w-14 h-14 bg-green-600 rounded-full flex items-center justify-center shadow-lg hover:bg-green-700 hover:scale-105 transition-all text-white z-50 border-[3px] border-white ring-2 ring-green-600/20"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/>
            <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
            <line x1="12" x2="12" y1="19" y2="22"/>
          </svg>
        </button>
      )}
    </div>
  );
};

export const MobileContainer = () => {
  const location = useLocation();
  const isLogin = location.pathname.includes('/mobile/login');

  return (
    <MobileProvider>
      <div className="w-full h-screen flex bg-gray-50 overflow-hidden font-sans">
        {!isLogin && <SidebarNav />}
        <MobileAppRouter />
      </div>
    </MobileProvider>
  );
};

export default MobileContainer;
