import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, RefreshControl } from 'react-native';
import { useTranslation } from 'react-i18next';
import { ChevronRight } from 'lucide-react-native';
import apiClient from '../api/client';
import { FARMER_ID, COLORS } from '../utils/constants';

const ClaimStatusScreen = ({ navigation }) => {
  const { t } = useTranslation();
  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchClaims = async () => {
    try {
      const response = await apiClient.get(`/claims/${FARMER_ID}`);
      setClaims(response.data.data);
    } catch (err) {
      console.log('Error fetching claims:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchClaims();
    // Refresh when focused
    const unsubscribe = navigation.addListener('focus', () => {
      fetchClaims();
    });
    return unsubscribe;
  }, [navigation]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchClaims();
  };

  const getStatusColor = (status) => {
    if (status === 'Pending') return COLORS.warning;
    if (status === 'Approved') return COLORS.primary;
    if (status === 'Rejected') return COLORS.danger;
    return COLORS.textLight;
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{t('status')}</Text>
      </View>

      <FlatList
        data={claims}
        keyExtractor={item => item.claimId}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        contentContainerStyle={{ padding: 16 }}
        ListEmptyComponent={<Text style={styles.emptyText}>{t('no_data')}</Text>}
        renderItem={({ item }) => (
          <TouchableOpacity 
            style={styles.card}
            onPress={() => navigation.navigate('ClaimDetails', { claimId: item.claimId })}
          >
            <View style={styles.cardHeader}>
              <Text style={styles.claimId}>{item.claimId}</Text>
              <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) + '20' }]}>
                <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>{item.status}</Text>
              </View>
            </View>
            
            <View style={styles.row}>
              <Text style={styles.label}>{t('damage_type')}</Text>
              <Text style={styles.value}>{item.damageType}</Text>
            </View>
            
            <View style={styles.row}>
              <Text style={styles.label}>{t('claim_amount')}</Text>
              <Text style={styles.value}>₹{item.claimAmount?.toLocaleString()}</Text>
            </View>

            <View style={styles.chevronRow}>
              <Text style={styles.viewMoreText}>View Details</Text>
              <ChevronRight color={COLORS.primary} size={20} />
            </View>
          </TouchableOpacity>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { padding: 20, paddingTop: 60, backgroundColor: COLORS.primary },
  title: { fontSize: 24, fontWeight: 'bold', color: 'white' },
  card: {
    backgroundColor: COLORS.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, borderBottomWidth: 1, borderBottomColor: COLORS.border, paddingBottom: 12 },
  claimId: { fontSize: 16, fontWeight: 'bold', color: COLORS.text },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  statusText: { fontSize: 12, fontWeight: 'bold' },
  row: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  label: { color: COLORS.textLight, fontSize: 14 },
  value: { color: COLORS.text, fontSize: 14, fontWeight: '500' },
  chevronRow: { flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'center', marginTop: 8 },
  viewMoreText: { color: COLORS.primary, fontSize: 14, fontWeight: '500', marginRight: 4 },
  emptyText: { textAlign: 'center', marginTop: 40, color: COLORS.textLight, fontSize: 16 }
});

export default ClaimStatusScreen;
