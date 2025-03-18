import { useState, useRef } from 'react';

export const useAudio = () => {
  const [audio, setAudio] = useState<HTMLAudioElement | null>(null);
  const lastCongratsMessageRef = useRef<number>(-1);
  const lastSupportiveMessageRef = useRef<number>(-1);

  const playWord = async (word: string) => {
    try {
      if (audio) {
        audio.pause();
        audio.currentTime = 0;
      }
      
      const newAudio = new Audio(`/audio/words/${word}.mp3`);
      await newAudio.load();
      setAudio(newAudio);
      
      // Return a promise that resolves when the audio completes
      return new Promise<void>((resolve, reject) => {
        newAudio.onended = () => resolve();
        newAudio.onerror = (e) => reject(e);
        
        // Set a timeout just in case onended doesn't fire
        const timeout = setTimeout(() => resolve(), 5000);
        
        newAudio.play()
          .then(() => {})
          .catch(err => {
            console.error("Error playing word audio:", err);
            clearTimeout(timeout);
            reject(err);
          });
      });
    } catch (error) {
      console.error('Error setting up word audio:', error);
      return Promise.resolve();
    }
  };

  const getRandomNumberExcept = (max: number, except: number): number => {
    // If the last one was -1 (initial value), just return a random number
    if (except === -1) {
      return Math.floor(Math.random() * max) + 1;
    }
    
    // Generate a random number that's different from the previous one
    let randomNum;
    do {
      randomNum = Math.floor(Math.random() * max) + 1;
    } while (randomNum === except && max > 1);
    
    return randomNum;
  };

  const playCongratsMessage = async () => {
    try {
      if (audio) {
        audio.pause();
        audio.currentTime = 0;
      }
      
      // Get a random message number different from the last one used
      const messageNumber = getRandomNumberExcept(20, lastCongratsMessageRef.current);
      lastCongratsMessageRef.current = messageNumber;
      
      console.log(`Playing congrats message ${messageNumber}`);
      const newAudio = new Audio(`/audio/congrats/congrats_${messageNumber}.mp3`);
      newAudio.volume = 1.0; // Ensure volume is set to maximum
      await newAudio.load();
      setAudio(newAudio);
      
      // Return a promise that resolves when the audio completes
      return new Promise<void>((resolve, reject) => {
        newAudio.onended = () => resolve();
        newAudio.onerror = (e) => reject(e);
        
        // Set a timeout just in case onended doesn't fire
        const timeout = setTimeout(() => resolve(), 5000);
        
        newAudio.play()
          .then(() => {})
          .catch(err => {
            console.error("Error playing congrats audio:", err);
            clearTimeout(timeout);
            reject(err);
          });
      });
    } catch (error) {
      console.error('Error setting up congratulatory message:', error);
      return Promise.resolve();
    }
  };

  const playSupportiveMessage = async () => {
    try {
      if (audio) {
        audio.pause();
        audio.currentTime = 0;
      }
      
      // Get a random message number different from the last one used
      const messageNumber = getRandomNumberExcept(20, lastSupportiveMessageRef.current);
      lastSupportiveMessageRef.current = messageNumber;
      
      console.log(`Playing support message ${messageNumber}`);
      
      // Create and set up audio element
      const newAudio = new Audio(`/audio/support/support_${messageNumber}.mp3`);
      newAudio.volume = 1.0; // Ensure volume is set to maximum
      
      // Load the audio
      await new Promise<void>((resolve) => {
        newAudio.oncanplaythrough = () => resolve();
        newAudio.onerror = () => resolve(); // Resolve anyway to prevent hanging
        newAudio.load();
      });
      
      setAudio(newAudio);
      
      // Return a promise that resolves when the audio completes
      return new Promise<void>((resolve, reject) => {
        newAudio.onended = () => resolve();
        newAudio.onerror = (e) => reject(e);
        
        // Set a timeout just in case onended doesn't fire
        const timeout = setTimeout(() => resolve(), 5000);
        
        newAudio.play()
          .then(() => {})
          .catch(err => {
            console.error("Error playing supportive audio:", err);
            clearTimeout(timeout);
            reject(err);
          });
      });
    } catch (error) {
      console.error('Error setting up supportive message:', error);
      return Promise.resolve();
    }
  };

  const playWordAfterPause = async (word: string) => {
    try {
      // Create a new audio instance specifically for the word
      // Add a pause between the supportive message and the word
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Then play the word using a direct implementation instead of calling playWord
      // This avoids any potential state conflicts
      const wordAudio = new Audio(`/audio/words/${word}.mp3`);
      await wordAudio.load();
      
      console.log(`Playing word after pause: ${word}`);
      
      return new Promise<void>((resolve, reject) => {
        wordAudio.onended = () => resolve();
        wordAudio.onerror = (e) => reject(e);
        
        const timeout = setTimeout(() => resolve(), 5000);
        
        wordAudio.play()
          .then(() => {})
          .catch(err => {
            console.error(`Error playing word "${word}" after pause:`, err);
            clearTimeout(timeout);
            reject(err);
          });
      });
    } catch (error) {
      console.error(`Error playing word audio after pause:`, error);
      return Promise.resolve();
    }
  };

  const cleanup = () => {
    if (audio) {
      audio.pause();
      setAudio(null);
    }
  };

  return { 
    playWord, 
    playCongratsMessage, 
    playSupportiveMessage, 
    playWordAfterPause,
    cleanup 
  };
};