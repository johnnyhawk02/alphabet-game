import { useState } from 'react';

export const useAudio = () => {
  const [audio, setAudio] = useState<HTMLAudioElement | null>(null);

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

  const playCongratsMessage = async () => {
    try {
      if (audio) {
        audio.pause();
        audio.currentTime = 0;
      }
      
      const messageNumber = Math.floor(Math.random() * 6) + 1;
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
      
      const messageNumber = Math.floor(Math.random() * 6) + 1;
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

  const cleanup = () => {
    if (audio) {
      audio.pause();
      setAudio(null);
    }
  };

  return { playWord, playCongratsMessage, playSupportiveMessage, cleanup };
};