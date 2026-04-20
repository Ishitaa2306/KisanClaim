import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ScrollView } from 'react-native';
import { useTranslation } from 'react-i18next';
import { User, LogOut, Globe } from 'lucide-react-native';
import { COLORS } from '../utils/constants';

const SettingsScreen = ({ navigation }) => {
  const { t, i18n } = useTranslation();
  const [currentLang, setCurrentLang] = useState(i18n.language);

  const switchLanguage = (lang) => {
    i18n.changeLanguage(lang);
    setCurrentLang(lang);
  };

  const handleLogout = () => {
    Alert.alert("Logout", "You have been logged out.", [
      { text: "OK", onPress: () => navigation.navigate("HomeTab") }
    ]);
  };

  const languages = [
    { code: 'en', label: 'English' },
    { code: 'hi', label: 'हिंदी (Hindi)' },
    { code: 'mr', label: 'मराठी (Marathi)' },
    { code: 'ta', label: 'தமிழ் (Tamil)' },
    { code: 'te', label: 'తెలుగు (Telugu)' }
  ];

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{t('settings')}</Text>
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <User color={COLORS.textLight} size={20} />
          <Text style={styles.sectionTitle}>{t('profile_info')}</Text>
        </View>
        <View style={styles.card}>
          <Text style={styles.value}>FMR-0001</Text>
          <Text style={styles.label}>Demo Account</Text>
        </View>
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Globe color={COLORS.textLight} size={20} />
          <Text style={styles.sectionTitle}>{t('language_selector')}</Text>
        </View>
        
        <View style={styles.card}>
          {languages.map((lang) => (
            <TouchableOpacity 
              key={lang.code}
              style={[
                styles.langRow, 
                currentLang === lang.code && styles.langRowActive
              ]}
              onPress={() => switchLanguage(lang.code)}
            >
              <Text style={[
                styles.langText,
                currentLang === lang.code && styles.langTextActive
              ]}>
                {lang.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
        <LogOut color={COLORS.danger} size={24} />
        <Text style={styles.logoutText}>{t('logout')}</Text>
      </TouchableOpacity>
      
      <View style={{height: 40}} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: { padding: 20, paddingTop: 60, backgroundColor: COLORS.primary },
  title: { fontSize: 24, fontWeight: 'bold', color: 'white' },
  section: { padding: 20 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: COLORS.text, marginLeft: 10 },
  card: {
    backgroundColor: COLORS.card,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  label: { fontSize: 14, color: COLORS.textLight, marginTop: 4 },
  value: { fontSize: 18, fontWeight: 'bold', color: COLORS.text },
  langRow: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  langRowActive: {
    backgroundColor: COLORS.primary + '10',
    borderRadius: 8,
    borderBottomWidth: 0,
    paddingHorizontal: 12
  },
  langText: { fontSize: 16, color: COLORS.text },
  langTextActive: { color: COLORS.primary, fontWeight: 'bold' },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 20,
    marginTop: 20,
    backgroundColor: COLORS.card,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.danger,
  },
  logoutText: { color: COLORS.danger, fontSize: 18, fontWeight: 'bold', marginLeft: 10 }
});

export default SettingsScreen;
