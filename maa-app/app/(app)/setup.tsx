/**
 * Screen 2: Family Setup
 * Configure relationship, upload media, review processing status.
 */
import React, { useState, useEffect } from 'react';
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
  const [relationship, setRelationship] = useState('grandson');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<string | null>(null);

  // Transcript ingestion state
  const [transcriptText, setTranscriptText] = useState('');
  const [transcriptSource, setTranscriptSource] = useState('');
  const [isIngestingTranscript, setIsIngestingTranscript] = useState(false);
  const [transcriptResult, setTranscriptResult] = useState<string | null>(null);

  const RELATIONSHIPS = [
    'grandson', 'granddaughter', 'son', 'daughter',
    'son-in-law', 'daughter-in-law', 'great-grandchild', 'other',
  ];

  useEffect(() => {
    // Load current profile on mount
    apiClient.get<{ relationship?: string }>('/family/profile')
      .then(res => {
        if (res.relationship) setRelationship(res.relationship);
      })
      .catch(() => {});
  }, []);

  const handleSelectRelationship = async (rel: string) => {
    setRelationship(rel);
    try {
      await apiClient.patch('/family/profile', { relationship: rel });
    } catch {
      // Best-effort update
    }
  };

  const handleIngestTranscript = async () => {
    if (!transcriptText.trim()) {
      Alert.alert('Required', 'Please enter transcript text or family notes.');
      return;
    }
    const sourceDesc = transcriptSource.trim() || 'કૌટુંબિક વાતચીત (Family Notes)';
    setIsIngestingTranscript(true);
    setTranscriptResult(null);

    try {
      const res = await apiClient.post<{ message: string; result: { insertedCount: number } }>(
        '/family/transcripts/ingest',
        {
          rawText: transcriptText,
          sourceDescription: sourceDesc,
          autoApprove: false,
        }
      );
      setTranscriptResult(`✅ ${res.message} Review them in Yaadein (Memories).`);
      setTranscriptText('');
      setTranscriptSource('');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Ingestion failed.';
      setTranscriptResult(`❌ ${msg}`);
    } finally {
      setIsIngestingTranscript(false);
    }
  };

  const uploadFile = async (uri: string, name: string, type: string) => {
    setIsUploading(true);
    setUploadStatus(null);
    try {
      const formData = new FormData();
      formData.append('file', { uri, name, type } as unknown as Blob);

      await apiClient.uploadFormData('/media', formData);
      setUploadStatus('✅ Uploaded successfully. Stored in your private family vault.');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Upload failed. Check your connection.';
      setUploadStatus(`❌ ${msg}`);
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
                onPress={() => handleSelectRelationship(r)}
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

        {/* Transcript & Notes Ingestion */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📝 Import Transcripts & Family Stories</Text>
          <Text style={styles.sectionDesc}>
            Paste verified transcripts from home cassette tapes, video recordings, or oral history notes.
            The system categorizes them into verified facts, personal stories, and personality traits.
          </Text>

          <View style={styles.uploadCard}>
            <Text style={styles.label}>Source Label / Context</Text>
            <TextInput
              style={styles.textInputShort}
              value={transcriptSource}
              onChangeText={setTranscriptSource}
              placeholder="e.g. 1998 Diwali Cassette / Audio Recording from Rajkot"
              placeholderTextColor={Colors.textMuted}
            />

            <Text style={[styles.label, { marginTop: Spacing.sm }]}>Transcript or Memories (Gujarati or English)</Text>
            <TextInput
              style={styles.textInputArea}
              value={transcriptText}
              onChangeText={setTranscriptText}
              placeholder="લખો અથવા પેસ્ટ કરો (Paste verified quotes, life stories, or facts)..."
              placeholderTextColor={Colors.textMuted}
              multiline
              numberOfLines={4}
            />

            <TouchableOpacity
              style={[styles.uploadButton, (isIngestingTranscript || !transcriptText.trim()) && styles.uploadButtonDisabled]}
              onPress={handleIngestTranscript}
              disabled={isIngestingTranscript || !transcriptText.trim()}
            >
              {isIngestingTranscript ? (
                <ActivityIndicator color={Colors.textOnPrimary} />
              ) : (
                <Text style={styles.uploadButtonText}>Ingest & Structure Memories</Text>
              )}
            </TouchableOpacity>

            {transcriptResult && (
              <View style={styles.uploadStatus}>
                <Text style={styles.uploadStatusText}>{transcriptResult}</Text>
              </View>
            )}
          </View>
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
  label: {
    fontSize: Typography.fontSize.xs,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.textSecondary,
    marginBottom: Spacing.xs,
  },
  textInputShort: {
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: BorderRadius.md,
    padding: Spacing.sm,
    fontSize: Typography.fontSize.sm,
    color: Colors.textPrimary,
  },
  textInputArea: {
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: BorderRadius.md,
    padding: Spacing.sm,
    fontSize: Typography.fontSize.sm,
    color: Colors.textPrimary,
    minHeight: 90,
    textAlignVertical: 'top',
    marginBottom: Spacing.md,
  },
});
