import { Audio } from 'expo-av';
import { Platform } from 'react-native';
import {
  audioMap,
  dictionaryAudioMap,
  getConversationAudio,
  getDictionaryAudio,
} from '../../assets/audio';

/**
 * Service to handle audio playback for dictionary pronunciations and conversations
 * Uses dynamic audio registry - no hardcoded sequences needed
 */
class AudioService {
  private sound: Audio.Sound | null = null;

  /**
   * Configure audio mode for the platform
   */
  private async configureAudioMode(): Promise<void> {
    const audioMode: any = {
      allowsRecordingIOS: false,
      staysActiveInBackground: false,
    };

    // Only add platform-specific settings on native platforms
    if (Platform.OS === 'ios') {
      audioMode.interruptionModeIOS = Audio.INTERRUPTION_MODE_IOS_DO_NOT_MIX;
    } else if (Platform.OS === 'android') {
      audioMode.shouldDuckAndroid = true;
      audioMode.playThroughEarpieceAndroid = false;
      audioMode.interruptionModeAndroid = Audio.INTERRUPTION_MODE_ANDROID_DO_NOT_MIX;
    }
    // Web platform: no additional settings needed

    await Audio.setAudioModeAsync(audioMode);
  }

  /**
   * Play a single audio source
   */
  private async playSingleSource(source: number): Promise<void> {
    // Unload any previously loaded sound
    if (this.sound) {
      await this.sound.unloadAsync();
    }

    const { sound } = await Audio.Sound.createAsync(source, { shouldPlay: true });
    this.sound = sound;

    return new Promise((resolve) => {
      sound.setOnPlaybackStatusUpdate((status: any) => {
        if (status && status.didJustFinish) {
          this.unloadSound();
          resolve();
        }
      });
    });
  }

  /**
   * Play an audio file from the registry
   * @param filename The audio key or filename to play
   * @returns Promise that resolves when audio playback is complete
   */
  async playAudio(filename?: string): Promise<void> {
    if (!filename) {
      console.warn('No audio filename provided');
      return;
    }

    try {
      await this.configureAudioMode();

      // Try to find the audio source
      let source = null;

      // First, try to find in audioMap (flat registry)
      if (audioMap[filename]) {
        source = audioMap[filename];
      }
      // Then, try in dictionaryAudioMap (word-keyed)
      else if (dictionaryAudioMap[filename]) {
        source = dictionaryAudioMap[filename];
      }

      if (!source) {
        console.warn('No audio source found for:', filename);
        return;
      }

      await this.playSingleSource(source);
    } catch (error) {
      console.error('Error playing audio:', error);
      this.unloadSound();
    }
  }

  /**
   * Play by a known key registered in audioMap
   */
  async playByKey(key?: string): Promise<void> {
    return this.playAudio(key);
  }

  /**
   * Play multiple audio sources in sequence
   */
  async playSequence(sources: number[]): Promise<void> {
    for (const source of sources) {
      try {
        await this.playSingleSource(source);
      } catch {
        // continue to next
      }
    }
  }

  /**
   * Play dictionary audio for a word
   * Automatically matches the word to audio file
   *
   * @param word The word to play audio for (e.g., "hello", "water")
   *
   * Audio files should be named:
   *   assets/audio/dictionary_words/{word}.wav
   *   Example: hello.wav, water.wav
   */
  async playDictionaryAudio(word: string): Promise<void> {
    if (!word) {
      console.warn('No word provided for dictionary audio');
      return;
    }

    try {
      await this.configureAudioMode();

      const audioSource = getDictionaryAudio(word);

      if (!audioSource) {
        console.warn('No audio found for dictionary word:', word);
        return;
      }

      await this.playSingleSource(audioSource);
    } catch (error) {
      console.error('Error playing dictionary audio:', error);
      this.unloadSound();
    }
  }

  /**
   * Play conversation audio with support for multiple files per message
   * Automatically discovers and plays all audio files for the exchange
   *
   * @param conversationId The conversation ID (e.g., "hey", "oyle")
   * @param exchangeNumber The exchange number (1-based)
   * @param speaker The speaker ("A" or "B")
   */
  async playConversationAudio(
    conversationId: string,
    exchangeNumber: number,
    speaker: string
  ): Promise<void> {
    try {
      await this.configureAudioMode();

      // Get all audio sources for this exchange (handles multi-part automatically)
      const audioSources = getConversationAudio(conversationId, exchangeNumber, speaker);

      if (audioSources.length === 0) {
        console.warn('No audio found for conversation:', { conversationId, exchangeNumber, speaker });
        return;
      }

      // Play all audio files in sequence
      await this.playSequence(audioSources);
    } catch (error) {
      console.error('Error playing conversation audio:', error);
      this.unloadSound();
    }
  }

  /**
   * Unload the current sound to free up resources
   */
  private unloadSound(): void {
    if (this.sound) {
      this.sound.unloadAsync();
      this.sound = null;
    }
  }
}

// Export a singleton instance
export const audioService = new AudioService();
