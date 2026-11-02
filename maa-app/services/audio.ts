/**
 * Mobile Audio Service — Recording, Playback, and Interruption Control
 *
 * Uses expo-av to manage mobile microphone recording, base64 encoding,
 * audio playback of Gujarati responses, and interruptible playback states.
 */

import { Audio } from 'expo-av';
import { File, Paths } from 'expo-file-system';

class AudioService {
  private recording: Audio.Recording | null = null;
  private currentSound: Audio.Sound | null = null;
  private isPlaying = false;

  /**
   * Request microphone permissions
   */
  async requestPermissions(): Promise<boolean> {
    try {
      const { status } = await Audio.requestPermissionsAsync();
      return status === 'granted';
    } catch {
      return false;
    }
  }

  /**
   * Start recording voice input from microphone
   */
  async startRecording(): Promise<void> {
    try {
      await this.stopPlaying(); // Interrupt any active playback

      const permitted = await this.requestPermissions();
      if (!permitted) {
        throw new Error('Microphone permission not granted.');
      }

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const recording = new Audio.Recording();
      await recording.prepareToRecordAsync(Audio.RecordingOptionsPresets.HIGH_QUALITY);
      await recording.startAsync();

      this.recording = recording;
    } catch (err) {
      this.recording = null;
      throw err;
    }
  }

  /**
   * Stop recording and return base64 audio and local URI
   */
  async stopRecording(): Promise<{ uri: string; base64: string } | null> {
    if (!this.recording) return null;

    try {
      await this.recording.stopAndUnloadAsync();
      const uri = this.recording.getURI();
      this.recording = null;

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        playsInSilentModeIOS: true,
      });

      if (!uri) return null;

      const recFile = new File(uri);
      const base64 = await recFile.base64();

      return { uri, base64 };
    } catch (err) {
      this.recording = null;
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
      if (tempFile.exists) tempFile.delete();
      tempFile.create({ overwrite: true });
      await tempFile.write(base64Audio, { encoding: 'base64' });

      const { sound } = await Audio.Sound.createAsync(
        { uri: tempFile.uri },
        { shouldPlay: true },
        (status) => {
          if (status.isLoaded && status.didJustFinish) {
            this.isPlaying = false;
            this.currentSound = null;
            if (onPlaybackFinished) onPlaybackFinished();
          }
        }
      );

      this.currentSound = sound;
      this.isPlaying = true;
    } catch (err) {
      this.isPlaying = false;
      this.currentSound = null;
      console.warn('[AudioService] Playback error:', err);
    }
  }

  /**
   * Stop any active audio playback immediately (Interruption handling)
   */
  async stopPlaying(): Promise<void> {
    if (this.currentSound) {
      try {
        await this.currentSound.stopAsync();
        await this.currentSound.unloadAsync();
      } catch {
        // Ignore cleanup errors
      }
      this.currentSound = null;
      this.isPlaying = false;
    }
  }

  getIsPlaying(): boolean {
    return this.isPlaying;
  }
}

export const audioService = new AudioService();
