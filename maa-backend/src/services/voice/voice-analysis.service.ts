/**
 * Audio Quality & Voice Eligibility Analysis Service
 *
 * Evaluates family audio/video recordings to determine suitability
 * for transcription and potential voice modeling.
 */

import fs from 'fs';

export interface AudioAnalysisResult {
  fileSizeBytes: number;
  durationEstimateSeconds: number;
  estimatedSNRdB: number;
  qualityRating: 'EXCELLENT' | 'GOOD' | 'FAIR' | 'POOR';
  isEligibleForTranscription: boolean;
  isEligibleForVoiceCloning: boolean;
  feedbackNotes: string[];
}

export function analyzeAudioBuffer(buffer: Buffer, mimeType = 'audio/wav'): AudioAnalysisResult {
  const size = buffer.length;
  const feedbackNotes: string[] = [];

  // Duration estimate for typical audio bitrates (e.g. 128kbps / 16KB/s)
  const durationEstimateSeconds = Math.max(1, Math.round(size / 16000));

  // Compute energy distribution for rough SNR estimation
  let sum = 0;
  let maxSample = 0;
  const step = Math.max(1, Math.floor(size / 4000)); // Sample ~4000 points
  let sampleCount = 0;

  for (let i = 0; i < size; i += step) {
    const val = Math.abs(buffer[i] - 128); // center around 0
    sum += val;
    if (val > maxSample) maxSample = val;
    sampleCount++;
  }

  const avgEnergy = sampleCount > 0 ? sum / sampleCount : 0;
  // Estimated SNR based on signal variance vs baseline
  const estimatedSNRdB = Math.min(45, Math.max(5, Math.round(20 * Math.log10(Math.max(1, avgEnergy)))));

  let qualityRating: 'EXCELLENT' | 'GOOD' | 'FAIR' | 'POOR' = 'GOOD';

  if (estimatedSNRdB > 28 && durationEstimateSeconds > 30) {
    qualityRating = 'EXCELLENT';
    feedbackNotes.push('Clear audio profile with low background noise.');
  } else if (estimatedSNRdB >= 18) {
    qualityRating = 'GOOD';
    feedbackNotes.push('Satisfactory clarity for Gujarati speech recognition.');
  } else if (estimatedSNRdB >= 10) {
    qualityRating = 'FAIR';
    feedbackNotes.push('Noticeable room reverberation or background hiss. Suitable for transcription with review.');
  } else {
    qualityRating = 'POOR';
    feedbackNotes.push('Significant noise floor. May cause dialect transcription inaccuracies.');
  }

  if (durationEstimateSeconds < 5) {
    feedbackNotes.push('Audio is under 5 seconds; longer samples (30s - 2min) provide better dialect context.');
  }

  // Voice cloning eligibility checks:
  // Requires minimum clean duration (typically 30+ seconds minimum for few-shot, hours for fine-tune)
  const isEligibleForTranscription = estimatedSNRdB >= 8 && size > 1000;
  const isEligibleForVoiceCloning = estimatedSNRdB >= 22 && durationEstimateSeconds >= 20;

  if (!isEligibleForVoiceCloning) {
    feedbackNotes.push('Voice recreation requires high-fidelity, clean speech samples with minimal cross-talk.');
  }

  return {
    fileSizeBytes: size,
    durationEstimateSeconds,
    estimatedSNRdB,
    qualityRating,
    isEligibleForTranscription,
    isEligibleForVoiceCloning,
    feedbackNotes,
  };
}
