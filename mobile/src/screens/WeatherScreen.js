import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { useTranslation } from 'react-i18next';
import { CloudRain, Thermometer, Droplets } from 'lucide-react-native';
import apiClient from '../api/client';
import { COLORS } from '../utils/constants';

const WeatherScreen = ({ route }) => {
  const { location } = route.params || { location: 'Local Area' };
  const { t } = useTranslation();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWeather = async () => {
      try {
        const response = await apiClient.get(`/weather/${location}`);
        setData(response.data.data);
      } catch (err) {
        console.log('Error fetching weather:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchWeather();
  }, [location]);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  if (!data) {
    return (
      <View style={styles.center}>
        <Text>{t('no_data')}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{location}</Text>
        <Text style={styles.subtitle}>{data.condition}</Text>
      </View>
      
      <View style={styles.card}>
        <View style={styles.grid}>
          <View style={styles.statContainer}>
            <Thermometer color={COLORS.primary} size={40} />
            <Text style={styles.statValue}>{data.temperature}°C</Text>
            <Text style={styles.statLabel}>{t('temperature')}</Text>
          </View>
          
          <View style={styles.statContainer}>
            <CloudRain color={COLORS.primary} size={40} />
            <Text style={styles.statValue}>{data.rainfall} mm</Text>
            <Text style={styles.statLabel}>{t('rainfall')}</Text>
          </View>
          
          <View style={styles.statContainer}>
            <Droplets color={COLORS.primary} size={40} />
            <Text style={styles.statValue}>{data.humidity}%</Text>
            <Text style={styles.statLabel}>{t('humidity')}</Text>
          </View>
        </View>
        
        <View style={styles.divider} />
        
        <Text style={styles.forecastText}>{data.forecast}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.primary },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { padding: 40, alignItems: 'center' },
  title: { fontSize: 32, fontWeight: 'bold', color: 'white' },
  subtitle: { fontSize: 18, color: 'rgba(255,255,255,0.8)', marginTop: 8 },
  card: {
    backgroundColor: COLORS.card,
    flex: 1,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    padding: 30,
    alignItems: 'center',
  },
  grid: { flexDirection: 'row', justifyContent: 'space-between', width: '100%', marginBottom: 30 },
  statContainer: { alignItems: 'center', width: '30%' },
  statValue: { fontSize: 20, fontWeight: 'bold', color: COLORS.text, marginTop: 12 },
  statLabel: { fontSize: 14, color: COLORS.textLight, marginTop: 4 },
  divider: { height: 1, backgroundColor: COLORS.border, width: '100%', marginVertical: 20 },
  forecastText: { fontSize: 16, color: COLORS.text, fontStyle: 'italic', textAlign: 'center' }
});

export default WeatherScreen;
