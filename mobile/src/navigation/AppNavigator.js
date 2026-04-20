import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Home, LayoutGrid, FileText, CheckCircle, Settings } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';

// Screens
import HomeScreen from '../screens/HomeScreen';
import MyFarmScreen from '../screens/MyFarmScreen';
import FileClaimScreen from '../screens/FileClaimScreen';
import ClaimStatusScreen from '../screens/ClaimStatusScreen';
import SettingsScreen from '../screens/SettingsScreen';
import ClaimDetailsScreen from '../screens/ClaimDetailsScreen';
import WeatherScreen from '../screens/WeatherScreen';
import NotificationsScreen from '../screens/NotificationsScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

const BottomTabs = () => {
  const { t } = useTranslation();

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#16a34a', // Green
        tabBarInactiveTintColor: '#6b7280', // Gray
        tabBarStyle: { paddingBottom: 5, paddingTop: 5, height: 60 },
      }}
    >
      <Tab.Screen 
        name="HomeTab" 
        component={HomeScreen} 
        options={{
          title: t('home'),
          tabBarIcon: ({ color, size }) => <Home color={color} size={size} />
        }} 
      />
      <Tab.Screen 
        name="MyFarmTab" 
        component={MyFarmScreen} 
        options={{
          title: t('my_farm'),
          tabBarIcon: ({ color, size }) => <LayoutGrid color={color} size={size} />
        }} 
      />
      <Tab.Screen 
        name="FileClaimTab" 
        component={FileClaimScreen} 
        options={{
          title: t('file_claim'),
          tabBarIcon: ({ color, size }) => <FileText color={color} size={size} />
        }} 
      />
      <Tab.Screen 
        name="StatusTab" 
        component={ClaimStatusScreen} 
        options={{
          title: t('status'),
          tabBarIcon: ({ color, size }) => <CheckCircle color={color} size={size} />
        }} 
      />
      <Tab.Screen 
        name="SettingsTab" 
        component={SettingsScreen} 
        options={{
          title: t('settings'),
          tabBarIcon: ({ color, size }) => <Settings color={color} size={size} />
        }} 
      />
    </Tab.Navigator>
  );
};

export default function AppNavigator() {
  const { t } = useTranslation();
  
  return (
    <Stack.Navigator screenOptions={{ headerBackTitleVisible: false, headerTintColor: '#16a34a' }}>
      <Stack.Screen name="MainTabs" component={BottomTabs} options={{ headerShown: false }} />
      <Stack.Screen name="ClaimDetails" component={ClaimDetailsScreen} options={{ title: 'Claim Details' }} />
      <Stack.Screen name="Weather" component={WeatherScreen} options={{ title: t('weather') }} />
      <Stack.Screen name="Notifications" component={NotificationsScreen} options={{ title: 'Notifications' }} />
    </Stack.Navigator>
  );
}
