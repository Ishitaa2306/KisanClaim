import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, RefreshControl } from 'react-native';
import { useTranslation } from 'react-i18next';
import apiClient from '../api/client';
import { FARMER_ID, COLORS } from '../utils/constants';

const MyFarmScreen = () => {
  const { t } = useTranslation();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchFarmData = async () => {
    try {
      // First get farmer to get their linked farm ID
      const farmerRes = await apiClient.get(`/farmer/${FARMER_ID}`);
      const farmerData = farmerRes.data.data;
      if (farmerData.linkedFarmIds && farmerData.linkedFarmIds.length > 0) {
        const farmRes = await apiClient.get(`/farm/${farmerData.linkedFarmIds[0]}`);
        setData(farmRes.data.data);
      }
    } catch (err) {
      console.log('Error fetching farm data:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchFarmData();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchFarmData();
  };

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

  // Determine health color base on severity
  let healthColor = COLORS.primary;
  if (data.severity === 'high' || data.severity === 'severe') healthColor = COLORS.danger;
  else if (data.severity === 'moderate') healthColor = COLORS.warning;

  return (
    <ScrollView 
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      <View style={styles.header}>
        <Text style={styles.title}>{t('my_farm')}</Text>
      </View>

      <View style={styles.card}>
        {/* Large Health Indicator */}
        <View style={styles.healthVisual}>
          <View style={[styles.blob, { backgroundColor: healthColor }]} />
          <Text style={styles.healthStatusText}>{data.severity.toUpperCase()}</Text>
        </View>

        <View style={styles.divider} />

        <View style={styles.row}>
          <Text style={styles.label}>{t('crop_type')}</Text>
          <Text style={styles.value}>{data.cropType}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>{t('location')}</Text>
          <Text style={styles.value}>{data.location.district}, {data.location.state}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>{t('farm_area')}</Text>
          <Text style={styles.value}>{data.areaAcres} Aces</Text>
        </View>
        
        <View style={styles.divider} />
        
        <View style={styles.row}>
          <Text style={styles.label}>{t('ndvi_before_after')}</Text>
          <Text style={styles.value}>{data.ndviBefore} / {data.ndviAfter}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>{t('damage_percent')}</Text>
          <Text style={[styles.value, { color: healthColor, fontWeight: 'bold' }]}>
            {data.damagePercentage}%
          </Text>
        </View>
      </View>

    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { padding: 20, paddingTop: 60, backgroundColor: COLORS.primary },
  title: { fontSize: 24, fontWeight: 'bold', color: 'white' },
  card: {
    backgroundColor: COLORS.card,
    margin: 16,
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 3,
  },
  healthVisual: { alignItems: 'center', marginBottom: 20 },
  blob: { width: 80, height: 80, borderRadius: 40, marginBottom: 12 },
  healthStatusText: { fontSize: 18, fontWeight: 'bold', color: COLORS.text },
  divider: { height: 1, backgroundColor: COLORS.border, marginVertical: 16 },
  row: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  label: { fontSize: 16, color: COLORS.textLight },
  value: { fontSize: 16, fontWeight: '500', color: COLORS.text },
});

export default MyFarmScreen;
