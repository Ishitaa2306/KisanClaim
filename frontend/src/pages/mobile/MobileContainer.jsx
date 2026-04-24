import React from 'react';
import { Routes, Route, useNavigate, useLocation, Navigate } from 'react-router-dom';
import { Home, LayoutGrid, FileText, CheckCircle, Settings, CloudRain, Mic } from 'lucide-react';
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
import MobileLanding from './screens/MobileLanding';

const PrivateRoute = ({ children }) => {
  const { farmerId } = useMobile();
  if (!farmerId) return <Navigate to="/mobile/landing" replace />;
  return children;
};

const BottomTabBar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useMobile();

  // Hide tab bar entirely on login screen
  if (location.pathname === '/mobile/login' || location.pathname === '/mobile/landing' || location.pathname === '/mobile') return null;

  const tabs = [
    { name: t('home') || 'Home', path: '/mobile/home', icon: Home },
    { name: t('farm') || 'Farm', path: '/mobile/farm', icon: LayoutGrid },
    { name: t('file_claim') || 'Claims', path: '/mobile/status', icon: CheckCircle }, // Status/Claims list is more useful here than file claim
    { name: t('weather') || 'Weather', path: '/mobile/weather', icon: CloudRain },
    { name: t('settings') || 'Settings', path: '/mobile/settings', icon: Settings },
  ];

  return (
    <div className="absolute bottom-0 w-full bg-white/90 backdrop-blur-lg border-t border-gray-100 pb-safe pt-1 px-4 flex justify-between items-center z-50 shadow-[0_-4px_10px_rgba(0,0,0,0.03)] rounded-t-[24px]">
      {tabs.map((tab) => {
        const isActive = location.pathname.startsWith(tab.path);
        const Icon = tab.icon;
        
        const path = tab.path === '/mobile/weather' ? '/mobile/weather/Pune' : tab.path;

        return (
          <button 
            key={tab.name}
            onClick={() => navigate(path)}
            className="flex flex-col items-center justify-center w-14 h-14 relative group"
          >
            <div className={`flex flex-col items-center justify-center transition-all duration-300 ${isActive ? '-translate-y-1' : ''}`}>
              <div className={`p-1.5 rounded-xl transition-colors duration-300 ${isActive ? 'bg-green-50 text-green-600' : 'text-gray-400 group-hover:text-gray-600'}`}>
                <Icon size={isActive ? 22 : 20} strokeWidth={isActive ? 2.5 : 2} />
              </div>
              <span className={`text-[9px] font-bold mt-0.5 transition-colors duration-300 ${isActive ? 'text-green-600 opacity-100' : 'text-gray-400 opacity-0'}`}>
                {tab.name}
              </span>
            </div>
            {isActive && (
              <span className="absolute -bottom-1 w-1 h-1 bg-green-600 rounded-full" />
            )}
          </button>
        );
      })}
    </div>
  );
};

const MobileAppRouter = () => {
  const location = useLocation();
  return (
    <div className="flex-1 h-full overflow-y-auto bg-gradient-to-b from-gray-50 to-gray-100 relative pb-28">
      <div className="w-full h-full">
        <Routes>
          <Route path="landing" element={<MobileLanding />} />
          <Route path="login" element={<MobileLogin />} />
          
          <Route path="/" element={<Navigate to="landing" replace />} />
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

      {/* Voice Assistant placeholder logic removed from here as it's now in the container */}
    </div>
  );
};

export const MobileContainer = () => {
  const location = useLocation();
  const isAuthScreen = location.pathname.includes('/mobile/login') || location.pathname.includes('/mobile/landing') || location.pathname === '/mobile' || location.pathname === '/mobile/';

  return (
    <MobileProvider>
      <div className="w-full h-screen flex justify-center bg-gray-900 font-sans">
        <div className="w-full max-w-md h-full bg-white relative shadow-2xl flex flex-col overflow-hidden sm:rounded-[32px] sm:h-[95vh] sm:my-auto sm:border-[8px] sm:border-gray-800 ring-1 ring-gray-200">
          <MobileAppRouter />
          {!isAuthScreen && (
            <>
              <BottomTabBar />
              {/* Fixed Voice Assistant Button - Positioned above Nav Bar and aligned with Settings icon */}
              <button 
                onClick={() => alert("Voice assistant coming soon")}
                className="absolute bottom-20 right-5 w-12 h-12 bg-gradient-to-tr from-green-600 to-green-500 rounded-full flex items-center justify-center shadow-[0_8px_25px_rgba(22,163,74,0.3)] hover:scale-110 active:scale-90 transition-all text-white z-[60] border-[2px] border-white/80 backdrop-blur-md"
              >
                <Mic size={20} strokeWidth={2.5} />
              </button>
            </>
          )}
        </div>
      </div>
    </MobileProvider>
  );
};

export default MobileContainer;
