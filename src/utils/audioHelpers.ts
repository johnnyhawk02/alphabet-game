/**
 * Utility functions for audio handling in the game
 */

/**
 * Preloads an audio file and returns a promise that resolves when it's ready to play
 * 
 * @param path Path to the audio file
 * @param volume Optional volume level (0.0 to 1.0)
 * @returns Promise that resolves with the Audio object
 */
export const preloadAudio = async (path: string, volume = 1.0): Promise<HTMLAudioElement> => {
  const audio = new Audio(path);
  audio.volume = volume;
  
  return new Promise((resolve, reject) => {
    audio.oncanplaythrough = () => resolve(audio);
    audio.onerror = (error) => reject(error);
    audio.load();
  });
};

/**
 * Play an audio file with loading and error handling
 * 
 * @param path Path to the audio file
 * @param volume Optional volume level (0.0 to 1.0)
 * @returns Promise that resolves when audio playback completes
 */
export const playSound = async (path: string, volume = 1.0): Promise<void> => {
  try {
    const audio = await preloadAudio(path, volume);
    await audio.play();
    
    return new Promise((resolve) => {
      audio.onended = () => resolve();
    });
  } catch (error) {
    console.error('Error playing sound:', error);
    throw error;
  }
};

/**
 * Play an audio file but don't wait for it to complete
 * 
 * @param path Path to the audio file
 * @param volume Optional volume level (0.0 to 1.0)
 * @returns Promise that resolves immediately after playback starts
 */
export const playSoundInBackground = async (path: string, volume = 1.0): Promise<void> => {
  try {
    const audio = await preloadAudio(path, volume);
    await audio.play();
    // Don't wait for audio to end
  } catch (error) {
    console.error('Error playing background sound:', error);
  }
};

/**
 * Play a correct answer sound effect in background (doesn't block TTS)
 * 
 * @returns Promise that resolves immediately after playback starts
 */
export const playCorrectAnswerSound = async (): Promise<void> => {
  try {
    // Changed to use playSound instead of playSoundInBackground to wait for completion
    await playSound('/audio/other/correct.mp3', 0.5);
  } catch (error) {
    console.error('Failed to play correct sound:', error);
  }
};

/**
 * Play a wrong answer sound effect in background (doesn't block TTS)
 * 
 * @returns Promise that resolves immediately after playback starts
 */
export const playWrongAnswerSound = async (): Promise<void> => {
  try {
    await playSoundInBackground('/audio/other/wrong.mp3', 0.7);
  } catch (error) {
    console.error('Failed to play wrong sound:', error);
  }
};

/**
 * Creates a delay using a promise
 * 
 * @param ms Milliseconds to delay
 * @returns Promise that resolves after the specified delay
 */
export const delay = (ms: number): Promise<void> => {
  return new Promise(resolve => setTimeout(resolve, ms));
};