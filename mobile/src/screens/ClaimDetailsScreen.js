import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { useTranslation } from 'react-i18next';
import apiClient from '../api/client';
import { COLORS } from '../utils/constants';

const ClaimDetailsScreen = ({ route }) => {
  const { claimId } = route.params;
  const { t } = useTranslation();
  const [claim, setClaim] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchClaimDetails = async () => {
      try {
        const response = await apiClient.get(`/claim/${claimId}`);
        setClaim(response.data.data);
      } catch (err) {
        console.log('Error fetching claim details:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchClaimDetails();
  }, [claimId]);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  if (!claim) {
    return (
      <View style={styles.center}>
        <Text>{t('no_data')}</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Overview</Text>
        <View style={styles.row}>
          <Text style={styles.label}>Claim ID</Text>
          <Text style={styles.value}>{claim.claimId}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>{t('status')}</Text>
          <Text style={styles.value}>{claim.status}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>{t('damage_type')}</Text>
          <Text style={styles.value}>{claim.damageType}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>{t('claim_amount')}</Text>
          <Text style={[styles.value, {color: COLORS.primary, fontWeight: 'bold'}]}>
            ₹{claim.claimAmount?.toLocaleString()}
          </Text>
        </View>
      </View>

      {claim.explanation && (
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Intelligence Analysis</Text>
          <View style={styles.row}>
            <Text style={styles.label}>{t('damage_percent')}</Text>
            <Text style={styles.value}>{claim.explanation.ndviDrop}%</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>{t('fraud_score')}</Text>
            <Text style={styles.value}>{claim.fraudAnalysis?.fraudScore || 'N/A'}/100</Text>
          </View>
          <View style={styles.divider} />
          <Text style={styles.label}>{t('explanation')}</Text>
          <Text style={styles.paragraph}>{claim.explanation.reason}</Text>
          <View style={styles.divider} />
          <View style={styles.row}>
            <Text style={styles.label}>{t('decision')}</Text>
            <Text style={styles.value}>{claim.explanation.decision}</Text>
          </View>
        </View>
      )}

      {claim.timeline && claim.timeline.length > 0 && (
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>{t('timeline')}</Text>
          {claim.timeline.map((item, index) => (
            <View key={index} style={styles.timelineItem}>
              <View style={styles.timelineDot} />
              <View style={styles.timelineContent}>
                <Text style={styles.timelineAction}>{item.action}</Text>
                <Text style={styles.timelineDetail}>{item.detail}</Text>
                <Text style={styles.timelineTime}>{new Date(item.timestamp).toLocaleString()}</Text>
              </View>
            </View>
          ))}
        </View>
      )}
      <View style={{height: 40}}/>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background, padding: 16 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
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
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: COLORS.text, marginBottom: 16 },
  row: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  label: { color: COLORS.textLight, fontSize: 14 },
  value: { color: COLORS.text, fontSize: 14, fontWeight: '500' },
  divider: { height: 1, backgroundColor: COLORS.border, marginVertical: 12 },
  paragraph: { color: COLORS.text, fontSize: 14, lineHeight: 20, marginTop: 4 },
  timelineItem: { flexDirection: 'row', marginBottom: 16 },
  timelineDot: { width: 12, height: 12, borderRadius: 6, backgroundColor: COLORS.primary, marginTop: 4, marginRight: 12 },
  timelineContent: { flex: 1 },
  timelineAction: { fontWeight: 'bold', color: COLORS.text, fontSize: 14 },
  timelineDetail: { color: COLORS.textLight, fontSize: 14, marginTop: 2 },
  timelineTime: { color: COLORS.textLight, fontSize: 12, marginTop: 4 }
});

export default ClaimDetailsScreen;
