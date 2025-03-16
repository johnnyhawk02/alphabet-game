import { useState } from 'react';

export const useAudio = () => {
  const [audio, setAudio] = useState<HTMLAudioElement | null>(null);

  const playWord = async (word: string) => {
    try {
      if (audio) {
        audio.pause();
        audio.currentTime = 0;
      }
      const newAudio = new Audio(`/audio/${word}.mp3`);
      await newAudio.load();
      setAudio(newAudio);
      await new Promise(resolve => setTimeout(resolve, 100));
      await newAudio.play();
    } catch (error) {
      console.error('Error playing audio:', error);
    }
  };

  const cleanup = () => {
    if (audio) {
      audio.pause();
      setAudio(null);
    }
  };

  return { playWord, cleanup };
};