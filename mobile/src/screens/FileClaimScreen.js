import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, ScrollView, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { useTranslation } from 'react-i18next';
import { ImagePlus } from 'lucide-react-native';
import apiClient from '../api/client';
import { FARMER_ID, COLORS } from '../utils/constants';

const FileClaimScreen = ({ navigation }) => {
  const { t } = useTranslation();
  const [data, setData] = useState(null);
  const [damageType, setDamageType] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchFarmerData();
  }, []);

  const fetchFarmerData = async () => {
    try {
      const response = await apiClient.get(`/farmer/${FARMER_ID}`);
      setData(response.data.data);
    } catch (err) {
      console.log('Error fetching farm for claim:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleImagePickerMock = () => {
    Alert.alert("Image Upload", "This is a demo. We are mocking the image upload feature.");
  };

  const handleSubmit = async () => {
    if (!damageType) {
      Alert.alert(t('error'), "Please specify damage type.");
      return;
    }
    
    if (!data || !data.linkedFarmIds || data.linkedFarmIds.length === 0) {
      Alert.alert(t('error'), "No linked farm found.");
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        farmerId: FARMER_ID,
        farmId: data.linkedFarmIds[0],
        damageType,
        description,
        images: ["https://images.unsplash.com/photo-1583245553131-0e7d36409271"] // Mock image
      };
      
      const response = await apiClient.post('/claim', payload);
      Alert.alert(t('success'), `${t('claim_submitted')}\nID: ${response.data.data.claimId}`, [
        { text: "OK", onPress: () => {
          setDamageType('');
          setDescription('');
          navigation.navigate('StatusTab'); 
        }}
      ]);
    } catch (err) {
      console.log(err);
      const backendError = err.response?.data?.message || err.response?.data?.error || err.message;
      Alert.alert(t('error'), backendError || "Failed to submit claim.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{t('file_claim')}</Text>
      </View>

      <View style={styles.formContainer}>
        <Text style={styles.label}>{t('damage_type')}</Text>
        <TextInput 
          style={styles.input}
          placeholder="e.g. Drought, Hailstorm, Pest Attack"
          value={damageType}
          onChangeText={setDamageType}
        />

        <Text style={styles.label}>{t('description')}</Text>
        <TextInput 
          style={[styles.input, styles.textArea]}
          placeholder="Describe the damage..."
          multiline
          numberOfLines={4}
          value={description}
          onChangeText={setDescription}
        />

        <Text style={styles.label}>{t('upload_images')}</Text>
        <TouchableOpacity style={styles.imageUploadBtn} onPress={handleImagePickerMock}>
          <ImagePlus color={COLORS.primary} size={32} />
          <Text style={styles.imageUploadText}>Tap to upload photos</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.submitBtn, submitting && styles.submitBtnDisabled]} 
          onPress={handleSubmit}
          disabled={submitting}
        >
          {submitting ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text style={styles.submitBtnText}>{t('submit')}</Text>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { padding: 20, paddingTop: 60, backgroundColor: COLORS.primary },
  title: { fontSize: 24, fontWeight: 'bold', color: 'white' },
  formContainer: { padding: 20 },
  label: { fontSize: 16, fontWeight: '600', color: COLORS.text, marginBottom: 8, marginTop: 16 },
  input: {
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: COLORS.text
  },
  textArea: { height: 100, textAlignVertical: 'top' },
  imageUploadBtn: {
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderStyle: 'dashed',
    borderRadius: 8,
    padding: 30,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    marginTop: 8
  },
  imageUploadText: { color: COLORS.textLight, marginTop: 12 },
  submitBtn: {
    backgroundColor: COLORS.primary,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20
  },
  submitBtnDisabled: { opacity: 0.7 },
  submitBtnText: { color: 'white', fontSize: 18, fontWeight: 'bold' }
});

export default FileClaimScreen;
