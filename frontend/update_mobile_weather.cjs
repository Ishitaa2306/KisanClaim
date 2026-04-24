const fs = require('fs');
const newKeysEn = {
  'pune_mah': 'Pune, Maharashtra',
  'mostly_cloudy': 'Mostly Cloudy',
  'humidity': 'Humidity',
  'wind': 'Wind',
  'precip': 'Precip',
  'five_day_forecast': '5-Day Forecast',
  'mon': 'MON', 'tue': 'TUE', 'wed': 'WED', 'thu': 'THU', 'fri': 'FRI',
  'weather_insights': 'Weather Insights',
  'dry_spell': 'Dry Spell Expected',
  'dry_spell_desc': 'No rainfall expected in the next 3 days. Soil moisture levels are currently stable.',
  'thermal_warning': 'Thermal Warning',
  'thermal_warning_desc': 'High temperature peaks between 1PM-4PM may affect crop transpiration and moisture.',
  'impact_on_crop': 'Impact on Crop',
  'risk': 'RISK',
  'detected': 'Detected',
  'damage_est': 'Damage Estimate:',
  'before': 'Before',
  'after': 'After',
  'action_required': 'ACTION REQUIRED',
  'irrigation_rec': 'Irrigation Recommended',
  'irrigation_desc': "Initiate evening irrigation to counter tomorrow's predicted heat surge.",
  'low_risk': 'LOW RISK',
  'pest_disease': 'Pest & Disease',
  'pest_desc': 'Low humidity and clear skies reduce the immediate risk of fungal growth.',
  'optimal': 'OPTIMAL',
  'growth_conditions': 'Growth Conditions',
  'growth_desc': 'Photosynthetic activity index is high. Excellent for nutrient absorption.'
};

const newKeysHi = {
  'pune_mah': 'पुणे, महाराष्ट्र',
  'mostly_cloudy': 'मुख्यतः बादल छाये रहेंगे',
  'humidity': 'नमी',
  'wind': 'हवा',
  'precip': 'बारिश',
  'five_day_forecast': '5-दिवसीय पूर्वानुमान',
  'mon': 'सोम', 'tue': 'मंगल', 'wed': 'बुध', 'thu': 'गुरु', 'fri': 'शुक्र',
  'weather_insights': 'मौसम इनसाइट्स',
  'dry_spell': 'सूखे की संभावना',
  'dry_spell_desc': 'अगले 3 दिनों में बारिश की उम्मीद नहीं है। मिट्टी की नमी वर्तमान में स्थिर है।',
  'thermal_warning': 'थर्मल चेतावनी',
  'thermal_warning_desc': 'दोपहर 1 बजे से 4 बजे के बीच उच्च तापमान से फसल को प्रभावित हो सकता है।',
  'impact_on_crop': 'फसल पर प्रभाव',
  'risk': 'जोखिम',
  'detected': 'पाया गया',
  'damage_est': 'नुकसान का अनुमान:',
  'before': 'पहले',
  'after': 'बाद',
  'action_required': 'कार्रवाई की आवश्यकता',
  'irrigation_rec': 'सिंचाई की सिफारिश',
  'irrigation_desc': "कल के अनुमानित ताप वृद्धि का मुकाबला करने के लिए शाम को सिंचाई शुरू करें।",
  'low_risk': 'कम जोखिम',
  'pest_disease': 'कीट और रोग',
  'pest_desc': 'कम नमी और साफ आसमान से फंगल वृद्धि का तत्काल जोखिम कम होता है।',
  'optimal': 'इष्टतम',
  'growth_conditions': 'विकास की स्थिति',
  'growth_desc': 'प्रकाश संश्लेषक गतिविधि सूचकांक उच्च है। पोषक तत्वों के अवशोषण के लिए उत्कृष्ट।'
};

const newKeysKn = {
  'pune_mah': 'ಪುಣೆ, ಮಹಾರಾಷ್ಟ್ರ',
  'mostly_cloudy': 'ಬಹುತೇಕ ಮೋಡ',
  'humidity': 'ತೇವಾಂಶ',
  'wind': 'ಗಾಳಿ',
  'precip': 'ಮಳೆ',
  'five_day_forecast': '5-ದಿನಗಳ ಮುನ್ಸೂಚನೆ',
  'mon': 'ಸೋಮ', 'tue': 'ಮಂಗಳ', 'wed': 'ಬುಧ', 'thu': 'ಗುರು', 'fri': 'ಶುಕ್ರ',
  'weather_insights': 'ಹವಾಮಾನ ಒಳನೋಟಗಳು',
  'dry_spell': 'ಶುಷ್ಕ ಹವಾಮಾನ ನಿರೀಕ್ಷಿಸಲಾಗಿದೆ',
  'dry_spell_desc': 'ಮುಂದಿನ 3 ದಿನಗಳಲ್ಲಿ ಮಳೆ ನಿರೀಕ್ಷೆಯಿಲ್ಲ. ಮಣ್ಣಿನ ತೇವಾಂಶವು ಪ್ರಸ್ತುತ ಸ್ಥಿರವಾಗಿದೆ.',
  'thermal_warning': 'ಉಷ್ಣ ಎಚ್ಚರಿಕೆ',
  'thermal_warning_desc': 'ಮಧ್ಯಾಹ್ನ 1-4 ರ ನಡುವಿನ ಹೆಚ್ಚಿನ ತಾಪಮಾನವು ಬೆಳೆಗಳ ಮೇಲೆ ಪರಿಣಾಮ ಬೀರಬಹುದು.',
  'impact_on_crop': 'ಬೆಳೆಯ ಮೇಲಿನ ಪ್ರಭಾವ',
  'risk': 'ಅಪಾಯ',
  'detected': 'ಪತ್ತೆಯಾಗಿದೆ',
  'damage_est': 'ಹಾನಿ ಅಂದಾಜು:',
  'before': 'ಮೊದಲು',
  'after': 'ನಂತರ',
  'action_required': 'ಕ್ರಮ ಅಗತ್ಯವಿದೆ',
  'irrigation_rec': 'ನೀರಾವರಿ ಶಿಫಾರಸು',
  'irrigation_desc': "ನಾಳೆಯ ನಿರೀಕ್ಷಿತ ಶಾಖವನ್ನು ಎದುರಿಸಲು ಸಂಜೆ ನೀರಾವರಿ ಪ್ರಾರಂಭಿಸಿ.",
  'low_risk': 'ಕಡಿಮೆ ಅಪಾಯ',
  'pest_disease': 'ಕೀಟ ಮತ್ತು ರೋಗ',
  'pest_desc': 'ಕಡಿಮೆ ತೇವಾಂಶ ಮತ್ತು ಶುಭ್ರ ಆಕಾಶವು ಶಿಲೀಂಧ್ರಗಳ ಬೆಳವಣಿಗೆಯ ಅಪಾಯವನ್ನು ಕಡಿಮೆ ಮಾಡುತ್ತದೆ.',
  'optimal': 'ಸೂಕ್ತ',
  'growth_conditions': 'ಬೆಳವಣಿಗೆಯ ಪರಿಸ್ಥಿತಿಗಳು',
  'growth_desc': 'ದ್ಯುತಿಸಂಶ್ಲೇಷಕ ಚಟುವಟಿಕೆಯು ಹೆಚ್ಚಾಗಿದೆ. ಪೋಷಕಾಂಶಗಳ ಹೀರಿಕೊಳ್ಳುವಿಕೆಗೆ ಅತ್ಯುತ್ತಮ.'
};

const updateJson = (file, newKeys) => {
  const data = JSON.parse(fs.readFileSync(file, 'utf8'));
  Object.assign(data, newKeys);
  fs.writeFileSync(file, JSON.stringify(data, null, 2));
};
updateJson('frontend/src/locales/en.json', newKeysEn);
updateJson('frontend/src/locales/hi.json', newKeysHi); 
updateJson('frontend/src/locales/kn.json', newKeysKn);

let content = fs.readFileSync('frontend/src/pages/mobile/screens/MobileWeather.jsx', 'utf8');
content = content.replace(/>Pune, Maharashtra</g, '>{t("pune_mah")}<');
content = content.replace(/>Mostly Cloudy</g, '>{t("mostly_cloudy")}<');
content = content.replace(/>Humidity</g, '>{t("humidity")}<');
content = content.replace(/>Wind</g, '>{t("wind")}<');
content = content.replace(/>Precip</g, '>{t("precip")}<');
content = content.replace(/>5-Day Forecast</g, '>{t("five_day_forecast")}<');
content = content.replace(/>MON</g, '>{t("mon")}<');
content = content.replace(/>TUE</g, '>{t("tue")}<');
content = content.replace(/>WED</g, '>{t("wed")}<');
content = content.replace(/>THU</g, '>{t("thu")}<');
content = content.replace(/>FRI</g, '>{t("fri")}<');
content = content.replace(/>Weather Insights</g, '>{t("weather_insights")}<');
content = content.replace(/>Dry Spell Expected</g, '>{t("dry_spell")}<');
content = content.replace(/>\s*No rainfall expected in the next 3 days\. Soil moisture levels are currently stable\.\s*</g, '>\n                  {t("dry_spell_desc")}\n                <');
content = content.replace(/>Thermal Warning</g, '>{t("thermal_warning")}<');
content = content.replace(/>\s*High temperature peaks between 1PM-4PM may affect crop transpiration and moisture\.\s*</g, '>\n                  {t("thermal_warning_desc")}\n                <');
content = content.replace(/>Impact on Crop</g, '>{t("impact_on_crop")}<');
content = content.replace(/>\s*RISK\s*</g, '>\n                   {t("risk")}\n                 <');
content = content.replace(/\} Detected</g, '} {t("detected")}<');
content = content.replace(/Damage Estimate:/g, '{t("damage_est")}');
content = content.replace(/>Before</g, '>{t("before")}<');
content = content.replace(/>After</g, '>{t("after")}<');
content = content.replace(/>\s*ACTION REQUIRED\s*</g, '>\n                {t("action_required")}\n              <');
content = content.replace(/>Irrigation Recommended</g, '>{t("irrigation_rec")}<');
content = content.replace(/>\s*Initiate evening irrigation to counter tomorrow's predicted heat surge\.\s*</g, '>\n                {t("irrigation_desc")}\n              <');
content = content.replace(/>\s*LOW RISK\s*</g, '>\n                {t("low_risk")}\n              <');
content = content.replace(/>Pest & Disease</g, '>{t("pest_disease")}<');
content = content.replace(/>\s*Low humidity and clear skies reduce the immediate risk of fungal growth\.\s*</g, '>\n                {t("pest_desc")}\n              <');
content = content.replace(/>\s*OPTIMAL\s*</g, '>\n                {t("optimal")}\n              <');
content = content.replace(/>Growth Conditions</g, '>{t("growth_conditions")}<');
content = content.replace(/>\s*Photosynthetic activity index is high\. Excellent for nutrient absorption\.\s*</g, '>\n                {t("growth_desc")}\n              <');
fs.writeFileSync('frontend/src/pages/mobile/screens/MobileWeather.jsx', content);
