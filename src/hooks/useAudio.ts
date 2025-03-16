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
      await new Promise(resolve => setTimeout(resolve, 100));
      try {
        await newAudio.play();
      } catch (playError) {
        console.error('Error playing word audio:', playError);
      }
    } catch (error) {
      console.error('Error setting up word audio:', error);
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
      
      try {
        await newAudio.play();
        return true;
      } catch (playError) {
        console.error('Error playing congratulatory audio:', playError);
        return false;
      }
    } catch (error) {
      console.error('Error setting up congratulatory message:', error);
      return false;
    }
  };

  const playSupportiveMessage = async () => {
    try {
      if (audio) {
        audio.pause();
        audio.currentTime = 0;
      }
      
      const messageNumber = Math.floor(Math.random() * 6) + 1;
      console.log(`Attempting to play support message ${messageNumber}`);
      
      // Create and set up audio element
      const newAudio = new Audio(`/audio/support/support_${messageNumber}.mp3`);
      newAudio.volume = 1.0; // Ensure volume is set to maximum
      
      // Set oncanplaythrough event handler
      await new Promise<void>((resolve) => {
        newAudio.oncanplaythrough = () => {
          console.log("Support audio loaded and can play");
          resolve();
        };
        newAudio.onerror = () => {
          console.error(`Error loading support audio ${messageNumber}`);
          resolve(); // Resolve anyway to prevent hanging
        };
        newAudio.load();
      });
      
      setAudio(newAudio);
      
      try {
        console.log("Playing supportive message now");
        const playPromise = newAudio.play();
        
        if (playPromise !== undefined) {
          await playPromise;
          console.log("Supportive message playing successfully");
        }
        return true;
      } catch (playError) {
        console.error('Error playing supportive audio:', playError);
        
        // Fallback approach for browsers with strict autoplay policies
        document.addEventListener('click', function playOnClick() {
          newAudio.play().catch(e => console.error("Even with click, failed to play:", e));
          document.removeEventListener('click', playOnClick);
        }, { once: true });
        
        return false;
      }
    } catch (error) {
      console.error('Error setting up supportive message:', error);
      return false;
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