/**
 * Screen 2: Family Setup
 * Configure relationship, upload media, review processing status.
 */
import React, { useState } from 'react';
import {
  View, Text, StyleSheet, SafeAreaView, ScrollView,
  TouchableOpacity, TextInput, Alert, ActivityIndicator,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import { Colors } from '../../constants/Colors';
import { Typography, Spacing, BorderRadius } from '../../constants/Typography';
import { apiClient } from '../../services/api';

export default function SetupScreen() {
  const [relationship, setRelationship] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<string | null>(null);

  const RELATIONSHIPS = [
    'grandson', 'granddaughter', 'son', 'daughter',
    'son-in-law', 'daughter-in-law', 'great-grandchild', 'other',
  ];

  const uploadFile = async (uri: string, name: string, type: string) => {
    setIsUploading(true);
    setUploadStatus(null);
    try {
      const formData = new FormData();
      formData.append('file', { uri, name, type } as unknown as Blob);

      const response = await fetch(
        `${process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000'}/media`,
        {
          method: 'POST',
          body: formData,
          // Token handled by apiClient but FormData needs separate fetch
        }
      );

      if (response.ok) {
        setUploadStatus('✅ Uploaded successfully. Processing will begin shortly.');
      } else {
        setUploadStatus('❌ Upload failed. Please try again.');
      }
    } catch {
      setUploadStatus('❌ Upload failed. Check your connection.');
    } finally {
      setIsUploading(false);
    }
  };

  const pickPhoto = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Please allow photo access to upload family photographs.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.9,
    });
    if (!result.canceled && result.assets[0]) {
      const asset = result.assets[0];
      await uploadFile(asset.uri, asset.fileName || 'photo.jpg', asset.mimeType || 'image/jpeg');
    }
  };

  const pickDocument = async () => {
    const result = await DocumentPicker.getDocumentAsync({
      type: ['audio/*', 'video/*', 'application/pdf'],
      copyToCacheDirectory: true,
    });
    if (!result.canceled && result.assets[0]) {
      const asset = result.assets[0];
      await uploadFile(asset.uri, asset.name, asset.mimeType || 'audio/mpeg');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>🖼 Family Setup</Text>
        <Text style={styles.subtitle}>Configure your connection and add family materials</Text>

        {/* Relationship */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Your Relationship</Text>
          <Text style={styles.sectionDesc}>
            How are you related to your grandmother? This helps personalise how she addresses you.
          </Text>
          <View style={styles.chipGrid}>
            {RELATIONSHIPS.map(r => (
              <TouchableOpacity
                key={r}
                style={[styles.chip, relationship === r && styles.chipActive]}
                onPress={() => setRelationship(r)}
              >
                <Text style={[styles.chipText, relationship === r && styles.chipTextActive]}>
                  {r}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Media Upload */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Upload Family Materials</Text>
          <Text style={styles.sectionDesc}>
            All files are stored privately. They will be used to help the AI reflect her
            personality and voice. No files are made public or shared without your knowledge.
          </Text>

          <View style={styles.uploadCard}>
            <Text style={styles.uploadCardTitle}>📷 Photographs</Text>
            <Text style={styles.uploadCardDesc}>
              Upload clear photographs of your grandmother. These will be used for the portrait display.
            </Text>
            <TouchableOpacity
              style={[styles.uploadButton, isUploading && styles.uploadButtonDisabled]}
              onPress={pickPhoto}
              disabled={isUploading}
            >
              <Text style={styles.uploadButtonText}>Select Photo</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.uploadCard}>
            <Text style={styles.uploadCardTitle}>🎙 Audio / Video Recordings</Text>
            <Text style={styles.uploadCardDesc}>
              Recordings of her voice will be transcribed, used to build her dialect profile,
              and (if family and provider consent is obtained) used to recreate her voice.
            </Text>
            <TouchableOpacity
              style={[styles.uploadButton, isUploading && styles.uploadButtonDisabled]}
              onPress={pickDocument}
              disabled={isUploading}
            >
              <Text style={styles.uploadButtonText}>Select Recording</Text>
            </TouchableOpacity>
          </View>

          {isUploading && (
            <View style={styles.uploadStatus}>
              <ActivityIndicator color={Colors.primary} />
              <Text style={styles.uploadStatusText}>Uploading...</Text>
            </View>
          )}

          {uploadStatus && (
            <View style={styles.uploadStatus}>
              <Text style={styles.uploadStatusText}>{uploadStatus}</Text>
            </View>
          )}
        </View>

        {/* Privacy note */}
        <View style={styles.privacyNote}>
          <Text style={styles.privacyNoteTitle}>🔒 Privacy</Text>
          <Text style={styles.privacyNoteText}>
            Uploaded files are stored on a private server. They are never publicly accessible.
            You can delete any file from this app at any time. See Settings for full data controls.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { padding: Spacing.md, paddingTop: Spacing.lg, paddingBottom: Spacing['3xl'] },
  title: {
    fontSize: Typography.fontSize.xl,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.textPrimary,
  },
  subtitle: {
    fontSize: Typography.fontSize.sm,
    color: Colors.textMuted,
    marginTop: 4,
    marginBottom: Spacing.lg,
  },
  section: {
    marginBottom: Spacing.lg,
  },
  sectionTitle: {
    fontSize: Typography.fontSize.md,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.textPrimary,
    marginBottom: Spacing.xs,
  },
  sectionDesc: {
    fontSize: Typography.fontSize.sm,
    color: Colors.textSecondary,
    lineHeight: 20,
    marginBottom: Spacing.md,
  },
  chipGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.xs,
  },
  chip: {
    borderRadius: BorderRadius.full,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    backgroundColor: Colors.backgroundCard,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  chipActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  chipText: {
    fontSize: Typography.fontSize.sm,
    color: Colors.textSecondary,
  },
  chipTextActive: {
    color: Colors.textOnPrimary,
    fontWeight: Typography.fontWeight.semibold,
  },
  uploadCard: {
    backgroundColor: Colors.backgroundCard,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  uploadCardTitle: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  uploadCardDesc: {
    fontSize: Typography.fontSize.sm,
    color: Colors.textSecondary,
    lineHeight: 19,
    marginBottom: Spacing.md,
  },
  uploadButton: {
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.md,
    padding: Spacing.sm,
    alignItems: 'center',
  },
  uploadButtonDisabled: { opacity: 0.5 },
  uploadButtonText: {
    color: Colors.textOnPrimary,
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.semibold,
  },
  uploadStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    padding: Spacing.sm,
  },
  uploadStatusText: {
    fontSize: Typography.fontSize.sm,
    color: Colors.textSecondary,
  },
  privacyNote: {
    backgroundColor: '#F0F7FF',
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: '#C5DAEE',
  },
  privacyNoteTitle: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  privacyNoteText: {
    fontSize: Typography.fontSize.sm,
    color: Colors.textSecondary,
    lineHeight: 19,
  },
});
