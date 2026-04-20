import React, { createContext, useContext, useState, useEffect } from 'react';
import { translations } from '../locales';

const MobileContext = createContext();

export const MobileProvider = ({ children }) => {
  const [lang, setLang] = useState('en');
  const [farmerId, setFarmerId] = useState(sessionStorage.getItem('farmerId') || null);
  const [farmerName, setFarmerName] = useState(sessionStorage.getItem('farmerName') || '');

  useEffect(() => {
    const saved = localStorage.getItem('mobile_lang');
    if (saved) setLang(saved);
  }, []);

  const changeLang = (newLang) => {
    setLang(newLang);
    localStorage.setItem('mobile_lang', newLang);
  };

  const loginSession = (id, name) => {
    setFarmerId(id);
    setFarmerName(name);
    sessionStorage.setItem('farmerId', id);
    sessionStorage.setItem('farmerName', name);
  };

  const logoutSession = () => {
    setFarmerId(null);
    setFarmerName('');
    sessionStorage.removeItem('farmerId');
    sessionStorage.removeItem('farmerName');
  };

  const t = (key) => {
    const section = translations[lang] || translations['en'];
    return section[key] || translations['en'][key] || key;
  };

  return (
    <MobileContext.Provider value={{ 
      lang, changeLang, t, 
      farmerId, farmerName, 
      loginSession, logoutSession 
    }}>
      {children}
    </MobileContext.Provider>
  );
};

export const useMobile = () => useContext(MobileContext);
