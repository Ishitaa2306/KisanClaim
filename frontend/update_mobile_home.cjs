const fs = require('fs');
const newKeysEn = {
  'good_morning': 'Good Morning',
  'your_farm_overview': 'Your farm intelligence overview',
  'health': 'Health',
  'ndvi_status': 'NDVI Status',
  'good': 'Good',
  'damage': 'Damage',
  'ai_crop_advisor': 'AI Crop Advisor',
  'upload_crop_image': 'Upload crop image for smart suggestions',
  'tap_to_upload': 'Tap to upload',
  'analyze_crop': 'Analyze Crop',
  'analyzing': 'Analyzing...',
  'detected_condition': 'Detected Condition',
  'confidence': 'Confidence',
  'expert_suggestions': 'Expert Suggestions',
  'reset': 'Reset',
  'ai_insights': 'AI Insights',
  'veg_index': 'Vegetation index is stable. Crop growth is currently on track.',
  'risk_profile_low': 'Risk profile remains low. No fraud or weather anomalies detected.',
  'retry': 'Retry'
};
const newKeysHi = {
  'good_morning': 'सुप्रभात',
  'your_farm_overview': 'आपका खेत खुफिया अवलोकन',
  'health': 'स्वास्थ्य',
  'ndvi_status': 'एनडीवीआई स्थिति',
  'good': 'अच्छा',
  'damage': 'नुकसान',
  'ai_crop_advisor': 'एआई फसल सलाहकार',
  'upload_crop_image': 'स्मार्ट सुझावों के लिए फसल छवि अपलोड करें',
  'tap_to_upload': 'अपलोड करने के लिए टैप करें',
  'analyze_crop': 'फसल का विश्लेषण करें',
  'analyzing': 'विश्लेषण हो रहा है...',
  'detected_condition': 'पाई गई स्थिति',
  'confidence': 'विश्वास',
  'expert_suggestions': 'विशेषज्ञ सुझाव',
  'reset': 'रीसेट',
  'ai_insights': 'एआई इनसाइट्स',
  'veg_index': 'वनस्पति सूचकांक स्थिर है। फसल का विकास सही दिशा में है।',
  'risk_profile_low': 'जोखिम प्रोफ़ाइल कम बनी हुई है। कोई धोखाधड़ी या मौसम संबंधी विसंगति नहीं पाई गई।',
  'retry': 'पुनः प्रयास करें'
};
const newKeysKn = {
  'good_morning': 'ಶುಭೋದಯ',
  'your_farm_overview': 'ನಿಮ್ಮ ಹೊಲದ ಗುಪ್ತಚರ ಅವಲೋಕನ',
  'health': 'ಆರೋಗ್ಯ',
  'ndvi_status': 'ಎನ್‌ಡಿವಿಐ ಸ್ಥಿತಿ',
  'good': 'ಉತ್ತಮ',
  'damage': 'ಹಾನಿ',
  'ai_crop_advisor': 'ಎಐ ಬೆಳೆ ಸಲಹೆಗಾರ',
  'upload_crop_image': 'ಸ್ಮಾರ್ಟ್ ಸಲಹೆಗಳಿಗಾಗಿ ಬೆಳೆ ಚಿತ್ರವನ್ನು ಅಪ್‌ಲೋಡ್ ಮಾಡಿ',
  'tap_to_upload': 'ಅಪ್‌ಲೋಡ್ ಮಾಡಲು ಟ್ಯಾಪ್ ಮಾಡಿ',
  'analyze_crop': 'ಬೆಳೆಯನ್ನು ವಿಶ್ಲೇಷಿಸಿ',
  'analyzing': 'ವಿಶ್ಲೇಷಿಸಲಾಗುತ್ತಿದೆ...',
  'detected_condition': 'ಪತ್ತೆಯಾದ ಸ್ಥಿತಿ',
  'confidence': 'ವಿಶ್ವಾಸ',
  'expert_suggestions': 'ತಜ್ಞರ ಸಲಹೆಗಳು',
  'reset': 'ಮರುಹೊಂದಿಸಿ',
  'ai_insights': 'ಎಐ ಒಳನೋಟಗಳು',
  'veg_index': 'ಸಸ್ಯವರ್ಗ ಸೂಚ್ಯಂಕ ಸ್ಥಿರವಾಗಿದೆ. ಬೆಳೆ ಬೆಳವಣಿಗೆ ಸರಿಯಾದ ಹಾದಿಯಲ್ಲಿದೆ.',
  'risk_profile_low': 'ಅಪಾಯದ ಪ್ರೊಫೈಲ್ ಕಡಿಮೆ ಉಳಿದಿದೆ. ಯಾವುದೇ ವಂಚನೆ ಅಥವಾ ಹವಾಮಾನ ವೈಪರೀತ್ಯಗಳು ಕಂಡುಬಂದಿಲ್ಲ.',
  'retry': 'ಮರುಪ್ರಯತ್ನಿಸಿ'
};
const updateJson = (file, newKeys) => {
  const data = JSON.parse(fs.readFileSync(file, 'utf8'));
  Object.assign(data, newKeys);
  fs.writeFileSync(file, JSON.stringify(data, null, 2));
};
updateJson('frontend/src/locales/en.json', newKeysEn);
updateJson('frontend/src/locales/hi.json', newKeysHi);
updateJson('frontend/src/locales/kn.json', newKeysKn);

let content = fs.readFileSync('frontend/src/pages/mobile/screens/MobileHome.jsx', 'utf8');
content = content.replace(/>Good Morning, /g, '>{t("good_morning")}, ');
content = content.replace(/>Your farm intelligence overview</g, '>{t("your_farm_overview")}<');
content = content.replace(/ Health<\/div>/g, ' {t("health")}</div>');
content = content.replace(/>Location</g, '>{t("location")}<');
content = content.replace(/>Area</g, '>{t("area")}<');
content = content.replace(/>Acres</g, '>{t("acres")}<');
content = content.replace(/>NDVI Status</g, '>{t("ndvi_status")}<');
content = content.replace(/>0\.72 \(Good\)</g, '>{`0.72 (${t("good")})`}<');
content = content.replace(/>Claim #/g, '>{t("claim_number")} ');
content = content.replace(/% Damage</g, '% {t("damage")}<');
content = content.replace(/>AI Crop Advisor</g, '>{t("ai_crop_advisor")}<');
content = content.replace(/>Upload crop image for smart suggestions</g, '>{t("upload_crop_image")}<');
content = content.replace(/>Tap to upload</g, '>{t("tap_to_upload")}<');
content = content.replace(/>Analyze Crop</g, '>{t("analyze_crop")}<');
content = content.replace(/Analyzing\.\.\./g, '{t("analyzing")}');
content = content.replace(/>Detected Condition</g, '>{t("detected_condition")}<');
content = content.replace(/>Confidence</g, '>{t("confidence")}<');
content = content.replace(/>Expert Suggestions</g, '>{t("expert_suggestions")}<');
content = content.replace(/>Reset</g, '>{t("reset")}<');
content = content.replace(/>File Claim</g, '>{t("file_claim")}<');
content = content.replace(/>Weather</g, '>{t("weather")}<');
content = content.replace(/>AI Insights</g, '>{t("ai_insights")}<');
content = content.replace(/>Vegetation index is stable. Crop growth is currently on track.</g, '>{t("veg_index")}<');
content = content.replace(/>Risk profile remains low. No fraud or weather anomalies detected.</g, '>{t("risk_profile_low")}<');
content = content.replace(/>Retry</g, '>{t("retry")}<');
fs.writeFileSync('frontend/src/pages/mobile/screens/MobileHome.jsx', content);
