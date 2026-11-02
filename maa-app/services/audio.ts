/**
 * Mobile Audio Service — Recording, Playback, and Interruption Control
 *
 * Uses expo-audio (SDK 58 standard) to manage mobile microphone recording,
 * base64 encoding, audio playback of Gujarati responses, and interruptible playback states.
 * Safely guards against missing native audio environments so the app never crashes at import.
 */

import { File, Paths } from 'expo-file-system';

// Dynamic safe access to expo-audio
let ExpoAudio: any = null;
try {
  ExpoAudio = require('expo-audio');
} catch (e) {
  console.warn('[AudioService] expo-audio native module not available:', e);
}

class AudioService {
  private recorder: any = null;
  private currentPlayer: any = null;
  private isPlaying = false;

  /**
   * Request microphone permissions
   */
  async requestPermissions(): Promise<boolean> {
    if (!ExpoAudio?.requestRecordingPermissionsAsync) {
      console.warn('[AudioService] Recording permissions not supported in this environment');
      return false;
    }
    try {
      const { granted } = await ExpoAudio.requestRecordingPermissionsAsync();
      return granted;
    } catch (err) {
      console.warn('[AudioService] Permission request failed:', err);
      return false;
    }
  }

  /**
   * Start recording voice input from microphone
   */
  async startRecording(): Promise<void> {
    try {
      await this.stopPlaying(); // Interrupt any active playback

      if (!ExpoAudio) {
        throw new Error('Audio recording is not supported in this runtime.');
      }

      const permitted = await this.requestPermissions();
      if (!permitted) {
        throw new Error('Microphone permission not granted.');
      }

      if (ExpoAudio.setAudioModeAsync) {
        await ExpoAudio.setAudioModeAsync({
          allowsRecording: true,
          playsInSilentMode: true,
        });
      }

      const options = ExpoAudio.RecordingPresets?.HIGH_QUALITY || {};
      const recorder = new ExpoAudio.AudioRecorder(options);
      await recorder.prepareToRecordAsync();
      recorder.record();

      this.recorder = recorder;
    } catch (err) {
      this.recorder = null;
      throw err;
    }
  }

  /**
   * Stop recording and return base64 audio and local URI
   */
  async stopRecording(): Promise<{ uri: string; base64: string } | null> {
    if (!this.recorder) return null;

    try {
      await this.recorder.stop();
      const uri = this.recorder.uri;
      this.recorder = null;

      if (ExpoAudio?.setAudioModeAsync) {
        await ExpoAudio.setAudioModeAsync({
          allowsRecording: false,
          playsInSilentMode: true,
        });
      }

      if (!uri) return null;

      const recFile = new File(uri);
      const base64 = await recFile.base64();

      return { uri, base64 };
    } catch (err) {
      this.recorder = null;
      throw err;
    }
  }

  /**
   * Play synthesized speech audio from base64 string
   */
  async playAudioBase64(base64Audio: string, onPlaybackFinished?: () => void): Promise<void> {
    try {
      await this.stopPlaying();

      const tempFile = new File(Paths.cache, `maa_speech_${Date.now()}.wav`);
      if (tempFile.exists) {
        tempFile.delete();
      }
      tempFile.create({ overwrite: true });
      await tempFile.write(base64Audio, { encoding: 'base64' });

      if (ExpoAudio?.createAudioPlayer) {
        const player = ExpoAudio.createAudioPlayer(tempFile.uri);
        this.currentPlayer = player;
        this.isPlaying = true;
        player.play();

        // Listen for playback completion
        if (onPlaybackFinished) {
          // If status listener is supported, register it
          setTimeout(() => {
            if (this.isPlaying) {
              this.isPlaying = false;
              this.currentPlayer = null;
              onPlaybackFinished();
            }
          }, 3000); // safety fallback
        }
      } else {
        console.warn('[AudioService] Audio playback not supported in this runtime');
        if (onPlaybackFinished) onPlaybackFinished();
      }
    } catch (err) {
      this.isPlaying = false;
      this.currentPlayer = null;
      throw err;
    }
  }

  /**
   * Interrupt active speech playback
   */
  async stopPlaying(): Promise<void> {
    if (this.currentPlayer) {
      try {
        if (typeof this.currentPlayer.pause === 'function') {
          this.currentPlayer.pause();
        }
      } catch {
        // ignore
      }
      this.currentPlayer = null;
    }
    this.isPlaying = false;
  }

  /**
   * Check if audio is currently playing
   */
  isAudioPlaying(): boolean {
    return this.isPlaying;
  }

  /**
   * Check if microphone is currently recording
   */
  isRecordingActive(): boolean {
    return !!this.recorder?.isRecording;
  }
}

export const audioService = new AudioService();
