import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, RefreshControl } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Bell, AlertTriangle, Info } from 'lucide-react-native';
import apiClient from '../api/client';
import { FARMER_ID, COLORS } from '../utils/constants';

const NotificationsScreen = () => {
  const { t } = useTranslation();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchNotifications = async () => {
    try {
      const response = await apiClient.get(`/notifications/${FARMER_ID}`);
      setNotifications(response.data.data.all || []);
    } catch (err) {
      console.log('Error fetching notifications:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchNotifications();
  };

  const getIcon = (type) => {
    if (type === 'alert' || type === 'weather_warning') return <AlertTriangle color={COLORS.danger} size={24} />;
    if (type === 'claim_update') return <Info color={COLORS.primary} size={24} />;
    return <Bell color={COLORS.textLight} size={24} />;
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
      <FlatList
        data={notifications}
        keyExtractor={item => item.id}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        contentContainerStyle={{ padding: 16 }}
        ListEmptyComponent={<Text style={styles.emptyText}>{t('no_data')}</Text>}
        renderItem={({ item }) => (
          <View style={[styles.card, !item.read && styles.unreadCard]}>
            <View style={styles.iconContainer}>
              {getIcon(item.type)}
            </View>
            <View style={styles.content}>
              <Text style={styles.message}>{item.message}</Text>
              <Text style={styles.time}>{new Date(item.timestamp).toLocaleString()}</Text>
            </View>
          </View>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  card: {
    backgroundColor: COLORS.card,
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 1,
  },
  unreadCard: {
    borderLeftWidth: 4,
    borderLeftColor: COLORS.primary
  },
  iconContainer: { marginRight: 16 },
  content: { flex: 1 },
  message: { fontSize: 14, color: COLORS.text, fontWeight: '500', lineHeight: 20 },
  time: { fontSize: 12, color: COLORS.textLight, marginTop: 8 },
  emptyText: { textAlign: 'center', marginTop: 40, color: COLORS.textLight, fontSize: 16 }
});

export default NotificationsScreen;
