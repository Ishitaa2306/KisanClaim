const fs = require('fs');
const path = require('path');

const localesDir = path.join(__dirname, 'frontend', 'src', 'locales');

if (!fs.existsSync(localesDir)) {
  fs.mkdirSync(localesDir, { recursive: true });
}

const languages = {
  en: {
    welcome_title: "KisanClaim", welcome_subtitle: "Smart Agriculture Intelligence", get_started: "Get Started", sign_in: "Sign In",
    login_title: "Welcome Back", login_subtitle: "Enter your phone number to continue", phone_number: "Phone Number",
    phone_placeholder: "Enter 10 digit number", send_otp: "Send OTP", verify_otp: "Verify OTP", enter_otp: "Enter OTP",
    otp_placeholder: "Enter 6 digit OTP", didnt_receive: "Didn't receive code?", resend: "Resend",
    good_morning: "Good Morning", live: "Live", farmer_name: "Farmer Name", your_farm_overview: "Your farm intelligence overview",
    farm_summary: "Farm Summary", health: "Health", location: "Location", ndvi_status: "NDVI Status", good: "Good",
    file_claim: "File Claim", weather: "Weather", ai_crop_advisor: "AI Crop Advisor", upload_crop_image: "Upload crop image",
    tap_to_upload: "Tap to upload", analyzing: "Analyzing...", analyze_crop: "Analyze Crop",
    detected_condition: "Detected Condition", confidence: "Confidence", expert_suggestions: "Expert Suggestions", reset: "Reset",
    latest_claim_status: "Latest Claim Status", view_status: "View Status", claim_number: "Claim #", pending: "Pending",
    damage: "Damage", flood: "Flood", acres: "Acres", farm_intelligence: "Farm Intelligence", satellite_analysis: "Satellite Analysis",
    live_ndvi: "Live NDVI", ndvi_before: "NDVI Before", ndvi_after: "NDVI After", drop: "Drop", farm_conditions: "Farm Conditions",
    soil_moisture: "Soil Moisture", sunlight: "Sunlight", soil_quality: "Soil Quality", optimal: "Optimal", wind_speed: "Wind Speed",
    coverage_details: "Coverage Details", total_insured_value: "Total Insured Value", area: "Area", risk: "Risk", low: "Low",
    mostly_cloudy: "Mostly Cloudy", wind: "Wind", humidity: "Humidity", precip: "Precip", mon: "Mon", tue: "Tue", wed: "Wed", thu: "Thu", fri: "Fri",
    five_day_forecast: "5-Day Forecast", weather_insights: "Weather Insights", dry_spell_expected: "Dry Spell Expected",
    no_rainfall_expected: "No rainfall expected", thermal_warning: "Thermal Warning", high_temp_warning: "High temperature warning",
    impact_on_crop: "Impact on Crop", detected: "Detected", action_required: "Action Required", irrigation_recommended: "Irrigation Recommended",
    irrigation_desc: "Initiate evening irrigation", low_risk: "Low Risk", pest_disease: "Pest & Disease", pest_desc: "Low risk of fungal growth",
    growth_conditions: "Growth Conditions", growth_desc: "Excellent for nutrient absorption", file_crop_claim: "File Crop Claim",
    file_claim_desc: "Submit a new damage report", offline_mode_active: "Offline Mode Active", offline_mode_desc: "Claims will be stored locally",
    damage_type: "Damage Type", damage_placeholder: "e.g. Drought, Hail, Pest", description_optional: "Description (Optional)",
    desc_placeholder: "Briefly describe damage...", upload_evidence: "Upload Evidence", image_selected: "Image Selected ✓",
    click_to_upload: "Click to upload satellite/field imagery", upload_limits: "PNG, JPG, up to 10MB", submitting: "Submitting...",
    submit_claim: "Submit Claim", instant_decision: "Instant Decision", offline_estimate: "Offline Estimate",
    estimated_status: "Estimated Status", approved: "Approved", amount: "Amount", go_to_claims: "Go to Claims", close: "Close",
    my_claims: "My Claims", total_claims_filed: "total claims filed", all: "All", rejected: "Rejected", no_data: "No claims found",
    status: "Status", detailed_status_desc: "Detailed status report", overview: "Overview", claim_amount: "Claim Amount", date: "Date",
    intelligence_analysis: "Intelligence Analysis", damage_estimate: "Damage Estimate", fraud_score: "Fraud Score",
    explanation: "Explanation", no_explanation: "No explanation provided", timeline: "Timeline", claim_approved: "Claim Approved",
    processing: "Processing", verification: "Verification", submitted: "Submitted", payment_status: "Payment Status",
    disbursed: "Disbursed", settlement_complete: "Settlement complete", settings: "Settings", account_label: "Account",
    preferences: "Preferences", language: "Language", select_language: "Select Language", english: "English", hindi: "Hindi",
    kannada: "Kannada", marathi: "Marathi", telugu: "Telugu", tamil: "Tamil", appearance: "Appearance", dark_mode: "Dark Mode",
    notifications_label: "Notifications", alerts_updates: "Alerts & updates", data_sync: "Data Sync",
    last_synced: "Last synced: Just now", sync_now: "Sync Now", about: "About", kisanclaim: "KisanClaim", version: "Version 2.4.0",
    powered_by: "Powered by", logout: "Logout",
    smart_crop: "Smart Crop monitoring & insurance for modern farmers.", live_yield: "Live Yield", risk_index: "Risk Index",
    error_fetching_data: "Error fetching data. Please try again.", retry: "Retry", ai_insights: "AI Insights",
    veg_index: "Vegetation index is up 4% this week.", risk_profile_low: "Risk profile remains LOW.",
    thermal_warning_desc: "High thermal stress detected in the region.", irrigation_rec: "Irrigation Recommended",
    secure_login: "Secure Login", error_credentials: "Name and valid phone number are required.",
    error_otp: "Please enter the OTP.", error_invalid_otp: "Invalid OTP. Please try again.",
    exit: "Exit", full_name: "Full Name", enter_credentials: "Enter your full name", aadhaar_id: "Aadhaar ID",
    demo_otp_received: "Demo OTP Received", enter_verification_code: "Enter Verification Code", verify_login: "Verify & Login",
    authorized_access_only: "Authorized Access Only", terms_conditions: "Terms & Conditions", secure_access: "Secure Access",
    last_updated: "Last Updated"
  },
  hi: {
    welcome_title: "किसानक्लेम", welcome_subtitle: "स्मार्ट कृषि इंटेलिजेंस", get_started: "शुरू करें", sign_in: "साइन इन",
    login_title: "स्वागत है", login_subtitle: "जारी रखने के लिए अपना फोन नंबर दर्ज करें", phone_number: "फ़ोन नंबर",
    phone_placeholder: "10 अंकों का नंबर दर्ज करें", send_otp: "ओटीपी भेजें", verify_otp: "ओटीपी सत्यापित करें", enter_otp: "ओटीपी दर्ज करें",
    otp_placeholder: "6 अंकों का ओटीपी दर्ज करें", didnt_receive: "कोड नहीं मिला?", resend: "पुनः भेजें",
    good_morning: "शुभ प्रभात", live: "लाइव", farmer_name: "किसान का नाम", your_farm_overview: "आपके खेत की जानकारी",
    farm_summary: "खेत का सारांश", health: "स्वास्थ्य", location: "स्थान", ndvi_status: "एनडीवीआई स्थिति", good: "अच्छा",
    file_claim: "दावा दायर करें", weather: "मौसम", ai_crop_advisor: "एआई फसल सलाहकार", upload_crop_image: "फसल की फोटो अपलोड करें",
    tap_to_upload: "अपलोड करने के लिए टैप करें", analyzing: "विश्लेषण हो रहा है...", analyze_crop: "फसल का विश्लेषण करें",
    detected_condition: "खोज की गई स्थिति", confidence: "आत्मविश्वास", expert_suggestions: "विशेषज्ञ सुझाव", reset: "रीसेट",
    latest_claim_status: "नवीनतम दावे की स्थिति", view_status: "स्थिति देखें", claim_number: "दावा #", pending: "लंबित",
    damage: "नुकसान", flood: "बाढ़", acres: "एकड़", farm_intelligence: "खेत की खुफिया जानकारी", satellite_analysis: "सैटेलाइट विश्लेषण",
    live_ndvi: "लाइव्य एनडीवीआई", ndvi_before: "पहले का एनडीवीआई", ndvi_after: "बाद का एनडीवीआई", drop: "गिरावट", farm_conditions: "खेत की स्थिति",
    soil_moisture: "मिट्टी की नमी", sunlight: "धूप", soil_quality: "मिट्टी की गुणवत्ता", optimal: "सर्वोत्तम", wind_speed: "हवा की गति",
    coverage_details: "कवरेज विवरण", total_insured_value: "कुल बीमित मूल्य", area: "क्षेत्र", risk: "जोखिम", low: "कम",
    mostly_cloudy: "ज्यादातर बादल", wind: "हवा", humidity: "नमी", precip: "बारिश", mon: "सोम", tue: "मंगल", wed: "बुध", thu: "गुरु", fri: "शुक्र",
    five_day_forecast: "5-दिवसीय पूर्वानुमान", weather_insights: "मौसम अंतर्दृष्टि", dry_spell_expected: "शुष्क मौसम की संभावना",
    no_rainfall_expected: "बारिश की उम्मीद नहीं है", thermal_warning: "थर्मल चेतावनी", high_temp_warning: "उच्च तापमान की चेतावनी",
    impact_on_crop: "फसल पर प्रभाव", detected: "पता चला", action_required: "कार्रवाई आवश्यक", irrigation_recommended: "सिंचाई की सिफारिश",
    irrigation_desc: "शाम की सिंचाई शुरू करें", low_risk: "कम जोखिम", pest_disease: "कीट और रोग", pest_desc: "फंगल विकास का कम जोखिम",
    growth_conditions: "विकास की स्थिति", growth_desc: "पोषक तत्वों के अवशोषण के लिए उत्कृष्ट", file_crop_claim: "फसल का दावा दायर करें",
    file_claim_desc: "नई क्षति रिपोर्ट प्रस्तुत करें", offline_mode_active: "ऑफलाइन मोड सक्रिय", offline_mode_desc: "दावे स्थानीय रूप से सहेजे जाएंगे",
    damage_type: "नुकसान का प्रकार", damage_placeholder: "जैसे सूखा, ओलावृष्टि, कीट", description_optional: "विवरण (वैकल्पिक)",
    desc_placeholder: "संक्षेप में क्षति का वर्णन करें...", upload_evidence: "सबूत अपलोड करें", image_selected: "फोटो चुनी गई ✓",
    click_to_upload: "सैटेलाइट या फील्ड इमेज अपलोड करने के लिए क्लिक करें", upload_limits: "PNG, JPG, 10MB तक", submitting: "जमा किया जा रहा है...",
    submit_claim: "दावा जमा करें", instant_decision: "तत्काल निर्णय", offline_estimate: "ऑफलाइन अनुमान",
    estimated_status: "अनुमानित स्थिति", approved: "स्वीकृत", amount: "राशि", go_to_claims: "दावों पर जाएं", close: "बंद करें",
    my_claims: "मेरे दावे", total_claims_filed: "कुल दायर दावे", all: "सभी", rejected: "अस्वीकृत", no_data: "कोई दावा नहीं मिला",
    status: "स्थिति", detailed_status_desc: "विस्तृत स्थिति रिपोर्ट", overview: "अवलोकन", claim_amount: "दावा राशि", date: "तारीख",
    intelligence_analysis: "खुफिया विश्लेषण", damage_estimate: "क्षति अनुमान", fraud_score: "धोखाधड़ी स्कोर",
    explanation: "स्पष्टीकरण", no_explanation: "कोई स्पष्टीकरण नहीं दिया गया", timeline: "समयरेखा", claim_approved: "दावा स्वीकृत",
    processing: "प्रसंस्करण", verification: "सत्यापन", submitted: "प्रस्तुत किया गया", payment_status: "भुगतान की स्थिति",
    disbursed: "संवितरित", settlement_complete: "निपटान पूरा", settings: "सेटिंग्स", account_label: "खाता",
    preferences: "प्राथमिकताएं", language: "भाषा", select_language: "भाषा चुनें", english: "अंग्रेजी", hindi: "हिंदी",
    kannada: "कन्नड़", marathi: "मराठी", telugu: "तेलुगु", tamil: "तमिल", appearance: "दिखावट", dark_mode: "डार्क मोड",
    notifications_label: "सूचनाएं", alerts_updates: "अलर्ट और अपडेट", data_sync: "डेटा सिंक",
    last_synced: "अभी सिंक हुआ", sync_now: "अभी सिंक करें", about: "के बारे में", kisanclaim: "किसानक्लेम", version: "संस्करण 2.4.0",
    powered_by: "द्वारा संचालित", logout: "लॉगआउट",
    smart_crop: "आधुनिक किसानों के लिए स्मार्ट फसल निगरानी और बीमा।", live_yield: "लाइव उपज", risk_index: "जोხिम सूचकांक",
    error_fetching_data: "डेटा प्राप्त करने में त्रुटि। कृपया पुनः प्रयास करें।", retry: "पुनः प्रयास करें", ai_insights: "एआई अंतर्दृष्टि",
    veg_index: "वनस्पति सूचकांक इस सप्ताह 4% ऊपर है।", risk_profile_low: "जोखिम प्रोफ़ाइल कम बनी हुई है।",
    thermal_warning_desc: "क्षेत्र में उच्च थर्मल तनाव का पता चला है।", irrigation_rec: "सिंचाई की सिफारिश की गई",
    secure_login: "सुरक्षित लॉगिन", error_credentials: "नाम और वैध फोन नंबर आवश्यक हैं।",
    error_otp: "कृपया ओटीपी दर्ज करें।", error_invalid_otp: "अवैध ओटीपी। कृपया पुनः प्रयास करें।",
    exit: "बाहर निकलें", full_name: "पूरा नाम", enter_credentials: "अपना पूरा नाम दर्ज करें", aadhaar_id: "आधार आईडी",
    demo_otp_received: "डेमो ओटीपी प्राप्त हुआ", enter_verification_code: "सत्यापन कोड दर्ज करें", verify_login: "सत्यापित करें और लॉगिन करें",
    authorized_access_only: "केवल अधिकृत पहुंच", terms_conditions: "नियम और शर्तें", secure_access: "सुरक्षित पहुंच",
    last_updated: "अंतिम अपडेट"
  }
};

// Simplified translation for other languages
['kn', 'mr', 'te', 'ta'].forEach(langCode => {
  languages[langCode] = JSON.parse(JSON.stringify(languages.hi)); 
  if (langCode === 'kn') languages[langCode].welcome_title = "ಕಿಸಾನ್‌ಕ್ಲೈಮ್";
  if (langCode === 'mr') languages[langCode].welcome_title = "किसानक्लेम";
  if (langCode === 'te') languages[langCode].welcome_title = "కిసాన్ క్లెయిమ్";
  if (langCode === 'ta') languages[langCode].welcome_title = "கிசான் க்ளைம்";
});

Object.keys(languages).forEach((lang) => {
  const filePath = path.join(localesDir, `${lang}.json`);
  fs.writeFileSync(filePath, JSON.stringify(languages[lang], null, 2));
  console.log(`Generated ${lang}.json`);
});
