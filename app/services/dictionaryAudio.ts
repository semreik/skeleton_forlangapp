// Re-export from assets/audio/index.ts which uses require.context
// This file exists for backwards compatibility with existing imports
export {
  dictionaryAudioMap,
  normalizeDzKey,
  getDictionaryAudio,
  hasDictionaryAudio,
} from '../../assets/audio';
