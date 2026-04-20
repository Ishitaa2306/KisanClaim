import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, RefreshControl } from 'react-native';
import { useTranslation } from 'react-i18next';
import { FileText, Activity, LayoutGrid, CloudRain } from 'lucide-react-native';
import apiClient from '../api/client';
import { FARMER_ID, COLORS } from '../utils/constants';

const HomeScreen = ({ navigation }) => {
  const { t } = useTranslation();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const fetchFarmerData = async () => {
    try {
      const response = await apiClient.get(`/farmer/${FARMER_ID}`);
      setData(response.data.data);
      setError(null);
    } catch (err) {
      console.log('Error fetching farmer data:', err);
      setError(t('error'));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchFarmerData();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchFarmerData();
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>{t('loading')}</Text>
      </View>
    );
  }

  if (error || !data) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>{error || t('no_data')}</Text>
        <TouchableOpacity style={styles.retryBtn} onPress={fetchFarmerData}>
          <Text style={styles.retryText}>{t('success')} (Retry)</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const primaryFarm = data.farms && data.farms.length > 0 ? data.farms[0] : null;

  return (
    <ScrollView 
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      <View style={styles.header}>
        <Text style={styles.greeting}>{t('farmer_name')},</Text>
        <Text style={styles.name}>{data.name}</Text>
      </View>

      {/* Farm Summary Card */}
      {primaryFarm && (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>{t('farm_summary')}</Text>
          <View style={styles.row}>
            <View>
              <Text style={styles.label}>{t('crop_type')}</Text>
              <Text style={styles.value}>{primaryFarm.cropType}</Text>
            </View>
            <View>
              <Text style={styles.label}>{t('location')}</Text>
              <Text style={styles.value}>{primaryFarm.location.district}</Text>
            </View>
          </View>
          
          <View style={styles.healthContainer}>
            <Text style={styles.label}>{t('health_indicator')}</Text>
            <View style={[styles.badge, styles[`badge_${primaryFarm.riskLevel}`] || styles.badge_low]}>
              <Text style={styles.badgeText}>{primaryFarm.riskLevel.toUpperCase()}</Text>
            </View>
          </View>
        </View>
      )}

      {/* Latest Claim */}
      {data.activeClaims && data.activeClaims.length > 0 && (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>{t('latest_claim')}</Text>
          <View style={styles.row}>
            <View>
              <Text style={styles.label}>Claim ID</Text>
              <Text style={styles.value}>{data.activeClaims[0].claimId}</Text>
            </View>
            <View>
              <Text style={styles.label}>{t('status')}</Text>
              <Text style={[styles.value, { color: COLORS.warning }]}>{data.activeClaims[0].status}</Text>
            </View>
          </View>
        </View>
      )}

      {/* Quick Actions */}
      <Text style={styles.sectionTitle}>{t('quick_actions')}</Text>
      <View style={styles.grid}>
        <TouchableOpacity style={styles.actionCard} onPress={() => navigation.navigate('FileClaimTab')}>
          <FileText color={COLORS.primary} size={32} />
          <Text style={styles.actionText}>{t('file_claim')}</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.actionCard} onPress={() => navigation.navigate('StatusTab')}>
          <Activity color={COLORS.primary} size={32} />
          <Text style={styles.actionText}>{t('view_status')}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionCard} onPress={() => navigation.navigate('MyFarmTab')}>
          <LayoutGrid color={COLORS.primary} size={32} />
          <Text style={styles.actionText}>{t('my_farm')}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionCard} onPress={() => {
          if (primaryFarm) {
            navigation.navigate('Weather', { location: primaryFarm.location.state });
          }
        }}>
          <CloudRain color={COLORS.primary} size={32} />
          <Text style={styles.actionText}>{t('weather')}</Text>
        </TouchableOpacity>
      </View>
      
      {/* Spacer */}
      <View style={{height: 40}} /> 
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background, padding: 16 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.background },
  header: { marginTop: 40, marginBottom: 20 },
  greeting: { fontSize: 16, color: COLORS.textLight },
  name: { fontSize: 24, fontWeight: 'bold', color: COLORS.text },
  card: { 
    backgroundColor: COLORS.card, 
    borderRadius: 12, 
    padding: 16, 
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  cardTitle: { fontSize: 18, fontWeight: '600', marginBottom: 12, color: COLORS.text },
  row: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 },
  label: { fontSize: 14, color: COLORS.textLight, marginBottom: 4 },
  value: { fontSize: 16, fontWeight: '500', color: COLORS.text },
  healthContainer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderTopWidth: 1, borderTopColor: COLORS.border, paddingTop: 12 },
  badge: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16 },
  badge_low: { backgroundColor: COLORS.primary + '20' },
  badge_medium: { backgroundColor: COLORS.warning + '20' },
  badge_high: { backgroundColor: COLORS.danger + '20' },
  badgeText: { fontWeight: '700', fontSize: 12 },
  sectionTitle: { fontSize: 18, fontWeight: '600', marginTop: 8, marginBottom: 12, color: COLORS.text },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  actionCard: { 
    backgroundColor: COLORS.card, 
    width: '48%', 
    padding: 20, 
    borderRadius: 12, 
    alignItems: 'center', 
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  actionText: { marginTop: 8, fontWeight: '500', color: COLORS.text },
  loadingText: { marginTop: 12, color: COLORS.textLight },
  errorText: { color: COLORS.danger, marginBottom: 16 },
  retryBtn: { backgroundColor: COLORS.primary, paddingHorizontal: 20, paddingVertical: 10, borderRadius: 8 },
  retryText: { color: 'white', fontWeight: 'bold' }
});

export default HomeScreen;
