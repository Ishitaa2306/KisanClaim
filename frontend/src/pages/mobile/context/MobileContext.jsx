import React, { createContext, useContext, useState, useEffect } from 'react';
import en from '../../../locales/en.json';
import hi from '../../../locales/hi.json';
import kn from '../../../locales/kn.json';
import mr from '../../../locales/mr.json';
import te from '../../../locales/te.json';
import ta from '../../../locales/ta.json';

const translations = { en, hi, kn, mr, te, ta };

const MobileContext = createContext();

export const MobileProvider = ({ children }) => {
  const [lang, setLang] = useState(localStorage.getItem('mobile_lang') || 'en');
  const [farmerId, setFarmerId] = useState(sessionStorage.getItem('farmerId') || null);
  const [farmerName, setFarmerName] = useState(sessionStorage.getItem('farmerName') || '');

  useEffect(() => {
    const saved = localStorage.getItem('mobile_lang');
    if (saved && translations[saved]) {
      setLang(saved);
    } else {
      setLang('en');
      localStorage.setItem('mobile_lang', 'en');
    }
  }, []);

  const changeLang = (newLang) => {
    if (translations[newLang]) {
      setLang(newLang);
      localStorage.setItem('mobile_lang', newLang);
      // Force refresh if needed, but React state update should be enough
    }
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
    const section = translations[lang];
    if (!section) return key;
    return section[key] || key;
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
