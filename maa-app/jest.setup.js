import '@testing-library/jest-native/extend-expect';

jest.mock('expo-audio', () => ({
  requestRecordingPermissionsAsync: jest.fn().mockResolvedValue({ status: 'granted', granted: true }),
  setAudioModeAsync: jest.fn().mockResolvedValue(undefined),
  createAudioPlayer: jest.fn().mockReturnValue({
    play: jest.fn(),
    pause: jest.fn(),
    release: jest.fn(),
  }),
  AudioRecorder: jest.fn().mockImplementation(() => ({
    prepareToRecordAsync: jest.fn().mockResolvedValue(undefined),
    record: jest.fn(),
    stop: jest.fn().mockResolvedValue(undefined),
    uri: 'file:///cache/test.wav',
    isRecording: false,
  })),
  RecordingPresets: {
    HIGH_QUALITY: {},
  },
}));

jest.mock('expo-file-system', () => ({
  File: jest.fn().mockImplementation((...args) => ({
    uri: 'file:///cache/test.wav',
    exists: false,
    delete: jest.fn(),
    create: jest.fn(),
    write: jest.fn().mockResolvedValue(undefined),
    base64: jest.fn().mockResolvedValue('base64audio'),
  })),
  Paths: {
    cache: { uri: 'file:///cache/' },
    document: { uri: 'file:///documents/' },
  },
}));
